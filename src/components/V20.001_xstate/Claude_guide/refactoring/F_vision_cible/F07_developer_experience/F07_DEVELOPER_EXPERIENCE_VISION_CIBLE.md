# 👨‍💻 F07 - DEVELOPER EXPERIENCE - VISION CIBLE

**Date** : 2 octobre 2025
**Phase** : F - Vision Cible
**Session** : F07 - Expérience Développeur
**Statut** : ✅ COMPLET

---

## 📋 VUE D'ENSEMBLE

La **Developer Experience (DX)** définit l'ensemble des outils, pratiques et workflows qui rendent le développement **rapide**, **agréable** et **productif** pour les développeurs travaillant sur Overmind XState v5.

---

## 🚀 QUICK START

### **Setup en 3 commandes**

```bash
# 1. Clone + install
git clone https://github.com/overmind/overmind-xstate.git
cd overmind-xstate
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:3000
```

**Temps total** : < 2 minutes ✅

---

## 🛠️ DEVELOPER TOOLS

### **1. Stately Inspector (XState DevTools)**

**Installation** :
```typescript
// src/main.tsx
import { inspect } from '@stately/inspect';

if (import.meta.env.DEV) {
  inspect({
    iframe: false, // false = open in browser, true = embed iframe
    url: 'https://stately.ai/viz?inspect'
  });
}
```

**Features** :
- 🔍 Visualisation temps réel des state machines
- 📊 Historique événements (time-travel debugging)
- 🎯 Snapshot états actors
- 🔄 Replay événements

**Usage** :
```
1. Start app : npm run dev
2. Open Stately Inspector : https://stately.ai/viz?inspect
3. Connect to app (auto-detect)
4. Visualiser machines en temps réel
```

---

### **2. React DevTools**

**Installation** :
- Chrome Extension : [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)

**Features** :
- 🔍 Inspect component tree
- 📊 Profiler (performance)
- 🎯 Highlight re-renders
- 🔄 Props/State inspection

**Custom hooks debugging** :
```typescript
// useDebugValue pour afficher dans React DevTools
export function useBloomColorPicker(input: UseBloomColorPickerInput) {
  const actorRef = useActorRef(bloomColorPickerMachine, { input });
  const color = useSelector(actorRef, (state) => state.context.selectedColor);

  // ✅ Visible dans React DevTools
  useDebugValue(`Color: #${color.toString(16)}`);

  return { color, /* ... */ };
}
```

---

### **3. Three.js Inspector**

**Installation** :
```bash
npm install --save-dev three-inspect
```

**Usage** :
```typescript
import { Inspector } from 'three-inspect';

if (import.meta.env.DEV) {
  const inspector = new Inspector(scene, renderer);
  inspector.enable();
}
```

**Features** :
- 🔍 Scene hierarchy tree
- 📊 Object properties (position, rotation, scale)
- 🎯 Material/Geometry inspector
- 🔄 Real-time updates

---

### **4. Performance Monitor**

**Installation** :
```bash
npm install --save-dev stats.js
```

**Usage** :
```typescript
import Stats from 'stats.js';

if (import.meta.env.DEV) {
  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb
  document.body.appendChild(stats.dom);

  function animate() {
    stats.begin();
    // render code
    stats.end();
    requestAnimationFrame(animate);
  }
}
```

---

## 📝 CODE GENERATION

### **1. Plop.js Templates**

**Installation** :
```bash
npm install --save-dev plop
```

**Configuration (plopfile.js)** :
```javascript
module.exports = function (plop) {
  // Generate XState machine
  plop.setGenerator('machine', {
    description: 'Create new XState machine',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Machine name (e.g., "bloomColorPicker")?'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/actors/{{camelCase name}}/{{camelCase name}}Machine.ts',
        templateFile: 'plop-templates/machine.hbs'
      },
      {
        type: 'add',
        path: 'src/actors/{{camelCase name}}/{{camelCase name}}Machine.test.ts',
        templateFile: 'plop-templates/machine.test.hbs'
      }
    ]
  });

  // Generate React hook
  plop.setGenerator('hook', {
    description: 'Create new React hook',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Hook name (e.g., "useBloomColorPicker")?'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/hooks/{{camelCase name}}.ts',
        templateFile: 'plop-templates/hook.hbs'
      },
      {
        type: 'add',
        path: 'src/hooks/{{camelCase name}}.test.ts',
        templateFile: 'plop-templates/hook.test.hbs'
      }
    ]
  });

  // Generate Component
  plop.setGenerator('component', {
    description: 'Create new React component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g., "BloomColorPicker")?'
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.tsx',
        templateFile: 'plop-templates/component.hbs'
      },
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.test.tsx',
        templateFile: 'plop-templates/component.test.hbs'
      }
    ]
  });
};
```

**Templates (plop-templates/machine.hbs)** :
```handlebars
import { setup, assign, fromPromise } from 'xstate';

interface {{pascalCase name}}Context {
  // TODO: Define context
}

type {{pascalCase name}}Events =
  | { type: 'INIT' }
  | { type: 'TODO_EVENT' };

export const {{camelCase name}}Machine = setup({
  types: {} as {
    context: {{pascalCase name}}Context;
    events: {{pascalCase name}}Events;
  },
  actions: {
    // TODO: Define actions
  },
  guards: {
    // TODO: Define guards
  }
}).createMachine({
  id: '{{camelCase name}}',
  initial: 'idle',
  context: {
    // TODO: Initialize context
  },
  states: {
    idle: {
      on: {
        INIT: { target: 'active' }
      }
    },
    active: {
      // TODO: Define states
    }
  }
});
```

**Usage** :
```bash
# Generate new machine
npm run plop machine
# → Enter name: "particleSystem"
# → Files created:
#   - src/actors/particleSystem/particleSystemMachine.ts
#   - src/actors/particleSystem/particleSystemMachine.test.ts

# Generate new hook
npm run plop hook
# → Enter name: "useParticleSystem"

# Generate new component
npm run plop component
# → Enter name: "ParticleControl"
```

---

### **2. VS Code Snippets**

**Configuration (.vscode/overmind.code-snippets)** :
```json
{
  "XState Machine": {
    "prefix": "xsmachine",
    "body": [
      "export const ${1:machine}Machine = setup({",
      "  types: {} as {",
      "    context: ${1:Machine}Context;",
      "    events: ${1:Machine}Events;",
      "  }",
      "}).createMachine({",
      "  id: '${1:machine}',",
      "  initial: 'idle',",
      "  context: {},",
      "  states: {",
      "    idle: {",
      "      $0",
      "    }",
      "  }",
      "});"
    ],
    "description": "Create XState v5 machine"
  },
  "React Hook with XState": {
    "prefix": "usexstate",
    "body": [
      "export function use${1:Feature}() {",
      "  const actorRef = useActorRef(${1:feature}Machine);",
      "  const ${2:value} = useSelector(actorRef, (state) => state.context.${2:value});",
      "",
      "  const handle${3:Action} = useCallback(() => {",
      "    actorRef.send({ type: '${4:EVENT}' });",
      "  }, [actorRef]);",
      "",
      "  return {",
      "    ${2:value},",
      "    handle${3:Action}",
      "  };",
      "}"
    ],
    "description": "Create React hook with XState integration"
  },
  "fromPromise Service": {
    "prefix": "xsservice",
    "body": [
      "export const ${1:serviceName} = fromPromise<${2:Output}, ${3:Input}>(",
      "  async ({ input }) => {",
      "    $0",
      "    return result;",
      "  }",
      ");"
    ],
    "description": "Create XState fromPromise service"
  }
}
```

**Usage dans VS Code** :
```typescript
// Taper "xsmachine" + Tab
// → Génère template machine complète

// Taper "usexstate" + Tab
// → Génère template hook avec XState

// Taper "xsservice" + Tab
// → Génère template service fromPromise
```

---

## 🔥 HOT RELOAD

### **Vite HMR (Hot Module Replacement)**

**Configuration (vite.config.ts)** :
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Fast Refresh pour React
      fastRefresh: true
    })
  ],
  server: {
    port: 3000,
    open: true, // Auto-open browser
    hmr: {
      overlay: true // Show errors overlay
    }
  }
});
```

**Features** :
- ⚡ Hot reload React components (< 100ms)
- 🔄 Preserve state entre reloads
- 🎯 Error overlay

**XState HMR** :
```typescript
// src/actors/bloomColorPicker/bloomColorPickerMachine.ts
export const bloomColorPickerMachine = setup({ /* ... */ });

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Reload machine sans perdre state
    console.log('Machine reloaded:', newModule);
  });
}
```

---

## 📊 STORYBOOK

### **Installation** :
```bash
npx storybook@latest init
```

**Configuration (.storybook/main.ts)** :
```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};

export default config;
```

**Story Example (BloomColorPicker.stories.tsx)** :
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { BloomColorPicker } from './BloomColorPicker';

const meta: Meta<typeof BloomColorPicker> = {
  title: 'Features/BloomColorPicker',
  component: BloomColorPicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof BloomColorPicker>;

export const Default: Story = {
  args: {
    securityManager: mockSecurityManager,
    initialColor: 0xffffff
  }
};

export const RedColor: Story = {
  args: {
    securityManager: mockSecurityManager,
    initialColor: 0xff0000
  }
};

export const WithCallback: Story = {
  args: {
    securityManager: mockSecurityManager,
    onApplyColor: (color) => {
      console.log('Color applied:', color);
    }
  }
};
```

**Run Storybook** :
```bash
npm run storybook
# → Open http://localhost:6006
```

---

## 🐛 DEBUGGING

### **1. VS Code Debug Configuration**

**Configuration (.vscode/launch.json)** :
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug App in Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///./src/*": "${webRoot}/*"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:debug"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

**Usage** :
```
1. Set breakpoint dans VS Code
2. Press F5 (Start Debugging)
3. Chrome opens avec debugger attaché
4. Breakpoint hit → Step through code
```

---

### **2. Console Debugging**

**XState Logger** :
```typescript
import { createActor } from 'xstate';

const actor = createActor(bloomColorPickerMachine, {
  inspect: (inspectionEvent) => {
    if (inspectionEvent.type === '@xstate.event') {
      console.log('Event:', inspectionEvent.event);
    }
    if (inspectionEvent.type === '@xstate.snapshot') {
      console.log('State:', inspectionEvent.snapshot.value);
      console.log('Context:', inspectionEvent.snapshot.context);
    }
  }
});
```

**React DevTools Profiler** :
```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
}

<Profiler id="BloomColorPicker" onRender={onRenderCallback}>
  <BloomColorPicker />
</Profiler>
```

---

## 📦 NPM SCRIPTS

**package.json** :
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",

    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:debug": "vitest --inspect-brk --inspect --single-thread",

    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",

    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",

    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\"",

    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",

    "plop": "plop",
    "analyze": "vite-bundle-visualizer"
  }
}
```

**Usage** :
```bash
# Development
npm run dev              # Start dev server
npm run test:ui          # Test with UI
npm run storybook        # Component playground

# Code quality
npm run lint:fix         # Auto-fix lint errors
npm run format           # Format code
npm run type-check       # Check TypeScript

# Testing
npm run test:coverage    # Run tests with coverage
npm run test:e2e:ui      # E2E tests with UI

# Production
npm run build            # Build for production
npm run preview          # Preview production build
npm run analyze          # Analyze bundle size
```

---

## 🎨 VS CODE EXTENSIONS

**Recommended extensions (.vscode/extensions.json)** :
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "statelyai.stately-vscode",
    "ms-playwright.playwright",
    "vitest.explorer",
    "usernamehw.errorlens",
    "christian-kohler.npm-intellisense",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

**Extensions utiles** :
- **Stately VSCode** : Visualiser machines XState dans VS Code
- **Error Lens** : Inline error messages
- **Vitest Explorer** : Run tests from sidebar
- **Playwright** : E2E test runner

---

## 📚 LEARNING RESOURCES

### **Documentation interne**

```
docs/
├── getting-started.md
├── architecture/
│   ├── actors.md
│   ├── services.md
│   └── hooks.md
├── guides/
│   ├── adding-new-feature.md
│   ├── testing.md
│   └── debugging.md
├── api/
│   ├── machines.md
│   ├── hooks.md
│   └── components.md
└── examples/
    ├── bloom-color-picker.md
    ├── animation-control.md
    └── debug-panel.md
```

### **Interactive Tutorials**

```typescript
// src/tutorials/interactive-tutorial.tsx
export function InteractiveTutorial() {
  return (
    <TutorialProvider>
      <Step id="1" title="Create XState Machine">
        <CodeEditor initialCode={machineTemplate} />
        <TaskList tasks={['Define context', 'Add states', 'Add events']} />
      </Step>

      <Step id="2" title="Create React Hook">
        <CodeEditor initialCode={hookTemplate} />
        <TaskList tasks={['Use useActorRef', 'Use useSelector', 'Return API']} />
      </Step>

      <Step id="3" title="Create Component">
        <CodeEditor initialCode={componentTemplate} />
        <Preview />
      </Step>
    </TutorialProvider>
  );
}
```

### **Video Walkthroughs**

```
videos/
├── 01-setup-development-environment.mp4
├── 02-create-xstate-machine.mp4
├── 03-integrate-with-react.mp4
├── 04-testing-strategies.mp4
└── 05-debugging-tips.mp4
```

---

## ⚡ PERFORMANCE DX

### **Fast Feedback Loop**

```
Code change → Save
  ↓ < 100ms (Vite HMR)
Browser refresh
  ↓ < 50ms (Fast Refresh)
See changes
  ↓ Immediate
Continue coding
```

### **Fast Tests**

```bash
# Watch mode (run tests on save)
npm run test
# → Tests run in < 500ms

# UI mode (visual feedback)
npm run test:ui
# → See results in browser
```

### **Fast Linting**

```bash
# ESLint with cache
npm run lint
# → First run: ~2s
# → Cached runs: ~200ms
```

---

## ✅ CHECKLIST DEVELOPER EXPERIENCE

- [ ] Quick start < 2 minutes
- [ ] Stately Inspector integration
- [ ] React DevTools ready
- [ ] Three.js Inspector (dev mode)
- [ ] Stats.js performance monitor
- [ ] Plop.js code generation (machine, hook, component)
- [ ] VS Code snippets
- [ ] Vite HMR < 100ms
- [ ] Storybook setup
- [ ] VS Code debug config
- [ ] NPM scripts bien organisés
- [ ] VS Code extensions recommandées
- [ ] Documentation complète
- [ ] Interactive tutorials
- [ ] Video walkthroughs
- [ ] Fast feedback loop (< 100ms)
- [ ] Fast tests (< 500ms)

---

**Prochaine** : F08 Testing Architecture

