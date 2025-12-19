# Design Editor - Documentazione Completa

## 1. VISIONE

Creare un editor visuale che funziona come Figma ma genera codice React + Tailwind reale. L'utente non deve scrivere codice - modifica visualmente e l'AI scrive il codice per lui.

**Ispirazioni:**
- **Framer** - Editor visuale che genera siti
- **Bolt.new** - AI che genera app complete da prompt
- **Cursor** - IDE con AI integrata
- **Plasmic** - Visual builder per React

**La nostra differenza:** Combiniamo editing visuale (tipo Figma) + AI code generation (tipo Bolt) in un unico tool.

---

## 2. ARCHITETTURA

```
┌─────────────────────────────────────────────────────────────────┐
│                        DESIGN EDITOR                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   SIDEBAR    │  │    CANVAS    │  │    RIGHT PANEL       │  │
│  │              │  │              │  │                      │  │
│  │ - Frames     │  │  [Preview]   │  │ - StylePanel (CSS)   │  │
│  │ - Layers     │  │  [iframe]    │  │ - PropsPanel         │  │
│  │ - Chat AI    │  │              │  │ - Code Output        │  │
│  │              │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     BOTTOM TOOLBAR                               │
│  [Desktop] [Tablet] [Phone] | [Select] [Hand] [Rectangle] [Text]│
└─────────────────────────────────────────────────────────────────┘
```

### Come funziona il Preview

Il preview NON è un semplice iframe statico. Usa **WebContainers** - una tecnologia che esegue Node.js direttamente nel browser.

```
┌─────────────────────────────────────────────────────────────────┐
│                      WebContainer                                │
│                                                                  │
│   1. Monta file system virtuale (package.json, src/, etc.)      │
│   2. Esegue `npm install`                                       │
│   3. Esegue `npm run dev` (Vite)                                │
│   4. Serve l'app su una porta virtuale                          │
│   5. L'iframe punta a quella porta                              │
│                                                                  │
│   Quando l'AI genera nuovo codice:                              │
│   - Il file viene scritto nel filesystem virtuale               │
│   - Vite rileva il cambio (HMR)                                 │
│   - Il preview si aggiorna automaticamente                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. FLUSSO DATI

### Direzione 1: Prompt → AI → Code → Preview

```
User scrive: "Crea un hero con titolo e bottone"
         ↓
AI (Claude) riceve il prompt + system prompt
         ↓
AI risponde con:
    <boltArtifact id="hero" title="Hero Component">
      <boltAction type="file" filePath="src/components/Hero.tsx">
        export function Hero() {
          return (
            <section className="min-h-screen bg-violet-600">
              <h1 className="text-5xl">Titolo</h1>
              <button className="px-6 py-3 bg-white">Click</button>
            </section>
          )
        }
      </boltAction>
    </boltArtifact>
         ↓
artifactParser.ts estrae i file dalla risposta
         ↓
WebContainer scrive src/components/Hero.tsx
         ↓
Vite HMR → Preview si aggiorna
```

### Direzione 2: Visual Edit → AI → Code → Preview (DA IMPLEMENTARE)

```
User clicca sul bottone nel preview
         ↓
postMessage invia info elemento al parent:
    { type: 'objects:selected', id: 'button-1', props: {...}, styles: {...} }
         ↓
StylePanel mostra i controlli per quell'elemento
         ↓
User cambia padding da 12px a 24px
         ↓
User clicca "Apply to Code"
         ↓
DesignToCodeEngine.queueChange({
  type: 'style',
  elementId: 'button-1',
  property: 'padding',
  oldValue: '12px',
  newValue: '24px'
})
         ↓
Dopo debounce (500ms), buildPrompt() crea:
    "Nel componente Hero, cambia il padding del bottone da p-3 a p-6"
         ↓
AI riceve prompt + file corrente
         ↓
AI risponde con file aggiornato in <boltArtifact>
         ↓
WebContainer scrive il file
         ↓
Preview si aggiorna
```

---

## 4. STRUTTURA FILE

```
design-editor/
├── src/
│   ├── DesignEditor.tsx          # Componente principale dell'editor
│   ├── components/
│   │   ├── AIChatPanel.tsx       # Chat con AI (streaming SSE)
│   │   ├── StylePanel/
│   │   │   └── StylePanel.tsx    # Controlli CSS (padding, colors, etc.)
│   │   ├── EditablePreview/
│   │   │   ├── PreviewManager.tsx    # Bridge postMessage editor↔iframe
│   │   │   └── PropsPanel.tsx        # Editor props componente
│   │   ├── LayersPanel.tsx       # Gerarchia elementi
│   │   ├── FileExplorer.tsx      # Tree view file progetto
│   │   └── CodePanel.tsx         # Monaco editor per codice
│   │
│   ├── lib/
│   │   ├── artifactParser.ts     # Parsing <boltArtifact> da AI response
│   │   ├── webcontainer.ts       # Setup WebContainers
│   │   ├── design-to-code/
│   │   │   └── DesignToCodeEngine.ts  # Queue + debounce modifiche visuali
│   │   └── prompts/
│   │       └── system-prompt.ts  # System prompt per Claude
│   │
│   └── pages/
│       └── index.tsx             # Homepage con lista progetti
│
├── packages/
│   └── editable-runtime/         # Runtime iniettato nel preview
│       └── src/
│           ├── EditableProvider.tsx  # Context per edit mode
│           ├── Editable.tsx          # Wrapper per elementi selezionabili
│           └── types.ts              # Protocollo messaggi
│
├── worker/                       # Cloudflare Worker per API
│   └── index.ts                  # Proxy AI, GitHub OAuth
│
└── tests/
    ├── editor.spec.ts            # Test UI editor
    └── artifact-parser.spec.ts   # Test parsing AI response
```

---

## 5. COMPONENTI CHIAVE

### artifactParser.ts

Estrae file dalla risposta AI. Supporta 4 formati:

```typescript
// Formato bolt.diy
<boltArtifact id="..." title="...">
  <boltAction type="file" filePath="src/App.tsx">
    // contenuto file
  </boltAction>
</boltArtifact>

// Formato Lovable
<file path="src/App.tsx">
  // contenuto file
</file>

// Formato Cursor
```tsx:src/App.tsx
// contenuto file
```

// Markdown con commento path
```tsx
// filepath: src/App.tsx
// contenuto file
```
```

### DesignToCodeEngine.ts

Accumula modifiche visuali e le invia all'AI in batch:

```typescript
class DesignToCodeEngine {
  private queue: Change[] = []
  private debounceTimer: number | null = null

  queueChange(change: Change) {
    this.queue.push(change)
    this.debounce()
  }

  private debounce() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => this.processQueue(), 500)
  }

  private processQueue() {
    const prompt = this.buildPrompt(this.queue)
    this.sendToAI(prompt)
    this.queue = []
  }

  private buildPrompt(changes: Change[]): string {
    // Genera prompt tipo:
    // "Aggiorna il componente Hero:
    //  - Cambia padding da 12px a 24px
    //  - Cambia colore sfondo da #fff a #000"
  }
}
```

### StylePanel.tsx

Pannello con controlli CSS:

```typescript
// Sezioni:
// - Layout: display, flex-direction, justify, align, gap
// - Size: width, height, min/max
// - Fill: background-color
// - Stroke: border-width, border-color, border-radius
// - Typography: font-family, font-size, font-weight, color
// - Effects: opacity, shadow

// Quando l'utente modifica un valore:
const handleStyleChange = (property: string, value: string) => {
  // 1. Aggiorna preview live (via postMessage)
  previewManager.updateStyle(selectedElement.id, { [property]: value })

  // 2. Salva nella queue per invio ad AI
  designToCodeEngine.queueChange({
    type: 'style',
    elementId: selectedElement.id,
    property,
    value
  })
}

// Bottone "Apply to Code"
const handleApplyToCode = () => {
  designToCodeEngine.processNow() // Forza invio immediato
}
```

### Protocollo postMessage

Comunicazione tra editor e iframe preview:

```typescript
// Editor → Preview
type ParentToIframeMessage =
  | { type: 'objects:enable-edit-mode' }
  | { type: 'objects:disable-edit-mode' }
  | { type: 'objects:select'; id: string | null }
  | { type: 'objects:update-props'; id: string; props: Record<string, unknown> }
  | { type: 'objects:update-style'; id: string; style: CSSProperties }
  | { type: 'objects:highlight'; id: string | null }

// Preview → Editor
type IframeToParentMessage =
  | { type: 'objects:ready'; version: string }
  | { type: 'objects:selected'; id: string; componentName: string; props: {...}; styles: {...} }
  | { type: 'objects:deselected' }
  | { type: 'objects:hover'; id: string | null; rect: DOMRect | null }
  | { type: 'objects:props-changed'; id: string; props: {...} }
```

---

## 6. COSA FUNZIONA GIÀ

1. **UI Editor completa** - Canvas, sidebar, panels tutto funzionante
2. **AI Chat** - Streaming responses da Claude
3. **Artifact parsing** - Estrazione file da risposta AI (testato con Playwright)
4. **WebContainers** - Preview live con hot reload
5. **GitHub OAuth** - Login e caricamento repo
6. **Edit mode** - Click su elementi nel preview, selezione funziona
7. **CSS → Tailwind mapping** - Conversione valori CSS a classi Tailwind

---

## 7. COSA MANCA (PRIORITÀ)

### 🔴 Alta Priorità

**1. Collegare StylePanel → AI → Code**

Il flusso è spezzato. StylePanel esiste, AI esiste, ma non comunicano.

File da modificare:
- `src/components/StylePanel/StylePanel.tsx` - Aggiungere `onApplyToCode()`
- `src/lib/design-to-code/DesignToCodeEngine.ts` - Implementare `processQueue()` che chiama AI
- `src/DesignEditor.tsx` - Collegare i pezzi

**2. Source Mapping (DOM → Codice)**

Quando clicchi un elemento, come sai QUALE riga di codice modificare?

Soluzione proposta: `data-objects-*` attributes

```tsx
// L'AI deve generare codice con questi attributi:
<div data-objects-id="hero-1" data-objects-file="src/App.tsx" data-objects-line="42">

// Oppure: parsing AST per mappare component name → file position
```

### 🟡 Media Priorità

3. **Component registration** - Schema props per ogni componente (tipo Plasmic)
4. **Animation panel** - Controlli per Framer Motion
5. **Template library** - Componenti pronti da drag & drop

### 🟢 Bassa Priorità

6. **Undo/Redo** - History delle modifiche
7. **Export ZIP** - Scaricare il progetto
8. **Collaboration** - Multi-utente real-time

---

## 8. COME TESTARE

```bash
cd /Users/eziopappalardo/Documents/design-editor

# Installa dipendenze
npm install

# Avvia dev server
npm run dev

# L'editor sarà su http://localhost:5173 (o porta successiva se occupata)

# Per i test automatici:
npm install -D @playwright/test
npx playwright install chromium
npx playwright test
```

---

## 9. PROGETTI CORRELATI

### ALF Portfolio (`/Documents/alf/artist-portfolio`)

CMS completo per portfolio artista. 30+ pagine backoffice:
- CollectionManagement, MediaStorage, OrdersManagement
- Cloudflare Workers + D1 + R2
- Pattern utile: CRUD List → Detail → Form

### Artemis Portfolio (`/Documents/artemis-portfolio/src/DesignEditor.tsx`)

Prototipo semplice della funzionalità `/back`:
- Slider che modificano useState
- Preview live che si aggiorna
- Output CSS/Tailwind copiabile
- **Manca:** connessione ad AI

---

## 10. PROSSIMI PASSI CONCRETI

1. **Verificare che StylePanel → AI funzioni manualmente**
   - Aprire editor
   - Selezionare elemento
   - Cambiare stile
   - Verificare che `DesignToCodeEngine.queueChange()` venga chiamato

2. **Implementare `processQueue()` in DesignToCodeEngine**
   - Costruire prompt dalle modifiche in coda
   - Chiamare AI API
   - Parsare risposta con `artifactParser`
   - Scrivere file in WebContainer

3. **Testare il flusso completo**
   - Modifica visuale → AI → nuovo codice → preview aggiornata

4. **Aggiungere source mapping**
   - Decidere approccio (data attributes vs AST parsing)
   - Implementare
   - Testare click → identifica riga codice corretta
