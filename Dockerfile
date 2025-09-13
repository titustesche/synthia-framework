# Base image
FROM node:latest

# Specify Author
LABEL authors="Titus Tesche"

# Specify working directory
WORKDIR /src

# Copy package files and install
COPY src/ ./
RUN npm install -g ts-node typescript
RUN npm install

# Copy Sourcecode
COPY . .

# Expose port
EXPOSE 3000

# Define start command
CMD ["node", "--require", "ts-node/register", "index.ts"]
