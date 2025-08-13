FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

RUN npm i -g serve

CMD [ "serve", "-s", "dist" ]
