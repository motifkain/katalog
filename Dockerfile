FROM alpine:latest

# Install curl and unzip
RUN apk add --no-cache curl unzip

# Download and extract PocketBase
RUN curl -L "https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip" -o pocketbase.zip && \
    unzip pocketbase.zip pocketbase && \
    rm pocketbase.zip && \
    chmod +x pocketbase

# Create data directory
RUN mkdir -p /pb_data

# Expose default port
EXPOSE 8090

# Start PocketBase
CMD ["./pocketbase", "serve", "--http", "0.0.0.0:8090", "--dir", "/pb_data"]
