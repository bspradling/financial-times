var Numeral = require('numeral')

let currency = '$0,0.00'
let percent = '0.00%'

function formatMessage (entries) {
    var formattedEntries = entries.map(formatData)
    return formattedEntries.join('\n')
}

function formatData(data) {
    var price = Numeral(data['price']).format(currency)
    var priceChange = Numeral(data['priceChange']).format(currency)
    var percentChange = Numeral(data['percentChange']).format(percent)
    
    console.log(`Reporting on ${data.ticker}`)
    return `*${data.ticker}* (${data.name})\n\`${price}\` (${priceChange} / ${percentChange})`
}

module.exports = {
    formatMessage
}