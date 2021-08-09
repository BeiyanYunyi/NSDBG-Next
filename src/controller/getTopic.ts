/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JSDOM } from "jsdom";

import SQLStorageProvider from "../database/SQLStorageProvider";
import pageInstance from "../instances/Page";

import getTopicReply from "./getTopicReply";

const getTopic = async (topicID: number | string) => {
  await pageInstance.page.goto(
    `https://www.douban.com/group/topic/${topicID}/`
  );
  const content = await pageInstance.page.content();
  const dom = new JSDOM(content);
  const detailTitle = dom.window.document.querySelector("td.tablecc");
  const storage = new SQLStorageProvider();
  if (detailTitle) {
    const title = detailTitle.textContent!.substring(3);
    await storage.updateTopicInfo(topicID, { title });
  }
  const mainContent = dom.window.document
    .querySelector("div.rich-content")!
    .outerHTML.replaceAll("\n", "<br />");
  await storage.updateTopicInfo(topicID, {
    content: mainContent,
    lastFetchTime: Math.floor(Date.now() / 1000),
  });
  const replies = await getTopicReply(topicID);
  if (replies.length !== 0) await storage.insertOrReplaceReplies(replies);
};

export default getTopic;
