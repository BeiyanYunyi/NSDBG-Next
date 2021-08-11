import prompts from "prompts";

import SQLStorageProvider from "../database/SQLStorageProvider";
import progressBar from "../instances/progressBar";
import logger from "../utils/logger";
import { basicWait } from "../utils/wait";

import getTopic from "./getTopic";

const updateTopic = async () => {
  const storage = new SQLStorageProvider();
  const { action }: { action: boolean } = await prompts({
    type: "select",
    name: "action",
    message: "要获取哪些帖的内容？",
    choices: [
      { title: "今年的", value: false },
      { title: "其它时候的", value: true },
    ],
  });
  const topicIDs = await storage.getTopicIDForUpdate(action);
  logger.log(`将更新 ${topicIDs.length} 个帖子的内容或回复`);
  progressBar.start(topicIDs.length, 0, { topicID: NaN });
  for await (const topicID of topicIDs) {
    progressBar.increment(1, { status: topicID });
    try {
      await getTopic(topicID);
    } catch (e) {
      logger.error(e);
      await basicWait();
      continue;
    }
    await basicWait();
  }
  progressBar.stop();
  logger.log("更新成功");
};

export default updateTopic;
