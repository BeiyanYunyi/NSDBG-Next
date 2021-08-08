/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JSDOM } from "jsdom";
import lodash from "lodash";

import SQLStorageProvider from "../../../database/SQLStorageProvider";
import pageInstance from "../../../instances/Page";
import Topic from "../../../types/topic";
import formatLastReplyTime from "../../formatter/formatLastReplyTime";
import formatReplyNumber from "../../formatter/formatReplyNumber";
import { basicWait } from "../../wait";

const getTopicsList = async (pages: string[]) => {
  const topicSet: Set<Topic> = new Set();
  const db = new SQLStorageProvider();
  for (const aPage of pages) {
    try {
      await pageInstance.page.goto(aPage);
    } catch (_e) {
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
      console.log(`已爬取 ${aPage}`);
    } else {
      console.log("当前页无帖");
      break;
    }
    await basicWait();
  }
  return 0;
};

export default getTopicsList;
