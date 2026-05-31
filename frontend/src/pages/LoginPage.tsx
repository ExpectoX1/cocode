import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setToken, setUserEmail } from '../lib/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Login failed')
        return
      }

      if (!data.token) {
        setError('Login succeeded but no token was returned')
        return
      }

      setToken(data.token)
      setUserEmail(email)
      navigate('/dashboard')
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-left">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-h)]">
            Cocode
          </h1>
          <p className="mt-2 text-sm text-[var(--text)]">
            Sign in to start collaborating
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-6 shadow-[var(--shadow)]"
        >
          {error && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}

          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-(--text-h)">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-(--border) bg-(--code-bg) px-3 py-2 text-sm text-(--text-h) outline-none transition focus:border-(--accent-border) focus:ring-2 focus:ring-[var(--accent-bg)]"
              placeholder="you@example.com"
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--text-h)]">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--code-bg)] px-3 py-2 text-sm text-[var(--text-h)] outline-none transition focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-bg)]"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="mt-6 text-center text-sm text-[var(--text)]">
          Don&apos;t have an account?{' '}
          <Link
            to="/sign-in"
            className="font-medium text-[var(--accent)] hover:underline"
          >
            Create one
          </Link>
        </div>
        </form>

     
      </div>
    </div>
  )
}
