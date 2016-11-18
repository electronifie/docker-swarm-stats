FROM node:7-alpine
MAINTAINER Anthony Schneider "https://github.com/electronifie"

ENV USERID 5000
ENV ELECTRONIFIE_SSH_DIR /home/electronifie/.ssh
RUN mkdir /electronifie

ADD . /electronifie
ADD run /usr/bin

RUN cd /electronifie && npm i
