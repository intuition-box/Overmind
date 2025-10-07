# 🚢 SESSION E12 - DEPLOYMENT PLANNING PLAN CONSTRUCTION

**Date** : 1 octobre 2025
**Phase** : E - Plan Construction
**Focus** : Infrastructure deployment, environnements, CI/CD, monitoring production
**Criticité** : HAUTE

---

## 🎯 OBJECTIF SESSION E12

**Mission** : Définir infrastructure complète deployment (dev → staging → production) avec CI/CD automatisé.

**Scope** :
1. **Environnements** : Dev, Staging, Production
2. **CI/CD Pipeline** : GitHub Actions automatisé
3. **Infrastructure** : Hosting, CDN, Database
4. **Monitoring Production** : Logs, metrics, alertes
5. **Backup & Recovery** : Stratégies backup

**Objectif qualité** : Deployment automatisé, monitoring 24/7, backup quotidien

---

## 🏗️ ARCHITECTURE ENVIRONNEMENTS

### **3 Environnements** :

```
┌─────────────────────────────────────────────────────────┐
│                  ENVIRONMENTS ARCHITECTURE              │
│                                                         │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────┐│
│  │     DEV     │─────▶│   STAGING   │─────▶│  PROD   ││
│  │             │      │             │      │         ││
│  │  localhost  │      │ staging.app │      │ app.com ││
│  │  :5173      │      │             │      │         ││
│  └─────────────┘      └─────────────┘      └─────────┘│
│       ↑                     ↑                    ↑     │
│       │                     │                    │     │
│   Developers            QA Testing         Real Users │
└─────────────────────────────────────────────────────────┘
```

---

### **1. Development Environment**

**URL** : `http://localhost:5173`

**Configuration** :
```bash
# .env.development
VITE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_GLB_PATH=/models/overmind.glb
VITE_ENABLE_DEBUG=true
VITE_ENABLE_DEVTOOLS=true
```

**Caractéristiques** :
- ✅ Hot reload (Vite HMR)
- ✅ Source maps (debugging)
- ✅ XState inspector enabled
- ✅ Console logs enabled
- ✅ Performance profiling tools

**Usage** : Développement local, debugging

---

### **2. Staging Environment**

**URL** : `https://staging.overmind.app`

**Configuration** :
```bash
# .env.staging
VITE_ENV=staging
VITE_API_URL=https://staging-api.overmind.app
VITE_GLB_PATH=/models/overmind.glb
VITE_ENABLE_DEBUG=false
VITE_ENABLE_DEVTOOLS=false
VITE_SENTRY_DSN=https://xxx@sentry.io/staging
```

**Caractéristiques** :
- ✅ Production-like (même config que prod)
- ✅ Draco compressed GLB (test compression)
- ✅ Minified build
- ✅ Error tracking (Sentry staging)
- ✅ Analytics disabled (pas de pollution)

**Usage** : QA testing, validation pré-production

---

### **3. Production Environment**

**URL** : `https://overmind.app`

**Configuration** :
```bash
# .env.production
VITE_ENV=production
VITE_API_URL=https://api.overmind.app
VITE_GLB_PATH=/models/overmind-draco.glb
VITE_ENABLE_DEBUG=false
VITE_ENABLE_DEVTOOLS=false
VITE_SENTRY_DSN=https://xxx@sentry.io/production
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

**Caractéristiques** :
- ✅ Production optimized (minified, compressed)
- ✅ CDN enabled (CloudFlare/AWS CloudFront)
- ✅ Error tracking (Sentry production)
- ✅ Analytics enabled (Google Analytics)
- ✅ Monitoring 24/7

**Usage** : Real users, production traffic

---

## 🔄 CI/CD PIPELINE

### **GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  push:
    branches:
      - main        # Production deployment
      - develop     # Staging deployment
  pull_request:
    branches:
      - develop     # Run tests on PR

jobs:
  # Job 1: Lint & Type Check
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: ESLint
        run: npm run lint

      - name: TypeScript check
        run: npm run type-check

  # Job 2: Unit Tests
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  # Job 3: Integration Tests
  test-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration

  # Job 4: E2E Tests
  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build app
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  # Job 5: Build
  build:
    runs-on: ubuntu-latest
    needs: [lint, test-unit, test-integration, test-e2e]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Build production
        run: npm run build
        env:
          VITE_ENV: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  # Job 6: Deploy Staging (develop branch)
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist

      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          alias-domains: staging.overmind.app

  # Job 7: Deploy Production (main branch)
  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          alias-domains: overmind.app

      - name: Notify deployment success
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"🚀 Production deployment successful!"}'

  # Job 8: Lighthouse CI (production only)
  lighthouse:
    runs-on: ubuntu-latest
    needs: deploy-production
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://overmind.app
          budgetPath: ./budget.json
          uploadArtifacts: true
```

---

## 🏢 INFRASTRUCTURE HOSTING

### **Option 1 : Vercel (Recommandé pour MVP)**

**Avantages** :
- ✅ Deploy automatique (Git push → deploy)
- ✅ CDN global inclus
- ✅ HTTPS automatique
- ✅ Preview deployments (PR)
- ✅ Rollback en 1 clic
- ✅ Free tier généreux

**Configuration** :
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "routes": [
    {
      "src": "/models/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
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
        }
      ]
    }
  ]
}
```

**Coût** : 0€ (Free tier) ou 20€/mois (Pro)

---

### **Option 2 : AWS S3 + CloudFront**

**Avantages** :
- ✅ Contrôle total infrastructure
- ✅ Scalabilité illimitée
- ✅ CDN global (CloudFront)
- ✅ Intégration AWS services

**Configuration** :
```bash
# Deploy script
aws s3 sync dist/ s3://overmind-app --delete
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

**Coût** : ~5-10€/mois (low traffic)

---

### **Option 3 : Netlify**

**Similaire à Vercel** :
- ✅ Git-based deployments
- ✅ CDN global
- ✅ HTTPS automatique
- ✅ Free tier

**Coût** : 0€ (Free tier)

---

## 📊 MONITORING PRODUCTION

### **1. Error Tracking (Sentry)**

**Setup** :
```typescript
// monitoring/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});

// Track XState errors
export function trackError(error: Error, context: string) {
  Sentry.captureException(error, {
    tags: { context },
    level: 'error'
  });
}
```

**Alerts** :
- Error rate >1% → Slack notification
- Critical error (crash loop) → SMS alert

---

### **2. Performance Monitoring (Web Vitals)**

```typescript
// monitoring/webVitals.ts
import { onCLS, onFID, onLCP } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Send to Google Analytics
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'Web Vitals',
    non_interaction: true
  });

  // Send to custom backend
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
```

**Thresholds** :
- LCP < 2.5s ✅
- FID < 100ms ✅
- CLS < 0.1 ✅

---

### **3. Custom Metrics (XState + Three.js)**

```typescript
// monitoring/customMetrics.ts
export class ProductionMonitor {
  private metrics = {
    fps: 0,
    loadTime: 0,
    glbSize: 0,
    errorCount: 0
  };

  trackGLBLoad(startTime: number, fileSize: number) {
    const loadTime = performance.now() - startTime;

    this.metrics.loadTime = loadTime;
    this.metrics.glbSize = fileSize;

    // Send to analytics
    gtag('event', 'glb_load', {
      load_time: loadTime,
      file_size: fileSize
    });
  }

  trackFPS(fps: number) {
    this.metrics.fps = fps;

    // Alert if low FPS
    if (fps < 30) {
      this.alertLowFPS(fps);
    }
  }

  private alertLowFPS(fps: number) {
    fetch('/api/alerts/low-fps', {
      method: 'POST',
      body: JSON.stringify({ fps, timestamp: Date.now() })
    });
  }
}
```

---

### **4. Monitoring Dashboard**

**Tools** :
- **Sentry** : Error tracking, crash reports
- **Google Analytics** : User behavior, page views
- **Vercel Analytics** : Performance, Web Vitals
- **Custom Dashboard** : FPS, GLB load time, XState metrics

**Metrics to Monitor** :

| Metric | Target | Alert If |
|--------|--------|----------|
| Error rate | <0.5% | >1% |
| FPS average | >50 | <30 |
| GLB load time | <3s | >5s |
| Page load time | <2s | >4s |
| Memory usage | <300MB | >500MB |
| Active users | - | - |

---

## 💾 BACKUP & RECOVERY

### **1. Code Backup**

**Git Repository** :
- ✅ GitHub (primary)
- ✅ GitLab (mirror backup, daily sync)

```bash
# Auto-sync to GitLab (GitHub Actions)
git push --mirror gitlab
```

---

### **2. Build Artifacts Backup**

**Storage** :
- ✅ S3 bucket (all production builds)
- ✅ Retention : 90 jours

```bash
# Archive production build
aws s3 cp dist/ s3://overmind-builds/$(date +%Y-%m-%d)/ --recursive
```

---

### **3. Database Backup** (si applicable)

**Stratégie** :
- ✅ Daily backup (automated)
- ✅ Retention : 30 jours
- ✅ Point-in-time recovery

---

### **4. Recovery Plan**

**Scenario 1 : Build corrompu** :
```bash
# Restore previous build from S3
aws s3 sync s3://overmind-builds/2025-10-01/ dist/
vercel deploy --prod
```

**Scenario 2 : Code perdu (Git repo)** :
```bash
# Restore from GitLab mirror
git clone gitlab:overmind
```

**RTO (Recovery Time Objective)** : <15 minutes
**RPO (Recovery Point Objective)** : <24 heures

---

## 🔐 SECURITY

### **1. HTTPS Enforcement**

```javascript
// Redirect HTTP → HTTPS
if (location.protocol !== 'https:' && import.meta.env.PROD) {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

---

### **2. Content Security Policy**

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.overmind.app https://sentry.io;
">
```

---

### **3. Secrets Management**

**GitHub Secrets** :
- `VERCEL_TOKEN`
- `SENTRY_DSN`
- `GA_TRACKING_ID`
- `SLACK_WEBHOOK_URL`

**Never commit** :
- ❌ API keys
- ❌ Sentry DSN
- ❌ Database credentials

---

## 📋 DEPLOYMENT CHECKLIST

### **Avant chaque deployment** :

**Tests** :
- ✅ All tests green (unit + integration + E2E)
- ✅ Coverage >80%
- ✅ Lighthouse score >90
- ✅ No TypeScript errors
- ✅ No ESLint errors

**Build** :
- ✅ Production build successful
- ✅ Bundle size <500KB gzipped
- ✅ GLB compressed (Draco)
- ✅ Source maps generated

**Security** :
- ✅ No secrets in code
- ✅ Dependencies updated (no critical vulnerabilities)
- ✅ CSP configured
- ✅ HTTPS enforced

**Monitoring** :
- ✅ Sentry configured
- ✅ Analytics configured
- ✅ Alerts configured

---

## 🎯 PROCHAINES ÉTAPES

✅ **E12 COMPLÉTÉ** - Deployment Planning

**Infrastructure** :
- ✅ 3 environnements (dev, staging, production)
- ✅ CI/CD automatisé (GitHub Actions)
- ✅ Hosting (Vercel recommandé)
- ✅ CDN global

**Monitoring** :
- ✅ Error tracking (Sentry)
- ✅ Performance monitoring (Web Vitals)
- ✅ Custom metrics (FPS, GLB load)
- ✅ Dashboard alertes

**Backup** :
- ✅ Code (Git + GitLab mirror)
- ✅ Builds (S3, 90 jours)
- ✅ Recovery plan (<15min RTO)

**Prochaine** : E13 BloomColorPicker Construction Plan

---

**SESSION E12 TERMINÉE** ✅

**PLAN E COMPLET** : E01-E12 ✅
