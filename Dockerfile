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

# Backend setup
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/
COPY --from=build-frontend /app/client/dist ./client/dist

# Data directory for SQLite
RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 6100
ENV NODE_ENV=production
ENV PORT=6100
ENV DB_PATH=/app/data/promptvault.db

CMD ["node", "server/index.js"]
