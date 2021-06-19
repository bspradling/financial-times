use anyhow::Result;
use log::info;
use yahoo_finance_api as yahoo;
use yahoo_finance_api::YahooConnector;

pub struct StocksClient {
    client: YahooConnector,
}

impl StocksClient {
    pub fn new() -> Self {
        StocksClient {
            client: yahoo::YahooConnector::new(),
        }
    }

    pub async fn quote(self, ticker: &str) -> Result<String> {
        let quote = self.client.get_latest_quotes(ticker, "1m").await?;
        info!("{:?}", quote);
        info!("{:?}", quote.last_quote()?.close.to_string());
        Ok(quote.last_quote()?.close.to_string())
    }
}

pub struct Quote {}
