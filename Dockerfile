FROM node:14
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install
COPY . .
RUN bash bin/tz-script.sh
EXPOSE 8080
CMD ["yarn", "start"]
