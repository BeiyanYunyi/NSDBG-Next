/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JSDOM } from "jsdom";
import lodash from "lodash";

import pageInstance from "../instances/Page";
import Topic from "../types/topic";

import wait from "./wait";

const getTopics = async (pages: string[]) => {
  const topicSet: Set<Topic> = new Set();
  for await (const aPage of pages) {
    await pageInstance.page.goto(aPage);
    const cont = await pageInstance.page.content();
    const dom = new JSDOM(cont);
    const trAry = lodash.drop(
      Array.from(
        dom.window.document.querySelector("table.olt")!.querySelectorAll("tr")
      )
    );
    // 一堆 Non-null assertion, 好孩子不要学
    const topicAry: Topic[] = trAry.map((tr) => ({
      title: tr.querySelector("td.title")!.querySelector("a")!.title!,
      author: tr.querySelector("td[nowrap]")!.querySelector("a")!.textContent!,
      reply: tr.querySelector("td.r-count")!.textContent!,
      lastReplyTime: tr.querySelector("td.time")!.textContent!,
      link: tr.querySelector("td.title")!.querySelector("a")!.href!,
    }));
    topicAry.forEach((topic) => {
      topicSet.add(topic);
    });
    await wait(5000 + (Math.random() - 0.5) * 2000);
  }
  return Array.from(topicSet);
};

export default getTopics;
