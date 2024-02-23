require("dotenv").config();

const puppeteer = require("puppeteer");

const { saveCookies } = require("./jitta-scrapper");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  console.log("Login..");

  await page.goto("https://accounts.jitta.com/login");

  const email = process.env.JITTA_EMAIL;
  const password = process.env.JITTA_PWD;

  await page.type("input[name=email]", email);
  await page.type("input[name=password]", password);

  const buttons = await page.$x("//button[contains(., 'เข้าสู่ระบบ')]");

  if (buttons[2]) {
    const button = buttons[2];
    await button.click();
    await page.waitForNavigation();

    console.log("Login success.");
    const cookies = await page.cookies();
    saveCookies(JSON.stringify(cookies));
  }

  await browser.close();
})();
