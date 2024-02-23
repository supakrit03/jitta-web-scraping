const summaryJson = require("./summary.json");

(async () => {
  //   avgPE: '10.63',
  //   sumOfRemovedTopBottomPE: 74.43,
  //   PE: [Array],
  //   removedTopBottomPE: [Array],
  //   EPS: [Array],
  //   stockKey: 'bkk:tks',
  //   currentPrice: 6.8,
  //   isCanBuy: true,
  //   predictFairPrice: '14.04',
  //   MOS30PE: '7.44',
  //   MOS30Price: '9.83',
  //   MOS25Price: '10.53'
  const interestStocks = summaryJson.filter((s) => s.isCanBuy);
  console.log({
    stocks: interestStocks.map((s) => ({
      stockKey: s.stockKey,
      currentPrice: s.currentPrice,
      predictFairPrice: s.predictFairPrice,
      MOS30Price: s.MOS30Price,
    })),
    stocksLength: interestStocks.length,
  });

  // const interestStocks = summaryJson.filter(
  //   (s) => s.MOS25Price > s.predictFairPrice
  // );
})();
