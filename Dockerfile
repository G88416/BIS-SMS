# Use official Node.js LTS version on slim Alpine Linux for smaller image size
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first for better caching
COPY package*.json ./

# Install dependencies (production only to keep image small)
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port your app listens on
EXPOSE 3000

# Health check (optional but recommended for production)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Run the app
CMD ["npm", "start"]
