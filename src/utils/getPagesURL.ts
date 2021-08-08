import groupURL from "./groupURL";

const getPagesURL = (lastPageNum: number): string[] => {
  const aryToReturn: string[] = [];
  for (let i = 0; i < lastPageNum; i++) {
    aryToReturn.push(`${groupURL}?start=${25 * i}`);
  }
  return aryToReturn;
};

export default getPagesURL;
