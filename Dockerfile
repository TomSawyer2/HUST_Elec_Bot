FROM alpine:edge

RUN mkdir -p /home/elecbot
WORKDIR /home/elecbot

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  yarn \
  python3

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . /home/elecbot

RUN yarn config set registry 'https://registry.npmmirror.com' && \
  yarn config set sharp_binary_host "https://npmmirror.com/mirrors/sharp" && \
  yarn config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips" && \
  yarn global add node-gyp && \
  yarn add sharp --verbose && \
  yarn global add pm2 && \
  yarn install && \
  yarn cache clean
