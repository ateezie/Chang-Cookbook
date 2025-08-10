# Docker Development Guide - Chang Cookbook

## 🚀 Quick Start with Docker Desktop

### Prerequisites
- Docker Desktop installed and running
- Git repository cloned

### Development Workflow

```bash
# 1. Start development container
docker-compose -f docker-compose.dev.yml up --build

# 2. Access the application
# http://localhost:3003 (development mode with hot reloading)

# 3. Stop development container
docker-compose -f docker-compose.dev.yml down
```

### Production Testing

```bash
# 1. Build and run production container
docker-compose up --build

# 2. Access the application
# http://localhost:3000 (production mode)

# 3. Stop production container
docker-compose down
```

## 🛠️ Optimizations Implemented

### Build Performance
- ✅ **Multi-stage Dockerfile**: Separate build and runtime stages
- ✅ **Optimized .dockerignore**: Excludes unnecessary files
- ✅ **Layer caching**: Efficient Docker layer utilization
- ✅ **Node 20 Alpine**: Latest stable Node.js on lightweight base

### CI/CD Enhancements
- ✅ **Multi-platform builds**: AMD64 + ARM64 support
- ✅ **Build time monitoring**: Track performance metrics
- ✅ **Image size analysis**: Monitor container size
- ✅ **Enhanced caching**: GitHub Actions + Registry caching
- ✅ **Security scanning**: Trivy vulnerability scanning

### Performance Metrics
- **Build Time Target**: Under 5 minutes (excellent)
- **Image Size Target**: Under 500MB (good), under 1GB (acceptable)
- **Cache Hit Rate**: Maximized with multi-layer caching strategy

## 📊 Monitoring & Optimization

### Build Performance Tracking
The CI/CD pipeline now includes:
- Build time measurement and reporting
- Image size analysis and recommendations
- Layer breakdown for optimization insights
- Performance benchmarks comparison

### Local Development Benefits
- **Hot Reloading**: Changes reflected immediately
- **Volume Mounting**: Persistent development files
- **Isolated Environment**: Consistent across team members
- **Database Persistence**: Local development database

## 🔧 Troubleshooting

### Common Issues

1. **Docker Desktop not running**
   ```bash
   # Start Docker Desktop application first
   docker info  # Should show server info
   ```

2. **Port conflicts**
   ```bash
   # Change ports in docker-compose files if needed
   ports:
     - "3001:3000"  # Use different host port
   ```

3. **Build cache issues**
   ```bash
   # Force rebuild without cache
   docker-compose up --build --no-cache
   ```

4. **Permission issues** (Linux/Mac)
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Performance Tips

1. **Use BuildKit** (enabled by default in modern Docker)
2. **Optimize layer order**: Put less frequently changing layers first
3. **Multi-stage builds**: Keep final image minimal
4. **Leverage caching**: Both local and CI/CD caching strategies

## 🎯 Next Steps

1. **Container monitoring**: Add health checks and logging
2. **Database optimization**: Container-based database setup
3. **Load testing**: Performance testing in containerized environment
4. **Security hardening**: Non-root user, minimal attack surface

---

**Last Updated**: August 10, 2025
**Docker Version**: 28.3.0
**Status**: ✅ Optimized for development and production