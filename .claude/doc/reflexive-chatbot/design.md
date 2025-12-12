# Chatbot Reflexivo SomosSur - Decisiones de Diseño

**Proyecto**: Chatbot Reflexivo (chat.somossur.es)
**Fecha**: 2025-12-10
**Propósito**: Combatir el automatismo de consultar IAs mediante preguntas socráticas

---

## 🎯 Concepto Central

### El Problema
La IA está llevando a todos hacia el "centro de la campana de Gauss" - donde desaparece lo único, lo raro, lo diferente. Los usuarios consultan ChatGPT, obtienen respuestas inmediatas, las aceptan sin cuestionar, y pierden su capacidad de pensamiento crítico.

### La Solución
Un chatbot que hace lo opuesto: **no responde, solo pregunta**. Devuelve la reflexión al usuario mediante el método socrático, obligándole a pensar por sí mismo.

### El Mensaje
"La respuesta no está en este chat. Está en ti."

---

## 🏗️ Arquitectura Técnica

### Base
- **Proyecto original**: `claude-code-demo` (Next.js + Hexagonal Architecture)
- **Proyecto nuevo**: `chatbot-reflexivo-sur` (fork limpio)
- **Cambios principales**: Simplificación (sin tools) + personalidad reflexiva

### Stack Tecnológico

#### Backend
- **Framework**: Next.js 13 (App Router)
- **Arquitectura**: Hexagonal + DDD
- **IA**: OpenAI API (GPT-4o)
- **Database**: MongoDB (con fallback a in-memory)
- **Testing**: Vitest

#### Frontend
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS (colores SomosSur)
- **Components**: shadcn/ui (new-york style)
- **Animations**: Framer Motion
- **Theme**: Dark mode (por defecto)

### Hosting
- **Platform**: Vercel (plan gratuito)
- **Domain**: chat.somossur.es
- **DNS**: CNAME a Vercel

---

## 📐 Decisiones Arquitectónicas

### 1. Modo Reflexivo vs Modo Estándar

**Decisión**: Soportar ambos modos con variable de entorno

```typescript
// .env
CHATBOT_MODE=reflexive  // o "standard"
MAX_MESSAGES_BEFORE_END=10
```

**Razón**: Permite mantener la flexibilidad sin duplicar código.

### 2. Contador de Mensajes

**Decisión**: Añadir al entity `Conversation`

```typescript
class Conversation {
  private messageCount: number = 0
  private maxMessagesBeforeEnd: number = 10

  hasReachedLimit(): boolean {
    return this.messageCount >= this.maxMessagesBeforeEnd
  }

  shouldShowEndMessage(): boolean {
    return this.messageCount === this.maxMessagesBeforeEnd
  }
}
```

**Razón**: El límite de mensajes es una regla de negocio del dominio.

### 3. Simplificación: Sin Tools

**Decisión**: Eliminar completamente:
- `ToolInvocation` entity
- `ExecuteToolUseCase`
- `ToolRegistry`, `WeatherTool`
- Componente `weather.tsx`

**Razón**:
- El chatbot reflexivo NO ejecuta acciones externas
- Solo conversa y reflexiona
- Simplifica el código y la UX

**Archivos eliminados**:
```
- app/utils/tools.ts
- app/features/conversation/components/weather.tsx
- src/infrastructure/adapters/tools/*
- src/application/use-cases/ExecuteToolUseCase.ts
- src/application/ports/outbound/IToolRegistry.ts
- src/application/ports/outbound/IWeatherService.ts
- src/domain/entities/ToolInvocation.ts
- src/domain/value-objects/ToolName.ts
- src/domain/exceptions/ToolExecutionError.ts
```

### 4. Prompt Engineering

**Decisión**: Crear `ReflexivePromptService`

**Ubicación**: `src/infrastructure/adapters/ai/ReflexivePromptService.ts`

**Responsabilidad**:
- Genera el prompt maestro con personalidad socrática
- Proporciona variaciones para evitar repetición
- Define el mensaje de cierre

**Razón**: Separar la lógica del prompt del adapter de OpenAI permite:
- Iterar fácilmente el prompt
- Testear diferentes personalidades
- Mantener el código limpio

### 5. Mensaje de Cierre

**Decisión**: Componente modal bloqueante

**Comportamiento**:
- Se muestra después de N intercambios (configurable)
- Bloquea nuevas interacciones
- No tiene botón "Continuar"
- Solo opción: "Nueva conversación"

**Razón**: Forzar al usuario a reflexionar, no a seguir preguntando.

### 6. UI/UX para SomosSur

**Decisión**: Adaptar colores y tipografía del brandbook

**Paleta de colores**:
```css
--sur-black: #101820
--sur-blue: #1e3fff
--sur-grey-1: #F5F5F5
--sur-grey-2: #E0E0E0
--sur-grey-3: #BDBDBD
--sur-grey-4: #757575
--sur-grey-5: #424242
```

**Tipografías**:
- **Inter**: Regular, Medium, Bold (UI)
- **Instrument Serif**: Acentos, títulos

**Tema**: Dark mode por defecto (coherente con identidad Sur)

---

## 🔄 Flujo de Conversación

### Flujo Estándar

```
1. Usuario envía mensaje
   ↓
2. Backend cuenta mensajes
   ↓
3. ¿Ha alcanzado límite?
   ├─ NO → OpenAI genera pregunta socrática
   └─ SÍ → Muestra mensaje de cierre y bloquea
   ↓
4. Frontend muestra respuesta
   ↓
5. Usuario reflexiona (esperamos...)
```

### Estados del Chat

1. **Active**: Conversación en curso (< N mensajes)
2. **Ending**: Mensaje N (muestra mensaje de cierre)
3. **Ended**: Conversación terminada (bloqueada)

---

## 🎨 Componentes Nuevos

### 1. `EndModal.tsx`

**Propósito**: Mostrar mensaje de cierre final

**Props**:
```typescript
interface EndModalProps {
  message: string
  onNewConversation: () => void
}
```

**Diseño**:
- Modal full-screen con backdrop oscuro
- Texto centrado, grande, impactante
- Botón único: "Comenzar nueva reflexión"
- Animación de entrada (fade + scale)

### 2. `ReflexiveChat.tsx` (opcional)

**Propósito**: Versión específica del chat reflexivo

**Diferencias con `Chat.tsx`**:
- Oculta contador de mensajes al usuario
- Estilos específicos SomosSur
- Manejo del modal de cierre

---

## 🧪 Testing

### Cobertura Objetivo
- Domain Layer: 95% (mantenemos estándar)
- Application Layer: 85%
- Infrastructure: 70%
- Frontend: 60%

### Tests Críticos Nuevos

1. **Conversation.hasReachedLimit()**
   - Verifica que detecta límite correctamente

2. **ReflexivePromptService**
   - Verifica que genera preguntas, no respuestas
   - Valida variaciones

3. **EndModal**
   - Verifica que se muestra en el momento correcto
   - Verifica que bloquea interacciones

4. **Flujo completo E2E**
   - Usuario envía N mensajes
   - Aparece modal de cierre
   - No puede enviar más mensajes

---

## 📊 Métricas

### Métricas de Negocio
- Número de conversaciones iniciadas
- Promedio de mensajes por conversación
- Porcentaje que llega al mensaje de cierre
- Tiempo de reflexión (tiempo entre mensajes)

### Métricas Técnicas
- Latencia de respuesta de OpenAI
- Coste por conversación
- Errores de API

---

## 💰 Costes Estimados

### Hosting
- **Vercel**: €0/mes (plan gratuito suficiente)

### OpenAI API
- **GPT-4o**: ~$0.01 por conversación (10 mensajes)
- **Estimado mensual**:
  - 100 conversaciones: €2-5
  - 500 conversaciones: €10-15
  - 1000 conversaciones: €20-30

### Total: €10-30/mes (escalable según tráfico)

---

## 🚀 Roadmap de Implementación

### Fase 1: Backend (Semana 1)
- ✅ Limpiar código de tools
- ⏳ Adaptar `Conversation` entity (contador)
- ⏳ Crear `ReflexivePromptService`
- ⏳ Adaptar `StreamChatCompletionUseCase`
- ⏳ Testing domain + application

### Fase 2: Frontend (Semana 2)
- ⏳ Adaptar colores SomosSur
- ⏳ Crear `EndModal` component
- ⏳ Integrar contador en `useConversation`
- ⏳ Testing componentes

### Fase 3: Prompt Engineering (Semana 2-3)
- ⏳ Escribir prompt maestro
- ⏳ Testear conversaciones reales
- ⏳ Iterar según feedback
- ⏳ Redactar mensaje de cierre final

### Fase 4: Deploy (Semana 3)
- ⏳ Configurar DNS (chat.somossur.es)
- ⏳ Deploy a Vercel
- ⏳ Monitorización primeras 48h
- ⏳ Ajustes finales

---

## 📝 Decisiones Pendientes

### Para Fran y Equipo:

1. **Número exacto de intercambios antes del cierre**
   - Recomendación: 7-10
   - Decisión: ___________

2. **¿El bot tiene nombre?**
   - Opciones: "Reflexión", "Espejo", "Sur", sin nombre
   - Decisión: ___________

3. **Mensaje de cierre final (ver closing-message.md)**
   - Requiere revisión y aprobación
   - Decisión: ___________

4. **¿Monitorizamos conversaciones?**
   - Para mejorar prompts (logs anónimos)
   - Consideración legal/ética
   - Decisión: ___________

5. **¿Comunicamos el lanzamiento?**
   - RRSS, newsletter, web principal
   - Decisión: ___________

---

## 🔐 Consideraciones de Seguridad

1. **Rate Limiting**: Máximo 10 conversaciones por IP/hora
2. **Validación de Input**: Sanitizar mensajes antes de enviar a OpenAI
3. **API Keys**: En variables de entorno (nunca en código)
4. **Logs**: No guardar contenido sensible de conversaciones

---

## 📚 Referencias

- **Proyecto original**: `/home/user/claude-code-demo`
- **Brandbook SomosSur**: (enlace pendiente)
- **Vercel Docs**: https://vercel.com/docs
- **OpenAI API**: https://platform.openai.com/docs

---

**Última actualización**: 2025-12-10
**Responsable**: Claude + Fran
**Estado**: 🟡 En desarrollo
