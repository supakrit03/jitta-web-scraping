const puppeteer = require("puppeteer");
const fs = require("fs");

const formulaKeys = {
  Price: 0,
  PE: 1,
  EPS: 3,
};

const pageOptions = { timeout: 0 };

/**
 * @type { puppeteer.Page }
 */

async function setCookies(pageInstant, cookiesJSON) {
  for (let i = 0; i < cookiesJSON.length; i++) {
    await pageInstant.setCookie(cookiesJSON[i]);
  }
}

/**
 *
 * @param { string } stockKey // slug stock from Jitta.com ex. bkk:com7
 */
async function runScrap(stockKey) {
  if (!stockKey) {
    console.log("Stock key is empty.", { stockKey });
    return;
  }

  console.log("Warn: Do logout Jitta site before run this script..");

  const cookies = await getCookies();

  const { page, browser } = await getPageInstant();

  await setCookies(page, JSON.parse(cookies));

  const factSheetLink = `https://www.jitta.com/stock/${stockKey}/factsheet`;
  console.log({ factSheetLink });
  await page.goto(factSheetLink, pageOptions);

  const data = await page.evaluate(() => {
    const spans = Array.from(
      document.querySelectorAll(
        "span[class*=FactsheetTableRow__TooltipWrapper]"
      )
    );
    return spans.map((span) => span.innerText);
  });

  const formulas = await page.evaluate(() => {
    const divs = Array.from(
      document.querySelectorAll(
        "div[class*=FactsheetTableRow__FlexLast] div div"
      )
    );
    return divs.map((div) => div.innerText);
  });

  const jittaScore = await page.evaluate(() => {
    const jittaScoreText = document.querySelector(
      "div[class*=JittaScoreBlock__ScoreBlock]"
    ).innerText;

    return parseFloat(jittaScoreText);
  });

  const chunkSize = 10;
  const chunks = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  const title = await page.title();
  await browser.close();

  return {
    title,
    chunks,
    formulas,
    jittaScore,
  };
}

function saveCookies(content) {
  if (!content) return;
  fs.writeFile("./cookies.json", content, (err) => {
    if (err) {
      console.error(err);
    }
    console.log("Saved cookies.");
  });
}

function getCookies() {
  return new Promise((rs) => {
    fs.readFile("./cookies.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      rs(data);
    });
  });
}

/**
 *
 * @param { puppeteer.Page } pageInstant
 * @returns
 */
async function auth() {
  try {
    const { page } = await getPageInstant();

    console.log("Authentication..");

    const cookies = await getCookies();
    const cookiesJSON = JSON.parse(cookies);

    console.log("Set cookies..");
    await setCookies(page, cookiesJSON);

    console.log("Go to Jitta growth-strategy page..");
    await page.goto(
      "https://www.jitta.com/explore/growth-strategy",
      pageOptions
    );

    const title = await page.title();

    const growthStrategyTitle = "Growth Strategy - Playlist | Jitta";

    console.log("Got title " + title);
    if (title === growthStrategyTitle) {
      console.log("Auth success");

      return true;
    }
    console.log("Auth fail");
    return false;
  } catch (error) {
    console.log({ error });
  }
}

async function getPageInstant() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-features=site-per-process"],
  });
  return {
    page: await browser.newPage(),
    browser,
  };
}

module.exports = {
  runScrap,
  formulaKeys,
  auth,
  getPageInstant,
  saveCookies,
  getCookies,
  setCookies,
};
