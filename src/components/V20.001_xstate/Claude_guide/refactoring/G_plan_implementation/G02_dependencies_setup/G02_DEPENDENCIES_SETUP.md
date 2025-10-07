# 📦 G02 - DEPENDENCIES SETUP

**Date** : 2 octobre 2025
**Phase** : G - Plan d'Implémentation
**Session** : G02 - Setup Dépendances
**Statut** : ✅ COMPLET

---

## 🎯 OBJECTIF

Configurer toutes les dépendances nécessaires pour XState v5, React 18, Three.js et outils de développement.

---

## 📋 DÉPENDANCES À INSTALLER

### **1. XState v5 (Core)**

```bash
npm install xstate@^5.18.0 @xstate/react@^4.1.0
```

**Versions** :
- `xstate` : 5.18.0+ (Actor Model, setup API, fromPromise)
- `@xstate/react` : 4.1.0+ (useActorRef, useSelector)

**Pourquoi ces versions ?**
- XState 5.18.0 = API stable + performance optimale
- @xstate/react 4.1.0 = Compatible React 18

---

### **2. React 18**

```bash
npm install react@^18.3.0 react-dom@^18.3.0
```

**Versions** :
- `react` : 18.3.0+ (Concurrent features)
- `react-dom` : 18.3.0+

**Pourquoi React 18 ?**
- Concurrent rendering
- Automatic batching
- useTransition / useDeferredValue
- Meilleure performance avec XState

---

### **3. Three.js + Loaders**

```bash
npm install three@^0.168.0
```

**Version** :
- `three` : 0.168.0+ (GLTFLoader, DRACOLoader, OrbitControls)

**Modules inclus** :
- `three/examples/jsm/loaders/GLTFLoader`
- `three/examples/jsm/loaders/DRACOLoader`
- `three/examples/jsm/controls/OrbitControls`
- `three/examples/jsm/postprocessing/EffectComposer`
- `three/examples/jsm/postprocessing/RenderPass`
- `three/examples/jsm/postprocessing/UnrealBloomPass`

---

### **4. Zustand (UI State)**

```bash
npm install zustand@^4.5.0
```

**Version** :
- `zustand` : 4.5.0+

**Pourquoi Zustand ?**
- UI state rapide (toggles, filters)
- Complément XState (pas concurrence)
- Légère (~1KB)

---

### **5. TypeScript**

```bash
npm install --save-dev typescript@^5.5.0
npm install --save-dev @types/react@^18.3.0 @types/react-dom@^18.3.0
npm install --save-dev @types/three@^0.168.0
```

**Versions** :
- `typescript` : 5.5.0+
- `@types/react` : 18.3.0+
- `@types/three` : 0.168.0+

---

### **6. Vite (Build Tool)**

```bash
npm install --save-dev vite@^5.4.0
npm install --save-dev @vitejs/plugin-react@^4.3.0
```

**Versions** :
- `vite` : 5.4.0+
- `@vitejs/plugin-react` : 4.3.0+

---

### **7. Testing**

```bash
# Vitest (unit tests)
npm install --save-dev vitest@^2.1.0

# React Testing Library
npm install --save-dev @testing-library/react@^16.0.0
npm install --save-dev @testing-library/user-event@^14.5.0

# Playwright (E2E)
npm install --save-dev @playwright/test@^1.47.0
npx playwright install
```

**Versions** :
- `vitest` : 2.1.0+
- `@testing-library/react` : 16.0.0+
- `@playwright/test` : 1.47.0+

---

### **8. Linting & Formatting**

```bash
npm install --save-dev eslint@^9.11.0
npm install --save-dev @typescript-eslint/parser@^8.6.0
npm install --save-dev @typescript-eslint/eslint-plugin@^8.6.0
npm install --save-dev eslint-plugin-react@^7.36.0
npm install --save-dev eslint-plugin-react-hooks@^4.6.0
npm install --save-dev prettier@^3.3.0
```

---

## 📄 FICHIERS CONFIGURATION

### **package.json (Scripts)**

```json
{
  "name": "overmind-xstate-v5",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\""
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "xstate": "^5.18.0",
    "@xstate/react": "^4.1.0",
    "three": "^0.168.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.168.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.47.0",
    "eslint": "^9.11.0",
    "@typescript-eslint/parser": "^8.6.0",
    "@typescript-eslint/eslint-plugin": "^8.6.0",
    "eslint-plugin-react": "^7.36.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.3.0"
  }
}
```

---

### **tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@xstate-v5/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/*"],
      "@actors/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/actors/*"],
      "@services/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/services/*"],
      "@hooks/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/hooks/*"],
      "@components/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/components/*"],
      "@utils/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/utils/*"],
      "@context/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/context/*"],
      "@stores/*": ["src/components/V19.9_refacto-wip-xstate/xstate-v5/stores/*"],
      "@legacy/*": ["src/components/V19.9_refacto-wip-xstate/legacy/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

### **vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@xstate-v5': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5'),
      '@actors': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/actors'),
      '@services': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/services'),
      '@hooks': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/hooks'),
      '@components': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/components'),
      '@utils': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/utils'),
      '@context': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/context'),
      '@stores': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/stores'),
      '@legacy': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/legacy')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'es2020',
    sourcemap: true
  }
});
```

---

### **vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/V19.9_refacto-wip-xstate/xstate-v5/**/*.{ts,tsx}'],
      exclude: [
        'src/components/V19.9_refacto-wip-xstate/xstate-v5/**/*.test.{ts,tsx}',
        'src/components/V19.9_refacto-wip-xstate/xstate-v5/**/*.types.ts'
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  },
  resolve: {
    alias: {
      '@xstate-v5': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5'),
      '@actors': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/actors'),
      '@services': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/services'),
      '@hooks': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/hooks'),
      '@components': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/components'),
      '@utils': path.resolve(__dirname, './src/components/V19.9_refacto-wip-xstate/xstate-v5/utils')
    }
  }
});
```

---

### **.eslintrc.cjs**

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  settings: {
    react: { version: '18.3' }
  }
};
```

---

### **.prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

---

### **playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

---

## ✅ CHECKLIST INSTALLATION

### **Étape 1 : Installation dépendances**

```bash
# Core dependencies
npm install xstate@^5.18.0 @xstate/react@^4.1.0
npm install react@^18.3.0 react-dom@^18.3.0
npm install three@^0.168.0
npm install zustand@^4.5.0

# Dev dependencies
npm install --save-dev typescript@^5.5.0
npm install --save-dev @types/react@^18.3.0 @types/react-dom@^18.3.0 @types/three@^0.168.0
npm install --save-dev vite@^5.4.0 @vitejs/plugin-react@^4.3.0
npm install --save-dev vitest@^2.1.0
npm install --save-dev @testing-library/react@^16.0.0
npm install --save-dev @playwright/test@^1.47.0
npm install --save-dev eslint@^9.11.0 prettier@^3.3.0
npm install --save-dev @typescript-eslint/parser@^8.6.0
npm install --save-dev @typescript-eslint/eslint-plugin@^8.6.0
npm install --save-dev eslint-plugin-react@^7.36.0
npm install --save-dev eslint-plugin-react-hooks@^4.6.0

# Playwright browsers
npx playwright install
```

### **Étape 2 : Créer fichiers config**

- [ ] `tsconfig.json`
- [ ] `vite.config.ts`
- [ ] `vitest.config.ts`
- [ ] `.eslintrc.cjs`
- [ ] `.prettierrc`
- [ ] `playwright.config.ts`

### **Étape 3 : Vérifier installation**

```bash
# Vérifier versions
npm list xstate
npm list @xstate/react
npm list react
npm list three

# Tester build
npm run type-check
npm run lint
npm run build
```

### **Validation**

- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur ESLint
- [ ] Build réussit
- [ ] `npm run dev` démarre serveur

---

**Prochaine** : G03 Files Order Checklist

