var BotKit = require('botkit')
var Config = require('config')

console.log(Config)
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

slackBot.hears([new RegExp('\\$[a-zA-Z]{0,5}')],
               ['direct_message', 'direct_mention', 'mention', 'ambient'],
               function (bot, message) { console.log("haha"); bot.reply(message, 'Test!') })