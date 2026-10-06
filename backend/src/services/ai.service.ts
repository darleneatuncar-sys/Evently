import { env } from '../config/env'
import type { RecommendationInput } from '../validators/ai.validator'

export interface RecommendationResult {
  recommendation: string
  source: 'ai' | 'fallback'
}

const CATEGORY_SUGGESTIONS: Record<string, string> = {
  tecnología:
    'Lleva tu laptop o tablet, un cuaderno para notas y ropa cómoda casual. No olvides el cargador y una botella de agua.',
  música:
    'Usa ropa cómoda y calzado cerrado, considera una chaqueta ligera y, si eres sensible al volumen, tapones para los oídos.',
  deportes:
    'Lleva ropa deportiva, calzado adecuado para la actividad, una toalla y suficiente agua para mantenerte hidratado.',
  educación:
    'Lleva material para tomar apuntes, tu laptop si la necesitas y ropa cómoda. Una botella de agua siempre viene bien.',
  negocios:
    'Opta por vestimenta formal o business casual, lleva tarjetas de presentación y una libreta para tomar notas.',
  cultura:
    'Elige ropa cómoda y elegante, lleva una chaqueta ligera y calzado apropiado para caminar o estar de pie.',
}

function buildFallbackRecommendation(input: RecommendationInput): string {
  const key = input.category?.toLowerCase() ?? ''
  const base =
    CATEGORY_SUGGESTIONS[key] ??
    'Opta por ropa cómoda y adecuada al tipo de evento, lleva una chaqueta ligera y una botella de agua. Si vas a tomar notas, no olvides un cuaderno.'

  const place = input.location ? ` en ${input.location}` : ''
  return `${base} Para "${input.title}"${place}, te sugerimos confirmar el código de vestimenta con el organizador.`
}

function buildPrompt(input: RecommendationInput): string {
  return [
    `Evento: ${input.title}`,
    input.category ? `Categoría: ${input.category}` : null,
    input.location ? `Ubicación: ${input.location}` : null,
    input.description ? `Descripción: ${input.description}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export async function getEventRecommendation(
  input: RecommendationInput,
): Promise<RecommendationResult> {
  if (!env.AI_API_KEY) {
    return { recommendation: buildFallbackRecommendation(input), source: 'fallback' }
  }

  try {
    const response = await fetch(`${env.AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        temperature: 0.7,
        max_tokens: 220,
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente que recomienda de forma breve (máximo 3 frases) qué llevar o cómo vestir para un evento, según su categoría, ubicación y descripción. Responde en español.',
          },
          {
            role: 'user',
            content: buildPrompt(input),
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`La API de IA respondió con estado ${response.status}`)
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const recommendation = data.choices?.[0]?.message?.content?.trim()

    if (!recommendation) {
      throw new Error('La API de IA devolvió una respuesta vacía')
    }

    return { recommendation, source: 'ai' }
  } catch (error) {
    console.error('AI service error:', error)
    return { recommendation: buildFallbackRecommendation(input), source: 'fallback' }
  }
}
