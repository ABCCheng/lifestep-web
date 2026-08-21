FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8084

# Only copy the standalone runtime output.
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

EXPOSE 8084

CMD ["node", "server.js"]
