import prompts from "prompts";

import getTopicsList from "./controller/getTopicsList";
import initPageInstance from "./controller/initPageInstance";
import updateTopic from "./controller/updateTopic";
import pageInstance from "./instances/Page";
import getLastPageNum from "./utils/getLastPageNum";
import getPagesURL from "./utils/getPagesURL";
import groupURL from "./utils/groupURL";
import { basicWait } from "./utils/wait";

(async () => {
  const { action } = await prompts({
    type: "select",
    name: "action",
    message: "客欲何为？",
    choices: [
      { title: "更新帖子列表", value: 0 },
      { title: "获取帖子内容", value: 1 },
    ],
  });
  await initPageInstance(); // 这样绕一圈是保证 page 已经启动
  switch (action) {
    case 0: {
      let userPageNum = 1;
      if (process.env.ENV === "dev") {
        console.log("处于开发模式，由用户指定爬取页数");
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
      break;
    }
    case 1:
      await updateTopic();
      break;
    default:
      break;
  }
  await pageInstance.context.close();
  process.exit(0);
})();
