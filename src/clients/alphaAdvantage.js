const Alpha = require("alphavantage");
var Config = require('config')

const client = Alpha({ key: Config.get('alphaAdvantage').get('apiKey') });

function getStockQuotes(tickers, callback) {

    Promise.all(
        tickers.map(ticker => client.data.quote(ticker))
    ).then(data => {
        console.log("Successfully retrieved quote")
        callback(null, 
            data.map(record => record['Global Quote'])
            .filter(isValidTicker)
            .map(transformResponse))
    }).catch(error => {
        console.log("An error occurred")
        callback("An error occurred retrieving quotes!")
    })
}

function isValidTicker(data) {
    return '01. symbol' in data && '05. price' in data
}

function transformResponse(data) {
    return {
        ticker: `${data['01. symbol']}`,
        name: `${data['01. symbol']}`,
        price: `${data['05. price']}`,
        priceChange: `${data['09. change']}`,
        percentChange: `${data['10. change percent']}%`
    }
}

module.exports = {
    getStockQuotes
}