FROM node:24

WORKDIR /usr/src/app

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency manifests first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
