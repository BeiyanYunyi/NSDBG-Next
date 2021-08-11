import fs from "fs/promises";

import pageInstance from "../instances/Page";

const closePageInstance = async () => {
  const cookies = await pageInstance.context.cookies();
  await fs.writeFile("./data/cookies.json", JSON.stringify(cookies, null, 2));
  await pageInstance.context.close();
};

export default closePageInstance;
