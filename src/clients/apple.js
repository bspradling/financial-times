var Request = require('request');
var Xml2js = require('xml2js');

function getStockQuotes(tickers, callback) {
    
    retrieveQuotesFromApple(tickers, function(err, messages){
        if (err) {
            callback(err)
        }

        var validTickers = messages.filter(isValidTicker).map(transformResponse)

        if (!validTickers.length) {
            callback("No valid tickers!")
        }

        callback(null, validTickers)
    })
}

function retrieveQuotesFromApple(tickers, callback) {
    var requestBody = {
        request: {
            $: {
                devtype: "Apple_OSX",
                deployver: "APPLE_DASHBOARD_1_0",
                app: "YGoAppleStocksWidget",
                appver: "unknown",
                api: "finance",
                apiver: '1.0.1',
                acknotification: "0000"
            },
            query: {
                $: {
                    id: "0", 
                    timestamp: Date.now(),
                    type: "getquotes"
                },
                list: {
                    symbol: []
                }
            }
        }
    };
    
    requestBody.request.query.list.symbol = tickers

    var xml = new Xml2js.Builder({explicitArray: false}).buildObject(requestBody)

    var options = {
        method: 'POST',
        url: 'http://wu-quotes.apple.com/dgw?imei=42&apptype=finance',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xml
      };

    var xmlParser = new Xml2js.Parser()

    Request(options, function (error, response, body) {
        xmlParser.parseString(body, function(err, data){ 
            if (err) {
                callback(err)
            }
            callback(null, data.response.result[0].list[0].quote || [])
        })
    });
}

function isValidTicker(data) {
    return data['currency'] == "USD"
}

function transformResponse(data) {
    return {
        ticker: `$${data['symbol']}`,
        name: data['issuername'] || data['name'],
        price: data['price'],
        priceChange: data['change'],
        percentChange: `${data['changepercent']}%`
    }
}

module.exports = {
    getStockQuotes
}