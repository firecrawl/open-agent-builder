# 🚀 Test Guide - Open Agent Builder

## Current Status

✅ Docker build successful  
✅ .env file configured  
✅ PostgreSQL mode enabled  
⚠️ Ollama port conflict detected  

---

## Quick Start (2 Options)

### Option A: Use System Ollama (Recommended)

Your system already has Ollama running! Just adjust Docker to use it:

```bash
# 1. Update .env to point to system Ollama
echo "OLLAMA_BASE_URL=http://localhost:11434" >> .env

# 2. Edit docker-compose.yml - Comment out the ollama and ollama-setup services
# (or we can just not start them)

# 3. Start services (excluding Ollama)
docker compose up -d postgres browserless nextjs

# 4. Wait for services
sleep 15

# 5. Run migrations
docker compose exec nextjs npx prisma generate
docker compose exec nextjs npx prisma migrate dev --name init

# 6. Open browser
open http://localhost:3000
```

### Option B: Use Docker Ollama

Stop the system Ollama first:

```bash
# 1. Stop system Ollama
sudo systemctl stop ollama

# 2. Start all Docker services
docker compose up -d

# 3. Wait for services
sleep 15

# 4. Run migrations
docker compose exec nextjs npx prisma generate
docker compose exec nextjs npx prisma migrate dev --name init

# 5. Check Ollama models
docker compose exec ollama ollama list

# 6. Pull a model if needed
docker compose exec ollama ollama pull llama3.2

# 7. Open browser
open http://localhost:3000
```

---

## Testing the Setup

### 1. Check Services Are Running

```bash
docker compose ps
```

**Expected output:**
```
NAME                          STATUS
open-agent-builder-nextjs     Up
open-agent-builder-postgres   Up
open-agent-builder-browserless Up
```

### 2. Check PostgreSQL

```bash
docker compose exec postgres psql -U agent_builder -d agent_builder -c "\dt"
```

**Expected output:** List of tables (users, workflows, executions, etc.)

### 3. Check Next.js

```bash
curl http://localhost:3000 | head -20
```

**Expected output:** HTML from the homepage

### 4. Test API Endpoint

```bash
# Create a test workflow
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-workflow",
    "name": "Test Workflow",
    "description": "Testing the API",
    "nodes": [],
    "edges": []
  }'
```

**Expected output:**
```json
{
  "success": true,
  "id": "...",
  "source": "postgres"
}
```

### 5. List Workflows

```bash
curl http://localhost:3000/api/workflows
```

**Expected output:**
```json
{
  "workflows": [...],
  "total": 1,
  "source": "postgres"
}
```

---

## Using the Application

### 1. Sign Up

```bash
open http://localhost:3000/sign-up
```

- Enter email and password
- Click "Sign Up"
- You'll be redirected to the main page

### 2. Create a Workflow

1. Click "New Workflow" or "+ Create"
2. Drag nodes from the sidebar:
   - **Start Node** - Already there
   - **Agent Node** - AI processing
   - **Extract Node** - Data extraction
   - **Firecrawl Node** - Web scraping
3. Connect nodes by dragging from one handle to another
4. Configure each node:
   - Click the node
   - Fill in settings in the right panel
5. Click "Save" in the top toolbar

### 3. Test with Ollama (Local AI)

1. Create an Agent node
2. In the node settings:
   - **Provider**: Select "Ollama"
   - **Model**: Select "llama3.2" or "qwen2.5-coder"
   - **Prompt**: Enter your AI instruction
3. Connect to Start node
4. Click "Run" or "Test"
5. Watch the execution in real-time!

---

## Troubleshooting

### Issue: "Cannot connect to database"

```bash
# Check PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Issue: "Ollama not responding"

**If using System Ollama:**
```bash
# Check Ollama status
systemctl status ollama

# Restart Ollama
sudo systemctl restart ollama

# Test Ollama
curl http://localhost:11434/api/tags
```

**If using Docker Ollama:**
```bash
# Check container
docker compose ps ollama

# View logs
docker compose logs ollama

# Restart
docker compose restart ollama
```

### Issue: "Migrations fail"

```bash
# Reset database (⚠️ DELETES ALL DATA)
docker compose down -v
docker compose up -d postgres
sleep 10
docker compose exec nextjs npx prisma migrate dev --name init
```

### Issue: "Port already in use"

```bash
# Check what's using ports
lsof -ti:3000,3001,5432,11434

# Kill processes
lsof -ti:3000 | xargs kill -9
```

---

## Viewing the Database

### Option 1: Prisma Studio (GUI)

```bash
docker compose exec nextjs npx prisma studio
open http://localhost:5555
```

### Option 2: pgAdmin (Already Running)

```bash
open http://localhost:5050
```

**Login:**
- Email: `admin@admin.com`
- Password: `admin`

**Connect to PostgreSQL:**
- Right-click "Servers" → "Register" → "Server"
- General Tab:
  - Name: `Agent Builder`
- Connection Tab:
  - Host: `postgres`
  - Port: `5432`
  - Database: `agent_builder`
  - Username: `agent_builder`
  - Password: `changeme123`

### Option 3: psql (Command Line)

```bash
docker compose exec postgres psql -U agent_builder -d agent_builder

# Sample queries:
SELECT * FROM users;
SELECT * FROM workflows;
SELECT * FROM executions;
```

---

## Advanced Testing

### Test Workflow Execution

```bash
# Create a simple workflow
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-agent",
    "name": "Test Agent",
    "nodes": [
      {
        "id": "start",
        "type": "start",
        "data": {"label": "Start"}
      },
      {
        "id": "agent1",
        "type": "agent",
        "data": {
          "label": "AI Agent",
          "provider": "ollama",
          "model": "llama3.2",
          "prompt": "Say hello"
        }
      }
    ],
    "edges": [
      {"source": "start", "target": "agent1"}
    ]
  }'

# Execute it
curl -X POST http://localhost:3000/api/workflows/test-agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello!",
    "workflow": {...}  // Full workflow object
  }'
```

### Test Web Scraping

```bash
# Test Jina.ai (free)
curl "https://r.jina.ai/https://example.com"

# Test Browserless
curl -X POST http://localhost:3001/function \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "code": "return await page.content();"
  }'
```

---

## Performance Monitoring

### Check Resource Usage

```bash
# Docker stats
docker stats

# Service-specific
docker stats open-agent-builder-nextjs
docker stats open-agent-builder-postgres
docker stats open-agent-builder-ollama
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f nextjs
docker compose logs -f postgres
docker compose logs -f ollama

# Last 50 lines
docker compose logs --tail=50 nextjs
```

---

## Cleanup

### Stop Services (Keep Data)

```bash
docker compose down
```

### Stop Services (Delete Data)

```bash
docker compose down -v
```

### Complete Reset

```bash
# Stop everything
docker compose down -v

# Remove images
docker compose rm -f

# Start fresh
docker compose up -d --build
```

---

## What's Next?

### 1. Explore Features
- Create workflows with multiple nodes
- Test different AI models (Ollama, OpenAI, Anthropic)
- Try web scraping with Jina.ai and Browserless
- Set up MCP servers for custom tools

### 2. Import Templates
```bash
curl -X POST http://localhost:3000/api/templates/seed
```

### 3. API Integration
- Generate API keys in settings
- Use REST API to trigger workflows
- Build external integrations

### 4. Production Deployment
- Use `docker-compose.prod.yml`
- Set up SSL/HTTPS
- Configure environment variables
- Set up backups

---

## Documentation

- **START_HERE.txt** - Quick visual guide
- **QUICKSTART.md** - 5-minute setup
- **README.md** - Full documentation
- **PHASE1_COMPLETE.md** - Database migration details
- **DOCKER.md** - Docker setup details

---

## Support

### Getting Help
1. Check logs: `docker compose logs [service]`
2. Check environment: `cat .env`
3. Verify services: `docker compose ps`
4. Review documentation above

### Common Commands Reference

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart [service]

# Logs
docker compose logs -f [service]

# Shell access
docker compose exec nextjs sh
docker compose exec postgres psql -U agent_builder -d agent_builder

# Rebuild
docker compose up -d --build

# Clean restart
docker compose down && docker compose up -d
```

---

**Status: Ready to test! 🚀**

Choose Option A (use system Ollama) and start testing!


