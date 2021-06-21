use crate::stocks::StocksClient;
use anyhow::Result;
use futures::future::BoxFuture;
use hyper::{http, Body, Request, Response};
use log::info;
use slack_morphism::listener::{
    SlackClientEventsListenerEnvironment, SlackClientEventsUserStateStorage,
    SlackPushEventsListenerConfig,
};
use slack_morphism::prelude::{SlackEventCallbackBody, SlackMessageContent};
use slack_morphism::SlackClient;
use slack_morphism_hyper::listener::SlackPushEvent;
use slack_morphism_hyper::{
    SlackClientEventsHyperListener, SlackClientHyperConnector, SlackHyperClient,
};
use std::sync::{Arc, RwLock};

pub fn configuration() -> Result<Arc<SlackPushEventsListenerConfig>> {
    let push_events_config = Arc::new(SlackPushEventsListenerConfig::new(std::env::var(
        "SLACK_SIGNING_SECRET",
    )?));

    return Ok(push_events_config.clone());
}

pub struct EventsHandler {
    stocks_client: StocksClient,
}

impl EventsHandler {
    pub fn new() -> Self {
        EventsHandler {
            stocks_client: StocksClient::new(),
        }
    }

    pub async fn handle(
        event: SlackPushEvent,
        _client: Arc<SlackHyperClient>,
        _states: Arc<RwLock<SlackClientEventsUserStateStorage>>,
    ) {
        match event {
            SlackPushEvent::UrlVerification(_) => {
                info!("URL Verification")
            }
            SlackPushEvent::EventCallback(event2) => match event2.event {
                SlackEventCallbackBody::Message(message) => {
                    info!("Received message {:?}", message);
                    let text = message.content.and_then(|content| content.text);
                    info!("{:?}", text);

                    let price = StocksClient::new().quote(text.unwrap().as_str()).await;
                    info!("{:?}", price);
                }
                foo => info!("Unsupported push event {:?}", foo),
            },
            SlackPushEvent::AppRateLimited(_) => {
                info!("App Rate Not Supported")
            }
        }
    }
}
