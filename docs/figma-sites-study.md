# Studio Completo: Figma Sites

## 1. Overview Architetturale

Figma Sites trasforma i design Figma in siti web funzionali senza codice. A differenza di Framer/Webflow che partono da zero, Sites parte dai design esistenti in Figma.

### Flusso di Lavoro
```
Design in Figma → Configura Site → Aggiungi Interazioni → Pubblica
```

### Differenza Chiave
- **Figma Sites**: Design-first, converte frame esistenti in pagine
- **Framer**: Editor dedicato web-first con code components
- **Webflow**: CMS-first con designer visuale complesso

---

## 2. Sistema di Pagine

### Struttura
- Ogni **frame di primo livello** diventa una potenziale pagina
- Nome frame = URL path (`/about`, `/contact`)
- Pagine possono essere:
  - **Statiche**: contenuto fisso
  - **CMS Template**: genera pagine dinamiche da collection

### Gerarchia URL
```
/ (Home)
├── /about
├── /blog
│   ├── /blog/[slug]  ← CMS Template
├── /products
│   ├── /products/[slug]  ← CMS Template
```

---

## 3. CMS Collections (Sistema Dati)

### Struttura Collection
```typescript
interface CMSCollection {
  name: string;           // "Blog Posts"
  slug: string;           // "blog-posts"
  fields: CMSField[];     // Schema dei campi
  items: CMSItem[];       // Contenuti
}

interface CMSField {
  name: string;
  type: 'text' | 'richText' | 'image' | 'link' | 'number' | 'boolean' | 'date' | 'reference';
  required: boolean;
}
```

### Tipi di Campo
| Tipo | Uso |
|------|-----|
| **Text** | Titoli, nomi |
| **Rich Text** | Contenuto formattato |
| **Image** | Media con alt text |
| **Link** | URL esterni/interni |
| **Number** | Prezzi, quantità |
| **Boolean** | Flags (featured, published) |
| **Date** | Pubblicazione, eventi |
| **Reference** | Relazioni tra collections |

### Binding Dati
```
Text Layer → Bind to → collection.title
Image → Bind to → collection.featuredImage
Link → Bind to → collection.externalUrl
```

### CMS List vs CMS Page
- **CMS List**: Mostra N elementi (griglia blog, lista prodotti)
- **CMS Page**: Template per singolo item (`/blog/[slug]`)

---

## 4. Blocks Library

### Categorie Disponibili

#### Pages (Template Completi)
- Landing Page
- About Page
- Contact Page
- Blog Index
- Product Listing
- Portfolio

#### Navigation
- Navbar Desktop (con dropdown)
- Navbar Mobile (hamburger menu)
- Footer (multi-colonna)
- Sidebar Navigation

#### Heroes
- Hero con immagine background
- Hero split (testo + media)
- Hero video
- Hero con form
- Hero animato

#### Features
- Feature Grid (2x2, 3x3)
- Feature Cards
- Feature con icone
- Comparison Table
- Stats/Metrics

#### CMS Blocks
- Blog Card Grid
- Blog List
- Product Grid
- Team Members
- Testimonials Carousel

#### Embeds
- Video (YouTube, Vimeo)
- Maps (Google Maps)
- Forms (Typeform, Tally)
- Social Feeds
- Custom Code (HTML/CSS/JS)

---

## 5. Sistema Responsive

### Breakpoints Predefiniti
```typescript
const FIGMA_BREAKPOINTS = [
  { id: 'desktop', name: 'Desktop', width: 1440, min: 1280 },
  { id: 'tablet', name: 'Tablet', width: 768, min: 768, max: 1279 },
  { id: 'mobile', name: 'Mobile', width: 375, max: 767 },
];
```

### Multi-Breakpoint View
Figma Sites mostra **tutti i breakpoint simultaneamente** affiancati:
```
┌─────────────────┐ ┌──────────┐ ┌─────┐
│     Desktop     │ │  Tablet  │ │ Mob │
│     1440px      │ │  768px   │ │375px│
└─────────────────┘ └──────────┘ └─────┘
```

### Primary vs Secondary Breakpoints
- **Primary**: Desktop (base styles)
- **Secondary**: Override solo proprietà che cambiano

### Cascata Stili
```
Desktop (base) → Tablet (override) → Mobile (override)
```

Se tablet non ha override, eredita da desktop.

---

## 6. Interazioni & Animazioni

### Trigger Disponibili

| Trigger | Descrizione |
|---------|-------------|
| **On Click** | Al click dell'utente |
| **On Hover** | Al passaggio mouse |
| **While Hovering** | Durante hover |
| **On Scroll** | Quando elemento entra in viewport |
| **While Scrolling** | Durante scroll (parallax) |
| **On Page Load** | Caricamento pagina |

### Azioni

#### Reveal (Entrata Elementi)
```typescript
interface RevealAnimation {
  type: 'fade' | 'slide' | 'scale' | 'blur';
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;      // px
  duration: number;       // ms
  delay?: number;         // ms
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  stagger?: number;       // delay tra elementi figli
}
```

#### Scroll Transform
```typescript
interface ScrollTransform {
  property: 'translateY' | 'translateX' | 'rotate' | 'scale' | 'opacity';
  startValue: number;
  endValue: number;
  scrollStart: 'top' | 'center' | 'bottom';  // quando inizia
  scrollEnd: 'top' | 'center' | 'bottom';    // quando finisce
}
```

#### Hover States
- Cambio colore background
- Cambio colore testo
- Scala (zoom in/out)
- Ombra
- Border
- Transform

#### Cursor Effects
- Custom cursor image
- Cursor follower (element che segue mouse)
- Magnetic buttons

#### Altri
- **Draggable**: Elementi trascinabili
- **Lightbox**: Galleria immagini popup
- **Marquee**: Testo/elementi che scorrono
- **Accordion**: Espandi/comprimi sezioni
- **Tabs**: Contenuto a schede

---

## 7. HTML Semantico & Accessibilità

### Tag Semantici
Figma Sites permette di assegnare tag HTML semantici:

```html
<!-- Invece di tutto <div> -->
<nav>...</nav>
<header>...</header>
<main>
  <section>...</section>
  <article>...</article>
  <aside>...</aside>
</main>
<footer>...</footer>
```

### Impostazioni Accessibilità
- **Alt text** per immagini
- **ARIA labels** per elementi interattivi
- **Tab index** per navigazione tastiera
- **Heading hierarchy** (h1 → h2 → h3)
- **Skip links** per screen reader
- **Focus states** visibili

### Lighthouse Score
Figma Sites ottimizza automaticamente per:
- Performance (lazy loading, image optimization)
- Accessibility (semantic HTML, ARIA)
- Best Practices (HTTPS, no mixed content)
- SEO (meta tags, sitemap)

---

## 8. Publishing & Hosting

### Domini
- **Gratuito**: `nome.figma.site`
- **Custom**: `www.tuodominio.com` (piano a pagamento)

### DNS Setup
```
Type: CNAME
Name: www
Value: sites.figma.com
```

### SSL
Certificato HTTPS automatico e gratuito.

### SEO Settings
- Meta title
- Meta description
- Open Graph image
- Favicon
- Robots.txt
- Sitemap.xml automatico

### Analytics
- Integrazione Google Analytics
- Integrazione Plausible
- Custom scripts (head/body)

---

## 9. Pricing

| Piano | Prezzo | Caratteristiche |
|-------|--------|-----------------|
| **Free** | $0 | 1 sito, dominio .figma.site, 1000 visits/mese |
| **Basic** | $6/mese | Custom domain, 10K visits, form submissions |
| **Pro** | $15/mese | CMS, 100K visits, password protection |
| **Enterprise** | Custom | SSO, SLA, supporto dedicato |

### Confronto Prezzi

| | Figma Sites | Framer | Webflow |
|---|---|---|---|
| **Free** | ✓ | ✓ | ✓ |
| **Basic** | $6/mo | $5/mo | $14/mo |
| **CMS** | $15/mo | $15/mo | $23/mo |
| **Custom Code** | Pro | Free | CMS |

---

## 10. Gap Analysis: Objects vs Figma Sites

### Funzionalità Mancanti in Objects

| Feature | Figma Sites | Objects | Priorità |
|---------|-------------|---------|----------|
| Multi-breakpoint view | ✅ | ❌ | Alta |
| CMS Collections | ✅ | ❌ | Alta |
| HTML semantic tags | ✅ | ❌ | Media |
| Reveal animations | ✅ | ❌ | Alta |
| Scroll transform | ✅ | ❌ | Media |
| Hover states builder | ✅ | Parziale | Media |
| Blocks library | ✅ | ❌ | Alta |
| Custom domains | ✅ | ❌ | Media |
| SEO settings | ✅ | ❌ | Media |
| Cursor effects | ✅ | ❌ | Bassa |
| Lightbox | ✅ | ❌ | Bassa |
| Marquee | ✅ | ❌ | Bassa |
| Design tokens | ✅ | ❌ | Media |

### Funzionalità Presenti in Objects

| Feature | Status |
|---------|--------|
| Canvas editor | ✅ |
| Element inspector | ✅ |
| Responsive breakpoints | ✅ (singolo) |
| Layers panel | ✅ |
| Properties panel | ✅ |
| AI Image generation | ✅ |
| AI 3D generation | ✅ |
| Image effects | ✅ |
| Preview mode | ✅ |

---

## 11. Roadmap Implementazione Consigliata

### Fase 1: Core Features
1. **Multi-breakpoint view** - Vista simultanea dei breakpoint
2. **Blocks library** - Template pre-costruiti
3. **Design Tokens** - Variabili colori/typography

### Fase 2: Interazioni
4. **Hover states builder** - UI per stati hover
5. **Reveal animations** - Animazioni entrata
6. **Scroll-triggered animations** - Animazioni su scroll

### Fase 3: CMS
7. **Collections schema** - Definizione campi
8. **Collection items** - CRUD contenuti
9. **Data binding** - Collegamento elementi-dati
10. **CMS Pages** - Template dinamici

### Fase 4: Publishing
11. **HTML semantic tags** - Selezione tag per elemento
12. **SEO settings** - Meta, OG, favicon
13. **Export HTML/CSS** - Codice pulito
14. **Hosting integration** - Vercel/Netlify
