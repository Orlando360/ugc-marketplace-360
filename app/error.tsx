'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background text-white">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-2xl font-bold mb-3">Algo salió mal</h1>
      <p className="text-gray-400 mb-6 max-w-md">
        Hubo un error inesperado. Nuestro equipo ha sido notificado.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}
