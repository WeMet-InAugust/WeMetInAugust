# Use a lightweight Node image to run the example upload server
FROM node:18-alpine

WORKDIR /usr/src/app

# Install ffmpeg in alpine (uses a community repo) for demo purposes
RUN apk add --no-cache ffmpeg bash

COPY package.json package-lock.json ./
RUN npm ci --production

COPY server ./server

EXPOSE 3000
CMD ["node", "server/upload-handler-express.js"]
