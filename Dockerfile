# 阶段1：构建前端
FROM node:24-alpine AS client-build
WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# 阶段2：编译后端
FROM node:24-alpine AS server-build
WORKDIR /build/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# 阶段3：生产镜像
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=server-build /build/server/package*.json ./
RUN npm ci --omit=dev

COPY --from=server-build /build/server/dist ./dist
COPY --from=client-build /build/client/dist ./client/dist

USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
