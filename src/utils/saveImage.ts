import axios from "axios";

import storage from "../database/instanceGetter";

const saveImage = async (imgURL: string) => {
  const imgJpgURL = imgURL.replace(".webp", ".jpg");
  const imgURLAry = imgJpgURL.split("/");
  const imgID = imgURLAry[imgURLAry.length - 1].replace(".jpg", "");
  const { data }: { data: Blob } = await axios.get(imgJpgURL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/jxl,image/jpeg,*/*;q=0.8",
    },
    responseType: "arraybuffer",
  });
  // const imgContent = new Blob([data], { type: "image/jpeg" });
  await storage.savePicture({ imgID, imgContent: data });
};

export default saveImage;
