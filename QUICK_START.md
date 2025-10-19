# 🚀 Quick Start Guide - Open Agent Builder

## You're All Set! 🎉

Everything is running and ready to use. Here's what to do next:

## 1️⃣ Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## 2️⃣ Create Your Account

1. Click **"Start Building"** on the homepage
2. You'll be prompted to sign in
3. Click **"Sign up"** to create a new account
4. Enter your email and password
5. Start building!

## 3️⃣ Build Your First Workflow

Once signed in:
1. Click **"Create New Workflow"** or choose a template
2. Drag and drop nodes to build your workflow
3. Connect them together
4. Configure each node
5. Click **"Run"** to execute

## 🎯 What Can You Build?

### Example Workflows

**1. Web Research Agent**
```
Input → Extract (Jina.ai) → Agent (Ollama) → Output
```
Scrape a website and have AI summarize it

**2. Content Generator**
```
Input → Agent (Ollama) → Output
```
Use local LLM to generate content

**3. Data Pipeline**
```
Input → Extract → Transform → Agent → Output
```
Build complex data processing workflows

## 🔧 System Info

### Running Services
- **Frontend:** http://localhost:3000
- **Ollama API:** http://localhost:11435
- **PostgreSQL:** localhost:54320
- **Browserless:** http://localhost:3001

### Available Models
- `llama3.2:3b` (2GB) - Fast, general purpose
- `qwen2.5-coder:7b` (4.7GB) - Coding specialist

### Database
- **Type:** PostgreSQL 16
- **User:** agent_builder
- **Database:** agent_builder
- **Port:** 54320

## 🛠️ Common Commands

### Check Status
```bash
docker compose ps
```

### View Logs
```bash
# Next.js logs
docker logs open-agent-builder-nextjs -f

# Ollama logs
docker logs open-agent-builder-ollama -f

# PostgreSQL logs
docker logs open-agent-builder-postgres -f
```

### Restart Services
```bash
docker compose restart
```

### Stop Everything
```bash
docker compose down
```

### Start Everything
```bash
docker compose up -d
```

## 📊 Test Your Setup

### Test Ollama (Local LLM)
```bash
curl http://localhost:11435/api/tags
```
Should show your downloaded models.

### Test PostgreSQL
```bash
docker exec -it open-agent-builder-postgres psql -U agent_builder -c "SELECT version();"
```

### Test Browserless
```bash
curl http://localhost:3001
```
Should return the Browserless interface.

## 🎨 Features You Can Use Right Away

### ✅ No API Keys Required
- **Local LLM:** Uses Ollama (already running)
- **Web Scraping:** Uses Jina.ai (free tier) + Browserless
- **Database:** PostgreSQL (self-hosted)
- **Auth:** NextAuth.js (self-hosted)

### 🔌 Optional Integrations
If you want to add cloud services later:
- Convex (database)
- OpenAI, Anthropic (premium LLMs)
- Firecrawl (advanced scraping)

Just add the API keys to your `.env` file.

## 🎓 Learning Resources

### Workflow Nodes
- **Agent Node:** Run AI prompts with local or cloud LLMs
- **Extract Node:** Scrape websites with Jina.ai or Browserless
- **Logic Nodes:** Conditions, loops, branching
- **Data Nodes:** Transform, filter, map data
- **HTTP Node:** Call external APIs

### MCP (Model Context Protocol)
Add custom tools and capabilities to your agents:
- File system access
- Database queries
- Custom APIs
- And more!

## 💡 Tips

1. **Start Simple:** Begin with a basic Agent node to test Ollama
2. **Use Templates:** Choose from pre-built workflow templates
3. **Test Often:** Run workflows frequently to catch issues early
4. **Check Logs:** Use `docker logs` if something isn't working
5. **Save Your Work:** Workflows are automatically saved to PostgreSQL

## 🐛 Troubleshooting

### "Cannot connect to Ollama"
```bash
docker restart open-agent-builder-ollama
```

### "Database connection error"
```bash
docker restart open-agent-builder-postgres
```

### "Port already in use"
Check the docker-compose.yml for port mappings and adjust if needed.

### Still Having Issues?
```bash
# Check all container status
docker compose ps

# View all logs
docker compose logs

# Restart everything
docker compose restart
```

## 📚 Next Steps

1. **Explore Templates** - Try pre-built workflows
2. **Read the Docs** - Check README.md for detailed info
3. **Join Community** - Star the repo on GitHub
4. **Build Something Cool** - Share your workflows!

## 🎯 Your First Task

Try this simple workflow:
1. Go to http://localhost:3000
2. Sign up / Sign in
3. Click "Start Building"
4. Add an **Agent node**
5. Set the prompt to: "Write a haiku about coding"
6. Select model: `llama3.2:3b`
7. Click **Run**
8. Watch your local LLM generate poetry! 🎭

---

**You're ready to build amazing AI workflows!** 🚀

Questions? Check FIXES_COMPLETE.md for technical details.

