import type { Card, ParseResult } from '../types'

const BASE = '/api'

function getToken(): string {
  return localStorage.getItem('token') ?? ''
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function login(password: string, displayName: string): Promise<string> {
  const res = await fetch(`${BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, display_name: displayName }),
  })
  const data = await handleResponse<{ token: string }>(res)
  return data.token
}

export async function parseRadio(rawText: string): Promise<ParseResult> {
  const res = await fetch(`${BASE}/parse`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ raw_text: rawText }),
  })
  return handleResponse<ParseResult>(res)
}

export async function fetchCards(): Promise<Card[]> {
  const res = await fetch(`${BASE}/cards`, { headers: authHeaders() })
  return handleResponse<Card[]>(res)
}

export async function createCard(payload: {
  raw_text: string
  time_field: string
  location: string
  summary: string
  zone: 'left' | 'right'
}): Promise<Card> {
  const res = await fetch(`${BASE}/cards`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<Card>(res)
}

export async function updateCard(id: string, payload: Partial<Card>): Promise<Card> {
  const res = await fetch(`${BASE}/cards/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<Card>(res)
}

export async function deleteCard(id: string): Promise<void> {
  const res = await fetch(`${BASE}/cards/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return handleResponse<void>(res)
}

export async function reorderCards(
  updates: { id: string; sort_order: number; zone: string }[]
): Promise<void> {
  const res = await fetch(`${BASE}/cards/reorder`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ updates }),
  })
  return handleResponse<void>(res)
}
