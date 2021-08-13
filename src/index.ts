import fs from "fs";

import pressAnyKey from "press-any-key";
import prompts from "prompts";

import detectTopic from "./controller/detectTopic";
import getTopicsList from "./controller/getTopicsList";
import setConfig from "./controller/setConfig";
import updateTopic from "./controller/updateTopic";
import pageInstance from "./instances/Page";
import { cfgInstance } from "./instances/config";
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
  const { action } = await prompts({
    type: "select",
    name: "action",
    message: "客欲何为？",
    choices: [
      { title: "更新帖子列表", value: 0 },
      { title: "获取帖子内容", value: 1 },
      { title: "检测帖子状态", value: 2 },
      { title: "修改配置信息", value: 3 },
    ],
  });
  switch (action) {
    case 0: {
      await pageInstance.init(); // 这样绕一圈是保证 page 已经启动
      let userPageNum = 1;
      if (process.env.ENV === "dev") {
        logger.log("处于开发模式，由用户指定爬取页数");
        const { num } = await prompts({
          type: "number",
          name: "num",
          message: "要爬几页？一页 25 帖",
          initial: 1,
          min: 1,
        });
        userPageNum = num;
      }
      await pageInstance.page.goto(groupURL);
      const cont = await pageInstance.page.content();
      const lastPageNum = getLastPageNum(cont);
      const pages = getPagesURL(
        process.env.ENV === "dev" ? userPageNum : lastPageNum
      );
      await basicWait();
      await getTopicsList(pages);
      await pageInstance.close();
      break;
    }
    case 1:
      await updateTopic();
      break;
    case 2:
      await detectTopic();
      break;
    case 3:
      await setConfig();
      break;
    default:
      break;
  }
  cfgInstance.saveConfig();
  await pressAnyKey("运行完毕，随便按一个键退出");
  process.exit(0);
})();
