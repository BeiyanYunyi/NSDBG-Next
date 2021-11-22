const getImgID = (imgURL: string) => {
  const imgURLStrAry = imgURL
    .replace(".webp", "")
    .replace(".jpg", "")
    .split("/");
  return imgURLStrAry[imgURLStrAry.length - 1].substring(1);
};

export default getImgID;
