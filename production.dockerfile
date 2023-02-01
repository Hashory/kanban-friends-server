#########################################################
FROM --platform=linux/x86_64 node:18-slim

RUN apt-get update && \
    apt-get install -y locales
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y tzdata 
RUN locale-gen ja_JP.UTF-8
ENV LANG=ja_JP.UTF-8
ENV TZ=Asia/Tokyo
WORKDIR /kanban-friends-server

RUN npm install
RUN npx tsc --project tsconfig.production.json


CMD [ "node", "./src/index.js" ]
