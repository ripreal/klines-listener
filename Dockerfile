FROM mirror.gcr.io/node:18.17.1-alpine as development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --global npm@7.5.6 
RUN npm install

COPY . .

RUN npm run build

FROM mirror.gcr.io/node:18.17.1-alpine as production

RUN apk update
RUN apk add curl

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --global npm@7.5.6
RUN npm install --only=production

COPY --from=development /usr/src/app/dist ./dist

CMD [ "npm", "run", "start:prod" ]
