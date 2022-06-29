FROM node:latest as builder

WORKDIR /app

COPY . ./

RUN yarn install --frozen-lockfile --quiet
RUN yarn build

FROM node:latest

WORKDIR /app
ENV NODE_ENV production

COPY package.json ./
COPY yarn.lock ./
COPY --from=builder app/dist ./dist
COPY prisma ./prisma

RUN yarn install --production --frozen-lockfile --quiet
RUN yarn add prisma
RUN npx prisma generate
RUN yarn remove prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]