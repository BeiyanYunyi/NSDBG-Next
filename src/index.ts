import playwright from "playwright";

import config from "./config/config";
import pageInstance from "./instances/Page";
import getLastPageNum from "./utils/getLastPageNum";
import getPagesURL from "./utils/getPagesURL";
import getTopics from "./utils/getTopics";
import wait from "./utils/wait";

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
  await pageInstance.page.goto(`${config.groupURL}/discussion`);
  const cont = await pageInstance.page.content();
  const lastPageNum = getLastPageNum(cont);
  const pages = getPagesURL(process.env.ENV === "dev" ? 1 : lastPageNum);
  await wait(5000 + (Math.random() - 0.5) * 2000);
  const topics = await getTopics(pages);
  console.log(topics);
})();
