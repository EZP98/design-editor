# Design Editor - Task List

## Completati

### Edit Mode Visual
- [x] Edit button con feedback visivo (glow, pulsing dot)
- [x] Banner "Edit Mode - Click elements to select"
- [x] Keyboard shortcuts: 'e' toggle, ESC exit
- [x] SelectionOverlay callbacks collegati (hover, select, style, position, size)
- [x] VisualPropsPanel con Apply with AI

### UI Header
- [x] Pages view mode (icona dopo eye/code)
- [x] Edit + Desktop + Route su stessa riga

---

## Priorità Alta

### 1. Settings Panel (pattern bolt.diy)
- [ ] **ControlPanel component** - Modal con tabs per tutte le integrazioni
- [ ] **Tab configuration store** - nanostores per gestire tabs visibili/ordine
- [ ] **Shared components** - ConnectionForm, ServiceHeader, StatusBadge, ErrorState
- [ ] **Tab registry** - Registrazione dinamica delle integrazioni

### 2. Supabase Integration (Database Viewer)
- [ ] **Store `supabase.ts`** - nanostore con pattern bolt.diy
  ```typescript
  interface SupabaseConnection {
    user: SupabaseUser | null;
    token: string;
    stats?: SupabaseStats;
    selectedProjectId?: string;
    credentials?: { url: string; anonKey: string };
  }
  ```
- [ ] **SupabaseTab.tsx** - UI completa:
  - Projects list con stats (tables, buckets, functions, DB size)
  - Database viewer con tabelle e row counts
  - Actions: View Database, Get API Keys, View Dashboard
  - Analytics: Database Health, Auth & Security
- [ ] **localStorage persistence** - Salvataggio credenziali
- [ ] **Auto-connect via env** - `VITE_SUPABASE_ACCESS_TOKEN`

### 3. Netlify Integration
- [ ] **Store `netlify.ts`** - nanostore pattern
- [ ] **NetlifyTab.tsx** - UI:
  - Sites list con status badges (ready/error/building)
  - Deployment analytics (success rate, recent activity)
  - Site actions: Clear Cache, Trigger Build, Manage Env, Delete
  - Deployment management: Lock/Unlock/Publish
  - Recent builds con status tracking
- [ ] **API integration** - Batch fetching per rate limiting

### 4. Vercel Integration
- [ ] **Store `vercel.ts`** - nanostore pattern
- [ ] **VercelTab.tsx** - UI:
  - Projects con latest deployment info
  - Actions: Redeploy, Dashboard, Deployments, Functions, Analytics, Domains, Logs
  - Environment variable auto-connect
- [ ] **useConnectionTest hook** - Test connessione shared

### 5. Figma Integration (bolt.diy coming soon)
- [ ] **FigmaTab.tsx** - Import designs as code
- [ ] **Figma API OAuth** - Connessione account
- [ ] **Design to React** - Conversione design → componenti

### 6. Stripe Integration
- [ ] **Store `stripe.ts`** - nanostore pattern
- [ ] **StripeTab.tsx** - UI:
  - Account overview
  - Products/Prices management
  - Subscriptions dashboard
  - Payment links
- [ ] **Stripe Connect OAuth** - Per utenti che vogliono monetizzare

---

## Priorità Media

### 7. Agentic Error Correction
- [ ] **Pre-execution validation** - Validare comandi prima dell'esecuzione
- [ ] **Error capture** - Catturare errori da WebContainer/preview
- [ ] **Actionable alerts** - Mostrare errori con "Send to AI for fixing"
- [ ] **Self-correction loop** - Feedback automatico errori all'AI

### 8. Context Management (claude-code)
- [ ] **Project memory file** - CLAUDE.md equivalente
- [ ] **System reminders** - Prompt dinamici basati su stato
- [ ] **TODO scratchpad** - Lista persistente tra sessioni

### 9. Source Mapping
- [ ] Babel plugin per `data-source-file/line`
- [ ] DOM element → source code mapping
- [ ] Click element → apri file alla linea

### 10. Component Tree Panel
- [ ] Vista ad albero dei componenti React
- [ ] Navigazione DOM
- [ ] Sync con SelectionOverlay

### 11. GitHub Integration (migliorata)
- [ ] OAuth completo (non solo token)
- [ ] Push commits da editor
- [ ] Branch management
- [ ] PR creation

### 12. CMS/Backoffice (da Cocktail/ALF)
- [ ] Analizzare implementazione Cocktail
- [ ] Upload immagini a storage
- [ ] CRUD contenuti
- [ ] Media library

---

## Animation Editor (Theatre.js + Motion)

### Stack Raccomandato

| Layer | Tool | Perché |
|-------|------|--------|
| **3D + Timeline** | Theatre.js | Unico con timeline editor visuale per Three.js |
| **UI Animations** | Motion (Framer) | Il migliore per micro-interazioni React |
| **3D Rendering** | React Three Fiber | Standard de facto per 3D in React |

### Installazione

```bash
# 3D + Timeline
npm install @theatre/core @theatre/studio @theatre/r3f

# UI Animations
npm install motion

# 3D Rendering
npm install three @react-three/fiber @react-three/drei
```

### Perché Theatre.js (e NON GSAP)

**Theatre.js ti dà GRATIS:**
- Timeline editor professionale (tipo After Effects)
- Keyframe management con drag & drop
- Graph editor per curve di easing
- Integrazione nativa R3F (`@theatre/r3f`)
- Export animazioni in JSON
- Open source Apache 2.0 (nessuna restrizione!)

**EVITA GSAP dal 2024:**
- Licenza Webflow restrittiva
- Non puoi usarlo in tool che competono con Webflow
- Licenza revocabile a discrezione
- Rischio legale per il prodotto

**Motion + Theatre.js = 100% open source, zero rischi**

### Tasks Animation Editor

- [ ] **Setup Theatre.js + R3F + Motion** (1-2 settimane)
  - Configurare @theatre/core e @theatre/studio
  - Integrare con React Three Fiber
  - Setup Motion per UI animations

- [ ] **Embed Theatre Studio nel Design Editor** (3-4 settimane)
  - Panel timeline integrato
  - Sync con canvas preview
  - Controls per play/pause/scrub

- [ ] **Animation Presets Library** (5-6 settimane)
  - Preset per scroll animations
  - Preset per hover effects
  - Preset per page transitions
  - Preset per 3D transforms

- [ ] **Code Export** (7-8 settimane)
  - JSON → React/Motion code
  - Scroll markers export
  - Keyframe to CSS export

- [ ] **AI Animation Suggestions** (9-10 settimane)
  - Suggerimenti basati su elemento selezionato
  - "Anima questo bottone con hover effect"
  - Auto-generate keyframes da prompt

### Esempio Integrazione Theatre.js

```typescript
import { getProject, types } from '@theatre/core';
import studio from '@theatre/studio';
import { SheetProvider, editable as e } from '@theatre/r3f';

// Inizializza studio in development
if (import.meta.env.DEV) {
  studio.initialize();
}

// Crea progetto animazione
const project = getProject('Design Editor Animations');
const sheet = project.sheet('Main');

// Component con Theatre.js
function AnimatedBox() {
  return (
    <SheetProvider sheet={sheet}>
      <e.mesh theatreKey="box">
        <boxGeometry />
        <meshStandardMaterial color="purple" />
      </e.mesh>
    </SheetProvider>
  );
}

// Export animazione
const animationData = project.exportJSON();
```

### Timeline Stimata

| Settimane | Task |
|-----------|------|
| 1-2 | Setup base Theatre.js + R3F + Motion |
| 3-4 | Embed Theatre Studio nel editor |
| 5-6 | Animation presets library |
| 7-8 | Code export + scroll markers |
| 9-10 | AI integration + polish |

**~10 settimane vs 6+ mesi se costruisci il timeline da zero!**

---

## Priorità Bassa

### 13. Undo/Redo System
- [ ] History stack per operazioni
- [ ] Checkpoint-based recovery
- [ ] Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)

### 14. Drag & Drop
- [ ] Riordinamento elementi
- [ ] Drop da component library

---

## Pattern bolt.diy - Integrations

### Struttura File per ogni Integrazione:

```
app/
├── components/@settings/
│   ├── core/
│   │   ├── ControlPanel.tsx      # Main modal con tabs
│   │   └── constants.tsx         # Tab configuration
│   ├── tabs/
│   │   ├── supabase/
│   │   │   └── SupabaseTab.tsx
│   │   ├── netlify/
│   │   │   └── NetlifyTab.tsx
│   │   ├── vercel/
│   │   │   └── VercelTab.tsx
│   │   └── stripe/
│   │       └── StripeTab.tsx
│   └── shared/
│       └── service-integration/
│           ├── ConnectionForm.tsx
│           ├── ServiceHeader.tsx
│           ├── ConnectionTestIndicator.tsx
│           ├── ErrorState.tsx
│           └── LoadingState.tsx
├── lib/stores/
│   ├── supabase.ts
│   ├── netlify.ts
│   ├── vercel.ts
│   └── stripe.ts
└── types/
    ├── supabase.ts
    ├── netlify.ts
    ├── vercel.ts
    └── stripe.ts
```

### Nanostore Pattern (ogni integrazione):

```typescript
import { atom } from 'nanostores';

// State interface
interface ServiceConnection {
  user: ServiceUser | null;
  token: string;
  stats?: ServiceStats;
}

// Atoms
export const serviceConnection = atom<ServiceConnection>({
  user: null,
  token: '',
});
export const isConnecting = atom<boolean>(false);
export const isFetchingStats = atom<boolean>(false);

// Update with localStorage
export const updateServiceConnection = (updates: Partial<ServiceConnection>) => {
  const current = serviceConnection.get();
  const newState = { ...current, ...updates };
  serviceConnection.set(newState);

  if (typeof window !== 'undefined') {
    localStorage.setItem('service_connection', JSON.stringify(newState));
  }
};

// Auto-connect from env
export async function initializeConnection() {
  const envToken = import.meta.env?.VITE_SERVICE_TOKEN;
  if (envToken && !serviceConnection.get().token) {
    updateServiceConnection({ token: envToken });
    await fetchStats(envToken);
  }
}
```

### Tab Registration (ControlPanel.tsx):

```typescript
const getTabComponent = (tabId: TabType) => {
  switch (tabId) {
    case 'supabase': return <SupabaseTab />;
    case 'netlify': return <NetlifyTab />;
    case 'vercel': return <VercelTab />;
    case 'stripe': return <StripeTab />;
    case 'figma': return <FigmaTab />;
    default: return null;
  }
};
```

### ServiceHeader Component:

```typescript
<ServiceHeader
  icon={ServiceLogo}
  title="Service Integration"
  description="Connect and manage your Service projects"
  onTestConnection={testConnection}
  isTestingConnection={status === 'testing'}
/>
```

---

## Progetti da Analizzare

- **Cocktail** (progetto Ezio): CMS backoffice, database Supabase
- **ALF** (progetto Ezio): Image storage implementation
- **bolt.diy**: Settings panel, integrations architecture
- **claude-code**: Agentic loops, context management
