# Build stage
FROM node:20.14.0-alpine3.19 AS builderr
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

# Run stage
FROM node:20.14.0-alpine3.19 AS productionn
WORKDIR /app
COPY --from=builderr /app/package*.json ./
COPY --from=builderr /app/next.config.mjs ./
COPY --from=builderr /app/public ./public
COPY --from=builderr /app/.next/standalone ./
COPY --from=builderr /app/.next/static ./.next/static
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
CMD HOSTNAME="0.0.0.0" node server.js
