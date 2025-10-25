#!/bin/bash

# Build the Docker image
echo "Building Aether Mail Docker image..."
docker build -t aethermail .

# Run the container
echo "Starting Aether Mail container..."
docker run -d \
  --name aethermail \
  -p 4000:4000 \
  --cap-add=SYS_PTRACE \
  aethermail

echo "Aether Mail is running at: http://localhost:4000"
echo ""
echo "To stop: docker stop aethermail"
echo "To remove: docker rm aethermail"
echo "To view logs: docker logs aethermail"