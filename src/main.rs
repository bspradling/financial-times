use anyhow::Result;
use log::info;
use slack_morphism_hyper::SlackClientHyperConnector;
use slack_morphism::{SlackClient, SlackApiToken, SlackApiTokenValue, ClientResult};
use slack_morphism::api::{SlackApiChatPostMessageRequest, SlackApiChatPostMessageResponse};
use slack_morphism_models::SlackMessageContent;
use tokio;

#[tokio::main]
async fn main() -> Result<()> {

    info!("Starting program");
    let hyper_connector = SlackClientHyperConnector::new();
    let client = SlackClient::new(hyper_connector);
    // client.open_session(SlackApiToken::new())
    let token_value: SlackApiTokenValue = "xoxb-121376327456-2153727258290-ntiMIEXKRXWtalLVhXhjs1tK".into();
    let token: SlackApiToken = SlackApiToken::new(token_value);
    let session = client.open_session(&token);

    let message = SlackApiChatPostMessageRequest::new(
        "#financial-times-dev".into(),
        SlackMessageContent::new().with_text("Hey there!".into())
    );

    info!("{:?}", message);
    return session.chat_post_message(&message);
}
