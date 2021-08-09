import playwright from "playwright";

class Page {
  page!: playwright.Page; // 好孩子别学我
  context!: playwright.BrowserContext;
  changePage(page: playwright.Page) {
    this.page = page;
  }
  changeContext(context: playwright.BrowserContext) {
    this.context = context;
  }
}

const pageInstance = new Page();

export default pageInstance;
