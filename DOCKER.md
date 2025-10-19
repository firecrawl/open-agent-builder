# Docker Setup Guide for Open Agent Builder

This guide will help you run the entire Open Agent Builder application using Docker, without installing Node.js or any dependencies locally.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually comes with Docker Desktop)
- API keys for required services (see Environment Variables section)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/firecrawl/open-agent-builder.git
cd open-agent-builder
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp env.example .env
```

Edit `.env` and add your API keys (see [Environment Variables](#environment-variables) section below).

### 3. Start the Application

```bash
# Build and start all services (includes Ollama for local LLM inference)
docker-compose up

# Or run in detached mode (background)
docker-compose up -d
```

**First Run:** The first time you run this, Docker will:
- Pull the Ollama image (~700MB)
- Download Llama 3.2 3B (~2GB) and Qwen 2.5 Coder 7B (~4GB)
- This may take 5-10 minutes depending on your internet speed

The application will be available at: **http://localhost:3000**
Ollama API will be available at: **http://localhost:11434**

### 4. View Logs

```bash
# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f nextjs
docker-compose logs -f convex-dev
```

### 5. Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Environment Variables

### Required Variables

You **must** configure these environment variables for the application to work:

#### 1. Convex Database

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

**How to get it:**
1. Go to [convex.dev](https://convex.dev) and sign up
2. Create a new project
3. Copy the deployment URL from your dashboard

#### 2. Clerk Authentication

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
```

**How to get them:**
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Go to **API Keys** and copy both keys
4. Go to **JWT Templates** → **Convex**
5. Click "Apply" and copy the issuer URL

**Important:** After getting your Clerk JWT issuer domain, update the `convex/auth.config.ts` file:

```typescript
export default {
  providers: [
    {
      domain: "https://your-domain.clerk.accounts.dev", // Replace with your domain
      applicationID: "convex",
    },
  ],
};
```

#### 3. Firecrawl API

```env
FIRECRAWL_API_KEY=fc-...
```

**How to get it:**
1. Go to [firecrawl.dev](https://firecrawl.dev)
2. Sign up for an account
3. Copy your API key from the dashboard

### Local LLM (Included - No API Key Needed!)

```env
# Ollama runs locally in Docker
OLLAMA_BASE_URL=http://ollama:11434
```

**Ollama is included in the Docker setup and provides FREE local AI inference!**
- No API keys or cloud accounts required
- Models automatically downloaded: Llama 3.2 3B, Qwen 2.5 Coder 7B
- Perfect for development and testing
- Works offline once models are downloaded

### Optional Cloud LLM Providers

These can be added now or later through the UI (Settings → API Keys).
**With Ollama running locally, these are completely optional!**

#### Cloud LLM Providers (Optional - Ollama is recommended)

```env
# Anthropic Claude (Best for MCP support)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI
OPENAI_API_KEY=sk-...

# Groq
GROQ_API_KEY=gsk_...
```

#### E2B Code Interpreter (For sandboxed code execution)

```env
E2B_API_KEY=e2b_...
```

Get it from [e2b.dev](https://e2b.dev)

## Docker Commands Reference

### Development Mode

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Execute commands in container
docker-compose exec nextjs sh
docker-compose exec convex-dev sh
```

### Production Mode

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up --build

# Or with npm scripts (see below)
npm run docker:prod
```

### Using npm Scripts

For convenience, you can use these npm scripts:

```bash
# Development
npm run docker:build    # Build images
npm run docker:up       # Start services
npm run docker:down     # Stop services
npm run docker:logs     # View logs

# Production
npm run docker:prod     # Start production build
```

## Architecture

The Docker setup consists of four main services:

### 1. `ollama`
- Local LLM inference server
- Provides OpenAI-compatible API
- Models stored in persistent Docker volume
- Accessible at http://localhost:11434

### 2. `ollama-setup`
- One-time initialization container
- Downloads default models (Llama 3.2 3B, Qwen 2.5 Coder 7B)
- Runs once then exits
- Shares volume with ollama service

### 3. `convex-dev`
- Runs the Convex development server
- Syncs your database schema and functions
- Watches for changes in the `convex/` directory

### 4. `nextjs`
- Runs the Next.js development server
- Hot-reloads on code changes
- Serves the application on port 3000
- Connects to Ollama for local LLM inference

All services share:
- Network connection for inter-service communication
- Environment variables from `.env` file
- Volume mounts for live code reloading

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change the port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Convex Connection Issues

1. Make sure `NEXT_PUBLIC_CONVEX_URL` is set correctly in `.env`
2. Verify your Convex project is active in the dashboard
3. Check Convex dev server logs:
   ```bash
   docker-compose logs convex-dev
   ```

### Clerk Authentication Issues

1. Verify all three Clerk variables are set in `.env`
2. Make sure `convex/auth.config.ts` has your Clerk domain
3. Check that your Clerk application has the Convex JWT template applied
4. Verify allowed origins in Clerk dashboard include `http://localhost:3000`

### Module Not Found Errors

```bash
# Rebuild containers with fresh install
docker-compose down -v
docker-compose up --build
```

### Hot Reloading Not Working

If code changes aren't reflected:

1. Make sure volumes are mounted correctly in `docker-compose.yml`
2. Try setting polling mode in `.env`:
   ```env
   WATCHPACK_POLLING=true
   ```
3. Restart the services:
   ```bash
   docker-compose restart nextjs
   ```

### Container Keeps Restarting

```bash
# Check logs for errors
docker-compose logs nextjs

# Common causes:
# - Missing required environment variables
# - Incorrect API keys
# - Port conflicts
```

### Ollama Issues

#### Ollama Models Not Downloading

```bash
# Check ollama-setup logs
docker-compose logs ollama-setup

# Manually pull models
docker-compose exec ollama ollama pull llama3.2:3b
docker-compose exec ollama ollama pull qwen2.5-coder:7b
```

#### Check Available Ollama Models

```bash
# List installed models
docker-compose exec ollama ollama list

# Test Ollama API
curl http://localhost:11434/api/tags
```

#### Pull Additional Models

```bash
# Pull other popular models
docker-compose exec ollama ollama pull llama3.1:8b
docker-compose exec ollama ollama pull mistral:7b
docker-compose exec ollama ollama pull codellama:7b

# Pull larger models (requires more RAM)
docker-compose exec ollama ollama pull llama3.1:70b
```

#### Ollama Connection Errors

1. Check if Ollama is running:
   ```bash
   docker-compose ps ollama
   ```

2. Check Ollama health:
   ```bash
   curl http://localhost:11434/
   ```

3. Restart Ollama if needed:
   ```bash
   docker-compose restart ollama
   ```

#### Delete Models to Free Space

```bash
# Remove a model
docker-compose exec ollama ollama rm llama3.1:8b

# Clean up all unused models
docker-compose exec ollama ollama prune
```

## Production Deployment

### Building for Production

The production Dockerfile uses multi-stage builds for optimal image size:

```bash
# Build production image
docker build -t open-agent-builder:latest .

# Run production container
docker run -p 3000:3000 --env-file .env open-agent-builder:latest
```

### Using Production Compose

```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Deployment Checklist

- [ ] All required environment variables are set
- [ ] Convex deployment is in production mode (`npx convex deploy`)
- [ ] Clerk application has production URLs configured
- [ ] API keys are for production environments (not test keys)
- [ ] Security: Use secrets management (not plain `.env` files)
- [ ] Consider using orchestration platforms (Kubernetes, ECS, etc.)

## Advanced Configuration

### Custom Port

Edit `docker-compose.yml`:

```yaml
services:
  nextjs:
    ports:
      - "8080:3000"  # Expose on port 8080
```

### Adding Custom MCP Servers

1. Add your MCP server configuration to `.env`
2. The application will pick it up automatically
3. Configure in UI: Settings → MCP Registry

### Volume Mounts

By default, the entire project is mounted for development:

```yaml
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next
```

This enables hot-reloading but can be slower on macOS/Windows. For better performance, use Docker volumes or adjust mount paths.

### Multi-Platform Builds

For deployment across different architectures:

```bash
# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t open-agent-builder:latest .
```

## Getting Help

- **Documentation**: Check the main [README.md](./README.md)
- **Issues**: [GitHub Issues](https://github.com/firecrawl/open-agent-builder/issues)
- **Community**: Join the Firecrawl community

## Using Ollama (Local LLM)

### Selecting Ollama Models

1. Go to Settings → API Keys
2. You'll see "Ollama (Local)" as an available provider
3. Select models like:
   - **Llama 3.2 3B** - Fast and efficient for most tasks
   - **Qwen 2.5 Coder 7B** - Best for coding and development workflows

### Model Recommendations

- **For quick tasks**: Use Llama 3.2 3B (faster, less RAM)
- **For coding**: Use Qwen 2.5 Coder 7B (better code generation)
- **For complex reasoning**: Pull and use Llama 3.1 8B or larger models

### Performance Tips

- Smaller models (3B-7B) run on most hardware
- 13B+ models require 16GB+ RAM
- 70B models require 64GB+ RAM or GPU
- First inference is slower (model loading), subsequent calls are fast

## Next Steps

1. Sign in at `http://localhost:3000`
2. **Start with Ollama (no API keys needed!)** or add cloud LLM keys in Settings → API Keys
3. Create a workflow and select "Ollama (Local)" / "Llama 3.2 3B" as your model
4. Try the "Simple Web Scraper" template
5. Build your first custom workflow!

### Example: First Workflow with Ollama

1. Click "New Workflow"
2. Add an Agent node
3. Select Model: **Ollama (Local) - Llama 3.2 3B**
4. Add instructions: "Summarize this text: {{input}}"
5. Click Run and enter some text
6. Watch Ollama process it locally - completely free!

---

**Happy building!** 🔥

