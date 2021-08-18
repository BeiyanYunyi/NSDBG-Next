import lodash from "lodash";

import getTopic from "../controller/getTopic";
import SQLStorageProvider from "../database/SQLStorageProvider";
import Topic from "../types/Topic";
import logger from "../utils/logger";
import { basicWait } from "../utils/wait";

import progressBar from "./progressBar";

/** class，用于粗检与保存疑似删除的帖子，然后细检它们。 */
class LikeDeletedTopics {
  likeDeletedTopics: number[];

  constructor() {
    this.likeDeletedTopics = [];
  }

  /** 粗检疑似删除的帖子。原理是在帖子列表中取最大回复时间和最小回复时间，
   * 然后在数据库中取出这段时间内的帖子列表，并相互比对。大凡获取到的帖子列表中没有，
   * 而数据库取出的列表里面有的，视为疑似被删除的帖子。
   * 疑似被删除的帖子会被加入该类下的数组中，等待细检。
   *
   * 该方法存在假阳性的可能，故只能用作粗检。
   */
  async detectTopicRough(topicList: Topic[]) {
    const replyTimeAry = lodash.compact(
      topicList.map((topic) => topic.lastReplyTime)
    );
    if (replyTimeAry.length === 0) return Promise.resolve(); // 防止捞到不是今年的帖子
    const maxTime = Math.max(...replyTimeAry);
    const minTime = Math.min(...replyTimeAry);
    const storage = new SQLStorageProvider();
    const topicsIDInDBAry = await storage.getTopicIDByTimeRange(
      minTime,
      maxTime
    );
    const topicIDAry = topicList.map((topic) => topic.topicID);
    const difference = lodash.difference(topicsIDInDBAry, topicIDAry);
    if (difference.length !== 0)
      logger.log(
        `筛查到 ${difference.length} 个疑似删除的帖子，等待进一步确认`
      );
    this.likeDeletedTopics.push(...difference);
  }

  /** 细检疑似删除的帖子。原理是调用 {@link getTopic} 逐个访问该类下数组的元素。*/
  async detectTopicPrecise() {
    const topicIDs = this.likeDeletedTopics;
    if (topicIDs.length === 0) return Promise.resolve();
    logger.log(`将确认 ${topicIDs.length} 个帖子的状态`);
    progressBar.start(topicIDs.length, 0, { topicID: NaN });
    const safeValue = Math.floor(topicIDs.length / 10);
    let failCount = 0;
    while (topicIDs.length !== 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const topicID = topicIDs.pop()!; // 不会为 undefined，是安全的
      try {
        progressBar.increment(0, { status: topicID });
        await getTopic(topicID);
        progressBar.increment(1);
      } catch (e) {
        if (failCount > safeValue) {
          logger.error("出错超总数十分之一，请检查是否有故障");
          throw new Error("出错超总数十分之一，请检查是否有故障");
        }
        failCount += 1;
        logger.error(e);
        topicIDs.push(topicID);
        await basicWait();
        continue;
      }
      await basicWait();
    }
    progressBar.stop();
    logger.log("确认完毕");
  }
}

/** 全程用一个实例就好，只用导出一个实例就行 */
const likeDeletedTopics = new LikeDeletedTopics();

export default likeDeletedTopics;
