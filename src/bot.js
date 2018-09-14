var AppleClient = require('./clients/apple')
var BotKit = require('botkit')
var Config = require('config')

var stockTickerRegex = new RegExp('\\$[a-zA-Z]{0,5}')

var slackConfig = Config.get('slack')
var slackBot = BotKit.slackbot({
    debug: true,
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
                   console.log({TICKERS:tickers})
                   //TODO support multiple tickers per message
                   AppleClient.getStockUpdate(tickers[0], function(err, data) {
                        //TODO fix having to index the array here
                        bot.reply(message, data[0])
                   }) 
                });