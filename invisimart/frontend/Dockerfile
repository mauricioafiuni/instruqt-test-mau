# Install dependencies and build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Build argument for the API URL
ARG API_URL
ENV API_URL=$API_URL

# Build the application
RUN npm run build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
