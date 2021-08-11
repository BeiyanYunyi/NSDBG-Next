import fs from "fs/promises";
import path from "path";

import pageInstance from "../instances/Page";
import pathUtils from "../utils/pathUtils";

const closePageInstance = async () => {
  const cookies = await pageInstance.context.cookies();
  await fs.writeFile(
    path.join(pathUtils.dataPath, "cookies.json"),
    JSON.stringify(cookies, null, 2)
  );
  await pageInstance.context.close();
};

export default closePageInstance;
