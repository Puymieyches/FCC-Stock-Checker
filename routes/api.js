'use strict';
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');
const StockLikes = require('../mongoose-models');

async function getStockInfo(symbol) {
  try {
    
    const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching ${symbol} data: ${response.statusText}`);
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
};

async function hashIp(ip) {
  const saltRounds = 10;
  return await bcrypt.hash(ip, saltRounds);
}


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const { stock, like } = req.query;
      const ip = req.ip;

      const hashedIp = await hashIp(ip);

      const stocks = Array.isArray(stock) ? stock : [stock];

      let symbol, latestPrice, symbol2, latestPrice2;
      let stockLikesInfo, stockLikesInfo2;
      if (stocks.length === 1) {
        // API
        ({ symbol, latestPrice } = await getStockInfo(stocks[0]));
        // DB
        stockLikesInfo = await StockLikes.findOne({ symbol: symbol });
        if (!stockLikesInfo) {
          stockLikesInfo = await StockLikes.create({ symbol: symbol });
        }
        // Like Ticked?
        // Ip Exists in Stock? and like ticked?
        if ((like == 'true') && !stockLikesInfo.ipAddresses.includes(hashedIp)) {
          stockLikesInfo.likes += 1;
          stockLikesInfo.ipAddresses.push(hashIp);
          await stockLikesInfo.save();
        }
        return res.json({ stockData: { stock: symbol, price: latestPrice, likes: stockLikesInfo.likes }});

      } else if (stocks.length === 2) {
        // API
        ({ symbol, latestPrice } = await getStockInfo(stocks[0]));
        ({ symbol: symbol2, latestPrice: latestPrice2 } = await getStockInfo(stocks[1]));
        // DB
        stockLikesInfo = await StockLikes.findOne({ symbol: symbol });
        if (!stockLikesInfo) {
          stockLikesInfo = await StockLikes.create({ symbol: symbol });
        }
        stockLikesInfo2 = await StockLikes.findOne({ symbol: symbol2 });
        if (!stockLikesInfo2) {
          stockLikesInfo2 = await StockLikes.create({ symbol: symbol2 });
        }
        // Like Ticked?
        // rel_likes
        let relLikes, relLikes2;
        if (like === 'true') {
          // Ip Exists in Stock?
          // stock 1
          if (!stockLikesInfo.ipAddresses.includes(hashIp)) {
            stockLikesInfo.likes += 1;
            stockLikesInfo.ipAddresses.push(hashedIp);
            await stockLikesInfo.save();
          }
          // stock 2
          if (!stockLikesInfo2.ipAddresses.includes(hashedIp)) {
            stockLikesInfo2.likes += 1;
            stockLikesInfo2.ipAddresses.push(hashedIp);
            await stockLikesInfo2.save();
          }
        }

        relLikes = stockLikesInfo.likes - stockLikesInfo2.likes;
        relLikes2 = stockLikesInfo2.likes - stockLikesInfo.likes;

        return res.json({ stockData: [{ stock: symbol, price: latestPrice, rel_likes: relLikes }, { stock: symbol2, price: latestPrice2, rel_likes: relLikes2 }]});

      }


    });
    
};
