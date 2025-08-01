
FROM node:18-bullseye-slim

WORKDIR /app


COPY package*.json ./
RUN npm install


COPY . .


RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]