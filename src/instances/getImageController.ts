import storage from "../database/instanceGetter";
import getImgID from "../utils/getImgID";
import logger from "../utils/logger";
import saveImage from "../utils/saveImage";
import { basicWait } from "../utils/wait";

import progressBar from "./progressBar";

const GetImageController = class {
  imagesURL: Set<string>;

  constructor() {
    this.imagesURL = new Set();
  }

  pushImageURLToSet(imgURL: string) {
    this.imagesURL.add(imgURL);
  }

  async getImages() {
    logger.log("正在保存图片");
    const imagesURLAry = Array.from(this.imagesURL);
    const trimedImgURLAry: string[] = [];
    await Promise.all(
      imagesURLAry.map(async (imgURL) => {
        const isInDB = await storage.isPictureSaved(getImgID(imgURL));
        if (!isInDB) trimedImgURLAry.push(imgURL);
      })
    );
    progressBar.start(trimedImgURLAry.length, 0, { status: "" });
    const safeValue = Math.floor(trimedImgURLAry.length / 10);
    let failCount = 0;
    while (trimedImgURLAry.length !== 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const imageURL = trimedImgURLAry.pop()!; // 不会为 undefined，是安全的
      try {
        await saveImage(imageURL);
        progressBar.increment(1, { status: getImgID(imageURL) });
      } catch (e) {
        if (failCount > safeValue) {
          logger.error("出错超总数十分之一，请检查是否有故障");
          throw new Error("出错超总数十分之一，请检查是否有故障");
        }
        failCount += 1;
        logger.error(e);
        trimedImgURLAry.push(imageURL);
        await basicWait();
        continue;
      }
      await basicWait();
    }
  }
};

const getImageController = new GetImageController();

export default getImageController;
