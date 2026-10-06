FROM node:24-slim

WORKDIR /app

# pnpm comes from the packageManager field (pnpm@10.33.2) via corepack.
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src ./src

ENV NODE_ENV=production

# The unit runs both of these out of node_modules, so devDependencies
# (drizzle-kit, tsx) are part of the payload, not just build-time tools.
CMD ["sh", "-c", "node ./node_modules/drizzle-kit/bin.cjs migrate; ./node_modules/.bin/tsx src/index.ts"]
