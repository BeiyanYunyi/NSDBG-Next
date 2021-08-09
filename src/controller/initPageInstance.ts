import fs from "fs/promises";

import playwright from "playwright";
import prompts from "prompts";

import pageInstance from "../instances/Page";
import groupURL from "../utils/groupURL";

const initPageInstance = async () => {
  let state: boolean;
  try {
    await fs.access("./data/browserState.json");
    state = true;
  } catch (e) {
    state = false;
  }
  const context = await (
    await playwright.firefox.launch({ headless: false })
  ).newContext(
    state ? { storageState: "./data/browserState.json" } : undefined
  );
  pageInstance.changeContext(context);
  const page = await pageInstance.context.newPage();
  pageInstance.changePage(page);
  console.log("先登录");
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
      console.log("还不快登录？");
    } else break;
  }
  await pageInstance.page.goto(groupURL);
};

export default initPageInstance;
