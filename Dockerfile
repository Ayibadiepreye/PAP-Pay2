# Use Node 20
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install pnpm v9.15.5 (compatible with Node 20)
RUN npm install -g pnpm@9.15.5

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/pap-pay/package.json ./artifacts/pap-pay/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the code
COPY . .

# Build everything
RUN pnpm build

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "artifacts/api-server/dist/index.mjs"]
