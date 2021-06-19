use anyhow::Result;
use slack_morphism::listener::{
    SlackClientEventsUserStateStorage, SlackInteractionEventsListenerConfig,
};
use slack_morphism_hyper::listener::SlackInteractionEvent;
use slack_morphism_hyper::SlackHyperClient;
use std::sync::{Arc, RwLock};

pub fn configuration() -> Result<Arc<SlackInteractionEventsListenerConfig>> {
    return Ok(Arc::new(SlackInteractionEventsListenerConfig::new(
        std::env::var("SLACK_SIGNING_SECRET")?,
    )));
}

pub async fn receive(
    event: SlackInteractionEvent,
    _client: Arc<SlackHyperClient>,
    _states: Arc<RwLock<SlackClientEventsUserStateStorage>>,
) {
    println!("{:#?}", event);
}
