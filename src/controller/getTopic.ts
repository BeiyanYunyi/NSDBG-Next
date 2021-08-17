/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JSDOM } from "jsdom";

import SQLStorageProvider from "../database/SQLStorageProvider";
import pageInstance from "../instances/Page";
import getTopicDeleteTime from "../utils/getTopicDeleteTime";

import getTopicReply from "./getTopicReply";

const getTopic = async (topicID: number | string) => {
  await pageInstance.page.goto(
    `https://www.douban.com/group/topic/${topicID}/`
  );
  const content = await pageInstance.page.content();
  const deleteTime = getTopicDeleteTime(content);
  const storage = new SQLStorageProvider();
  if (deleteTime) {
    await storage.updateTopicInfo(topicID, { deleteTime });
    return true;
  }
  const dom = new JSDOM(content);
  const detailTitle = dom.window.document.querySelector("td.tablecc");
  if (detailTitle) {
    const title = detailTitle.textContent!.substring(3);
    await storage.updateTopicInfo(topicID, { title });
  }
  const mainContent = dom.window.document
    .querySelector("div.rich-content")!
    .outerHTML.replaceAll("\n", "<br />");
  const createTime = Math.floor(
    Number(
      new Date(
        dom.window.document.querySelector("span.create-time")!.textContent!
      )
    ) / 1000
  );
  const replies = await getTopicReply(topicID);
  await storage.updateTopicInfo(topicID, {
    content: mainContent,
    lastFetchTime: Math.floor(Date.now() / 1000),
    reply: replies.length,
    createTime,
    deleteTime: getTopicDeleteTime(content),
  });
  if (replies.length !== 0) {
    await storage.insertOrReplaceReplies(replies);
    const topicInfo = await storage.queryTopicInfo(topicID)!;
    if (topicInfo!.lastReplyTime === null) {
      await storage.updateTopicInfo(topicID, {
        lastReplyTime: replies[replies.length - 1].replyTime,
      });
    }
  } else {
    const topicInfo = await storage.queryTopicInfo(topicID)!;
    if (topicInfo!.lastReplyTime === null) {
      await storage.updateTopicInfo(topicID, {
        lastReplyTime: createTime,
      });
    }
  }
  return false;
};

export default getTopic;
