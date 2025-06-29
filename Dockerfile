FROM node:23

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]

# CMD ["node", "src/index.js", "--trace-warnings"]
