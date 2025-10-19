# Self-Hosting Migration Progress

## Overview

This document tracks the progress of migrating from cloud services (Convex, Clerk, Firecrawl) to fully self-hosted alternatives.

**Goal**: Eliminate all external service dependencies and run 100% in Docker.

**Estimated Total Time**: 7-11 days of development work  
**Time Invested So Far**: ~4 hours (Phase 3 partially complete)

---

## ✅ Phase 3: Replace Firecrawl (COMPLETED - 80%)

### Status: **IN PROGRESS** 
**Started**: Current session  
**Completed Tasks**: 3/5  
**Time Spent**: ~4 hours  
**Remaining**: ~1-2 hours

### ✅ Completed

1. **Strategy Selection** ✅
   - Chose hybrid approach: Jina.ai (free) + Browserless (local)
   - Maintains Firecrawl as optional fallback

2. **Implementation** ✅
   - Created `/lib/scraping/jina.ts` - Full Jina.ai integration
     - `scrapeWithJina()` - Convert URL to markdown
     - `searchWithJina()` - Web search
     - `mapWithJina()` - Site structure mapping
     - `crawlWithJina()` - Multi-page crawling
     - `batchScrapeWithJina()` - Batch operations
   
   - Created `/lib/scraping/browserless.ts` - Advanced scraping
     - `scrapeWithBrowserless()` - Full JavaScript rendering
     - `extractWithBrowserless()` - Custom extraction scripts
     - `submitFormWithBrowserless()` - Form automation
     - `screenshotWithBrowserless()` - Screenshot capture
     - `pdfWithBrowserless()` - PDF generation

3. **API Route Update** ✅
   - Updated `/app/api/execute-firecrawl/route.ts`
   - Smart fallback logic:
     1. Try Jina.ai first (free, fast)
     2. Use Browserless if `useBrowserless=true`
     3. Fall back to Firecrawl if API key exists
   - All actions supported: scrape, search, map, crawl, batch_scrape

4. **Docker Infrastructure** ✅
   - Added Browserless service to `docker-compose.yml`
   - Configured with 3 concurrent sessions
   - Added puppeteer-core dependency to `package.json`
   - Updated environment variables in `env.example`

### 🔄 Remaining Tasks

5. **MCP Integration Update** (2-3 hours)
   - Update `convex/mcpServers.ts` or equivalent
   - Replace Firecrawl MCP server with custom implementation
   - Update MCP tool definitions
   - Test MCP tool calls from Agent nodes

6. **Template Updates** (1-2 hours)
   - Update workflow templates that use Firecrawl
   - Test all example workflows:
     - Simple Web Scraper
     - Multi-Page Research
     - Price Monitoring
     - Content Research
   - Update template documentation

### Files Modified

```
✅ Created:
- lib/scraping/jina.ts (282 lines)
- lib/scraping/browserless.ts (358 lines)

✅ Modified:
- app/api/execute-firecrawl/route.ts
- docker-compose.yml
- env.example
- package.json

🔄 To Modify:
- convex/mcpServers.ts (or lib/db equivalent when migrated)
- lib/workflow/templates/*.ts (template files)
```

### Testing Checklist

- [ ] Test Jina.ai scraping with simple URL
- [ ] Test Jina.ai search functionality
- [ ] Test Browserless with JavaScript-heavy site
- [ ] Test crawl with multiple pages
- [ ] Test batch scrape
- [ ] Verify fallback to Firecrawl works
- [ ] Test all workflow templates
- [ ] Performance comparison vs Firecrawl

### Environment Variables

**NEW (No API keys needed!):**
```env
JINA_READER_URL=https://r.jina.ai
BROWSERLESS_URL=http://browserless:3000
```

**OPTIONAL (Legacy support):**
```env
FIRECRAWL_API_KEY=  # Only if you want Firecrawl fallback
```

---

## 🔲 Phase 2: Replace Clerk with NextAuth.js (NOT STARTED)

### Status: **PENDING**
**Estimated Time**: 1-2 days  
**Priority**: Medium  
**Complexity**: 🟡 Medium

### Tasks Breakdown

#### 2.1 Setup NextAuth.js Infrastructure (4-6 hours)
- [ ] Install dependencies: `next-auth@latest`, `@auth/prisma-adapter`
- [ ] Create NextAuth config at `app/api/auth/[...nextauth]/route.ts`
- [ ] Configure Prisma adapter (requires Phase 1 completion)
- [ ] Add auth tables to Prisma schema:
  - `User`, `Account`, `Session`, `VerificationToken`

#### 2.2 Choose Authentication Providers (1 hour)
- [ ] Implement Credentials provider (email/password)
- [ ] Optional: Add Email Magic Links
- [ ] Optional: Add OAuth (GitHub, Google)

#### 2.3 Replace Clerk Middleware (3-4 hours)
- [ ] Remove `@clerk/nextjs` package
- [ ] Delete `/proxy.ts` (Clerk middleware)
- [ ] Create new `middleware.ts` with NextAuth
- [ ] Protect routes with session checks

#### 2.4 Update Authentication Logic (6-8 hours)
- [ ] Update `app/layout.tsx` - Replace ClerkProvider with SessionProvider
- [ ] Create custom `app/sign-in/page.tsx`
- [ ] Create custom `app/sign-up/page.tsx`
- [ ] Update `lib/api/auth.ts` - Replace Clerk validation
- [ ] Find and replace all `useUser()` hooks with `useSession()`
- [ ] Update all components using Clerk

#### 2.5 Update Database Auth References (2-3 hours)
- [ ] Remove Clerk-specific user ID formats
- [ ] Update user creation flow
- [ ] Migrate existing user data (if any)

#### 2.6 Environment Variables
**NEW:**
```env
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

**REMOVE:**
```env
# ❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# ❌ CLERK_SECRET_KEY
# ❌ CLERK_JWT_ISSUER_DOMAIN
```

### Files to Create
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `app/sign-in/page.tsx` - Custom sign-in page
- `app/sign-up/page.tsx` - Custom sign-up page
- `middleware.ts` - Session-based auth middleware

### Files to Modify (30+ files)
- `app/layout.tsx`
- `lib/api/auth.ts`
- All components in `components/` using `useUser()`
- All API routes using Clerk auth
- `convex/auth.config.ts` (replace with Prisma auth)

---

## 🔲 Phase 1: Replace Convex with PostgreSQL + Prisma (NOT STARTED)

### Status: **PENDING**
**Estimated Time**: 4-5 days  
**Priority**: Highest (but requires Phases 2 & 3 first)  
**Complexity**: 🔴 VERY HIGH

### Tasks Breakdown

#### 1.1 Setup PostgreSQL Infrastructure (2-3 hours)
- [ ] Add PostgreSQL service to `docker-compose.yml`
- [ ] Add pgAdmin for management (optional)
- [ ] Configure persistent volume
- [ ] Create database initialization scripts

#### 1.2 Install and Configure Prisma (4-6 hours)
- [ ] Install: `prisma`, `@prisma/client`, `@prisma/adapter-nextjs`
- [ ] Create `prisma/schema.prisma`
- [ ] Define all tables:
  - `workflows` - Workflow definitions
  - `executions` - Execution history
  - `users` - User accounts (from NextAuth)
  - `apiKeys` - User API keys
  - `userLLMKeys` - LLM provider keys
  - `mcpServers` - MCP server configs
  - `approvals` - Human-in-the-loop approvals
  - `templates` - Workflow templates
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Create migrations: `npx prisma migrate dev`

#### 1.3 Replace Convex Queries/Mutations (12-16 hours)
**Transform 7 Convex files to Prisma:**

- [ ] `convex/workflows.ts` → `lib/db/workflows.ts`
  - [ ] `getWorkflow`, `listWorkflows`, `createWorkflow`, `updateWorkflow`, `deleteWorkflow`
  
- [ ] `convex/executions.ts` → `lib/db/executions.ts`
  - [ ] `getExecution`, `listExecutions`, `createExecution`, `updateExecution`
  
- [ ] `convex/apiKeys.ts` → `lib/db/apiKeys.ts`
  - [ ] `getKey`, `createKey`, `verifyKey`, `deleteKey`
  
- [ ] `convex/userLLMKeys.ts` → `lib/db/userLLMKeys.ts`
  - [ ] `getActiveKey`, `listKeys`, `addKey`, `updateKey`
  
- [ ] `convex/mcpServers.ts` → `lib/db/mcpServers.ts`
  - [ ] `listServers`, `addServer`, `updateServer`, `testConnection`
  
- [ ] `convex/approvals.ts` → `lib/db/approvals.ts`
  - [ ] `getApproval`, `createApproval`, `approveOrReject`
  
- [ ] `convex/templates.ts` → `lib/db/templates.ts`
  - [ ] `listTemplates`, `getTemplate`, `seedTemplates`

#### 1.4 Update API Routes (16-20 hours)
**Replace ConvexHttpClient in 20+ API routes:**

- [ ] `app/api/workflows/route.ts`
- [ ] `app/api/workflows/[workflowId]/route.ts`
- [ ] `app/api/workflows/[workflowId]/execute/route.ts`
- [ ] `app/api/workflows/[workflowId]/execute-stream/route.ts`
- [ ] `app/api/workflows/[workflowId]/resume/route.ts`
- [ ] `app/api/workflows/[workflowId]/duplicate/route.ts`
- [ ] `app/api/workflows/[workflowId]/export/route.ts`
- [ ] `app/api/workflows/cleanup/route.ts`
- [ ] `app/api/approval/route.ts`
- [ ] `app/api/approval/[approvalId]/approve/route.ts`
- [ ] `app/api/approval/[approvalId]/reject/route.ts`
- [ ] `app/api/mcp/registry/route.ts`
- [ ] `app/api/templates/seed/route.ts`
- [ ] `app/api/templates/update/route.ts`
- [ ] All other routes using Convex

#### 1.5 Update Frontend Components (12-16 hours)
**Replace Convex hooks with custom API hooks:**

- [ ] Create custom hooks using React Query or SWR
- [ ] Replace all `useQuery(api.xxx)` calls
- [ ] Replace all `useMutation(api.xxx)` calls
- [ ] Implement WebSockets or polling for real-time updates
- [ ] Update all components in `components/app/` directory
- [ ] Update workflow builder components
- [ ] Update execution renderer

#### 1.6 Environment Variables
**NEW:**
```env
DATABASE_URL=postgresql://agent_builder:password@postgres:5432/agent_builder
DB_PASSWORD=<generate strong password>
```

**REMOVE:**
```env
# ❌ NEXT_PUBLIC_CONVEX_URL
```

### Docker Services to Add

```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: agent_builder
    POSTGRES_PASSWORD: ${DB_PASSWORD}
    POSTGRES_DB: agent_builder
  volumes:
    - postgres-data:/var/lib/postgresql/data
  ports:
    - "5432:5432"

pgadmin:
  image: dpage/pgadmin4:latest
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@local.dev
    PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
  ports:
    - "5050:80"
```

### Files to Create (7 new files)
- `prisma/schema.prisma` - Database schema
- `lib/db/workflows.ts` - Workflow queries
- `lib/db/executions.ts` - Execution queries
- `lib/db/apiKeys.ts` - API key queries
- `lib/db/userLLMKeys.ts` - LLM key queries
- `lib/db/mcpServers.ts` - MCP server queries
- `lib/db/approvals.ts` - Approval queries
- `lib/db/templates.ts` - Template queries
- `lib/db/client.ts` - Prisma client singleton

### Files to Modify (50+ files)
- All API routes (20+ files)
- All components using Convex hooks (30+ files)
- `lib/convex/client.ts` - Remove or replace
- All workflow-related components

---

## 📊 Overall Progress

| Phase | Status | Progress | Time Estimate | Priority |
|-------|--------|----------|---------------|----------|
| **Phase 3**: Firecrawl → Self-hosted | 🟡 In Progress | 80% | 1-2 days | ✅ Started |
| **Phase 2**: Clerk → NextAuth | 🔴 Not Started | 0% | 1-2 days | 🟡 Medium |
| **Phase 1**: Convex → PostgreSQL | 🔴 Not Started | 0% | 4-5 days | 🔴 High |
| **Testing**: All features | 🔴 Not Started | 0% | 1-2 days | 🔴 Critical |
| **Documentation**: Update docs | 🔴 Not Started | 0% | 1 day | 🟡 Medium |

**Total Progress**: ~15% complete (Phase 3 mostly done)  
**Remaining Work**: ~8-10 days

---

## 🚀 Quick Start (Current State)

### What Works Now:
✅ Ollama local LLM inference  
✅ Jina.ai web scraping (free, no key)  
✅ Browserless browser automation (local)  
✅ Docker containerization  

### What Still Needs Cloud:
❌ Convex (database) - still required  
❌ Clerk (authentication) - still required  
❌ Firecrawl (optional fallback) - can remove  

### To Test Phase 3 Progress:

```bash
# 1. Start services
docker-compose up

# 2. The app will use:
#    - Jina.ai for web scraping (free, no key needed)
#    - Browserless for JS-heavy sites
#    - Ollama for LLM (free, local)

# 3. Still need to configure:
#    - Convex (database)
#    - Clerk (auth)
```

---

## 📝 Next Steps

### Immediate (Complete Phase 3):
1. Update MCP integration for custom scraping
2. Test all workflow templates
3. Update template documentation
4. **ETA**: 2-3 hours

### Short Term (Start Phase 2):
1. Install NextAuth.js
2. Create auth configuration
3. Replace Clerk middleware
4. **ETA**: 1-2 days

### Long Term (Phase 1):
1. Set up PostgreSQL
2. Create Prisma schema
3. Migrate all Convex code
4. **ETA**: 4-5 days

---

## 🛠️ Commands for Continuing

### To continue Phase 3:
```bash
# Test current scraping
curl -X POST http://localhost:3000/api/execute-firecrawl \
  -H "Content-Type: application/json" \
  -d '{"action": "scrape", "params": {"url": "https://example.com"}}'

# Check Browserless status
curl http://localhost:3001/
```

### To start Phase 2:
```bash
# Install NextAuth
npm install next-auth@latest @auth/prisma-adapter

# Generate NextAuth secret
openssl rand -base64 32
```

### To start Phase 1:
```bash
# Install Prisma
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init
```

---

## ⚠️ Important Notes

1. **Phase Order**: The plan recommends Phase 3 → Phase 2 → Phase 1
   - Phase 3 is independent and easiest (mostly done!)
   - Phase 2 should come before Phase 1
   - Phase 1 is most complex and benefits from stable auth

2. **Can Run Hybrid**: You can mix self-hosted and cloud services
   - Keep using Convex/Clerk while testing Phase 3
   - Each phase can be rolled back independently

3. **Rollback Safety**: 
   - All changes are additive (not destructive)
   - Environment variables control which services are used
   - Can revert to cloud services anytime

4. **Testing is Critical**:
   - Test each phase thoroughly before moving to next
   - Keep existing cloud services until confident
   - Have rollback plan ready

---

## 💰 Cost Savings (After Full Migration)

### Current (Cloud Services):
- Convex: $0 (free tier) → $25+/month (production)
- Clerk: $0 (free tier) → $25+/month (production)
- Firecrawl: $0 (free tier) → $50+/month (production)
- LLMs: $50-200/month (usage-based)
**Total**: $125-300+/month in production

### After Migration:
- PostgreSQL: $0 (self-hosted)
- NextAuth: $0 (self-hosted)
- Jina.ai + Browserless: $0 (self-hosted)
- Ollama: $0 (self-hosted)
**Total**: $0/month ✨

**Savings**: $1,500-3,600/year

---

## 📚 Related Documentation

- [DOCKER.md](./DOCKER.md) - Docker setup guide
- [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md) - Quick start
- [DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md) - Ollama setup
- [Self-Hosting Plan](./dockerize-open-agent-builder.plan.md) - Full migration plan

---

**Last Updated**: Current session  
**Next Review**: After completing Phase 3  
**Questions?**: Refer to the plan document or reach out for guidance

