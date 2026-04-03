import { NextRequest } from 'next/server'
import { streamClaude } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { briefContext, creator } = await req.json()

    const stream = await streamClaude({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Eres un experto en marketing de contenido UGC. Escribe un brief de campaña profesional y conciso en español.

CREADORA: ${creator.name} (${creator.category}) | Bio: ${creator.bio || ''} | Tags: ${creator.tags?.join(', ') || ''}
INFORMACIÓN DEL CLIENTE: ${briefContext}

Escribe un brief claro con:
1. Objetivo de la campaña
2. Mensaje clave
3. Tono y estilo sugerido para ${creator.name}
4. Entregables específicos recomendados

Sé directo y práctico. Máximo 200 palabras.`,
        },
      ],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('AI brief error:', error)
    return new Response('Error generando brief', { status: 500 })
  }
}
