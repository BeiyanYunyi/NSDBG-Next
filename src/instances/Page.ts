import playwright from "playwright";

class Page {
  page!: playwright.Page; // 好孩子别学我
  changePage(page: playwright.Page) {
    this.page = page;
  }
}

const pageInstance = new Page();

export default pageInstance;
