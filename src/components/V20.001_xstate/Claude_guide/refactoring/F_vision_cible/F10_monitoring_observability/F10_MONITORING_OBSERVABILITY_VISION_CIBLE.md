# 📊 F10 - MONITORING & OBSERVABILITY - VISION CIBLE

**Date** : 2 octobre 2025
**Phase** : F - Vision Cible
**Session** : F10 - Monitoring & Observabilité
**Statut** : ✅ COMPLET

---

## 📋 VUE D'ENSEMBLE

Le **Monitoring & Observability** définit les outils et stratégies pour surveiller la santé, les performances et les erreurs de l'application Overmind XState v5 en production.

---

## 🎯 TROIS PILIERS OBSERVABILITÉ

```
┌─────────────────────────────────────────────────────────────┐
│                     OBSERVABILITY                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 METRICS          📝 LOGS           🔍 TRACES            │
│  (Quantitatif)       (Qualitatif)      (Contexte)          │
│                                                             │
│  • FPS               • Errors          • User flow         │
│  • Load time         • Warnings        • XState events     │
│  • Memory usage      • State changes   • Network calls     │
│  • Bundle size       • User actions    • Render timeline   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 METRICS MONITORING

### **1. Web Vitals (Core Performance)**

**Implementation** :
```typescript
// src/monitoring/webVitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

interface AnalyticsPayload {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
  url: string;
  timestamp: number;
}

function sendToAnalytics(metric: Metric) {
  const payload: AnalyticsPayload = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    url: window.location.href,
    timestamp: Date.now()
  };

  // Send to analytics endpoint
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
  } else {
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    });
  }

  // Send to Sentry as breadcrumb
  if (window.Sentry) {
    window.Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${metric.value}ms (${metric.rating})`,
      level: metric.rating === 'poor' ? 'warning' : 'info'
    });
  }
}

// Track all Core Web Vitals
export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

**Usage** :
```typescript
// src/main.tsx
import { initWebVitals } from './monitoring/webVitals';

if (import.meta.env.PROD) {
  initWebVitals();
}
```

---

### **2. Custom Performance Metrics**

**Implementation** :
```typescript
// src/monitoring/customMetrics.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record custom metric
   */
  record(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  /**
   * Get metric statistics
   */
  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * Send all metrics to analytics
   */
  flush() {
    const allStats: Record<string, any> = {};

    this.metrics.forEach((values, name) => {
      allStats[name] = this.getStats(name);
    });

    fetch('/api/analytics/custom', {
      method: 'POST',
      body: JSON.stringify(allStats),
      headers: { 'Content-Type': 'application/json' }
    });

    // Clear metrics
    this.metrics.clear();
  }
}

// Auto-flush every 5 minutes
if (import.meta.env.PROD) {
  setInterval(() => {
    PerformanceMonitor.getInstance().flush();
  }, 5 * 60 * 1000);
}
```

**Usage dans app** :
```typescript
// src/services/loadGLBFile.ts
import { PerformanceMonitor } from '../monitoring/customMetrics';

export const loadGLBFile = fromPromise<GLBLoadOutput, GLBLoadInput>(
  async ({ input }) => {
    const startTime = performance.now();

    // ... loading logic

    const loadTime = performance.now() - startTime;
    PerformanceMonitor.getInstance().record('glb_load_time', loadTime);

    return result;
  }
);
```

---

### **3. Real-time FPS Monitoring**

**Implementation** :
```typescript
// src/monitoring/fpsMonitor.ts
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private isMonitoring = false;

  start() {
    this.isMonitoring = true;
    this.measure();
  }

  stop() {
    this.isMonitoring = false;
  }

  private measure = () => {
    if (!this.isMonitoring) return;

    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);

      // Send to analytics if FPS drops below 50
      if (this.fps < 50) {
        PerformanceMonitor.getInstance().record('fps_drop', this.fps);

        if (window.Sentry) {
          window.Sentry.captureMessage('FPS drop detected', {
            level: 'warning',
            extra: { fps: this.fps }
          });
        }
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    requestAnimationFrame(this.measure);
  };

  getCurrentFPS() {
    return this.fps;
  }
}

// Global instance
export const fpsMonitor = new FPSMonitor();
```

**Usage** :
```typescript
// src/actors/rendering/renderingMachine.ts
import { fpsMonitor } from '../../monitoring/fpsMonitor';

export const renderingMachine = setup({
  actions: {
    startRenderLoop: () => {
      fpsMonitor.start();

      const animate = () => {
        // render logic
        requestAnimationFrame(animate);
      };
      animate();
    },
    stopRenderLoop: () => {
      fpsMonitor.stop();
    }
  }
});
```

---

## 📝 ERROR LOGGING (Sentry)

### **Configuration Sentry**

**Installation** :
```bash
npm install @sentry/react @sentry/tracing
```

**Setup** :
```typescript
// src/monitoring/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: `overmind-xstate@${import.meta.env.VITE_APP_VERSION}`,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false
        })
      ],
      tracesSampleRate: 0.1, // 10% transactions
      replaysSessionSampleRate: 0.1, // 10% sessions
      replaysOnErrorSampleRate: 1.0, // 100% errors
      beforeSend(event, hint) {
        // Filter out known issues
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver loop')) {
          return null; // Ignore benign errors
        }
        return event;
      }
    });
  }
}
```

**Usage** :
```typescript
// src/main.tsx
import { initSentry } from './monitoring/sentry';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorScreen />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
```

---

### **XState Error Tracking**

**Integration avec Sentry** :
```typescript
// src/actors/bloomColorPicker/bloomColorPickerMachine.ts
import * as Sentry from '@sentry/react';

export const bloomColorPickerMachine = setup({
  actions: {
    logError: ({ context, event }) => {
      Sentry.captureException(context.error, {
        tags: {
          machine: 'bloomColorPicker',
          state: event.type
        },
        extra: {
          context: context,
          event: event
        }
      });
    }
  }
}).createMachine({
  states: {
    error: {
      entry: 'logError'
    }
  }
});
```

---

## 🔍 TRACING (XState Inspector)

### **XState Event Tracing**

**Development (Stately Inspector)** :
```typescript
// src/main.tsx
import { inspect } from '@stately/inspect';

if (import.meta.env.DEV) {
  inspect({
    iframe: false,
    url: 'https://stately.ai/viz?inspect'
  });
}
```

**Production (Custom Logger)** :
```typescript
// src/monitoring/xstateLogger.ts
export function createXStateLogger() {
  return (inspectionEvent: any) => {
    if (inspectionEvent.type === '@xstate.event') {
      // Log events to analytics
      PerformanceMonitor.getInstance().record(
        `xstate_event_${inspectionEvent.event.type}`,
        1
      );

      // Send critical events to Sentry
      if (inspectionEvent.event.type.includes('ERROR')) {
        Sentry.addBreadcrumb({
          category: 'xstate',
          message: `Event: ${inspectionEvent.event.type}`,
          level: 'error',
          data: inspectionEvent.event
        });
      }
    }

    if (inspectionEvent.type === '@xstate.snapshot') {
      // Log state transitions
      console.log('[XState]', inspectionEvent.snapshot.value);
    }
  };
}

// Usage in actor
const actor = createActor(machine, {
  inspect: createXStateLogger()
});
```

---

## 📈 ANALYTICS DASHBOARD

### **Custom Dashboard (Vercel Analytics + Grafana)**

**Metrics collectées** :

```typescript
// Dashboard metrics
interface DashboardMetrics {
  // Core Web Vitals
  lcp: { p50: number; p75: number; p95: number };
  fid: { p50: number; p75: number; p95: number };
  cls: { p50: number; p75: number; p95: number };

  // Custom Metrics
  glb_load_time: { p50: number; p75: number; p95: number };
  fps: { min: number; avg: number; p5: number };
  memory_usage: { avg: number; max: number };

  // XState Events
  event_counts: Record<string, number>;
  state_transitions: Record<string, number>;

  // User Metrics
  active_users: number;
  session_duration: { avg: number; median: number };
  bounce_rate: number;

  // Error Metrics
  error_rate: number;
  error_types: Record<string, number>;
}
```

**Grafana Dashboard Config** :
```json
{
  "dashboard": {
    "title": "Overmind XState Production",
    "panels": [
      {
        "title": "Core Web Vitals",
        "targets": [
          { "metric": "lcp", "threshold": 2500 },
          { "metric": "fid", "threshold": 100 },
          { "metric": "cls", "threshold": 0.1 }
        ]
      },
      {
        "title": "FPS (Real-time)",
        "targets": [
          { "metric": "fps", "threshold": 50 }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          { "metric": "error_rate", "threshold": 0.001 }
        ]
      }
    ]
  }
}
```

---

## 🚨 ALERTING

### **Alert Rules**

**Sentry Alerts** :
```yaml
# sentry-alerts.yml
rules:
  - name: High Error Rate
    condition: error_count > 10 in 5 minutes
    action: notify_slack
    channel: "#overmind-alerts"

  - name: Low FPS
    condition: fps < 30 for 1 minute
    action: notify_slack + create_issue
    channel: "#overmind-performance"

  - name: High Memory Usage
    condition: memory > 200MB
    action: notify_slack
    channel: "#overmind-performance"

  - name: Deployment Failed
    condition: deployment_status == "failed"
    action: notify_slack + email_team
    channel: "#overmind-deployments"
```

**Custom Alerts (Webhook)** :
```typescript
// src/monitoring/alerts.ts
export class AlertManager {
  static async sendAlert(alert: {
    level: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    data?: any;
  }) {
    // Send to Slack
    await fetch(import.meta.env.VITE_SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${alert.level.toUpperCase()}] ${alert.title}`,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: alert.message }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Environment: ${import.meta.env.MODE} | Time: ${new Date().toISOString()}`
              }
            ]
          }
        ]
      })
    });

    // Send to Sentry
    if (alert.level === 'error' || alert.level === 'critical') {
      Sentry.captureMessage(alert.title, {
        level: alert.level === 'critical' ? 'fatal' : 'error',
        extra: alert.data
      });
    }
  }
}

// Usage
AlertManager.sendAlert({
  level: 'critical',
  title: 'FPS dropped below 20',
  message: 'Average FPS in last minute: 18',
  data: { fps: 18, timestamp: Date.now() }
});
```

---

## 🔔 USER FEEDBACK MONITORING

### **User Satisfaction (NPS)**

```typescript
// src/components/FeedbackWidget.tsx
import { useState } from 'react';

export function FeedbackWidget() {
  const [rating, setRating] = useState<number | null>(null);

  const handleSubmit = async () => {
    await fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        rating,
        url: window.location.href,
        timestamp: Date.now()
      })
    });

    // Track in analytics
    if (window.gtag) {
      window.gtag('event', 'feedback_submitted', {
        rating,
        page: window.location.pathname
      });
    }
  };

  return (
    <div className="feedback-widget">
      <p>How satisfied are you with Overmind?</p>
      <div>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)}>
            {n}
          </button>
        ))}
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

---

## 📊 MONITORING DASHBOARD (Example)

```
┌─────────────────────────────────────────────────────────────┐
│              OVERMIND XSTATE - PRODUCTION                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🟢 Status: Healthy                   Uptime: 99.98%        │
│                                                             │
│  📊 Core Web Vitals (Last 24h)                              │
│  ├─ LCP: 1.8s (p95: 2.2s) ✅                               │
│  ├─ FID: 12ms (p95: 45ms) ✅                               │
│  └─ CLS: 0.02 (p95: 0.05) ✅                               │
│                                                             │
│  ⚡ Performance                                             │
│  ├─ FPS: 58 avg (min: 52) ✅                               │
│  ├─ Memory: 98MB avg (max: 145MB) ✅                       │
│  └─ GLB Load: 820ms avg ✅                                 │
│                                                             │
│  🐛 Errors (Last 24h)                                       │
│  ├─ Error Rate: 0.05% (12 errors / 24,000 sessions) ✅     │
│  ├─ Top Error: "ResizeObserver loop" (8 occurrences)       │
│  └─ Critical Errors: 0 ✅                                  │
│                                                             │
│  👥 Users (Last 24h)                                        │
│  ├─ Active Users: 1,245                                    │
│  ├─ Avg Session: 4m 32s                                    │
│  └─ Bounce Rate: 12% ✅                                    │
│                                                             │
│  🎯 XState Events (Top 10)                                  │
│  ├─ COLOR_CHANGED: 1,234                                   │
│  ├─ ANIMATION_STARTED: 892                                 │
│  ├─ LOAD_MODEL: 1,245                                      │
│  └─ APPLY_COLOR: 456                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST MONITORING

- [ ] Web Vitals tracking (LCP, FID, CLS, FCP, TTFB)
- [ ] Custom metrics (GLB load, FPS, memory)
- [ ] FPS monitoring (real-time + alerts)
- [ ] Sentry error tracking
- [ ] XState event logging
- [ ] Analytics dashboard (Grafana/Vercel)
- [ ] Alert rules configured (Slack/Email)
- [ ] User feedback widget (NPS)
- [ ] Performance budgets enforced
- [ ] Error rate monitoring (< 0.1%)
- [ ] Uptime monitoring (> 99.9%)
- [ ] Session recording (Sentry Replay)
- [ ] Custom alerts (FPS drops, memory spikes)

---

**Prochaine** : F11 Documentation Strategy

