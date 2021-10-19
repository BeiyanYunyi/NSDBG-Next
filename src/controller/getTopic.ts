/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JSDOM } from "jsdom";

import storage from "../database/instanceGetter";
import pageInstance from "../instances/Page";
import getImageController from "../instances/getImageController";
import getTopicDeleteTime from "../utils/getTopicDeleteTime";

import getTopicReply from "./getTopicReply";

/** 原谅我贫弱的英文。该函数用于获取单个帖子的所有内容，调用
 * {@link getTopicReply} 和 {@link getTopicDeleteTime}
 * 从而先判断帖子是否被删除，然后获取帖子主楼内容，最后获取帖子回复。
 */
const getTopic = async (topicID: number | string) => {
  await pageInstance.page.goto(
    `https://www.douban.com/group/topic/${topicID}/`
  );
  const content = await pageInstance.page.content();
  const deleteTime = getTopicDeleteTime(content);
  if (deleteTime) {
    await storage.updateTopicInfo(topicID, {
      deleteTime,
      lastFetchTime: Math.abs(deleteTime),
    });
    return true;
  }
  const dom = new JSDOM(content);
  const detailTitle = dom.window.document.querySelector("td.tablecc");
  if (detailTitle) {
    const title = detailTitle.textContent!.substring(3);
    await storage.updateTopicInfo(topicID, { title });
  }
  const mainContentElement =
    dom.window.document.querySelector("div.rich-content")!;
  const mainContent = mainContentElement.outerHTML.replaceAll("\n", "<br />");
  Array.from(mainContentElement.querySelectorAll("img")).forEach((img) =>
    getImageController.pushImageURLToSet(img.src)
  );
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
    replies.forEach((reply) => {
      if (reply.image) getImageController.pushImageURLToSet(reply.image);
      if (reply.quotingImage)
        getImageController.pushImageURLToSet(reply.quotingImage);
    });
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
