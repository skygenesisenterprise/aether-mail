#!/bin/bash

# Aether Mail Docker Deployment Script
# This script builds and deploys the separated containers

set -e

echo "🚀 Starting Aether Mail Docker deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file with your configuration before running again"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.separated.yml down --remove-orphans

# Build and start containers
echo "🔨 Building containers..."
docker-compose -f docker-compose.separated.yml build --no-cache

echo "🚀 Starting containers..."
docker-compose -f docker-compose.separated.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check backend
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
fi

# Check frontend
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not responding"
fi

# Check database
if docker exec aethermail-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is not responding"
fi

# Check Redis
if docker exec aethermail-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis is not responding"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3000"
echo "   Database: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "📝 To view logs:"
echo "   docker-compose -f docker-compose.separated.yml logs -f [service-name]"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.separated.yml down"