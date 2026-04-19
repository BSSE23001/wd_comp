FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY pris_client/package.json ./pris_client/package.json

# Install only the shared Prisma workspace package.
RUN pnpm install --frozen-lockfile --filter @repo/prisma...

COPY pris_client ./pris_client

# Ensure Prisma client and schema artifacts are ready.
RUN pnpm --filter @repo/prisma db:generate

# Safe default: no schema mutation command runs automatically.
CMD ["pnpm", "--filter", "@repo/prisma", "db:generate"]
