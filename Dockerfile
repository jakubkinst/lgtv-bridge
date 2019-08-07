FROM node:10
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app
ENV TV_MAC="xx:xx:xx:xx:xx:xx" \
    TV_IP="xxx.xxx.xxx.xxx" \
    SERVICE_PORT=4000
CMD ["node", "index.js"]
