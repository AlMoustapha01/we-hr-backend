FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache bash curl

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
    else echo "Lockfile not found." && exit 1; \
    fi

COPY . .
RUN npm run build


FROM node:22-alpine AS runner
WORKDIR /app

# Install bash for entrypoint script
RUN apk add --no-cache bash

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/docker-entrypoint.sh ./

# Copy source files needed for migrations (TypeORM CLI requires them)
COPY --from=builder /app/src /app/src

# Configuration de l'environnement
ENV NODE_ENV=production
ENV PORT=3000
ENV TS_NODE_PROJECT=./tsconfig.json

EXPOSE 3000

RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]

