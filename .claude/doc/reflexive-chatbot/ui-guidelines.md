# UI/UX Guidelines - Chatbot Reflexivo SomosSur

**Propósito**: Definir la identidad visual y experiencia de usuario del chatbot reflexivo, coherente con el brandbook de SomosSur.

---

## 🎨 Paleta de Colores

### Colores Principales (del Brandbook)

```css
/* Sur Black - Background principal */
--sur-black: #101820

/* Sur Blue Accent - CTAs y acentos */
--sur-blue: #1e3fff
--sur-blue-hover: #1a35e0

/* Sur Greys - Textos y elementos secundarios */
--sur-grey-1: #F5F5F5  /* Texto principal sobre fondo oscuro */
--sur-grey-2: #E0E0E0  /* Texto secundario */
--sur-grey-3: #BDBDBD  /* Texto terciario */
--sur-grey-4: #757575  /* Bordes, divisores */
--sur-grey-5: #424242  /* Backgrounds secundarios */

/* White/Black auxiliares */
--white: #FFFFFF
--black: #000000
```

### Aplicación en el Chatbot

```css
/* Backgrounds */
body { background: var(--sur-black); }
chat-container { background: var(--sur-black); }
message-user { background: var(--sur-grey-5); }
message-bot { background: transparent; }

/* Textos */
primary-text { color: var(--sur-grey-1); }
secondary-text { color: var(--sur-grey-2); }
muted-text { color: var(--sur-grey-4); }

/* Interactivos */
button-primary { background: var(--sur-blue); }
button-primary:hover { background: var(--sur-blue-hover); }
input-border { border-color: var(--sur-grey-4); }
input-border:focus { border-color: var(--sur-blue); }
```

---

## 🔤 Tipografía

### Fuentes (del Brandbook)

#### Inter (Sans-serif)
**Uso**: Texto corriente, UI, mensajes de chat

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Pesos disponibles */
font-weight: 400;  /* Regular - Texto corriente */
font-weight: 500;  /* Medium - Énfasis suave */
font-weight: 700;  /* Bold - Títulos, CTAs */
```

**Aplicación**:
- Mensajes del chat: Regular (400)
- Input field: Regular (400)
- Botones: Medium (500)
- Títulos pequeños: Bold (700)

#### Instrument Serif (Serif)
**Uso**: Títulos, acentos, mensaje de cierre

```css
font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;

font-weight: 400;  /* Regular - Títulos */
font-style: italic; /* Italic - Énfasis especial */
```

**Aplicación**:
- Mensaje de cierre: Instrument Serif
- Título de landing (si hay): Instrument Serif
- Citas destacadas: Instrument Serif Italic

### Tamaños y Escalas

```css
/* Mensajes de chat */
--text-xs: 0.75rem;   /* 12px - Timestamps */
--text-sm: 0.875rem;  /* 14px - Mensajes móvil */
--text-base: 1rem;    /* 16px - Mensajes desktop */
--text-lg: 1.125rem;  /* 18px - Énfasis */

/* Títulos */
--text-xl: 1.25rem;   /* 20px - Subtítulos */
--text-2xl: 1.5rem;   /* 24px - Títulos móvil */
--text-3xl: 1.875rem; /* 30px - Títulos desktop */

/* Mensaje de cierre */
--text-4xl: 2.25rem;  /* 36px - Mensaje cierre desktop */
```

---

## 📐 Espaciado y Layout

### Grid System

```css
/* Contenedor principal */
max-width: 800px;    /* Chat area */
margin: 0 auto;
padding: 1rem (mobile) / 2rem (desktop);

/* Espaciado entre mensajes */
gap: 1rem (16px);

/* Espaciado interno de mensajes */
padding: 0.75rem 1rem (mobile);
padding: 1rem 1.5rem (desktop);
```

### Bordes y Radios

```css
/* Mensajes */
border-radius: 1rem;  /* 16px - Burbujas redondeadas */

/* Input field */
border-radius: 0.75rem;  /* 12px */

/* Botones */
border-radius: 0.5rem;  /* 8px */

/* Modal de cierre */
border-radius: 0 (full screen) / 1.5rem (si hay bordes);
```

---

## 🎭 Componentes UI

### 1. Chat Container

```typescript
// Diseño
<div className="min-h-screen bg-sur-black text-sur-grey-1">
  <div className="mx-auto max-w-3xl px-4 py-8">
    {/* Messages */}
    {/* Input */}
  </div>
</div>
```

**Características**:
- Full height viewport
- Centrado horizontal
- Scroll vertical suave
- Sin distracciones (header mínimo o ninguno)

### 2. Message Bubble (Usuario)

```typescript
<div className="flex justify-end">
  <div className="max-w-[80%] rounded-2xl bg-sur-grey-5 px-4 py-3">
    <p className="text-sur-grey-1">{message}</p>
  </div>
</div>
```

**Características**:
- Alineado a la derecha
- Background gris oscuro
- Max width 80% (responsive)
- Texto blanco

### 3. Message Bubble (Bot)

```typescript
<div className="flex justify-start">
  <div className="max-w-[85%]">
    <p className="text-sur-grey-1 leading-relaxed">
      {message}
    </p>
  </div>
</div>
```

**Características**:
- Alineado a la izquierda
- Sin background (transparente)
- Max width 85%
- Texto blanco con line-height relajado

**Nota**: El bot NO tiene burbuja de color para sentirse más como un "espejo" que como un personaje.

### 4. Input Field

```typescript
<div className="sticky bottom-0 bg-sur-black/90 backdrop-blur-sm pb-4">
  <div className="flex gap-2">
    <textarea
      className="flex-1 rounded-xl border border-sur-grey-4 bg-sur-grey-5 px-4 py-3 text-sur-grey-1 placeholder-sur-grey-3 focus:border-sur-blue focus:outline-none"
      placeholder="Escribe tu pregunta..."
      rows={1}
    />
    <button className="rounded-lg bg-sur-blue px-6 py-3 text-white hover:bg-sur-blue-hover">
      Enviar
    </button>
  </div>
</div>
```

**Características**:
- Sticky al fondo
- Backdrop blur para elegancia
- Auto-resize (1 línea → multi-línea)
- Focus state con Sur Blue
- Botón de envío siempre visible

### 5. Typing Indicator

```typescript
<div className="flex items-center gap-2 text-sur-grey-3">
  <div className="flex gap-1">
    <span className="h-2 w-2 animate-bounce rounded-full bg-sur-grey-3" style={{ animationDelay: '0ms' }} />
    <span className="h-2 w-2 animate-bounce rounded-full bg-sur-grey-3" style={{ animationDelay: '150ms' }} />
    <span className="h-2 w-2 animate-bounce rounded-full bg-sur-grey-3" style={{ animationDelay: '300ms' }} />
  </div>
  <span className="text-sm">Reflexionando...</span>
</div>
```

**Características**:
- 3 dots animados
- Texto: "Reflexionando..." (no "Escribiendo...")
- Color gris medio

### 6. End Modal

```typescript
<div className="fixed inset-0 z-50 flex items-center justify-center bg-sur-black/95 backdrop-blur-md">
  <div className="max-w-2xl px-6 text-center">
    <p className="font-serif text-2xl leading-relaxed text-sur-grey-1 md:text-3xl">
      {closingMessage}
    </p>
    <button className="mt-12 rounded-lg bg-sur-blue px-8 py-4 font-medium text-white hover:bg-sur-blue-hover">
      Comenzar nueva reflexión
    </button>
  </div>
</div>
```

**Características**:
- Full screen overlay
- Backdrop blur intenso
- Texto grande, serif
- Un solo botón centrado
- No tiene "X" para cerrar (intencional)

---

## 🎬 Animaciones y Transiciones

### Mensajes Nuevos

```css
/* Fade + Slide Up */
@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message {
  animation: messageAppear 0.3s ease-out;
}
```

### Typing Indicator

```css
/* Bounce dots */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.dot {
  animation: bounce 1s infinite;
}
```

### End Modal

```css
/* Fade in con delay */
@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal {
  animation: modalAppear 0.5s ease-out 0.2s both;
}
```

### Botones

```css
/* Hover smooth */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 63, 255, 0.3);
}

button:active {
  transform: translateY(0);
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile first */
/* xs: 0-639px (default) */
/* sm: 640px+ */
@media (min-width: 640px) { ... }

/* md: 768px+ */
@media (min-width: 768px) { ... }

/* lg: 1024px+ */
@media (min-width: 1024px) { ... }
```

### Adaptaciones por Tamaño

#### Mobile (< 640px)
```css
chat-container { padding: 1rem; }
message-bubble { font-size: 0.875rem; }
input-field { font-size: 1rem; }  /* Evita zoom en iOS */
end-modal-text { font-size: 1.5rem; }
```

#### Tablet (640px - 1023px)
```css
chat-container { padding: 1.5rem; }
message-bubble { font-size: 1rem; }
input-field { font-size: 1rem; }
end-modal-text { font-size: 2rem; }
```

#### Desktop (1024px+)
```css
chat-container { padding: 2rem; }
message-bubble { font-size: 1rem; }
input-field { font-size: 1rem; }
end-modal-text { font-size: 2.25rem; }
```

---

## ♿ Accesibilidad

### Contraste de Color

```css
/* WCAG AA compliance */
text-on-black: #F5F5F5 (21:1 ratio) ✅
text-on-grey-5: #F5F5F5 (15:1 ratio) ✅
blue-on-white: #1e3fff (4.7:1 ratio) ✅
```

### Focus States

```css
*:focus-visible {
  outline: 2px solid var(--sur-blue);
  outline-offset: 2px;
}
```

### ARIA Labels

```typescript
<button aria-label="Enviar mensaje">
  <SendIcon />
</button>

<div role="log" aria-live="polite" aria-label="Mensajes del chat">
  {messages}
</div>
```

### Keyboard Navigation

- **Tab**: Navegar entre input y botones
- **Enter**: Enviar mensaje
- **Shift + Enter**: Nueva línea en textarea
- **Escape**: Cerrar modal (si aplicable)

---

## 🎯 Principios de Diseño

### 1. Minimalismo Intencional

**Qué SÍ**:
- Fondo negro puro
- Texto blanco/gris
- Sin distracciones visuales
- Foco en la conversación

**Qué NO**:
- Avatares o iconos innecesarios
- Múltiples colores
- Elementos decorativos
- Animaciones excesivas

### 2. Elegancia Sobria

**Concepto**: Profesional pero no corporativo, elegante pero no pretencioso.

**Aplicación**:
- Tipografía serif para momentos clave
- Animaciones sutiles
- Espaciado generoso
- Bordes redondeados moderados

### 3. Dark Mode por Defecto

**Razón**:
- Coherente con identidad Sur (black + blue)
- Menos distracción visual
- Mejor para reflexión (menos luz agresiva)

**Nota**: No implementar light mode inicialmente (opcional para v2).

### 4. Contenido Primero

**Principio**: El mensaje es lo importante, no la interfaz.

**Aplicación**:
- Sin header/footer
- Sin sidebar con opciones
- Sin timestamps visibles (opcional oculto)
- Sin avatares o nombres

---

## 🖼️ Assets Visuales

### Logo SomosSur

**Ubicación**: Top-left corner (pequeño y discreto)

```typescript
<div className="p-4">
  <img
    src="/logo-sur-white.svg"
    alt="SomosSur"
    className="h-6 opacity-50 hover:opacity-100"
  />
</div>
```

**Características**:
- Versión blanca del logo
- Opacity reducida (50%)
- Hover sube a 100%
- Link a somossur.es

### Iconos

**Librería**: Lucide React (ya integrada)

**Iconos usados**:
```typescript
import { Send, RotateCcw } from 'lucide-react'

// Send icon en botón de enviar
<Send className="h-5 w-5" />

// RotateCcw icon en botón de nueva conversación
<RotateCcw className="h-5 w-5" />
```

---

## 🧪 Testing Visual

### Checklist de Validación

- [ ] **Contraste**: Todos los textos cumplen WCAG AA
- [ ] **Responsive**: Funciona en móvil (320px) hasta desktop (1920px)
- [ ] **Tipografía**: Inter y Instrument Serif cargan correctamente
- [ ] **Colores**: Coinciden con brandbook SomosSur
- [ ] **Animaciones**: Suaves, no causan mareo
- [ ] **Focus states**: Visibles en navegación por teclado
- [ ] **Dark mode**: No hay elementos blancos que "quemen" la vista

---

## 🎨 Inspiración y Referencias

### Referentes de diseño:
- **ChatGPT**: Limpieza, simplicidad
- **Linear.app**: Elegancia oscura
- **Vercel**: Minimalismo profesional
- **Arc Browser**: Dark mode sofisticado

### Lo que tomamos de cada uno:
- ChatGPT: Layout de mensajes
- Linear: Paleta oscura elegante
- Vercel: Tipografía y espaciado
- Arc: Atención al detalle

### Lo que NO copiamos:
- ❌ Sidebars con mil opciones
- ❌ Avatares de usuario
- ❌ Colores brillantes y saturados
- ❌ Efectos visuales excesivos

---

## 📁 Implementación Técnica

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'sur-black': '#101820',
        'sur-blue': '#1e3fff',
        'sur-grey': {
          1: '#F5F5F5',
          2: '#E0E0E0',
          3: '#BDBDBD',
          4: '#757575',
          5: '#424242',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
      },
    },
  },
}
```

### Fuentes (Next.js)

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const inter = Inter({ subsets: ['latin'] })
const instrumentSerif = localFont({
  src: '../assets/fonts/InstrumentSerif-Regular.woff2',
  variable: '--font-serif',
})
```

---

## 🔄 Changelog

### v1.0 (2025-12-10)
- ✅ Paleta de colores definida
- ✅ Tipografía establecida
- ✅ Componentes UI diseñados
- ✅ Responsive breakpoints
- ✅ Principios de diseño documentados
- ⏳ Pendiente: Implementación en componentes

---

**Responsable**: Diseño + Frontend SomosSur
**Estado**: 🟡 Documentado, pendiente implementación
**Próximo paso**: Implementar componentes con estas guías
