use crate::slack::events::EventsHandler;
use anyhow::Result;
use hyper::service::{make_service_fn, service_fn};
use hyper::{http, Body, Request, Response};
use log::{error, info};
use slack_morphism::api::{
    SlackApiChatPostMessageRequest, SlackApiChatPostMessageResponse,
    SlackOAuthV2AccessTokenResponse,
};
use slack_morphism::listener::{
    SlackClientEventsListenerEnvironment, SlackClientEventsUserStateStorage,
    SlackCommandEventsListenerConfig, SlackOAuthListenerConfig, SlackPushEventsListenerConfig,
};
use slack_morphism::prelude::{SlackCommandEvent, SlackCommandEventResponse, SlackPushEvent};
use slack_morphism::{ClientResult, SlackApiToken, SlackApiTokenValue, SlackClient};
use slack_morphism_hyper::{
    chain_service_routes_fn, SlackClientEventsHyperListener, SlackClientHyperConnector,
    SlackHyperClient,
};
use slack_morphism_models::SlackMessageContent;
use std::error::Error;
use std::sync::{Arc, RwLock};
use tokio;

mod slack;
mod stocks;

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    info!("Starting program");
    println!("brett s");
    let hyper_connector = SlackClientHyperConnector::new();
    let client = SlackClient::new(hyper_connector);
    // client.open_session(SlackApiToken::new())
    let token_value: SlackApiTokenValue = "".into();
    let token: SlackApiToken = SlackApiToken::new(token_value);
    let session = client.open_session(&token);

    let message = SlackApiChatPostMessageRequest::new(
        "#financial-times-dev".into(),
        SlackMessageContent::new().with_text("Hey there server3!".into()),
    );

    // let response = session.chat_post_message(&message).await;

    let server = create_slack_events_listener_server().await;

    match server {
        Ok(haha) => {
            info!("{:?}", haha)
        }
        Err(err) => {
            error!("{:?}", err)
        }
    }

    info!("{:?}", message);
    let response = session.chat_post_message(&message).await;
    println!("{:?}", response);
    Ok(())
}

async fn create_slack_events_listener_server(
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // let addr = std::net::SocketAddr::from(([10, 20, 117, 55], 8080));
    let addr = std::net::SocketAddr::from(([192, 168, 0, 108], 8080));
    info!("Loading server: {}", addr);

    // This is our default HTTP route when Slack routes didn't handle incoming request (different/other path).
    async fn default_route(
        _req: Request<Body>,
    ) -> Result<Response<Body>, Box<dyn std::error::Error + Send + Sync>> {
        Response::builder()
            .body("404 Not Found".into())
            .map_err(|e| e.into())
    }

    let make_svc = make_service_fn(|_| async {
        // We need also a client instance. `Arc` used here because we would like
        // to share the the same client for all of the requests and all hyper threads
        let hyper_connector = SlackClientHyperConnector::new();

        // Chaining all of the possible routes for Slack.
        // `chain_service_routes_fn` is an auxiliary function from Slack Morphism
        let client: Arc<SlackClient<SlackClientHyperConnector>> =
            Arc::new(SlackClient::new(hyper_connector));

        // Creating a shared listener environment with an ability to share client and user state
        let listener_environment = Arc::new(
            SlackClientEventsListenerEnvironment::new(client.clone()).with_error_handler(
                |err, _, _| {
                    println!("{:#?}", err);
                    http::StatusCode::BAD_REQUEST
                },
            ),
        );

        // Creating listener
        let listener = SlackClientEventsHyperListener::new(listener_environment.clone());
        let routes = chain_service_routes_fn(
            listener.oauth_service_fn(slack::oauth::configuration()?, slack::oauth::receive),
            chain_service_routes_fn(
                listener
                    .push_events_service_fn(slack::events::configuration()?, EventsHandler::handle),
                chain_service_routes_fn(
                    listener.interaction_events_service_fn(
                        slack::interactions::configuration()?,
                        slack::interactions::receive,
                    ),
                    chain_service_routes_fn(
                        listener.command_events_service_fn(
                            slack::commands::configuration()?,
                            slack::commands::receive,
                        ),
                        default_route,
                    ),
                ),
            ),
        );

        Ok::<_, anyhow::Error>(service_fn(routes))
    });

    info!("starting server");
    // Starting a server with listener routes
    let server = hyper::server::Server::bind(&addr).serve(make_svc);
    server.await.map_err(|e| {
        error!("Server error: {}", e);
        e.into()
    })
}
