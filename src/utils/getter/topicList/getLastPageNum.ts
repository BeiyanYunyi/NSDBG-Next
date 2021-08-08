import { JSDOM } from "jsdom";
import lodash from "lodash";

import groupURL from "../../groupURL";

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
  return Number(pagesAry[pagesAry.length - 2]);
};

export default getLastPageNum;
