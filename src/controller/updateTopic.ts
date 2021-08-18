import SQLStorageProvider from "../database/SQLStorageProvider";
import pageInstance from "../instances/Page";
import progressBar from "../instances/progressBar";
import logger from "../utils/logger";
import { basicWait } from "../utils/wait";

import getTopic from "./getTopic";

/** 该函数用于更新所有应当被更新的帖子的内容。 */
const updateTopic = async () => {
  await pageInstance.init();
  const storage = new SQLStorageProvider();
  const topicIDs = await storage.getTopicIDForUpdate();
  topicIDs.reverse(); // 不在数据库中用排序是因为有获取条数限制
  logger.log(`将更新 ${topicIDs.length} 个帖子的内容或回复`);
  progressBar.start(topicIDs.length, 0, { topicID: NaN });
  const safeValue = Math.floor(topicIDs.length / 10);
  let failCount = 0;
  while (topicIDs.length !== 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const topicID = topicIDs.pop()!; // 不会为 undefined，是安全的
    try {
      await getTopic(topicID);
      progressBar.increment(1, { status: topicID });
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
  logger.log("更新成功");
  await pageInstance.close();
};

export default updateTopic;
