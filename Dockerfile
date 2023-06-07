ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and install node modules
COPY package.json .

# Install all dependencies
RUN npm install

COPY ./ .

# Add app source code
# ADD . /usr/src/app

# EXPOSE 8080

ENV $PORT 8080

# ENTRYPOINT npm run start
CMD ["npm", "start"]