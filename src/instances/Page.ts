import fs from "fs/promises";
import path from "path";

import playwright from "playwright";
import prompts from "prompts";

import groupURL from "../utils/groupURL";
import logger from "../utils/logger";
import pathUtils from "../utils/pathUtils";

class Page {
  page!: playwright.Page; // 好孩子别学我

  context!: playwright.BrowserContext;

  changePage(page: playwright.Page) {
    this.page = page;
  }

  changeContext(context: playwright.BrowserContext) {
    this.context = context;
  }

  async init() {
    const context = await playwright.firefox.launchPersistentContext(
      path.join(pathUtils.dataPath, "browserState"),
      { headless: false }
    );
    this.changeContext(context);
    const page = this.context.pages()[0];
    this.changePage(page);
    // 读取已保存的 cookie 文件，若没有则要求登录
    try {
      const cookiesBuf = await fs.readFile(
        path.join(pathUtils.dataPath, "cookies.json")
      );
      const cookies = JSON.parse(cookiesBuf.toString());
      await this.context.addCookies(cookies);
    } catch (e) {
      logger.log("还没登录，先登录");
      await this.page.goto("https://www.douban.com");
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
    await this.page.goto(groupURL);
  }

  async close() {
    const cookies = await this.context.cookies();
    await fs.writeFile(
      path.join(pathUtils.dataPath, "cookies.json"),
      JSON.stringify(cookies, null, 2)
    );
    await this.context.close();
  }
}

const pageInstance = new Page();

export default pageInstance;
