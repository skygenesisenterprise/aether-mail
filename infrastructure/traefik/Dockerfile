FROM alpine:latest

# Installer socat pour proxifier le socket Docker
RUN apk add --no-cache socat

# Script pour démarrer socat
CMD ["socat", "-d", "-d", \
     "UNIX-LISTEN:/var/run/docker-proxy.sock,fork,reuseaddr,unlink-early,mode=777", \
     "UNIX-CONNECT:/var/run/docker.sock"]