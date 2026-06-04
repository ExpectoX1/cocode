import { useState } from 'react'
import { motion } from 'framer-motion'
import { getUserEmail } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

const LANGUAGES = ['python', 'java', 'cpp', 'go'] as const
type Language = (typeof LANGUAGES)[number]

const COLORS = {
  bg: '#f2f1eb',
  panel: '#f7f6f1',
  border: 'rgba(0,0,0,0.08)',
  text: '#111111',
  muted: '#6b6b6b',
  subtle: '#9a9a9a',
  blue: '#3C5C86',
}

export default function Dashboard() {
  const email = getUserEmail()
  const username = email?.split('@')[0] ?? 'user'

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')
  const [language, setLanguage] = useState<Language>('python')
  const [roomName, setRoomName] = useState('frontend-loop-1')
  const [roomId, setRoomId] = useState('')

  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

  const handleCreateRoom = async () => {
    const token = localStorage.getItem('token')

    const res = await fetch(`${API_URL}/create-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        room_name: roomName,
        language,
      }),
    })

    if (!res.ok) return

    const data = await res.json()
    navigate(`/room/${data.room_id}`)
  }

  const handleJoinRoom = async () => {
    const token = localStorage.getItem('token')

    const res = await fetch(`${API_URL}/join-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        room_id: roomId,
      }),
    })

    if (!res.ok) return

    navigate(`/room/${roomId}`)
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: COLORS.bg,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {/* grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* header */}
      <header
        className="relative z-20 flex h-[72px] items-center justify-between border-b px-8"
        style={{
          borderColor: COLORS.border,
        }}
      >
        <div className="flex items-center gap-4">
          <span
            className="text-[20px] font-black tracking-tight"
            style={{
              color: COLORS.text,
              letterSpacing: '-0.05em',
            }}
          >
            cocode
          </span>

          <span
            className="text-[10px] uppercase"
            style={{
              color: COLORS.subtle,
              letterSpacing: '0.18em',
            }}
          >
            // collaborative interview workspace
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span
            className="text-[10px]"
            style={{
              color: COLORS.subtle,
              letterSpacing: '0.14em',
            }}
          >
            REV 2.4 · 2026.06
          </span>

          <div
            className="flex items-center gap-2 px-3 py-1.5"
            style={{
              background: '#111',
              borderRadius: 4,
            }}
          >
            <span
              className="text-[10px] font-bold uppercase"
              style={{
                color: '#fff',
                letterSpacing: '0.08em',
              }}
            >
              {username[0].toUpperCase()}
            </span>

            <span
              className="text-[11px]"
              style={{
                color: '#cfcfcf',
              }}
            >
              {username}
            </span>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="relative z-10 mx-auto h-[calc(100vh-72px)] max-w-[1240px] px-8 py-8">
        {/* badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: COLORS.blue,
            }}
          />

          <span
            className="text-[10px] font-bold uppercase"
            style={{
              color: COLORS.blue,
              letterSpacing: '0.22em',
            }}
          >
            LIVE COLLAB SESSION
          </span>
        </motion.div>

        {/* hero */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-3"
        >
          <h1
            className="text-[42px] font-black leading-[0.95]"
            style={{
              color: COLORS.text,
              letterSpacing: '-0.05em',
              maxWidth: 640,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Pair-program the
            <br />
            interview,{' '}
            <span style={{ color: COLORS.blue }}>
              on the record.
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="mb-8 text-[13px] leading-6"
          style={{
            color: COLORS.muted,
            maxWidth: 480,
          }}
        >
          Real-time editor, shared cursor, replayable timeline.
          <br />
          Spin up a room or join one in a single step.
        </motion.p>

        {/* layout */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[440px_1fr]">
          {/* left card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 4,
              boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
            }}
          >
            <CornerCross position="top-left" />
            <CornerCross position="top-right" />
            <CornerCross position="bottom-left" />
            <CornerCross position="bottom-right" />

            <div className="p-6">
              {/* tabs */}
              <div
                className="mb-7 flex gap-6 border-b"
                style={{
                  borderColor: COLORS.border,
                }}
              >
                <button
                  onClick={() => setActiveTab('create')}
                  className="pb-3 text-[10px] font-bold uppercase transition-all"
                  style={{
                    color:
                      activeTab === 'create'
                        ? COLORS.text
                        : COLORS.subtle,
                    borderBottom:
                      activeTab === 'create'
                        ? '2px solid #111'
                        : '2px solid transparent',
                    letterSpacing: '0.18em',
                    marginBottom: '-1px',
                  }}
                >
                  New Room
                </button>

                <button
                  onClick={() => setActiveTab('join')}
                  className="pb-3 text-[10px] font-bold uppercase transition-all"
                  style={{
                    color:
                      activeTab === 'join'
                        ? COLORS.text
                        : COLORS.subtle,
                    borderBottom:
                      activeTab === 'join'
                        ? '2px solid #111'
                        : '2px solid transparent',
                    letterSpacing: '0.18em',
                    marginBottom: '-1px',
                  }}
                >
                  Join Room
                </button>
              </div>

              {activeTab === 'create' ? (
                <div>
                  <label
                    className="mb-3 block text-[10px] font-bold uppercase"
                    style={{
                      color: COLORS.subtle,
                      letterSpacing: '0.18em',
                    }}
                  >
                    Room Name
                  </label>

                  <input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="my-interview-room"
                    className="mb-6 w-full border-b bg-transparent pb-2 text-[13px] outline-none"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.text,
                    }}
                  />

                  <label
                    className="mb-3 block text-[10px] font-bold uppercase"
                    style={{
                      color: COLORS.subtle,
                      letterSpacing: '0.18em',
                    }}
                  >
                    Language
                  </label>

                  <div className="mb-7 grid grid-cols-4 gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className="py-3 text-[10px] font-bold uppercase transition-all"
                        style={{
                          border:
                            language === lang
                              ? '1.5px solid #111'
                              : `1px solid ${COLORS.border}`,
                          borderRadius: 4,
                          color:
                            language === lang
                              ? COLORS.text
                              : COLORS.subtle,
                          letterSpacing: '0.15em',
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    className="w-full py-4 text-[11px] font-bold uppercase transition-all hover:opacity-90"
                    style={{
                      background: '#111',
                      color: '#fff',
                      borderRadius: 4,
                      letterSpacing: '0.2em',
                    }}
                  >
                    Initialize Room →
                  </button>
                </div>
              ) : (
                <div>
                  <label
                    className="mb-3 block text-[10px] font-bold uppercase"
                    style={{
                      color: COLORS.subtle,
                      letterSpacing: '0.18em',
                    }}
                  >
                    Room ID
                  </label>

                  <input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="paste room id"
                    className="mb-7 w-full border-b bg-transparent pb-2 text-[13px] outline-none"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.text,
                    }}
                  />

                  <button
                    onClick={handleJoinRoom}
                    className="w-full py-4 text-[11px] font-bold uppercase transition-all hover:opacity-90"
                    style={{
                      background: '#111',
                      color: '#fff',
                      borderRadius: 4,
                      letterSpacing: '0.2em',
                    }}
                  >
                    Join Room →
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* right card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
            }}
          >
            {/* top */}
            <div
              className="flex items-center justify-between border-b px-5 py-3"
              style={{
                borderColor: COLORS.border,
              }}
            >
              <span
                className="text-[10px] font-bold uppercase"
                style={{
                  color: COLORS.subtle,
                  letterSpacing: '0.18em',
                }}
              >
                solution.py — specimen
              </span>

              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: '#22c55e',
                  }}
                />

                <span
                  className="text-[10px]"
                  style={{
                    color: COLORS.muted,
                    letterSpacing: '0.12em',
                  }}
                >
                  2 online
                </span>
              </div>
            </div>

            {/* editor */}
            <div
              className="flex"
              style={{
                minHeight: 290,
              }}
            >
              {/* lines */}
              <div
                className="flex min-w-[52px] flex-col items-end border-r px-4 py-6 select-none"
                style={{
                  borderColor: 'rgba(0,0,0,0.06)',
                  background: 'rgba(0,0,0,0.015)',
                }}
              >
                {Array.from({ length: 11 }).map((_, i) => (
                  <span
                    key={i}
                    className="text-xs leading-6"
                    style={{
                      color: '#c9c9c9',
                    }}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>

              {/* code */}
              <div className="relative flex-1 overflow-x-auto px-6 py-6">
                <pre
                  className="text-xs leading-6"
                  style={{
                    color: '#2d2d2d',
                  }}
                >
{`class Solution:
    def twoSum(self, nums, target):
        seen = {}

        for i, n in enumerate(nums):
            diff = target - n

            if diff in seen:
                return [seen[diff], i]

            seen[n] = i`}
                  <span
                    className="ml-[2px] inline-block h-4 w-2 animate-pulse align-middle"
                    style={{
                      background: COLORS.blue,
                    }}
                  />

{`

        return []`}
                </pre>
              </div>
            </div>

            {/* bottom */}
            <div
              className="flex items-center justify-between border-t px-5 py-2.5"
              style={{
                borderColor: COLORS.border,
                background: 'rgba(0,0,0,0.015)',
              }}
            >
              <span
                className="text-[10px]"
                style={{
                  color: '#8a8a8a',
                }}
              >
                sarah · editing line 7
              </span>

              <span
                className="text-[10px]"
                style={{
                  color: '#b3b3b3',
                }}
              >
                UTF-8 · LF
              </span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function CornerCross({
  position,
}: {
  position:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
}) {
  const base = 'absolute w-4 h-4 pointer-events-none'

  const posMap = {
    'top-left': '-top-2 -left-2',
    'top-right': '-top-2 -right-2',
    'bottom-left': '-bottom-2 -left-2',
    'bottom-right': '-bottom-2 -right-2',
  }

  return (
    <div className={`${base} ${posMap[position]}`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <line
          x1="8"
          y1="0"
          x2="8"
          y2="16"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1"
        />

        <line
          x1="0"
          y1="8"
          x2="16"
          y2="8"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}