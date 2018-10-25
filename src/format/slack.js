var Numeral = require('numeral')

let currency = '$0,0.00'
let percent = '0.00%'

let green = '#61B329'
let red = '#CD3333'

function asText (entries) {
    return entries.map(entry => textFormat(formatData(entry))).join('\n')
}

function asAttachments(entries) {
    return {
        'attachments': entries.map(entry => attachmentFormat(formatData(entry)))
    }
}

function textFormat(data) {
    return `*${data.ticker}* (${data.name})\n\`${data.price}\` (${data.priceChange} / ${data.percentChange})`
}

function attachmentFormat(data) {
    var color = (isNegative(data.priceChange)) ? red : green
    return {
        'title': `${data.name}`,
        'text': `*${data.price}* (${data.priceChange} / ${data.percentChange})`,
        'color': color
    }
}

function isNegative(number) {
    return number.includes('-')
}

function formatData(data) {
    data.price = Numeral(data['price']).format(currency)
    data.priceChange = Numeral(data['priceChange']).format(currency)
    data.percentChange = Numeral(data['percentChange']).format(percent)
    return data
}

module.exports = {
    asText,
    asAttachments
}