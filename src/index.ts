import fs from "fs";

import pressAnyKey from "press-any-key";
import prompts from "prompts";

import getTopicsList from "./controller/getTopicsList";
import setConfig from "./controller/setConfig";
import updateTopic from "./controller/updateTopic";
import storage from "./database/instanceGetter";
import pageInstance from "./instances/Page";
import { cfgInstance } from "./instances/config";
import likeDeletedTopics from "./instances/likeDeletedTopics";
import getLastPageNum from "./utils/getLastPageNum";
import getPagesURL from "./utils/getPagesURL";
import groupURL from "./utils/groupURL";
import logger from "./utils/logger";
import pathUtils from "./utils/pathUtils";
import { basicWait } from "./utils/wait";

(async () => {
  fs.mkdirSync(pathUtils.dataPath, { recursive: true });
  const cfgExists = cfgInstance.configExists();
  if (!cfgExists) {
    logger.log("！初始化配置！");
    await setConfig();
    cfgInstance.saveConfig();
    await pressAnyKey("随便按一个键退出");
    process.exit(0);
  }
  await storage.connect();
  const { action } = await prompts({
    type: "select",
    name: "action",
    message: "客欲何为？",
    choices: [
      { title: "更新帖子", value: 0 },
      { title: "检测帖子状态", value: 1 },
      { title: "修改配置", value: 2 },
    ],
  });
  switch (action) {
    case 0: {
      await pageInstance.init(); // 这样绕一圈是保证 page 已经启动
      await pageInstance.page.goto(groupURL);
      const cont = await pageInstance.page.content();
      const lastPageNum = getLastPageNum(cont);
      const pages = getPagesURL(lastPageNum);
      await basicWait();
      await getTopicsList(pages);
      await likeDeletedTopics.detectTopicPrecise();
      await updateTopic();
      await pageInstance.close();
      break;
    }
    case 1: {
      const { userPageNum } = await prompts({
        type: "number",
        name: "userPageNum",
        message: "要检测多少页？",
        initial: 1,
        min: 1,
      });
      await pageInstance.init(); // 这样绕一圈是保证 page 已经启动
      const pages = getPagesURL(Number(userPageNum));
      await getTopicsList(pages, true);
      await likeDeletedTopics.detectTopicPrecise();
      await updateTopic();
      await pageInstance.close();
      break;
    }
    case 2:
      await setConfig();
      break;
    default:
      break;
  }
  cfgInstance.saveConfig();
  await pressAnyKey("运行完毕，随便按一个键退出");
  process.exit(0);
})();
