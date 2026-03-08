# Stage 1: Build Frontend
FROM node:22-alpine AS build-frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Final Image
FROM node:22-alpine
WORKDIR /app

# Install security updates and curl for healthchecks
RUN apk update && apk upgrade && apk add --no-cache curl

# Backend setup
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/
COPY --from=build-frontend /app/client/dist ./client/dist

# Infrastructure Cleanup scripts
COPY scripts/migrate_legacy.sh /usr/local/bin/migrate_legacy
COPY scripts/telegram_notify.sh /usr/local/bin/telegram_notify
RUN chmod +x /usr/local/bin/migrate_legacy /usr/local/bin/telegram_notify

# Permissions
RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/promptvault.db

CMD ["node", "server/index.js"]
