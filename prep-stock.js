const puppeteer = require("puppeteer");
const fs = require("fs");

const { getCookies, setCookies } = require("./jitta-scrapper");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  const cookies = await getCookies();

  await setCookies(page, JSON.parse(cookies));

  console.log("Prep stocks..");

  const listStockLink = `https://www.jitta.com/explore/growth-strategy`;
  console.log({ listStockLink });
  await page.goto(listStockLink);

  await page.waitForSelector(".FilterResults__ResultsWrapper-lnmeq7-0");

  const data = await page.evaluate(() => {
    const divArr = Array.from(
      document.querySelectorAll(".Text__TextXS-dn2wcp-3.jiPJYH")
    );
    const andOperator = "&amp;";

    return divArr.map((item) => {
      const str = item.innerHTML.toLowerCase();
      if (str.includes(andOperator)) {
        return str.replace(andOperator, "&");
      }
      return str;
    });
  });

  fs.writeFile("./stock-list.json", JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
    }
    console.log("Stock list created.");
  });

  browser.close();
})();

// Second choice
// let data = []
// document.querySelectorAll(".Text__TextXS-dn2wcp-3.jiPJYH").forEach((item) => {
//      const andOperator = "&amp;";
//     const str = item.innerHTML.toLowerCase();
//       if (str.includes(andOperator)) {
//         data.push(str.replace(andOperator, "&"))
//       }
//       data.push(str);
// })

// console.log({ data })
