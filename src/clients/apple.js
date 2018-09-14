var Xml2js = require('xml2js');
var Request = require('request');

function getStockUpdate(ticker, callback) {
    var stripped = ticker.substring(1)
    getQuote(stripped, function(err, data){
        console.log({STOCK: data})
        callback(null, data['price'])
    })
}

function getQuote(ticker, callback) {
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
                    symbol: ticker
                }
            }
        }
    };
    
    var xml = new Xml2js.Builder().buildObject(requestBody)

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
            callback(null, data.response.result[0].list[0].quote[0])
        })
    });
}

module.exports= {
    getStockUpdate
}