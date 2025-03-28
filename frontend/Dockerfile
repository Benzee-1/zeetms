FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Build the React app
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

# Serve the built app
CMD ["serve", "-s", "build", "-l", "3000"]