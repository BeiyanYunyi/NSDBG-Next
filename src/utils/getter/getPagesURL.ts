import path from "path/posix";

import config from "../../config/config";

const getPagesURL = (lastPageNum: number): string[] => {
  const aryToReturn: string[] = [];
  for (let i = 0; i < lastPageNum; i++) {
    aryToReturn.push(
      `${path.join(config.groupURL, "discussion")}?start=${25 * i}`
    );
  }
  return aryToReturn;
};

export default getPagesURL;
