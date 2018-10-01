FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install
COPY . .
RUN bash tz-script.sh
EXPOSE 8080
CMD ["npm", "start"]
