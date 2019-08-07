FROM node:10
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . /app
ENV TV_MAC="xx:xx:xx:xx:xx:xx" \
    TV_IP="xxx.xxx.xxx.xxx" \
    SERVICE_PORT=4000 \
    CALLBACK_URL_ON="" \
    CALLBACK_URL_OFF=""
CMD ["node index.js"]
