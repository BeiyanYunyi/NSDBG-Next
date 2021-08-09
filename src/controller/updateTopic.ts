import prompts from "prompts";

import SQLStorageProvider from "../database/SQLStorageProvider";
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
  console.log("更新成功");
};

export default updateTopic;
