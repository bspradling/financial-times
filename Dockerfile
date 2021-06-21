FROM rust:1.53.0 as build
RUN rustup component add rustfmt

WORKDIR /rust

COPY . .
RUN cargo build
RUN ls /rust/target/debug

FROM gcr.io/distroless/cc-debian10

COPY --from=build /rust/target/debug /
ENV RUST_LOG=INFO

ENTRYPOINT ["/financial-times"]
