/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JSDOM } from "jsdom";
import lodash from "lodash";

import SQLStorageProvider from "../database/SQLStorageProvider";
import pageInstance from "../instances/Page";
import likeDeletedTopics from "../instances/likeDeletedTopics";
import progressBar from "../instances/progressBar";
import Topic from "../types/Topic";
import formatLastReplyTime from "../utils/formatLastReplyTime";
import formatReplyNumber from "../utils/formatReplyNumber";
import logger from "../utils/logger";
import { basicWait } from "../utils/wait";

/** 该函数用于获取帖子列表，并调用 {@link likeDeletedTopics} 的
 * detectTopicRough 方法，
 * 根据发帖时间与数据库比对，粗判帖子删除情况。
 */
const getTopicsList = async (pages: string[], manual = false) => {
  const db = new SQLStorageProvider();
  const lastReplyTimeInDB = await db.getLatestTopicTime();
  if (lastReplyTimeInDB && !manual)
    logger.log("数据库中已有数据，进行增量更新");
  progressBar.start(pages.length, 0, { status: "获取帖子列表" });
  pages.reverse();
  const safeValue = Math.floor(pages.length / 10);
  let failCount = 0;
  while (pages.length !== 0) {
    const aPage = pages.pop()!; // 这里 pop 不会返回 undefined，可以放心 non-null assertion
    try {
      await pageInstance.page.goto(aPage);
    } catch (e) {
      logger.error(`爬取 ${aPage} 超时，正在重试`);
      if (failCount > safeValue) {
        logger.error("出错超总数十分之一，请检查是否有故障");
        throw new Error("出错超总数十分之一，请检查是否有故障");
      }
      pages.push(aPage); // 出错则重新获取
      failCount += 1;
      await basicWait();
      continue;
    }
    const cont = await pageInstance.page.content();
    const dom = new JSDOM(cont);
    if (!dom.window.document.querySelector("table.olt")) break;
    const trAry = lodash.drop(
      Array.from(
        dom.window.document.querySelector("table.olt")!.querySelectorAll("tr")
      )
    );
    const lastReplyTimeOfFirstTopic = formatLastReplyTime(
      trAry[0].querySelector("td.time")!.textContent!
    );
    if (
      !manual &&
      lastReplyTimeInDB &&
      lastReplyTimeOfFirstTopic &&
      lastReplyTimeInDB > lastReplyTimeOfFirstTopic
    ) {
      logger.log("帖子列表获取完毕");
      break;
    }
    // 一堆 Non-null assertion, 好孩子不要学
    const topicAry: Topic[] = await Promise.all(
      trAry.map(async (tr) => {
        const lastReplyTimeInList = formatLastReplyTime(
          tr.querySelector("td.time")!.textContent!
        );
        const topicID = Number(
          tr
            .querySelector("td.title")!
            .querySelector("a")!
            .href!.substring(35)
            .replace("/", "")
        );
        return {
          title: tr.querySelector("td.title")!.querySelector("a")!.title!,

          authorID: tr
            .querySelector("td[nowrap]")!
            .querySelector("a")!
            .href.substring(30)
            .replace("/", ""),

          authorName: tr.querySelector("td[nowrap]")!.querySelector("a")!
            .textContent!,

          reply: formatReplyNumber(
            tr.querySelector("td.r-count")!.textContent!
          ),

          lastReplyTime: lastReplyTimeInList
            ? lastReplyTimeInList
            : (await db.queryTopicInfo(topicID))!.lastReplyTime,

          topicID,

          isElite: Boolean(tr.querySelector("span.elite_topic_lable")),

          content: null, // 这些不是在这里获取的，下同
          lastFetchTime: null,
          createTime: null,
          deleteTime: null,
        };
      })
    );
    await db.insertOrReplaceTopicInfo(topicAry);
    await likeDeletedTopics.detectTopicRough(topicAry);
    progressBar.increment(1);

    await basicWait();
  }
  return 0;
};

export default getTopicsList;
