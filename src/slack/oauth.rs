use anyhow::Result;
use slack_morphism::api::SlackOAuthV2AccessTokenResponse;
use slack_morphism::listener::{SlackClientEventsUserStateStorage, SlackOAuthListenerConfig};
use slack_morphism_hyper::SlackHyperClient;
use std::sync::{Arc, RwLock};

pub fn configuration() -> Result<Arc<SlackOAuthListenerConfig>> {
    return Ok(Arc::new(SlackOAuthListenerConfig::new(
        std::env::var("SLACK_CLIENT_ID")?,
        std::env::var("SLACK_CLIENT_SECRET")?,
        std::env::var("SLACK_BOT_SCOPE")?,
        std::env::var("SLACK_REDIRECT_HOST")?,
    )));
}

pub async fn receive(
    resp: SlackOAuthV2AccessTokenResponse,
    _client: Arc<SlackHyperClient>,
    _states: Arc<RwLock<SlackClientEventsUserStateStorage>>,
) {
    println!("{:#?}", resp);
}
