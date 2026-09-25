FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and client files
COPY package.json ./
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
RUN cd client && npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server ./server
COPY --from=builder /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

CMD ["node", "server/src/index.js"]
