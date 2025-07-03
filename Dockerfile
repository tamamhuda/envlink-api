FROM node:22-alpine
WORKDIR /app

# Use apk for Alpine Linux to install postgresql-client
RUN apk add --no-cache postgresql-client

COPY package*.json ./

COPY . .

RUN npm install --production

# Build app
RUN npm run build

EXPOSE 3000

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]