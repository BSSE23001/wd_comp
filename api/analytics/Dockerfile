FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY pris_client/package.json ./pris_client/package.json
COPY api/analytics/package.json ./api/analytics/package.json

# Install only analytics and its workspace dependency tree.
RUN pnpm install --frozen-lockfile --filter analytics...

COPY pris_client ./pris_client
COPY api/analytics ./api/analytics

WORKDIR /app/api/analytics

EXPOSE 4005

CMD ["sh", "-c", "pnpm --filter @repo/prisma db:generate && pnpm exec tsx src/index.ts"]
