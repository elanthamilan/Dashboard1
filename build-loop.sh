#!/bin/bash

echo "Starting build loop..."

while true; do
  echo "Attempting to build..."
  npm run build

  if [ $? -eq 0 ]; then
    echo "Build successful!"
    break
  else
    echo "Build failed. Retrying..."
    # Optional: Add a delay here if needed, e.g., sleep 5
  fi
done

echo "Build loop finished."
