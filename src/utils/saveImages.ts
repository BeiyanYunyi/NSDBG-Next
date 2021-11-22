import fs from "fs";
import path from "path";

import axios from "axios";

import storage from "../database/instanceGetter";
import progressBar from "../instances/progressBar";

import getImgID from "./getImgID";
import logger from "./logger";
import pathUtils from "./pathUtils";
import { basicWait } from "./wait";

const saveImage = async (imgURL: string) => {
  const imgJpgURL = imgURL.replace(".webp", ".jpg");
  const imgID = getImgID(imgURL);
  try {
    const { data }: { data: Blob } = await axios.get(imgJpgURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/jxl,image/jpeg,*/*;q=0.8",
        Referer: "https://www.douban.com",
      },
      responseType: "arraybuffer",
      timeout: 5000,
    });
    await storage.savePicture({ imgID, imgContent: data });
    progressBar.increment(1);
    return Promise.resolve(null);
  } catch (e) {
    return Promise.resolve(imgURL);
  }
};

const saveImages = async (imgURLs: string[]) => {
  const saveResultFilter = (result: string | null) => {
    if (result) {
      failCount += 1;
      return true;
    }
    return false;
  };
  progressBar.start(imgURLs.length, 0, { status: "" });
  const safeValue = Math.floor(imgURLs.length);
  let failCount = 0;
  let saveResultAry = await Promise.all(
    imgURLs.map(async (imgURL) => {
      return await saveImage(imgURL);
    })
  );
  saveResultAry = saveResultAry.filter(saveResultFilter);
  while (saveResultAry.length !== 0) {
    if (failCount > safeValue) {
      logger.error("出错超总数，请检查是否有故障");
      fs.writeFileSync(
        path.join(pathUtils.dataPath, "imgToGet.json"),
        JSON.stringify(saveResultAry.filter(saveResultFilter), null, 2)
      );
      throw new Error("出错超总数，请检查是否有故障");
    }
    await basicWait();
    saveResultAry = await Promise.all(
      saveResultAry.map(async (imgURL) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return await saveImage(imgURL!);
      })
    );
    saveResultAry = saveResultAry.filter(saveResultFilter);
  }
};

export default saveImages;
