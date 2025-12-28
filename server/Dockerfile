FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD sh -c 'if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then npm run build; fi && npm run migration:run || echo "Migration failed or already applied" && npm run start:prod'
