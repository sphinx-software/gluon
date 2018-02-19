FROM node:carbon
WORKDIR /gluon
COPY ./package.json /gluon
COPY ./package-lock.json /gluon
RUN npm install
