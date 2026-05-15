FROM oven/bun:1.3.4-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/booster-role.sqlite

CMD ["bun", "run", "src/index.ts"]
