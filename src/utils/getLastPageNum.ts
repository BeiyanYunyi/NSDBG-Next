import { JSDOM } from "jsdom";
import lodash from "lodash";

import groupURL from "./groupURL";

/** 用于获取最后一页的页码（页面总数） */
const getLastPageNum = (cont: string) => {
  const dom = new JSDOM(cont);
  const aAry = Array.from(dom.window.document.querySelectorAll("a"));
  const pagesAry = lodash.compact(
    aAry.map((node) => {
      if (node.href.startsWith(groupURL)) {
        return node.textContent;
      }
      return null;
    })
  );
  if (pagesAry.length === 0) return 1;
  return Number(pagesAry[pagesAry.length - 2]);
};

export default getLastPageNum;
