#!/bin/bash
# Find and stop container using port 8080
CONTAINER=$(docker ps --filter "publish=8080" --format "{{.Names}}" | head -n1)
if [ -n "$CONTAINER" ]; then
  echo "Stopping $CONTAINER on port 8080..."
  docker stop $CONTAINER
else
  echo "No container found on port 8080"
fi
