# Testing Guide - Start Here!

## 🚀 Quick Start Testing

Your self-hosted agent builder is ready to test! Here's what works now:

---

## ✅ What's Ready to Test

### 1. Ollama (Local FREE LLM)
### 2. Jina.ai (FREE Web Scraping)
### 3. Browserless (Local Browser Automation)
### 4. PostgreSQL (Database)

---

## 🧪 Test Procedure

### Step 1: Start Services (5 minutes)

```bash
cd /home/muhammadmotawe/open-source-agents/open-agent-builder

# Copy environment template
cp env.example .env

# Edit .env and add:
# - NEXT_PUBLIC_CONVEX_URL (still needed for Phase 1)
# - Clerk keys (still needed until Phase 2 complete)
# - Generate NEXTAUTH_SECRET: openssl rand -base64 32

# Start everything
docker-compose up
```

**First run**: Downloads ~6GB of Ollama models (5-10 minutes)

**Services Starting**:
- ✅ PostgreSQL (port 5432)
- ✅ Ollama (port 11434)
- ✅ Browserless (port 3001)
- ✅ Convex Dev (still needed)
- ✅ Next.js (port 3000)

---

### Step 2: Test Ollama (5 minutes)

```bash
# Check Ollama is running
curl http://localhost:11434/

# List installed models
docker-compose exec ollama ollama list

# Expected output:
# llama3.2:3b
# qwen2.5-coder:7b

# Test inference
docker-compose exec ollama ollama run llama3.2:3b "Say hello!"
```

**✅ Success**: You should see a response from the model

---

### Step 3: Test Jina.ai Scraping (5 minutes)

```bash
# Test basic scraping
curl -X POST http://localhost:3000/api/execute-firecrawl \
  -H "Content-Type: application/json" \
  -d '{
    "action": "scrape",
    "params": {"url": "https://example.com"}
  }'

# Expected: JSON with markdown content
```

**✅ Success**: You should see markdown content of the page

---

### Step 4: Test Browserless (5 minutes)

```bash
# Check Browserless is running
curl http://localhost:3001/

# Test with JS-heavy site
curl -X POST http://localhost:3000/api/execute-firecrawl \
  -H "Content-Type: application/json" \
  -d '{
    "action": "scrape",
    "params": {"url": "https://example.com"},
    "useBrowserless": true
  }'
```

**✅ Success**: You should see rendered content

---

### Step 5: Test in UI (10 minutes)

#### A. Test Ollama Local LLM

1. Open http://localhost:3000
2. Sign in (using Clerk for now)
3. Create new workflow
4. Add Agent node
5. Configure:
   - **Model**: Select "Ollama (Local)" → "Llama 3.2 3B"
   - **Instructions**: "Write a haiku about Docker"
6. Click Run
7. **✅ Success**: See local LLM response (no API cost!)

#### B. Test FREE Web Scraping

1. Create new workflow
2. Add Firecrawl Scrape node
3. Configure:
   - **URL**: https://news.ycombinator.com
   - **Action**: scrape
4. Add Agent node after it
5. Agent Instructions: "Summarize this content"
6. Click Run
7. **✅ Success**: See scraped and summarized content (FREE!)

#### C. Test Complete Workflow

1. Create workflow: Start → Scrape → Agent → End
2. Scrape node:
   - URL: https://firecrawl.dev
3. Agent node:
   - Model: Ollama (Local) / Llama 3.2 3B
   - Instructions: "Summarize in 3 bullets"
4. Run workflow
5. **✅ Success**: End-to-end FREE workflow!

---

### Step 6: Test PostgreSQL (5 minutes)

```bash
# Connect to database
docker-compose exec postgres psql -U agent_builder -d agent_builder

# Check tables (should be empty until Phase 2 complete)
\dt

# Exit
\q

# Or use Prisma Studio (visual database browser)
npx prisma studio
# Opens at http://localhost:5555
```

**✅ Success**: Database is accessible

---

## 📊 Testing Checklist

### Phase 3 (Scraping) - 100% Complete ✅
- [ ] Ollama models downloaded
- [ ] Ollama responds to test query
- [ ] Jina.ai scrapes successfully
- [ ] Browserless is accessible
- [ ] UI workflow uses Ollama
- [ ] UI workflow scrapes with Jina.ai
- [ ] End-to-end workflow works

### Phase 2 (Auth) - Infrastructure Ready 🔄
- [ ] PostgreSQL is running
- [ ] Can connect to database
- [ ] Prisma schema exists
- [ ] NextAuth config exists
- [ ] Dependencies installed

---

## 🐛 Troubleshooting

### Ollama Issues

**Problem**: Models not downloading
```bash
# Check logs
docker-compose logs ollama-setup

# Manual download
docker-compose exec ollama ollama pull llama3.2:3b
docker-compose exec ollama ollama pull qwen2.5-coder:7b
```

**Problem**: Ollama not responding
```bash
# Restart
docker-compose restart ollama

# Check status
docker-compose ps ollama
```

### Scraping Issues

**Problem**: "Browserless not responding"
```bash
# Check Browserless
curl http://localhost:3001/

# Restart
docker-compose restart browserless
```

**Problem**: "Scraping failed"
```bash
# Check logs
docker-compose logs nextjs

# Verify Jina.ai is accessible
curl https://r.jina.ai/https://example.com
```

### PostgreSQL Issues

**Problem**: "Connection refused"
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

**Problem**: "Authentication failed"
```bash
# Verify credentials in .env
# DATABASE_URL=postgresql://agent_builder:changeme123@postgres:5432/agent_builder
```

### General Issues

**Problem**: Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5432
lsof -ti:5432 | xargs kill -9
```

**Problem**: "Out of disk space"
```bash
# Check Docker disk usage
docker system df

# Clean up
docker system prune -a

# Remove old images
docker images
docker rmi <image-id>
```

---

## 🎯 Success Criteria

### Minimum Viable Test (10 minutes)

You should be able to:
1. ✅ Start all services
2. ✅ Access http://localhost:3000
3. ✅ Create workflow with Ollama
4. ✅ Scrape a URL (uses Jina.ai)
5. ✅ Run end-to-end workflow

### Full Feature Test (30 minutes)

Additionally:
1. ✅ Test Browserless for JS sites
2. ✅ Test multiple Ollama models
3. ✅ Test web search (Jina.ai)
4. ✅ Test crawl functionality
5. ✅ Verify PostgreSQL connection

---

## 📈 Performance Expectations

### Ollama (Local LLM)
- **First call**: 5-10 seconds (model loading)
- **Subsequent calls**: 1-3 seconds
- **Models**: Llama 3.2 3B (fast), Qwen 2.5 Coder 7B (medium)

### Jina.ai Scraping
- **Simple page**: 1-3 seconds
- **Complex page**: 2-5 seconds
- **Rate limits**: None (unlimited free)

### Browserless
- **Page load**: 3-8 seconds
- **With screenshots**: 5-10 seconds
- **Concurrent**: 3 browsers max

---

## 💰 Cost Comparison

### Traditional Setup (Cloud)
- Firecrawl: $50-100/month
- OpenAI/Anthropic: $50-200/month
- **Total**: $100-300/month

### Your Setup (Self-Hosted)
- Ollama: FREE
- Jina.ai: FREE
- Browserless: FREE
- **Total**: $0/month ✨

**Annual Savings**: $1,200-3,600!

---

## 🎉 What You Can Build Now

With your FREE self-hosted setup:

### 1. Web Scraper Bot
- Scrape any site (Jina.ai)
- Summarize with AI (Ollama)
- No scraping costs!

### 2. Content Research Tool
- Search web (Jina.ai search)
- Analyze results (Ollama)
- Generate reports (Ollama)

### 3. Price Monitor
- Scrape product pages
- Extract prices
- Alert on changes

### 4. Code Assistant
- Use Qwen 2.5 Coder
- Local code generation
- Privacy-friendly

### 5. Data Extraction
- Scrape structured data
- Use Browserless for JS sites
- Process with Ollama

---

## 🔄 Next Steps After Testing

### If Tests Pass ✅

**Option A: Use as-is**
- Phase 3 works completely
- Keep using Clerk temporarily
- Start building workflows!

**Option B: Complete Phase 2**
- Follow PHASE2_INFRASTRUCTURE_COMPLETE.md
- Migrate from Clerk to NextAuth
- Remove last cloud dependency

**Option C: Plan Phase 1**
- Start planning Convex migration
- When ready, tackle PostgreSQL full migration

### If Tests Fail ❌

1. Check troubleshooting section above
2. Review logs: `docker-compose logs`
3. Check ports: `lsof -i :3000,:5432,:11434`
4. Verify .env configuration
5. Restart services: `docker-compose restart`

---

## 📚 Additional Resources

- **Complete Setup**: [DOCKER.md](./DOCKER.md)
- **Quick Start**: [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)
- **Phase 3 Details**: [PHASE3_COMPLETE.md](./PHASE3_COMPLETE.md)
- **Phase 2 Guide**: [PHASE2_INFRASTRUCTURE_COMPLETE.md](./PHASE2_INFRASTRUCTURE_COMPLETE.md)
- **Full Progress**: [SELF_HOSTING_PROGRESS.md](./SELF_HOSTING_PROGRESS.md)
- **Summary**: [IMPLEMENTATION_COMPLETE_SUMMARY.md](./IMPLEMENTATION_COMPLETE_SUMMARY.md)

---

## 💡 Pro Tips

### Quick Commands

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f ollama

# Restart everything
docker-compose restart

# Stop everything
docker-compose down

# Clean start
docker-compose down -v && docker-compose up

# Check what's running
docker-compose ps

# Execute commands in container
docker-compose exec ollama ollama list
docker-compose exec postgres psql -U agent_builder
```

### Monitoring

```bash
# Watch resource usage
docker stats

# Check disk usage
docker system df

# Monitor logs
tail -f ~/.docker/daemon.log
```

---

## ✅ Ready to Test!

Run through the tests above and you'll see:
- 🆓 FREE local LLM working
- 🆓 FREE web scraping working
- 🐳 Everything in Docker
- 💰 Zero API costs

**Happy testing!** 🚀

If you encounter issues, check:
1. [TESTING_GUIDE.md](./TESTING_GUIDE.md) (this file)
2. [DOCKER.md](./DOCKER.md) troubleshooting section
3. Docker logs: `docker-compose logs`

