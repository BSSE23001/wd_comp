FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY pris_client/package.json ./pris_client/package.json
COPY api/grievances/package.json ./api/grievances/package.json

# Install only grievances and its workspace dependency tree.
RUN pnpm install --frozen-lockfile --filter grievances...

COPY pris_client ./pris_client
COPY api/grievances ./api/grievances

WORKDIR /app/api/grievances

EXPOSE 4004

CMD ["sh", "-c", "pnpm --filter @repo/prisma db:generate && pnpm exec tsx src/index.ts"]
