import { NextRequest, NextResponse } from 'next/server'
import { callAnthropicWithRetry } from '@/lib/anthropic-retry'

interface CreatorInput {
  id: string
  name: string
  category: string
  tags: string[]
  bio: string
  followers: number
  engagement: number
  price: number
}

export async function POST(req: NextRequest) {
  try {
    const { answers, creators } = await req.json()

    const creatorsText = creators
      .map((c: CreatorInput) =>
        `ID: ${c.id} | Nombre: ${c.name} | Categoría: ${c.category} | Seguidores: ${c.followers} | Engagement: ${c.engagement}% | Precio desde: $${c.price} COP | Tags: ${c.tags?.join(', ') || ''} | Bio: ${c.bio || ''}`
      )
      .join('\n')

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ matches: [] }, { status: 500 })

    const response = await callAnthropicWithRetry(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Eres un experto en marketing de influencers y UGC en Colombia. Analiza estas respuestas de un cliente y recomienda las 3 mejores creadoras.

RESPUESTAS DEL CLIENTE:
- Producto/servicio: ${answers.product}
- Objetivo principal: ${answers.goal}
- Presupuesto: ${answers.budget}

CREADORAS DISPONIBLES:
${creatorsText}

Responde ÚNICAMENTE con un JSON válido con este formato exacto (sin markdown, sin explicaciones):
{"matches":[{"creatorId":"<id>","score":<número 60-99>,"reason":"<explicación de 1-2 oraciones en español de por qué es un buen match>"},{"creatorId":"<id>","score":<número>,"reason":"<explicación>"},{"creatorId":"<id>","score":<número>,"reason":"<explicación>"}]}

Ordena de mayor a menor score. El score debe reflejar qué tan bien encaja con el producto, objetivo y presupuesto del cliente.`,
          },
        ],
      },
      apiKey,
    )
    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    const data = JSON.parse(text || '{}')
    return NextResponse.json(data)
  } catch (error) {
    console.error('AI match error:', error)
    return NextResponse.json({ matches: [] }, { status: 200 })
  }
}
