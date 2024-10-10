docker build . -t klines-listener
docker image tag klines-listener ghcr.io/ripreal/klines-listener:latest
docker push ghcr.io/ripreal/klines-listener:latest
