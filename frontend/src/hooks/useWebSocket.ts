import { useEffect, useRef, useCallback } from 'react'
import type { WsMessage } from '../types'

export function useWebSocket(onMessage: (msg: WsMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const retryDelay = useRef(1000)
  const unmounted = useRef(false)

  const connect = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token || unmounted.current) return

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${protocol}://${window.location.host}/ws?token=${token}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      retryDelay.current = 1000
    }

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data)
        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }))
          return
        }
        onMessage(msg)
      } catch {
        // ignore malformed
      }
    }

    ws.onclose = () => {
      if (unmounted.current) return
      const delay = Math.min(retryDelay.current, 30000)
      retryDelay.current = delay * 2
      setTimeout(connect, delay)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [onMessage])

  useEffect(() => {
    unmounted.current = false
    connect()
    return () => {
      unmounted.current = true
      wsRef.current?.close()
    }
  }, [connect])
}
