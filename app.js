const fs = require("fs");
const { auth, runScrap, formulaKeys } = require("./jitta-scrapper");
const stockList = require("./stock-list.json");

/**
 * @param { string[] } list
 */
function cutTopAndBottom(list) {
  const removedFlag = "#";

  const convertToNumberArr = [...list].map((n) => {
    const num = parseFloat(n);
    return isNaN(num) ? removedFlag : num;
  });

  const filterFlagOut = (n) => n != removedFlag;

  const min = Math.min(...convertToNumberArr.filter(filterFlagOut));
  const max = Math.max(...convertToNumberArr.filter(filterFlagOut));

  console.log({ min, max });

  return convertToNumberArr
    .reduce((prev, current) => {
      if (current === min || current === max) {
        return [...prev, removedFlag];
      }
      return [...prev, current];
    }, [])
    .filter(filterFlagOut)
    .sort();
}

async function calFairPrice(stockKey, callback) {
  const { title, chunks, formulas, jittaScore } = await runScrap(stockKey);

  console.log(title);
  console.log(formulas[formulaKeys.PE]);

  const Prices = chunks[formulaKeys.Price];
  const PE = chunks[formulaKeys.PE];
  const EPS = chunks[formulaKeys.EPS];

  const currentPrice = Prices[Prices.length - 1];

  // Need to find exactly value hear
  // <= ประเมินจากอดีตคร่าวๆ ลบลงหรือใช้ค่าล่าสุด ต้องหาวิธีคำนวณเพิ่ม
  const filteredEPS = EPS.filter((item) => item !== "- -");
  const latestEPS = parseFloat(filteredEPS[filteredEPS.length - 1]);
  //

  const removedTopBottomPE = cutTopAndBottom(PE);
  const sumOfRemovedTopBottomPE = removedTopBottomPE.reduce(
    (prev, current, index) => prev + current,
    0
  );

  const avgPE = sumOfRemovedTopBottomPE / removedTopBottomPE.length;

  const predictFairPrice = (latestEPS * avgPE).toFixed(2);

  const MOS30PE = (avgPE * 0.7).toFixed(2);
  const MOS30Price = (predictFairPrice * 0.7).toFixed(2);
  const MOS25Price = (predictFairPrice * 0.75).toFixed(2);

  callback();

  const isCanBuy =
    parseFloat(currentPrice) <= parseFloat(MOS30Price) && jittaScore > 6;

  const data = {
    avgPE: avgPE.toFixed(2),
    sumOfRemovedTopBottomPE,
    PE,
    removedTopBottomPE,
    EPS,
    filteredEPS,
    latestEPS,
    stockKey,
    currentPrice: parseFloat(currentPrice),
    canBuyFormula:
      "parseFloat(currentPrice) <= parseFloat(MOS30Price) && jittaScore > 6;",
    isCanBuy,
    predictFairPrice,
    MOS30Price,
    MOS25Price,
    jittaScore,
    MOS30PE,
  };
  console.log(data);

  return data;
}

function createSummary(content) {
  fs.writeFile("./summary.json", content, (err) => {
    if (err) {
      console.error(err);
    }
    console.log("Summary created.");
  });
}

(async () => {
  console.log({ total: stockList.length });

  //  --------- Run ---------
  const dataJson = [];

  try {
    for (let [index, stock] of stockList.entries()) {
      console.log(`stock ${index} : `, stock);
      dataJson.push(await calFairPrice(stock, () => {}));
    }

    createSummary(JSON.stringify(dataJson));
    console.log("Run succeed");
  } catch (error) {
    console.error(error);
    createSummary(JSON.stringify(dataJson));
  }
})();
