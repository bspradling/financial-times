use anyhow::Result;
use slack_morphism::listener::{
    SlackClientEventsUserStateStorage, SlackCommandEventsListenerConfig,
};
use slack_morphism_hyper::listener::{SlackCommandEvent, SlackCommandEventResponse};
use slack_morphism_hyper::SlackHyperClient;
use slack_morphism_models::SlackMessageContent;
use std::sync::{Arc, RwLock};

pub fn configuration() -> Result<Arc<SlackCommandEventsListenerConfig>> {
    return Ok(Arc::new(SlackCommandEventsListenerConfig::new(
        std::env::var("SLACK_SIGNING_SECRET")?,
    )));
}

pub async fn receive(
    event: SlackCommandEvent,
    _client: Arc<SlackHyperClient>,
    _states: Arc<RwLock<SlackClientEventsUserStateStorage>>,
) -> Result<SlackCommandEventResponse, Box<dyn std::error::Error + Send + Sync>> {
    println!("{:#?}", event);
    Ok(SlackCommandEventResponse::new(
        SlackMessageContent::new().with_text("Working on it".into()),
    ))
}
