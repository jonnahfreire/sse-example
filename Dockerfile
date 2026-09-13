FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY dist/src ./src

EXPOSE 3000

ENTRYPOINT [ "node" ]
CMD ["src/index.js"]