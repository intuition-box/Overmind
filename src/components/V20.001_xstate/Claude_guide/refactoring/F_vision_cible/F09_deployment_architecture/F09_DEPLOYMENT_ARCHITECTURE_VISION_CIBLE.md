# 🚀 F09 - DEPLOYMENT ARCHITECTURE - VISION CIBLE

**Date** : 2 octobre 2025
**Phase** : F - Vision Cible
**Session** : F09 - Architecture Déploiement
**Statut** : ✅ COMPLET

---

## 📋 VUE D'ENSEMBLE

L'**architecture de déploiement** définit l'infrastructure, les environnements, le pipeline CI/CD et la stratégie de mise en production pour l'application Overmind XState v5.

---

## 🌍 ENVIRONNEMENTS

### **Architecture 3 environnements**

```
┌─────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT                            │
│  - Local machines (npm run dev)                             │
│  - Feature branches                                         │
│  - Stately Inspector enabled                                │
│  - Hot reload                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓ git push
┌─────────────────────────────────────────────────────────────┐
│                       STAGING                               │
│  - https://staging.overmind.app                             │
│  - Auto-deploy on merge to 'develop'                        │
│  - QA testing environment                                   │
│  - Production-like data                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓ git tag v1.x.x
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION                             │
│  - https://overmind.app                                     │
│  - Deploy on release tag                                    │
│  - Real users                                               │
│  - Monitoring + Analytics                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ INFRASTRUCTURE

### **Static Hosting (Vercel)**

**Choix** : Vercel pour hosting static files (React SPA)

**Avantages** :
- ✅ Edge CDN global (faible latence)
- ✅ Auto-scaling
- ✅ Zero config (vite.config.ts détecté)
- ✅ Preview deployments (PR)
- ✅ Rollback instantané
- ✅ Analytics intégrés

**Configuration (vercel.json)** :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "regions": ["cdg1", "iad1", "sfo1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/*.glb",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400, must-revalidate"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### **CDN pour Assets (Cloudflare R2)**

**Choix** : Cloudflare R2 pour GLB files (alternative S3)

**Avantages** :
- ✅ Zero egress fees (vs AWS S3)
- ✅ Edge caching
- ✅ DRACO files (.wasm)

**Configuration** :
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          xstate: ['xstate']
        }
      }
    }
  },
  define: {
    'import.meta.env.GLB_CDN_URL': JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? 'https://cdn.overmind.app'
        : '/public'
    )
  }
});
```

**Usage** :
```typescript
// src/services/loadGLBFile.ts
const GLB_URL = import.meta.env.GLB_CDN_URL;

export const loadGLBFile = fromPromise<GLBLoadOutput, GLBLoadInput>(
  async ({ input }) => {
    const fullPath = `${GLB_URL}${input.path}`;
    // Load from CDN in production, local in dev
  }
);
```

---

## 🔄 CI/CD PIPELINE

### **GitHub Actions Workflow**

**.github/workflows/ci.yml** :
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  release:
    types: [published]

jobs:
  # Job 1: Lint
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  # Job 2: Unit Tests
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

  # Job 3: E2E Tests
  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # Job 4: Build
  build:
    runs-on: ubuntu-latest
    needs: [lint, test-unit, test-e2e]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  # Job 5: Lighthouse CI
  lighthouse:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true

  # Job 6: Deploy Staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build, lighthouse]
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          alias-domains: staging.overmind.app

  # Job 7: Deploy Production
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build, lighthouse]
    if: github.event_name == 'release' && github.event.action == 'published'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          alias-domains: overmind.app
      - uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

---

## 📦 BUILD OPTIMIZATION

### **Vite Production Build**

**Configuration (vite.config.ts)** :
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024
    }),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-three': ['three'],
          'vendor-xstate': ['xstate', '@xstate/react'],
          'vendor-zustand': ['zustand']
        }
      }
    },
    chunkSizeWarningLimit: 500,
    sourcemap: true
  }
});
```

**Build script (package.json)** :
```json
{
  "scripts": {
    "build": "vite build",
    "build:analyze": "vite build && open dist/stats.html",
    "build:staging": "NODE_ENV=staging vite build",
    "build:production": "NODE_ENV=production vite build"
  }
}
```

---

## 🔐 SECRETS MANAGEMENT

### **Environment Variables**

**.env.example** :
```bash
# Public variables (embedded in bundle)
VITE_APP_NAME=Overmind
VITE_GLB_CDN_URL=https://cdn.overmind.app
VITE_ANALYTICS_ID=G-XXXXXXXXXX

# Private variables (server-side only, not in Vite)
VERCEL_TOKEN=xxxxx
CLOUDFLARE_API_TOKEN=xxxxx
```

**.env.development** :
```bash
VITE_GLB_CDN_URL=/public
VITE_ENABLE_INSPECTOR=true
VITE_ENABLE_STATS=true
```

**.env.production** :
```bash
VITE_GLB_CDN_URL=https://cdn.overmind.app
VITE_ENABLE_INSPECTOR=false
VITE_ENABLE_STATS=false
```

**Usage** :
```typescript
// src/config.ts
export const config = {
  glbCdnUrl: import.meta.env.VITE_GLB_CDN_URL,
  enableInspector: import.meta.env.VITE_ENABLE_INSPECTOR === 'true',
  enableStats: import.meta.env.VITE_ENABLE_STATS === 'true',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID
};
```

---

## 🚦 DEPLOYMENT STRATEGY

### **Big Bang Deployment** (Construction from scratch)

**Stratégie** : 2 systèmes séparés, switch DNS

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Construction parallèle (Semaines 1-24)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Legacy System                   New XState System          │
│  overmind.app ────────────────   new.overmind.app          │
│  (running)                       (in development)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Validation Staging (Semaine 25)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  staging.overmind.app → XState system                       │
│  - QA testing complete                                      │
│  - Performance validated (60 FPS, <3s TTI)                  │
│  - All features working                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Production Go-Live (Semaine 26)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DNS Switch:                                                │
│  overmind.app → XState system (new.overmind.app)            │
│                                                             │
│  Rollback plan:                                             │
│  DNS Switch back → Legacy system (<2 min)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Checklist Go-Live** :
```markdown
# Pre-deployment (J-7)
- [ ] All tests pass (unit, integration, E2E)
- [ ] Lighthouse score ≥ 90
- [ ] Performance validated (60 FPS, LCP <2.5s)
- [ ] Security audit passed
- [ ] Staging validated by QA
- [ ] Documentation complete
- [ ] Rollback plan documented

# Go-Live Day (J-Day)
- [ ] 09:00 - Deploy to production (Vercel)
- [ ] 09:30 - Smoke tests production
- [ ] 10:00 - DNS switch (overmind.app → new)
- [ ] 10:15 - Monitor errors (Sentry)
- [ ] 10:30 - Monitor performance (Web Vitals)
- [ ] 11:00 - All clear ✅

# Post-deployment (J+1)
- [ ] Monitor error rate (target <0.1%)
- [ ] Monitor performance metrics
- [ ] User feedback review
- [ ] Remove legacy system (J+7 if stable)
```

---

## 🔙 ROLLBACK STRATEGY

### **Instant Rollback (Vercel)**

```bash
# Option 1: Vercel Dashboard
# → Go to Deployments
# → Click on previous deployment
# → Click "Promote to Production"
# Time: < 1 minute

# Option 2: Vercel CLI
vercel rollback
# Time: < 1 minute

# Option 3: DNS Switch
# → Point overmind.app back to legacy system
# Time: < 2 minutes (DNS propagation)
```

**Automated Rollback (GitHub Actions)** :
```yaml
# .github/workflows/rollback.yml
name: Rollback Production

on:
  workflow_dispatch:
    inputs:
      deployment_id:
        description: 'Deployment ID to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: 'rollback ${{ github.event.inputs.deployment_id }}'
```

---

## 📊 MONITORING POST-DEPLOYMENT

### **Health Checks**

```typescript
// public/health.json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-10-02T10:00:00Z"
}

// GitHub Actions health check
- name: Health Check
  run: |
    STATUS=$(curl -s https://overmind.app/health.json | jq -r '.status')
    if [ "$STATUS" != "ok" ]; then
      echo "Health check failed"
      exit 1
    fi
```

### **Error Monitoring (Sentry)**

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: `overmind-xstate@${import.meta.env.VITE_APP_VERSION}`,
    tracesSampleRate: 0.1,
    beforeSend(event, hint) {
      // Filter out non-critical errors
      if (event.level === 'warning') {
        return null;
      }
      return event;
    }
  });
}
```

### **Performance Monitoring (Web Vitals)**

```typescript
// src/utils/reportWebVitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify(metric);

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', {
      body,
      method: 'POST',
      keepalive: true
    });
  }
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

---

## 🔒 SECURITY

### **Content Security Policy**

**vercel.json** :
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.overmind.app; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.overmind.app https://cdn.overmind.app; frame-ancestors 'none';"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

---

## ✅ CHECKLIST DEPLOYMENT

- [ ] Vercel account setup
- [ ] Cloudflare R2 bucket created
- [ ] GitHub Actions workflows configured
- [ ] Environment variables configured (.env)
- [ ] Secrets stored (GitHub Secrets)
- [ ] Build optimization (code splitting, compression)
- [ ] Lighthouse budget configured
- [ ] Staging environment deployed
- [ ] Production environment ready
- [ ] DNS configured
- [ ] SSL certificates (auto via Vercel)
- [ ] CDN configured (Cloudflare)
- [ ] Monitoring (Sentry, Web Vitals)
- [ ] Health checks endpoint
- [ ] Rollback strategy documented
- [ ] Go-Live checklist prepared
- [ ] Post-deployment monitoring plan

---

**Prochaine** : F10 Monitoring & Observability

