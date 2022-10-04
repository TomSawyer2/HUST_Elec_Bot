FROM node:16.13.0

RUN mkdir -p /home/elecbot
WORKDIR /home/elecbot
COPY . /home/elecbot

RUN npm install -g pnpm@7
RUN npm config set registry https://registry.npmmirror.com
RUN pnpm install
