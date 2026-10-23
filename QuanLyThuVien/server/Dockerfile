FROM node:20-alpine AS base
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ .
RUN chmod +x wait-for-db.sh

EXPOSE 3000
CMD ["sh", "wait-for-db.sh"]
