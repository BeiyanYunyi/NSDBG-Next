import playwright from "playwright";

import config from "../config/config";
import pageInstance from "../instances/Page";

const initPageInstance = async () => {
  const pw = await playwright.firefox.launch({ headless: false });
  const page = await pw.newPage({
    extraHTTPHeaders: {
      Cookie: config.cookie.substring(8),
    },
  });
  pageInstance.changePage(page);
};

export default initPageInstance;
