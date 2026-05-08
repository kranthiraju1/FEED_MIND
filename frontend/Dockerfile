FROM node:18-alpine

WORKDIR /app

COPY frontend/package.json /app/frontend/package.json
COPY frontend/vite.config.js /app/frontend/vite.config.js
COPY frontend/index.html /app/frontend/index.html
RUN cd /app/frontend && npm install

COPY frontend/src /app/frontend/src
COPY .env.example /app/.env

WORKDIR /app/frontend
EXPOSE 3000
CMD ["npm", "run", "dev"]
