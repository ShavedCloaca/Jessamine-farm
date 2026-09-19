# Use the official NGINX unprivileged Alpine slim image
FROM nginxinc/nginx-unprivileged:alpine-slim

# Copy your static website files to the default NGINX public directory
COPY html/ /usr/share/nginx/html/

# Expose port 8080 (the default unprivileged port for this image)
EXPOSE 8080