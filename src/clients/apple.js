var Async = require('async')
var Numeral = require('numeral')
var Request = require('request');
var Xml2js = require('xml2js');

let currency = '$0,0.00'
let percent = '0.00%'

function getStockUpdates(tickers, callback) {
    var strippedTickers = tickers.map(ticker => { return ticker.substring(1)})
    getQuotes(strippedTickers, function(err, messages){
        if (err) {
            callback(err)
        }

        var formattedMessages = messages.filter(isValidTicker)
                                        .map(formatMessage)

        if (!formattedMessages.length) {
            callback("[ERROR] No valid tickers!")
        }

        callback(null, formattedMessages.join('\n'))
    })
}

function getQuotes(tickers, callback) {
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

function formatMessage (data) {
    var ticker = `$${data['symbol']}`
    var companyName = data['issuername'] || data['name']
    var price = Numeral(data['price']).format(currency)
    var priceChange = Numeral(data['change']).format(currency)
    var percentChange = Numeral(data['changepercent']+"%").format(percent)
    
    console.log(`Reporting on ${ticker}`)
    return `*${ticker}* (${companyName})\n\`${price}\` (${priceChange} / ${percentChange})`
}

module.exports= {
    getStockUpdates
}