var Request = require('request');

function getStockQuotes(tickers, callback) {

    getQuotesFromIEX(tickers, function(err, data) {
        if (err) {
            callback(err)
        }

        var validTickers = Object.keys(data).map(key => transformResponse(data, key))

        if (!validTickers.length) {
            callback("No valid tickers!")
        }

        callback(null, validTickers)
    })
}

function getQuotesFromIEX(tickers, callback) {

    let params = tickers.join(',')
    console.log({"params": params})
    var options = {
        method: 'GET',
        url: `https://api.iextrading.com/1.0/stock/market/batch?types=quote&symbols=${params}`,
        headers: {
          'Content-Type': 'application/json',
        }
    };

    Request(options, function(err, response, body) {
        if(err) {
            callback(err)
        }

        callback(null, JSON.parse(body))
    })
}

function transformResponse(data, key) {
    var response = data[key].quote
    return {
        ticker: `${response['symbol']}`,
        name: `${response['companyName']}`,
        price: `${response['latestPrice']}`,
        priceChange: `${response['change']}`,
        percentChange: `${response['changePercent']}`
    }
}

module.exports= {
    getStockQuotes
}