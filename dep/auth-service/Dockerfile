FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY pris_client/package.json ./pris_client/package.json
COPY api/auth-service/package.json ./api/auth-service/package.json

# Install only auth-service and its workspace dependency tree.
RUN pnpm install --frozen-lockfile --filter auth-service...

COPY pris_client ./pris_client
COPY api/auth-service ./api/auth-service

WORKDIR /app/api/auth-service

EXPOSE 5000

CMD ["sh", "-c", "pnpm --filter @repo/prisma db:generate && pnpm exec tsx src/index.ts"]
