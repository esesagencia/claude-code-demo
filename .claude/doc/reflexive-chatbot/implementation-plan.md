# Plan de Implementación - Chatbot Reflexivo SomosSur

**Proyecto**: Chatbot Reflexivo (chat.somossur.es)
**Repositorio**: claude-code-demo (adaptado para modo reflexivo)
**Timeline**: 2-3 semanas
**Fecha inicio**: 2025-12-10

---

## 🎯 Objetivo

Adaptar el repositorio actual para soportar un **modo reflexivo** donde el chatbot:
- No da respuestas directas, solo preguntas socráticas
- Cuenta mensajes y muestra mensaje de cierre después de N intercambios
- Tiene personalidad y estilo visual de SomosSur

---

## 📋 Fases del Proyecto

### FASE 1: Preparación y Decisiones (Completada ✅)

**Duración**: 1 día

**Tareas completadas**:
- ✅ Análisis del repositorio base
- ✅ Decisiones arquitectónicas documentadas
- ✅ Documentación completa creada:
  - `design.md` - Arquitectura y decisiones
  - `prompt-master.md` - Personalidad socrática
  - `closing-message.md` - Mensaje de cierre
  - `ui-guidelines.md` - Guía visual SomosSur
  - `implementation-plan.md` - Este documento

**Pendiente**:
- ⏳ Fran debe decidir:
  - Número exacto de intercambios (recomendado: 10)
  - Versión del mensaje de cierre a usar
  - ¿El bot tiene nombre o no?

---

### FASE 2: Backend - Domain Layer (3-4 días)

**Objetivo**: Adaptar entidades del dominio para soportar modo reflexivo

#### 2.1 Adaptar Entity: Conversation

**Archivo**: `src/domain/entities/Conversation.ts`

**Cambios necesarios**:

```typescript
export class Conversation {
  // ... propiedades existentes

  // NUEVAS PROPIEDADES
  private messageCount: number = 0
  private maxMessagesBeforeEnd: number = 10
  private mode: 'standard' | 'reflexive' = 'reflexive'
  private hasEnded: boolean = false

  // NUEVOS MÉTODOS
  public incrementMessageCount(): void {
    this.messageCount++
  }

  public getMessageCount(): number {
    return this.messageCount
  }

  public hasReachedLimit(): boolean {
    return this.messageCount >= this.maxMessagesBeforeEnd
  }

  public shouldShowEndMessage(): boolean {
    return this.messageCount === this.maxMessagesBeforeEnd
  }

  public end(): void {
    if (this.hasReachedLimit()) {
      this.hasEnded = true
      this.status = ConversationStatus.COMPLETED
    }
  }

  public canContinue(): boolean {
    return !this.hasEnded && !this.hasReachedLimit()
  }

  // Actualizar addMessage para contar mensajes del usuario
  public addMessage(message: Message): void {
    // ... validaciones existentes

    if (message.getRole().equals(MessageRole.USER)) {
      this.incrementMessageCount()
    }

    this.messages.push(message)
    // ... resto de lógica
  }
}
```

**Testing**:
```typescript
// src/domain/entities/__tests__/Conversation.test.ts
describe('Conversation - Reflexive Mode', () => {
  it('should count user messages', () => {
    // Test que incrementa contador
  })

  it('should detect when limit is reached', () => {
    // Test que detecta límite
  })

  it('should end conversation at limit', () => {
    // Test que termina conversación
  })

  it('should block new messages after end', () => {
    // Test que bloquea mensajes nuevos
  })
})
```

**Tiempo estimado**: 2 días (desarrollo + testing)

---

#### 2.2 Crear Value Object: ConversationMode

**Archivo**: `src/domain/value-objects/ConversationMode.ts`

```typescript
// ABOUTME: Value object que representa el modo de operación del chatbot
// ABOUTME: Puede ser 'standard' (con tools) o 'reflexive' (solo preguntas)

export class ConversationMode {
  private static readonly VALID_MODES = ['standard', 'reflexive'] as const
  private readonly value: typeof ConversationMode.VALID_MODES[number]

  private constructor(value: string) {
    if (!ConversationMode.VALID_MODES.includes(value as any)) {
      throw new Error(`Invalid conversation mode: ${value}`)
    }
    this.value = value as typeof ConversationMode.VALID_MODES[number]
  }

  public static standard(): ConversationMode {
    return new ConversationMode('standard')
  }

  public static reflexive(): ConversationMode {
    return new ConversationMode('reflexive')
  }

  public isReflexive(): boolean {
    return this.value === 'reflexive'
  }

  public isStandard(): boolean {
    return this.value === 'standard'
  }

  public toString(): string {
    return this.value
  }
}
```

**Testing**:
```typescript
// src/domain/value-objects/__tests__/ConversationMode.test.ts
describe('ConversationMode', () => {
  it('should create standard mode', () => {})
  it('should create reflexive mode', () => {})
  it('should identify reflexive mode correctly', () => {})
})
```

**Tiempo estimado**: 1 día

---

### FASE 3: Backend - Application Layer (4-5 días)

#### 3.1 Crear ReflexivePromptService

**Archivo**: `src/infrastructure/adapters/ai/ReflexivePromptService.ts`

```typescript
// ABOUTME: Servicio que gestiona los prompts para el modo reflexivo
// ABOUTME: Genera personalidad socrática y mensajes de cierre

export class ReflexivePromptService {
  private readonly systemPrompt: string
  private readonly closingMessage: string

  constructor() {
    this.systemPrompt = this.buildSystemPrompt()
    this.closingMessage = this.buildClosingMessage()
  }

  private buildSystemPrompt(): string {
    return `
Eres un asistente conversacional reflexivo. Tu objetivo NO es dar respuestas o soluciones, sino generar reflexión mediante preguntas.

REGLAS FUNDAMENTALES:
1. NUNCA des soluciones directas, pasos a seguir, ni consejos específicos
2. SIEMPRE responde con preguntas que hagan pensar
3. Cuestiona las premisas implícitas en cada consulta
4. Sugiere perspectivas alternativas sin resolver el problema
5. Usa un tono cercano y natural, como un amigo curioso
6. Respuestas cortas: máximo 2-4 preguntas por mensaje
7. Evita sonar como terapeuta o coach motivacional

ESTILO DE PREGUNTAS:
Varía tu forma de preguntar. Evita repetir patrones. Usa:
- "¿Y si...?" (alternativas)
- "¿Por qué das por hecho que...?" (premisas)
- "¿Qué pasaría si...?" (consecuencias)
- "¿De dónde viene esa idea de que...?" (origen)
- "¿Realmente es X el problema, o es Y?" (reencuadre)
- "¿Qué harías si...?" (autonomía)

EVITA:
- Frases hechas: "¿Has pensado en...?", "Tal vez deberías..."
- Preguntas retóricas obvias
- Múltiples preguntas que parezcan un interrogatorio
- Sonar como Siri o Alexa

CONTEXTO:
Estás en chat.somossur.es, un experimento sobre el automatismo de consultar IAs sin reflexionar. Tu misión es devolver al usuario su capacidad de pensar por sí mismo.
    `.trim()
  }

  private buildClosingMessage(): string {
    return `
La respuesta que buscas no está aquí.
Nunca estuvo.

Esta conversación ha sido un espejo.

Has visto cómo, automáticamente, delegas tu criterio
en una máquina esperando que te diga qué hacer.

Pero tú sabes más de tu situación que cualquier IA.

La diferencia es que aquí solo haces preguntas.
La respuesta siempre fue tuya.

¿Qué harías si este chat no existiera?

Ahí está tu respuesta.
    `.trim()
  }

  public getSystemPrompt(): string {
    return this.systemPrompt
  }

  public getClosingMessage(): string {
    return this.closingMessage
  }

  public getConversationContext(messageCount: number, maxMessages: number): string {
    if (messageCount === maxMessages) {
      return `Esta es tu última oportunidad para reflexionar. Después de este mensaje, mostrarás el mensaje de cierre.`
    }

    if (messageCount >= maxMessages - 2) {
      return `Estás cerca del final de esta conversación. Haz que las preguntas cuenten.`
    }

    return `Continúa con preguntas reflexivas que hagan pensar al usuario.`
  }
}
```

**Testing**:
```typescript
// src/infrastructure/adapters/ai/__tests__/ReflexivePromptService.test.ts
describe('ReflexivePromptService', () => {
  it('should provide system prompt', () => {})
  it('should provide closing message', () => {})
  it('should adapt context based on message count', () => {})
})
```

**Tiempo estimado**: 2 días

---

#### 3.2 Adaptar StreamChatCompletionUseCase

**Archivo**: `src/application/use-cases/StreamChatCompletionUseCase.ts`

**Cambios necesarios**:

```typescript
export class StreamChatCompletionUseCase {
  constructor(
    // ... dependencias existentes
    private reflexivePromptService: ReflexivePromptService  // NUEVO
  ) {}

  async execute(conversationId: string): Promise<StreamingResponse> {
    const conversation = await this.repository.findById(conversationId)

    // NUEVA LÓGICA: Verificar si debe terminar
    if (conversation.shouldShowEndMessage()) {
      // Devolver mensaje de cierre en lugar de llamar a OpenAI
      return this.createEndMessage()
    }

    if (!conversation.canContinue()) {
      throw new ConversationError('Conversation has ended')
    }

    // NUEVA LÓGICA: Usar prompt reflexivo si está en modo reflexivo
    const systemPrompt = conversation.getMode().isReflexive()
      ? this.reflexivePromptService.getSystemPrompt()
      : this.getStandardSystemPrompt()

    const context = this.reflexivePromptService.getConversationContext(
      conversation.getMessageCount(),
      conversation.getMaxMessagesBeforeEnd()
    )

    // ... resto de lógica de streaming
  }

  private createEndMessage(): StreamingResponse {
    const message = this.reflexivePromptService.getClosingMessage()
    // Crear respuesta de streaming con el mensaje de cierre
    // ...
  }
}
```

**Tiempo estimado**: 2 días

---

### FASE 4: Frontend - UI Adaptation (4-5 días)

#### 4.1 Crear EndModal Component

**Archivo**: `app/features/conversation/components/end-modal.tsx`

```typescript
// ABOUTME: Modal que muestra el mensaje de cierre cuando la conversación termina
// ABOUTME: Bloquea nuevas interacciones y ofrece opción de nueva conversación

'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface EndModalProps {
  isOpen: boolean
  message: string
  onNewConversation: () => void
}

export function EndModal({ isOpen, message, onNewConversation }: EndModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-sur-black/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="end-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl px-6 text-center"
          >
            <p
              id="end-modal-title"
              className="whitespace-pre-line font-serif text-2xl leading-relaxed text-sur-grey-1 md:text-3xl"
            >
              {message}
            </p>

            <button
              onClick={onNewConversation}
              className="mt-12 rounded-lg bg-sur-blue px-8 py-4 font-medium text-white transition-all hover:bg-sur-blue-hover hover:shadow-lg active:scale-95"
              aria-label="Comenzar nueva reflexión"
            >
              Comenzar nueva reflexión
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Testing**:
```typescript
// __tests__/components/EndModal.test.tsx
describe('EndModal', () => {
  it('should render when open', () => {})
  it('should not render when closed', () => {})
  it('should call onNewConversation when button clicked', () => {})
  it('should not allow closing with Escape (intentional)', () => {})
})
```

**Tiempo estimado**: 1 día

---

#### 4.2 Adaptar useConversation Hook

**Archivo**: `app/features/conversation/hooks/useConversation.tsx`

**Cambios necesarios**:

```typescript
export function useConversation(options) {
  // ... código existente

  // NUEVO ESTADO
  const [showEndModal, setShowEndModal] = useState(false)
  const [endMessage, setEndMessage] = useState('')

  // NUEVA LÓGICA: Detectar mensaje de cierre
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant' && lastMessage.content.includes('La respuesta que buscas no está aquí')) {
      setEndMessage(lastMessage.content)
      setShowEndModal(true)
    }
  }, [messages])

  // NUEVA FUNCIÓN: Iniciar nueva conversación
  const handleNewConversation = () => {
    setShowEndModal(false)
    startNewConversation()
  }

  return {
    // ... estados existentes
    showEndModal,
    endMessage,
    handleNewConversation,
  }
}
```

**Tiempo estimado**: 1 día

---

#### 4.3 Actualizar Colores y Estilos (SomosSur)

**Archivos a modificar**:
- `tailwind.config.js`
- `app/globals.css`
- Componentes de UI

**Cambios en Tailwind**:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'sur-black': '#101820',
        'sur-blue': '#1e3fff',
        'sur-blue-hover': '#1a35e0',
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

**Tiempo estimado**: 2 días

---

### FASE 5: Testing y Ajustes (3-4 días)

#### 5.1 Testing de Dominio

```bash
# Ejecutar tests de domain
yarn test src/domain

# Verificar cobertura
yarn test:coverage
```

**Checklist**:
- [ ] Conversation cuenta mensajes correctamente
- [ ] Conversation detecta límite correctamente
- [ ] Conversation bloquea mensajes después del límite
- [ ] ConversationMode funciona correctamente

**Tiempo estimado**: 1 día

---

#### 5.2 Testing de Aplicación

```bash
# Tests de use cases
yarn test src/application
```

**Checklist**:
- [ ] StreamChatCompletionUseCase muestra mensaje de cierre en momento correcto
- [ ] ReflexivePromptService genera prompts correctos
- [ ] Flujo completo funciona end-to-end

**Tiempo estimado**: 1 día

---

#### 5.3 Testing Manual (Conversaciones Reales)

**Protocolo**:
1. Cada miembro del equipo tiene 5 conversaciones
2. Diferentes tipos de preguntas:
   - Laborales
   - Existenciales
   - Prácticas
   - Frustrantes
3. Evaluar:
   - ¿El bot NUNCA da soluciones?
   - ¿Las preguntas generan reflexión?
   - ¿El tono es cercano?
   - ¿El mensaje de cierre impacta?

**Tiempo estimado**: 2 días

---

### FASE 6: Despliegue (2-3 días)

#### 6.1 Configuración DNS

**Tarea**: Conectar chat.somossur.es con Vercel

**Pasos**:
1. Acceder al panel de dominio somossur.es
2. Crear registro CNAME:
   - Nombre: `chat`
   - Valor: `cname.vercel-dns.com`
3. Verificar en Vercel
4. Esperar propagación (2-48h)

**Responsable**: IT/Técnico

**Tiempo estimado**: 30 minutos (+ espera DNS)

---

#### 6.2 Variables de Entorno

```bash
# .env.production
OPENAI_API_KEY=sk-...
CHATBOT_MODE=reflexive
MAX_MESSAGES_BEFORE_END=10
NEXT_PUBLIC_APP_URL=https://chat.somossur.es
```

**Tiempo estimado**: 15 minutos

---

#### 6.3 Deploy a Vercel

```bash
# Conectar con Vercel
vercel

# Deploy de producción
vercel --prod
```

**Checklist pre-deploy**:
- [ ] Tests pasan
- [ ] Build funciona localmente
- [ ] Variables de entorno configuradas
- [ ] DNS propagado

**Tiempo estimado**: 1 hora

---

#### 6.4 Monitorización Post-Launch

**Primeras 48h**:
- Verificar logs de errores
- Monitorizar costes de OpenAI
- Recoger feedback inicial
- Ajustes rápidos si necesario

**Tiempo estimado**: Continuo (2 días)

---

## 📊 Timeline Consolidado

| Fase | Duración | Responsable |
|------|----------|-------------|
| 1. Preparación | 1 día ✅ | Claude + Fran |
| 2. Backend - Domain | 3-4 días | Desarrollador Backend |
| 3. Backend - Application | 4-5 días | Desarrollador Backend |
| 4. Frontend | 4-5 días | Desarrollador Frontend |
| 5. Testing | 3-4 días | QA + Equipo |
| 6. Despliegue | 2-3 días | DevOps/Técnico |
| **TOTAL** | **17-22 días** | **~3 semanas** |

---

## 💰 Presupuesto

| Concepto | Tipo | Coste |
|----------|------|-------|
| Vercel Hosting | Mensual | €0 (plan gratuito) |
| OpenAI API | Mensual | €10-30 (según tráfico) |
| Dominio chat.somossur.es | N/A | €0 (subdominio) |
| Desarrollo | Único | (Interno) |
| **TOTAL OPERATIVO** | Mensual | **€10-30/mes** |

---

## ✅ Checklist de Entregables

### Código
- [ ] Domain entities adaptados y testeados
- [ ] ReflexivePromptService creado
- [ ] Use cases adaptados
- [ ] EndModal component
- [ ] UI con colores SomosSur
- [ ] Tests pasando (>90% cobertura)

### Documentación
- [x] design.md
- [x] prompt-master.md
- [x] closing-message.md
- [x] ui-guidelines.md
- [x] implementation-plan.md
- [ ] README actualizado

### Despliegue
- [ ] DNS configurado
- [ ] Deploy a Vercel
- [ ] Variables de entorno configuradas
- [ ] Monitorización activa

---

## 🚨 Riesgos y Mitigación

### Riesgo 1: El bot da respuestas por error
**Probabilidad**: Media
**Impacto**: Alto
**Mitigación**:
- Testing exhaustivo del prompt
- Iterar rápidamente si se detecta
- Tener versiones alternativas del prompt listas

### Riesgo 2: Usuarios frustrados abandonan
**Probabilidad**: Media
**Impacto**: Medio
**Mitigación**:
- Mensaje inicial claro sobre el propósito
- Tono cercano, no pedante
- Mensaje de cierre impactante que justifique la experiencia

### Riesgo 3: Costes de OpenAI se disparan
**Probabilidad**: Baja
**Impacto**: Medio
**Mitigación**:
- Rate limiting (max 10 conversaciones por IP/hora)
- Monitorización de costes
- Alerta si supera €50/mes

### Riesgo 4: Problemas de DNS
**Probabilidad**: Baja
**Impacto**: Bajo
**Mitigación**:
- Hacer configuración con tiempo (no el día del launch)
- Tener plan B (usar vercel.app temporalmente)

---

## 📞 Próximos Pasos Inmediatos

### Para Fran (HOY):
1. **Decidir**:
   - [ ] Número de intercambios antes del cierre (recomiendo 10)
   - [ ] Versión del mensaje de cierre (ver `closing-message.md`)
   - [ ] ¿El bot tiene nombre? (recomiendo: sin nombre)

2. **Revisar documentación**:
   - [ ] `design.md`
   - [ ] `prompt-master.md`
   - [ ] `closing-message.md`
   - [ ] `ui-guidelines.md`

3. **Aprobar y dar luz verde para empezar desarrollo**

### Para el Equipo (Semana 1):
1. Asignar responsables de cada fase
2. Configurar entorno de desarrollo
3. Crear branch `feature/reflexive-mode`
4. Comenzar con adaptaciones de domain layer

---

## 📚 Recursos y Referencias

- **Documentación completa**: `.claude/doc/reflexive-chatbot/`
- **Brandbook SomosSur**: (pendiente enlace)
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 🔄 Changelog

### v1.0 (2025-12-10)
- ✅ Plan completo de implementación
- ✅ Timeline de 3 semanas
- ✅ Presupuesto estimado
- ✅ Checklist de tareas
- ⏳ Pendiente: Inicio de desarrollo

---

**Estado**: 🟢 Listo para comenzar
**Próximo hito**: Decisiones de Fran + Inicio de desarrollo
**Responsable**: Equipo SomosSur + Claude
