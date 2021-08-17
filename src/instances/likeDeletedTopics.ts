import lodash from "lodash";

import getTopic from "../controller/getTopic";
import SQLStorageProvider from "../database/SQLStorageProvider";
import Topic from "../types/Topic";
import logger from "../utils/logger";
import { basicWait } from "../utils/wait";

import progressBar from "./progressBar";

class LikeDeletedTopics {
  likeDeletedTopics: number[];
  constructor() {
    this.likeDeletedTopics = [];
  }
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

const likeDeletedTopics = new LikeDeletedTopics();

export default likeDeletedTopics;
