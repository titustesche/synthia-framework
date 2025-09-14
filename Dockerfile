# Base image
FROM node:latest

# Specify Author
LABEL authors="Titus Tesche"

# Specify working directory
WORKDIR /app

# Copy package files and install
COPY . ./
RUN if [ -f package.json ]; then npm install; elif [ -f src/package.json ]; then cd src && npm install && cd ..; fi

# Expose port
EXPOSE 3000

# Define start command
CMD ["node", "--require", "./src/node_modules/ts-node/register", "src/index.ts"]
