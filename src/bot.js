var AppleClient = require('./clients/apple')
var BotKit = require('botkit')
var Config = require('config')
var SlackFormat = require('./format/slack')

var stockTickerRegex = /\$[a-zA-Z]{1,5}/g

var slackConfig = Config.get('slack')
var slackBot = BotKit.slackbot({
    clientId: process.env.clientId || slackConfig.get('clientId'),
    clientSecret: process.env.clientSecret || slackConfig.get('clientSecret'),
    clientSigningSecret: process.env.signingSecret || slackConfig.get('signingSecret')
})
var slackToken = process.env.slackToken || slackConfig.get("token")

slackBot.spawn({token: slackToken})
        .startRTM(
            function (err) {
                if (err) {
                    throw new Error(err)
                }
            }
        )

slackBot.hears([stockTickerRegex],
               ['direct_message', 'direct_mention', 'mention', 'ambient'],
               function (bot, message) {
                    var tickers = message.text.match(stockTickerRegex)
                    console.log("Processing tickers..." + JSON.stringify(tickers))
                    var strippedTickers = tickers.map(ticker => { return ticker.substring(1)})
                    AppleClient.getStockQuotes(strippedTickers, function(err, data) {
                        if (err) {
                            console.error(`[ERROR] ${err}`)
                            return
                        }
                        
                        var formattedResponse = SlackFormat.formatMessage(data) 
                        bot.reply(message, formattedResponse)
                    })
                }); 