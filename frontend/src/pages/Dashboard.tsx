import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { getUserEmail } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

const LANGUAGES = ['python', 'java', 'cpp'] as const

export default function Dashboard() {
  const email = getUserEmail()
  const username = email?.split('@')[0] ?? 'user'

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')
  const [language, setLanguage] = useState('python')
  const [roomName, setRoomName] = useState('')
  const [roomId, setRoomId] = useState('')

  const navigate = useNavigate()

  const blobRef = useRef<HTMLDivElement>(null)
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!blobRef.current) return

      blobRef.current.style.transform = `translate(${e.clientX - 250}px, ${
        e.clientY - 250
      }px)`
    }

    window.addEventListener('mousemove', move)

    return () => window.removeEventListener('mousemove', move)
  }, [])

  const handleCreateRoom = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/create-room`, {
    method: 'POST',
    headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ room_name: roomName, language }),})
    if (!res) return Error
    else{
      const data = await res.json()
      navigate(`/room/${data.room_id}`)
    }
  }

  const handleJoinRoom = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/join-room`, {
    method: 'POST',
    headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ room_id: roomId }),})
    if (!res) return Error
    else{
      navigate(`/room/${roomId}`)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#040406] text-white">
      {/* Backgrounds — clipped so blobs never cause horizontal scroll */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <div
          ref={blobRef}
          className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full blur-[130px] transition-transform duration-300 ease-out"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)',
          }}
        />

        <div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          }}
        />

        <div
          className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{
            background:
              'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* HEADER */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,1)]" />

          <span className="bg-gradient-to-r from-white to-violet-300 bg-clip-text text-xl font-black tracking-[-0.08em] text-transparent">
            cocode
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 backdrop-blur-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-400 text-sm font-bold">
            {username[0].toUpperCase()}
          </div>

          <span className="text-sm text-[#cfcfe7]">{username}</span>
        </div>
      </header>

      {/* MAIN — natural document flow (no viewport centering) */}
      <main className="relative z-10 mx-auto w-full max-w-[1100px] px-4 pb-20 pt-4 sm:px-6 md:px-10">
        <div className="flex w-full min-w-0 flex-col items-center">
          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full min-w-0 text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-violet-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              collaborative interviews
            </div>

            <h1 className="!m-0 mx-auto max-w-full px-1 text-center text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className='text-violet-400'>Code</span><span> together.</span>
              <br />
              <span className="animate-gradient bg-[linear-gradient(120deg,#8b5cf6,#6366f1,#c084fc,#ffffff,#8b5cf6)] bg-[length:300%_300%] bg-clip-text text-transparent">
                hire smarter.
              </span>
            </h1>

            <div className="mx-auto mt-4 w-full text-center text-base leading-8 text-[#8b8ba7] md:text-lg">
              Real-time collaborative coding interviews built for modern
              engineering teams.
            </div>
          </motion.div>

          {/* ACTION CARD */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mt-12 w-full max-w-[540px] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_80px_rgba(139,92,246,0.14)] backdrop-blur-3xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_70%)]" />

            <div className="relative z-10">
              {/* TAB SWITCH */}
              <div className="mb-7 flex rounded-2xl border border-white/10 bg-black/30 p-1">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'create'
                      ? 'bg-violet-600 text-white shadow-[0_8px_30px_rgba(139,92,246,0.45)]'
                      : 'text-[#7d7d98] hover:text-white'
                  }`}
                >
                  Create Room
                </button>

                <button
                  onClick={() => setActiveTab('join')}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'join'
                      ? 'bg-violet-600 text-white shadow-[0_8px_30px_rgba(139,92,246,0.45)]'
                      : 'text-[#7d7d98] hover:text-white'
                  }`}
                >
                  Join Room
                </button>
              </div>

              {/* CREATE */}
              {activeTab === 'create' ? (
                <div>
                  <input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="room name"
                    className="mb-5 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white outline-none transition-all placeholder:text-[#4c4c66] focus:border-violet-500/40 focus:bg-black/50"
                  />

                  <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`rounded-xl border px-3 py-3 text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
                          language === lang
                            ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                            : 'border-white/8 bg-black/20 text-[#666680] hover:border-white/15 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="group relative w-full overflow-hidden rounded-2xl bg-violet-600 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-violet-500"
                    onClick={()=>handleCreateRoom()}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)] -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />

                    <span className="relative z-10">Create Room — ⌘ Enter</span>
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="paste room id"
                    className="mb-6 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white outline-none transition-all placeholder:text-[#4c4c66] focus:border-violet-500/40 focus:bg-black/50"
                  />

                  <button
                    type="button"
                    className="group relative w-full overflow-hidden rounded-2xl bg-violet-600 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-violet-500"
                    onClick={()=>handleJoinRoom()}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)] -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />

                    <span className="relative z-10">Join Room — ⌘ Enter</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* LIVE EDITOR */}
          <motion.div
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mt-10 w-full min-w-0 overflow-hidden rounded-[34px] border border-white/10 bg-[#08080f]/80 shadow-[0_20px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_60%)]" />

            {/* TOP BAR */}
            <div className="relative z-10 flex h-12 items-center border-b border-white/6 px-5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>

              <div className="pointer-events-none absolute -right-4  flex -translate-x-1/2 items-center justify-center gap-4 text-xs text-[#8d8da8]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Alex typing
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                  Sarah joined
                </div>
              </div>
            </div>

            {/* CODE */}
            <div className="relative z-10 flex min-h-[280px] flex-col overflow-hidden sm:h-[360px] sm:flex-row">
              {/* LINE NUMBERS */}
              <div className="hidden w-[70px] shrink-0 flex-col items-end border-r border-white/5 bg-black/20 px-4 py-8 font-mono text-sm text-[#4e4e66] sm:flex">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className="leading-8">
                    {i + 1}
                  </span>
                ))}
              </div>

              {/* EDITOR */}
              <div className="relative min-w-0 flex-1 overflow-x-auto p-4 sm:p-8">
                <div className="mb-3 flex w-fit items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300 backdrop-blur-xl sm:absolute sm:right-[20%] sm:top-[42%] sm:mb-0">
                  <div className="h-2 w-2 rounded-full bg-violet-400" />
                  Sarah
                </div>

                <pre className="min-w-0 font-mono text-xs leading-7 text-[#d8d8f0] sm:text-[15px] sm:leading-8">
{`class Solution:
    def twoSum(self, nums, target):
        seen = {}

        for i, n in enumerate(nums):
            diff = target - n

            if diff in seen:
                return [seen[diff], i]

            seen[n] = i

        return []`}
                </pre>

                <div className="absolute bottom-24 right-8 hidden h-6 w-[2px] animate-pulse bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,1)] sm:block" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}