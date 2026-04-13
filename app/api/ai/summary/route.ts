import { NextRequest, NextResponse } from 'next/server'
import { callAnthropicWithRetry } from '@/lib/anthropic-retry'

interface RequestInput {
  id: string
  creator_name: string
  client_name: string
  package_name: string
  package_price: number
  status: string
  brief: string
  created_at: string
}

export async function POST(req: NextRequest) {
  try {
    const { requests } = await req.json()

    if (!requests || requests.length === 0) {
      return NextResponse.json({ summary: 'No hay solicitudes para resumir hoy.' })
    }

    const requestsText = requests
      .map((r: RequestInput) =>
        `- ${r.client_name} contrató a ${r.creator_name} | Paquete: ${r.package_name} ($${r.package_price?.toLocaleString('es-CO')} COP) | Estado: ${r.status} | Brief: ${r.brief?.slice(0, 80) || 'Sin brief'}`
      )
      .join('\n')

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ summary: 'API key no configurada.' }, { status: 500 })

    const response = await callAnthropicWithRetry(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `Eres el asistente de operaciones de UGC Marketplace 360. Genera un resumen ejecutivo del día para el administrador.

SOLICITUDES DE HOY (${requests.length} total):
${requestsText}

Escribe un resumen ejecutivo breve en español con:
1. Total de solicitudes y estado general
2. Ingresos potenciales del día
3. Creadoras más solicitadas
4. Acciones prioritarias recomendadas

Sé conciso, usa bullet points cuando ayude. Máximo 150 palabras.`,
          },
        ],
      },
      apiKey,
    )
    const summary = response.content.find(b => b.type === 'text')?.text ?? ''
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('AI summary error:', error)
    return NextResponse.json({ summary: 'Error generando resumen. Verifica la API key.' }, { status: 200 })
  }
}
