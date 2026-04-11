# Stage 1: Build Stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Stage
FROM nginx:stable-alpine

# Copy the build output
COPY --from=build /app/build /usr/share/nginx/html

# Hardened Permissions: Ensure Nginx has full read access to its root
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

EXPOSE 80
