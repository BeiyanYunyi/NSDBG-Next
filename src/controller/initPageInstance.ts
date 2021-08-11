import fs from "fs/promises";
import path from "path";

import playwright from "playwright";
import prompts from "prompts";

import pageInstance from "../instances/Page";
import groupURL from "../utils/groupURL";
import logger from "../utils/logger";
import pathUtils from "../utils/pathUtils";

const initPageInstance = async () => {
  const context = await playwright.firefox.launchPersistentContext(
    path.join(pathUtils.dataPath, "browserState"),
    { headless: false }
  );
  pageInstance.changeContext(context);
  const page = pageInstance.context.pages()[0];
  pageInstance.changePage(page);
  // 读取已保存的 cookie 文件，若没有则要求登录
  try {
    const cookiesBuf = await fs.readFile(
      path.join(pathUtils.dataPath, "cookies.json")
    );
    const cookies = JSON.parse(cookiesBuf.toString());
    await pageInstance.context.addCookies(cookies);
  } catch (e) {
    logger.log("先登录");
    await pageInstance.page.goto("https://www.douban.com");
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { action } = await prompts({
        type: "toggle",
        name: "action",
        message: "登录好了没",
        initial: false,
        active: "好了",
        inactive: "没好",
      });
      if (!action) {
        logger.log("还不快登录？");
      } else break;
    }
  }
  await pageInstance.page.goto(groupURL);
};

export default initPageInstance;
