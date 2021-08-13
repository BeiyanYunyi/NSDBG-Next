import prompts from "prompts";

import SQLStorageProvider from "../database/SQLStorageProvider";
import pageInstance from "../instances/Page";
import progressBar from "../instances/progressBar";
import logger from "../utils/logger";
import numberValidate from "../utils/numberValidate";
import { basicWait } from "../utils/wait";

import getTopic from "./getTopic";

const detectTopic = async () => {
  await pageInstance.init();
  const storage = new SQLStorageProvider();
  const { time } = await prompts({
    message: "要检测多少天前的帖子？",
    type: "text",
    name: "time",
    initial: `3`,
    validate: numberValidate,
  });
  const dateObj = new Date();
  const dateNow = dateObj.getDate();
  dateObj.setDate(dateNow - Number(time));
  const unixTime = Math.floor(Number(dateObj) / 1000);
  const topicIDs = await storage.getTopicIDForDetect(unixTime);
  logger.log(`将检测 ${topicIDs.length} 个帖子`);
  progressBar.start(topicIDs.length, 0, { topicID: NaN });
  let deletedCount = 0;
  for await (const topicID of topicIDs) {
    progressBar.increment(1, { status: topicID });
    try {
      const deleted = await getTopic(topicID);
      if (deleted) deletedCount += 1;
    } catch (e) {
      logger.error(e);
      await basicWait();
      continue;
    }
    await basicWait();
  }
  progressBar.stop();
  logger.log(
    `检测完毕，${topicIDs.length} 个帖子中有 ${deletedCount} 个被删除`
  );
  await pageInstance.close();
};

export default detectTopic;
