import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { query, creators } = await req.json()

    const creatorsText = creators
      .map((c: { id: string; name: string; category: string; tags: string[]; bio: string }) =>
        `- ${c.name} (${c.category}): ${c.bio || ''} | tags: ${c.tags?.join(', ') || ''}`
      )
      .join('\n')

    const suggestion = await callClaude({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Eres un asistente para un marketplace de creadoras UGC colombianas.
El usuario está buscando: "${query}"

Creadoras disponibles:
${creatorsText}

Responde con una sola sugerencia corta (máximo 2 oraciones) en español que ayude al usuario a refinar su búsqueda o entienda qué tipo de creadora encontrará. Sé específico y útil. No hagas listas.`,
        },
      ],
    })

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('AI search error:', error)
    return NextResponse.json({ suggestion: '' }, { status: 200 })
  }
}
