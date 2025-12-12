# Mensaje de Cierre - Chatbot Reflexivo SomosSur

**Propósito**: Mensaje final que aparece después de N intercambios, devolviendo al usuario la responsabilidad de su propia reflexión.

---

## 🎯 Objetivo del Mensaje

El mensaje de cierre debe:

1. **Generar impacto emocional** - Que el usuario se detenga a pensar
2. **Hacer explícito el experimento** - Revelar el propósito del chatbot
3. **Devolver la responsabilidad** - Clarificar que la respuesta siempre estuvo en él
4. **Invitar a la acción autónoma** - ¿Qué harías sin este chat?
5. **Ser memorable** - Que quede en la mente del usuario

---

## 📝 Versión 1.0 (Propuesta)

```
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
```

---

## 📝 Versión 1.1 (Alternativa Corta)

```
Has estado buscando respuestas en el lugar equivocado.

Yo solo te he devuelto preguntas.
Tú tienes las respuestas.

Siempre las tuviste.

¿Qué harías si yo no existiera?

Haz eso.
```

---

## 📝 Versión 1.2 (Alternativa Con Contexto SomosSur)

```
Este experimento es sobre ti, no sobre mí.

En SomosSur creemos que la IA debería hacerte
pensar, no pensar por ti.

Has pasado los últimos minutos esperando que
una máquina resolviera algo que solo tú puedes resolver.

Pero ahora sabes algo: la pregunta correcta
no es "¿qué hago?", sino "¿por qué doy por hecho
que alguien más tiene la respuesta?"

Tu criterio vale más que cualquier prompt.

¿Qué harías si este chat no existiera?

Esa es tu respuesta.
```

---

## 📝 Versión 1.3 (Alternativa Provocadora)

```
¿Qué esperabas encontrar aquí?

¿Una lista de 5 pasos?
¿Un plan infalible?
¿La solución a tu vida?

Spoiler: No existe.

Lo que existe es tu capacidad de pensar.
Y la has estado ignorando cada vez que
le preguntas a una IA qué hacer.

Esto no es un chatbot útil.
Es un espejo.

¿Qué ves en él?

Ahora, sal de aquí y usa tu criterio.
Es mejor que el de cualquier modelo de lenguaje.
```

---

## 🎨 Diseño Visual del Mensaje

### Propuesta de UI

**Layout**:
- Modal full-screen (overlay oscuro al 90%)
- Texto centrado vertical y horizontalmente
- Fondo: Sur Black (#101820) con gradiente sutil
- Animación de entrada: Fade + Slide from bottom

**Tipografía**:
```css
font-family: 'Instrument Serif', serif;
font-size: 1.5rem (mobile) / 2rem (desktop);
line-height: 1.6;
color: #F5F5F5 (Sur Grey 1);
text-align: center;
max-width: 600px;
```

**Enfatización**:
- Frases clave en negrita o italic
- Ejemplo: "**La respuesta siempre fue tuya.**"

**Botón**:
```
Label: "Comenzar nueva reflexión"
Position: Centrado debajo del texto (margin-top: 3rem)
Style: Sur Blue (#1e3fff) con hover effect
```

**Timing**:
- Fade in: 0.5s
- Permanece: Sin timeout (usuario decide cuándo cerrar)

---

## 🧪 Testing del Mensaje

### Checklist de Evaluación

Cuando pruebes el mensaje de cierre, verifica:

- [ ] **Impacto**: ¿Te hace pausar y pensar?
- [ ] **Claridad**: ¿Entiendes el propósito del experimento?
- [ ] **Tono**: ¿Es provocador sin ser agresivo?
- [ ] **Longitud**: ¿Es suficientemente corto para leer completo?
- [ ] **Coherencia**: ¿Refleja la filosofía de SomosSur?
- [ ] **Legibilidad**: ¿Es fácil de leer en móvil y desktop?

### Testing con Usuarios

**Pregunta clave después de ver el mensaje**:
> "¿Cómo te sentiste al leer esto?"

**Respuestas esperadas** (buenas):
- "Me hizo pensar"
- "Es incómodo pero tiene razón"
- "No me lo esperaba"
- "Me siento desafiado"

**Respuestas que indican ajuste necesario**:
- "No entendí nada"
- "Me siento frustrado" (sin reflexión)
- "¿Y ahora qué hago?" (confusión)

---

## 🔄 Variaciones por Contexto (Opcional)

Si quieres personalizar el mensaje según el tipo de conversación:

### Conversaciones Laborales

```
Llevas N mensajes preguntándome sobre trabajo.

Pero, ¿realmente necesitas que una IA te diga
cómo conseguir trabajo?

Tú conoces tus habilidades.
Tú sabes lo que quieres.
Tú sabes qué te detiene.

¿Qué harías si yo no existiera?

Haz eso.
```

### Conversaciones Existenciales

```
Has estado buscando tu propósito en un chatbot.

Irónico, ¿no?

El propósito no se encuentra, se construye.
Y no lo construye una máquina.

¿Qué harías si yo no existiera?

Esa es tu primera pista.
```

**Nota**: Personalizar por contexto requiere:
- Análisis de contenido de mensajes
- Lógica adicional en el backend
- Testing más complejo

**Recomendación**: Empezar con mensaje único (v1.0), iterar después.

---

## 📊 Métricas de Éxito

### Indicadores de que el mensaje funciona:

1. **Usuarios comparten capturas en RRSS**
   - Significa que el mensaje es memorable

2. **Usuarios vuelven a iniciar otra conversación**
   - Significa que el concepto les intrigó

3. **Feedback cualitativo positivo**
   - "Me hizo pensar", "No me lo esperaba"

4. **Baja tasa de rebote inmediato**
   - Usuario no abandona el sitio inmediatamente después

### Indicadores de que necesita ajuste:

1. **Alta tasa de abandono sin nueva conversación**
   - El mensaje no generó suficiente interés

2. **Feedback negativo predominante**
   - "No entendí", "Pérdida de tiempo"

3. **Usuarios intentan continuar conversación**
   - El mensaje no fue suficientemente claro sobre el fin

---

## 🎬 Secuencia Completa (Usuario POV)

1. Usuario llega a chat.somossur.es
2. Empieza a preguntar (esperando respuestas)
3. Bot solo devuelve preguntas (incomodidad inicial)
4. Usuario sigue conversando (curiosidad)
5. Después de N mensajes: **[APARECE MENSAJE DE CIERRE]**
6. Usuario lee, reflexiona, cierra modal
7. Opciones:
   - **Comenzar nueva reflexión** (nuevo chat)
   - **Salir del sitio** (reflexión completada)
   - **Compartir experiencia** (RRSS)

---

## ✏️ Decisión Requerida

**Fran y equipo, necesitamos decidir**:

1. **¿Qué versión del mensaje usamos?**
   - v1.0 (completa)
   - v1.1 (corta)
   - v1.2 (con mención a SomosSur)
   - v1.3 (provocadora)
   - Híbrido / Personalizada

2. **¿Cuántos intercambios antes del mensaje?**
   - Recomendación: 7-10
   - Decisión: _______

3. **¿Permitimos reiniciar conversación desde el modal?**
   - Sí (botón "Nueva reflexión")
   - No (solo cerrar + volver manualmente)

4. **¿Añadimos CTA de SomosSur?**
   - Ejemplo: "Conoce más sobre SomosSur" (link al final)
   - Decisión: _______

---

## 🔐 Implementación Técnica

### Componente: `EndModal.tsx`

```typescript
interface EndModalProps {
  isOpen: boolean
  message: string
  onNewConversation: () => void
  onClose?: () => void
}

export function EndModal({
  isOpen,
  message,
  onNewConversation,
  onClose
}: EndModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-sur-black/90"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl px-6 text-center"
          >
            <p className="font-serif text-2xl leading-relaxed text-sur-grey-1">
              {message}
            </p>
            <button
              onClick={onNewConversation}
              className="mt-12 rounded-lg bg-sur-blue px-8 py-3 text-white hover:bg-sur-blue/90"
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

### Service Method

```typescript
// src/infrastructure/adapters/ai/ReflexivePromptService.ts

getClosingMessage(): string {
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
```

---

## 🔄 Changelog

### v1.0 (2025-12-10)
- ✅ Cuatro versiones propuestas del mensaje
- ✅ Propuesta de diseño visual
- ✅ Métricas de éxito definidas
- ⏳ Pendiente: Decisión de versión final

### v1.1 (Próxima)
- ⏳ Versión final aprobada por Fran
- ⏳ Testing con equipo
- ⏳ Ajustes según feedback

---

**Responsable**: Fran + Equipo Contenido SomosSur
**Estado**: 🟡 Esperando decisión
**Próximo paso**: Revisar versiones y elegir la definitiva
