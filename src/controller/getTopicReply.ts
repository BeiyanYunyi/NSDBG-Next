/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JSDOM } from "jsdom";

import pageInstance from "../instances/Page";
import Reply from "../types/Reply";
import { basicWait } from "../utils/wait";

const getTopicReply = async (topicID: number | string) => {
  // 该函数被 getTopic() 调用，因此假设此时已经在帖子页面内，减少刷新
  const content = await pageInstance.page.content();
  const dom = new JSDOM(content);
  const paginator = dom.window.document.querySelector("div.paginator");
  const replySet = new Set<Reply>();
  if (paginator) {
    const pages = Number(
      paginator.querySelector("span.thispage")!.attributes[1].textContent!
    );
    // 先爬第一页
    getTopicReplyOfOnePage(dom, topicID).forEach((reply) =>
      replySet.add(reply)
    );
    // 从第二页开始循环爬
    for (let i = 2; i <= pages; i++) {
      await basicWait();
      await pageInstance.page.goto(
        `https://www.douban.com/group/topic/${topicID}/?start=${(i - 1) * 100}`
      );
      const content = await pageInstance.page.content();
      const dom = new JSDOM(content);
      getTopicReplyOfOnePage(dom, topicID).forEach((reply) =>
        replySet.add(reply)
      );
    }
  } else {
    getTopicReplyOfOnePage(dom, topicID).forEach((reply) =>
      replySet.add(reply)
    );
  }
  return Array.from(replySet);
};

const getTopicReplyOfOnePage = (dom: JSDOM, topicID: string | number) => {
  const comments = dom.window.document.querySelector("ul#comments");
  const replyAry = Array.from(comments ? comments.querySelectorAll("li") : []);
  if (replyAry.length === 0) return [];
  const formattedReplyAry: Reply[] = replyAry.map((reply) => {
    const replyHeader = reply.querySelector("h4")!;
    const quotingContentElement = reply.querySelector(
      "div.reply-quote-content"
    );
    const quoting = Boolean(quotingContentElement);

    const quotingContent = quoting
      ? {
          quotingImage: quotingContentElement!.querySelector("img")
            ? quotingContentElement!.querySelector("img")!.src
            : null,
          quotingText:
            quotingContentElement!.querySelector("span.all")!.textContent,
          quotingAuthorID: quotingContentElement!
            .querySelector("span.pubdate")!
            .querySelector("a")!
            .href.substring(30)
            .replace("/", ""),
          quotingAuthorName: quotingContentElement!
            .querySelector("span.pubdate")!
            .querySelector("a")!.textContent,
        }
      : {
          quotingImage: null,
          quotingText: null,
          quotingAuthorID: null,
          quotingAuthorName: null,
        };

    return {
      replyID: Number(reply.id),

      topicID: Number(topicID),

      authorID: replyHeader
        .querySelector("a")!
        .href.substring(30)
        .replace("/", ""),

      authorName: replyHeader.querySelector("a")!.textContent!,

      isPoster: Boolean(replyHeader.querySelector("span.topic-author-icon")),

      replyTime:
        Number(
          new Date(replyHeader.querySelector("span.pubtime")!.textContent!)
        ) / 1000,

      quoting,
      ...quotingContent,

      image: reply.querySelector("div.cmt-img")
        ? reply.querySelector("div.cmt-img")!.querySelector("img")!.src
        : null,

      content: reply
        .querySelector("p.reply-content")!
        .textContent!.replaceAll("\n", "<br />"),
    };
  });
  return formattedReplyAry;
};

export default getTopicReply;
