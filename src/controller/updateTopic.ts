import SQLStorageProvider from "../database/SQLStorageProvider";
import { basicWait } from "../utils/wait";

import getTopic from "./getTopic";

const updateTopic = async () => {
  const storage = new SQLStorageProvider();
  const topicIDs = await storage.getTopicIDForUpdate();
  console.log(`将更新 ${Math.min(topicIDs.length)} 个帖子的内容或回复`);
  for await (const topicID of topicIDs) {
    try {
      await getTopic(topicID);
    } catch (e) {
      console.error(e);
      await basicWait();
      continue;
    }
    await basicWait();
  }
};

export default updateTopic;
