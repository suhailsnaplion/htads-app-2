FROM node:22-slim AS base
WORKDIR /app

# Install deps (using npm here since it needs no extra setup in the image)
COPY package.json ./
RUN npm install

COPY . .

# Build the frontend
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server/src/index.js"]
