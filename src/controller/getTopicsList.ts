/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JSDOM } from "jsdom";
import lodash from "lodash";

import SQLStorageProvider from "../database/SQLStorageProvider";
import pageInstance from "../instances/Page";
import progressBar from "../instances/ProgressBar";
import Topic from "../types/topic";
import formatLastReplyTime from "../utils/formatLastReplyTime";
import formatReplyNumber from "../utils/formatReplyNumber";
import { basicWait } from "../utils/wait";

const getTopicsList = async (pages: string[]) => {
  const topicSet: Set<Topic> = new Set();
  const db = new SQLStorageProvider();
  const lastReplyTimeInDB = await db.getLatestTopicTime();
  if (lastReplyTimeInDB) console.log("数据库中已有数据，进行增量更新");
  progressBar.start(pages.length, 0, { status: "获取帖子列表" });
  for (const aPage of pages) {
    try {
      await pageInstance.page.goto(aPage);
    } catch (e) {
      console.error(e);
      await basicWait();
      continue;
    }
    const cont = await pageInstance.page.content();
    const dom = new JSDOM(cont);
    if (dom.window.document.querySelector("table.olt")) {
      const trAry = lodash.drop(
        Array.from(
          dom.window.document.querySelector("table.olt")!.querySelectorAll("tr")
        )
      );
      const lastReplyTimeOfFirstTopic = formatLastReplyTime(
        trAry[0].querySelector("td.time")!.textContent!
      );
      if (
        lastReplyTimeInDB &&
        lastReplyTimeOfFirstTopic &&
        lastReplyTimeInDB > lastReplyTimeOfFirstTopic
      ) {
        console.log("已获取完所有新内容");
        break;
      }
      // 一堆 Non-null assertion, 好孩子不要学
      const topicAry: Topic[] = trAry.map((tr) => ({
        title: tr.querySelector("td.title")!.querySelector("a")!.title!,

        authorID: tr
          .querySelector("td[nowrap]")!
          .querySelector("a")!
          .href.substring(30)
          .replace("/", ""),

        authorName: tr.querySelector("td[nowrap]")!.querySelector("a")!
          .textContent!,

        reply: formatReplyNumber(tr.querySelector("td.r-count")!.textContent!),

        lastReplyTime: formatLastReplyTime(
          tr.querySelector("td.time")!.textContent!
        ),

        topicID: Number(
          tr
            .querySelector("td.title")!
            .querySelector("a")!
            .href!.substring(35)
            .replace("/", "")
        ),

        isElite: Boolean(tr.querySelector("span.elite_topic_lable")),

        content: null, //这里没获取到
        lastFetchTime: null, // 同上
      }));
      topicAry.forEach((topic) => {
        topicSet.add(topic);
      });
      await db.insertOrReplaceTopicInfo(topicAry);
    } else {
      break;
    }
    progressBar.increment(1);
    await basicWait();
  }
  return 0;
};

export default getTopicsList;
