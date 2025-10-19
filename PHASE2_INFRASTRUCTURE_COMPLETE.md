# Phase 2: Infrastructure Complete ✅

## Status: Core Infrastructure Ready - Component Migration Pending

**Completion**: 40% (Infrastructure done, component updates remain)  
**Time Invested**: ~2 hours  
**Remaining Work**: 1-2 days for component updates

---

## ✅ What's Been Completed

### 1. PostgreSQL Database (Self-Hosted) ✅

**Added to `docker-compose.yml`**:
```yaml
postgres:
  image: postgres:16-alpine
  container_name: open-agent-builder-postgres
  environment:
    POSTGRES_USER: agent_builder
    POSTGRES_PASSWORD: changeme123
    POSTGRES_DB: agent_builder
  volumes:
    - postgres-data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
```

**Benefits**:
- 🆓 Free (self-hosted in Docker)
- 💾 Persistent data storage
- 🔒 Full control over data
- 📊 Can view/manage with pgAdmin or any PostgreSQL client

### 2. Prisma ORM Setup ✅

**Files Created**:
- `prisma/schema.prisma` - Database schema with NextAuth tables
- `lib/prisma.ts` - Prisma client singleton

**Schema Includes**:
- `User` - User accounts
- `Account` - OAuth accounts
- `Session` - User sessions
- `VerificationToken` - Email verification

**Commands Added**:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# View database
npx prisma studio
```

### 3. NextAuth.js Configuration ✅

**File**: `app/api/auth/[...nextauth]/route.ts`

**Features Implemented**:
- ✅ Credentials provider (email/password)
- ✅ GitHub OAuth (optional)
- ✅ Google OAuth (optional)
- ✅ JWT session strategy
- ✅ Prisma adapter integration
- ✅ Custom callbacks for user data

**Authentication Flow**:
```
User → Sign In Page → NextAuth API → Verify Credentials → Create JWT → Session
```

### 4. Dependencies Added ✅

**package.json**:
```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.25",
    "@auth/prisma-adapter": "^2.7.4",
    "@prisma/client": "^6.1.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "prisma": "^6.1.0"
  }
}
```

### 5. Environment Variables Updated ✅

**env.example**:
```env
# NextAuth (Self-Hosted)
NEXTAUTH_SECRET=  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://agent_builder:changeme123@postgres:5432/agent_builder
DB_USER=agent_builder
DB_PASSWORD=changeme123
DB_NAME=agent_builder

# Optional OAuth
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
```

---

## 🔄 What Remains To Be Done

### Critical (Required for Phase 2 to work):

#### 1. Create Auth Pages (2-3 hours)

**Files to Create**:

**`app/sign-in/page.tsx`**:
```typescript
import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <SignInForm />
      </div>
    </div>
  );
}
```

**`app/sign-up/page.tsx`**:
```typescript
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        <SignUpForm />
      </div>
    </div>
  );
}
```

**`components/auth/SignInForm.tsx`**:
```typescript
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/workflows');
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded">{error}</div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="text-center text-sm">
        Don't have an account?{' '}
        <a href="/sign-up" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </div>
    </form>
  );
}
```

**`components/auth/SignUpForm.tsx`**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        router.push('/sign-in?registered=true');
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded">{error}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <a href="/sign-in" className="text-blue-600 hover:underline">
          Sign in
        </a>
      </div>
    </form>
  );
}
```

**`app/api/auth/register/route.ts`**:
```typescript
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: 'User created', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

#### 2. Update Middleware (1 hour)

**Create `middleware.ts`** (replace Clerk):
```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes
        const publicPaths = ['/', '/sign-in', '/sign-up', '/api/auth'];
        const isPublicPath = publicPaths.some(path =>
          req.nextUrl.pathname.startsWith(path)
        );

        if (isPublicPath) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

**Delete** `proxy.ts` (Clerk middleware - no longer needed)

#### 3. Update Layout (30 minutes)

**app/layout.tsx** - Replace ClerkProvider with SessionProvider:

```typescript
import { SessionProvider } from 'next-auth/react';
import { auth } from './api/auth/[...nextauth]/route';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

#### 4. Update API Routes (4-6 hours)

**Pattern for all API routes**:

**Before (Clerk)**:
```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of code
}
```

**After (NextAuth)**:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  // ... rest of code
}
```

**Files to Update** (~20 files):
- `app/api/workflows/route.ts`
- `app/api/workflows/[workflowId]/route.ts`
- `app/api/workflows/[workflowId]/execute/route.ts`
- `app/api/workflows/[workflowId]/execute-stream/route.ts`
- `app/api/workflows/[workflowId]/resume/route.ts`
- `app/api/workflows/[workflowId]/duplicate/route.ts`
- `app/api/workflows/[workflowId]/export/route.ts`
- `app/api/workflows/cleanup/route.ts`
- `app/api/approval/route.ts`
- `app/api/approval/[approvalId]/approve/route.ts`
- `app/api/approval/[approvalId]/reject/route.ts`
- `app/api/mcp/registry/route.ts`
- All other routes using `auth()` from Clerk

#### 5. Update React Components (6-8 hours)

**Pattern for components**:

**Before (Clerk)**:
```typescript
import { useUser } from '@clerk/nextjs';

export function MyComponent() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;
  
  return <div>Hello {user.firstName}</div>;
}
```

**After (NextAuth)**:
```typescript
import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Not signed in</div>;
  
  return <div>Hello {session?.user?.name}</div>;
}
```

**Files to Update** (~30+ files in `components/`):
- Find all uses of `useUser()` from Clerk
- Replace with `useSession()` from NextAuth
- Update user property access (firstName → name, etc.)

#### 6. Update Authentication Helpers (1 hour)

**lib/api/auth.ts** - Update auth validation:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}
```

---

## 📋 Complete Migration Checklist

### Infrastructure (DONE ✅)
- [x] Add PostgreSQL to docker-compose.yml
- [x] Create Prisma schema
- [x] Create Prisma client singleton
- [x] Create NextAuth configuration
- [x] Add dependencies to package.json
- [x] Update environment variables

### Auth Pages (TODO)
- [ ] Create `app/sign-in/page.tsx`
- [ ] Create `app/sign-up/page.tsx`
- [ ] Create `components/auth/SignInForm.tsx`
- [ ] Create `components/auth/SignUpForm.tsx`
- [ ] Create `app/api/auth/register/route.ts`

### Middleware (TODO)
- [ ] Create new `middleware.ts` with NextAuth
- [ ] Delete `proxy.ts` (Clerk middleware)
- [ ] Test protected routes

### Layout (TODO)
- [ ] Update `app/layout.tsx` - Replace ClerkProvider
- [ ] Test session provider

### API Routes (TODO - ~20 files)
- [ ] Update all routes in `app/api/workflows/`
- [ ] Update all routes in `app/api/approval/`
- [ ] Update all routes in `app/api/mcp/`
- [ ] Update all other authenticated routes

### Components (TODO - ~30+ files)
- [ ] Find all `useUser()` from Clerk
- [ ] Replace with `useSession()` from NextAuth
- [ ] Update user property access
- [ ] Test each component

### Helper Functions (TODO)
- [ ] Update `lib/api/auth.ts`
- [ ] Update any custom auth utilities

---

## 🚀 How to Complete Phase 2

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Database

```bash
# Start PostgreSQL
docker-compose up postgres -d

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init-auth

# View database (optional)
npx prisma studio
```

### Step 3: Generate NextAuth Secret

```bash
# Generate and add to .env
openssl rand -base64 32
```

Add to `.env`:
```env
NEXTAUTH_SECRET=<your-generated-secret>
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://agent_builder:changeme123@postgres:5432/agent_builder
```

### Step 4: Create Auth Pages

Follow the code examples above to create:
- Sign-in page
- Sign-up page
- Auth forms
- Registration API route

### Step 5: Update Middleware

Replace `proxy.ts` with new NextAuth middleware

### Step 6: Systematic Component Update

```bash
# Find all Clerk usage
grep -r "useUser" components/
grep -r "@clerk/nextjs" app/

# Update each file systematically
```

### Step 7: Test

```bash
# Start all services
docker-compose up

# Test:
1. Sign up new user
2. Sign in
3. Access protected routes
4. Sign out
```

---

## 💡 Pro Tips

### Quick Find & Replace

Use these VS Code regex find/replace:

**Find**: `import { useUser } from '@clerk/nextjs';`  
**Replace**: `import { useSession } from 'next-auth/react';`

**Find**: `const { user, isLoaded } = useUser();`  
**Replace**: `const { data: session, status } = useSession();`

**Find**: `import { auth } from '@clerk/nextjs/server';`  
**Replace**: `import { getServerSession } from 'next-auth';\nimport { authOptions } from '@/app/api/auth/[...nextauth]/route';`

### Testing Auth

```typescript
// Quick auth test component
export function AuthTest() {
  const { data: session, status } = useSession();
  return (
    <div>
      <p>Status: {status}</p>
      <p>User: {session?.user?.email}</p>
    </div>
  );
}
```

---

## 📊 Time Estimates

| Task | Time | Priority |
|------|------|----------|
| Create auth pages | 2-3 hours | 🔴 Critical |
| Update middleware | 1 hour | 🔴 Critical |
| Update layout | 30 min | 🔴 Critical |
| Update API routes | 4-6 hours | 🔴 Critical |
| Update components | 6-8 hours | 🔴 Critical |
| Testing | 2-3 hours | 🟡 Important |
| Documentation | 1 hour | 🟢 Nice-to-have |

**Total**: 16-22 hours remaining

---

## ❌ What Can Be Removed

Once Phase 2 is complete, you can remove:

### Dependencies:
```bash
npm uninstall @clerk/nextjs
```

### Files:
- `proxy.ts` (Clerk middleware)
- `convex/auth.config.ts` (Clerk + Convex integration)

### Environment Variables:
```env
# Remove from .env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_JWT_ISSUER_DOMAIN
```

---

## 🎯 Current Status

**Phase 2 Progress**: 40%

✅ **Complete**:
- PostgreSQL setup
- Prisma schema  
- NextAuth configuration
- Dependencies added
- Environment variables
- Infrastructure ready

🔄 **In Progress**:
- Auth pages (code provided above)
- Middleware update (code provided above)

⏳ **Remaining**:
- Layout update
- API routes update
- Component updates
- Testing

---

**The foundation is solid! You can now:**
1. Create the auth pages using the code above
2. Test the auth system
3. Systematically update components
4. Complete Phase 2 migration

See [SELF_HOSTING_PROGRESS.md](./SELF_HOSTING_PROGRESS.md) for full project status.

