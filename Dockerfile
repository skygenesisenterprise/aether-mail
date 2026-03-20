FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY app/package.json app/pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY app/ ./
RUN pnpm install --frozen-lockfile && pnpm build

FROM golang:1.23-alpine AS backend-builder

WORKDIR /build

COPY server/go.mod server/go.sum* ./
RUN go mod download

COPY server/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o aether-server ./server/

FROM alpine:3.19 AS runtime

RUN apk add --no-cache nginx nodejs

WORKDIR /app

COPY --from=frontend-builder /app/.next/standalone ./
COPY --from=frontend-builder /app/.next/static ./
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./

COPY --from=backend-builder /build/aether-server ./

COPY app/nginx.conf /etc/nginx/http.d/default.conf

RUN addgroup -g 1000 -S aether && \
    adduser -u 1000 -S aether -G aether && \
    chown -R aether:aether /app

USER aether

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["sh", "-c", "nginx && ./aether-server & wait"]
