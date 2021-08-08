/* eslint-disable @typescript-eslint/no-non-null-assertion */
import playwright from "playwright";

import config from "./config/config";
import SQLStorageProvider from "./database/SQLStorageProvider";
import pageInstance from "./instances/Page";
import getTopic from "./utils/getter/topicContent/getTopic";
import getLastPageNum from "./utils/getter/topicList/getLastPageNum";
import getPagesURL from "./utils/getter/topicList/getPagesURL";
import getTopicsList from "./utils/getter/topicList/getTopicsList";
import groupURL from "./utils/groupURL";
import { basicWait } from "./utils/wait";

(async () => {
  if (process.env.ENV === "dev") {
    console.log("处于开发模式，只爬取第一页用于测试");
  }
  const pw = await playwright.webkit.launch({ headless: false });
  const page = await pw.newPage({
    extraHTTPHeaders: {
      Cookie: config.cookie.substring(8),
    },
  });
  pageInstance.changePage(page);
  await pageInstance.page.goto(groupURL);
  const cont = await pageInstance.page.content();
  const lastPageNum = getLastPageNum(cont);
  const pages = getPagesURL(process.env.ENV === "dev" ? 1 : lastPageNum);
  await basicWait();
  await getTopicsList(pages);
  const storage = new SQLStorageProvider();
  const topicIDs = await storage.getAllTopicID();
  for await (const topicID of topicIDs!) {
    try {
      await getTopic(topicID);
    } catch (e) {
      console.error(e);
      await basicWait();
      continue;
    }
    await basicWait();
  }
  await pageInstance.page.close();
  process.exit(0);
})();
