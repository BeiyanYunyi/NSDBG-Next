import fs from "fs";
import path from "path";

import storage from "../database/instanceGetter";
import getImgID from "../utils/getImgID";
import logger from "../utils/logger";
import pathUtils from "../utils/pathUtils";
import saveImages from "../utils/saveImages";

const GetImageController = class {
  imagesURL: Set<string>;

  constructor() {
    try {
      const imgToGetBuffer = fs.readFileSync(
        path.join(pathUtils.dataPath, "imgToGet.json")
      );
      fs.rmSync(path.join(pathUtils.dataPath, "imgToGet.json"));
      const imgToGet = JSON.parse(imgToGetBuffer.toString()) as string[];
      this.imagesURL = new Set(imgToGet);
    } catch (error) {
      this.imagesURL = new Set();
    }
  }

  pushImageURLToSet(imgURL: string) {
    this.imagesURL.add(imgURL);
  }

  async getImages() {
    logger.log("正在保存图片");
    const imagesURLAry = Array.from(this.imagesURL);
    const trimedImgURLAry: string[] = [];
    const imagesIDInDB = await storage.getLastImagesId(imagesURLAry.length * 5);
    imagesURLAry.forEach((imgURL) => {
      const isInDB = imagesIDInDB.includes(getImgID(imgURL));
      if (!isInDB) trimedImgURLAry.push(imgURL);
    });
    await saveImages(trimedImgURLAry);
  }
};

const getImageController = new GetImageController();

export default getImageController;
