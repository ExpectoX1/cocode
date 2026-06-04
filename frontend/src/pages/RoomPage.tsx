import { useState, useRef, useEffect } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type * as Monaco from 'monaco-editor'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'react-router-dom'

const LANGUAGES = ['python', 'java', 'cpp', 'javascript'] as const
type Language = (typeof LANGUAGES)[number]

const MONACO_LANG: Record<Language, string> = {
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  javascript: 'javascript',
}

const DEFAULT_CODE: Record<Language, string> = {
  python: `def two_sum(nums, target):
    seen = {}

    for i, n in enumerate(nums):
        diff = target - n

        if diff in seen:
            return [seen[diff], i]

        seen[n] = i

    return []`,

  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];

            if (seen.containsKey(diff)) {
                return new int[]{seen.get(diff), i};
            }

            seen.put(nums[i], i);
        }

        return new int[]{};
    }
}`,

  cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int,int> seen;

    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];

        if (seen.count(diff)) {
            return {seen[diff], i};
        }

        seen[nums[i]] = i;
    }

    return {};
}`,

  javascript: `function twoSum(nums, target) {
    const seen = {};

    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];

        if (diff in seen) {
            return [seen[diff], i];
        }

        seen[nums[i]] = i;
    }

    return [];
}`,
}

type Comment = {
  id: number
  author: string
  line: number
  text: string
  time: string
}

type RightPanel = 'output' | 'comments'

type CodeChangeMessage = {
  type: 'code_change'
  change: {
    range: Monaco.IRange
    text: string
    rangeLength: number
  }
}

type LanguageChangeMessage = {
  type: 'language_change'
  content: Language
}

type WsMessage = CodeChangeMessage | LanguageChangeMessage

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()

  const [language, setLanguage] = useState<Language>('python')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [rightPanel, setRightPanel] =
    useState<RightPanel>('output')
  const [elapsed, setElapsed] = useState(0)
  const [copied, setCopied] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [langOpen, setLangOpen] = useState(false)

  const editorRef =
    useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)

  const wsRef = useRef<WebSocket | null>(null)

  const isApplyingRemoteEdit = useRef(false)

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(null)

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: 'Alex',
      line: 3,
      text: 'Nice use of a hash map here',
      time: '2m ago',
    },
    {
      id: 2,
      author: 'You',
      line: 6,
      text: 'Should we handle edge cases?',
      time: '1m ago',
    },
  ])

  const participants = [
    {
      name: 'Alex',
      color: 'bg-violet-600',
      role: 'interviewer',
    },
    {
      name: 'You',
      color: 'bg-indigo-500',
      role: 'candidate',
    },
  ]

  /* TIMER */

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  /* WEBSOCKET */

  useEffect(() => {
    const token = localStorage.getItem('token')

    const ws = new WebSocket(
      `ws://localhost:8000/ws/${roomId}?token=${token}`
    )

    ws.onopen = () => {
      console.log('connected')
    }

    ws.onmessage = (event) => {
      const data: WsMessage = JSON.parse(event.data)

      /* REMOTE CODE CHANGE */

      if (data.type === 'code_change') {
        const editor = editorRef.current
        const model = editor?.getModel()

        if (!editor || !model) return

        isApplyingRemoteEdit.current = true

        model.pushEditOperations(
          [],
          [
            {
              range: data.change.range,
              text: data.change.text,
            },
          ],
          () => null
        )

        isApplyingRemoteEdit.current = false
      }

      /* REMOTE LANGUAGE CHANGE */

      if (data.type === 'language_change') {
        const editor = editorRef.current
        const model = editor?.getModel()

        if (!editor || !model) return

        setLanguage(data.content)

        model.setValue(DEFAULT_CODE[data.content])
      }
    }

    ws.onclose = () => {
      console.log('disconnected')
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [roomId])

  /* TIME FORMAT */

  const fmt = (s: number) => {
    return `${String(Math.floor(s / 60)).padStart(
      2,
      '0'
    )}:${String(s % 60).padStart(2, '0')}`
  }

  /* MONACO */

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor

    const model = editor.getModel()

    if (!model) return

    model.setValue(DEFAULT_CODE.python)

    editor.onDidChangeModelContent((event) => {
      if (isApplyingRemoteEdit.current) return

      for (const change of event.changes) {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          continue
        }

        wsRef.current.send(
          JSON.stringify({
            type: 'code_change',
            change: {
              range: change.range,
              text: change.text,
              rangeLength: change.rangeLength,
            },
          })
        )
      }
    })
  }

  /* LANGUAGE CHANGE */

  const handleLangChange = (lang: Language) => {
    const editor = editorRef.current
    const model = editor?.getModel()

    if (!editor || !model) return

    setLanguage(lang)

    model.setValue(DEFAULT_CODE[lang])

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'language_change',
          content: lang,
        })
      )
    }

    setLangOpen(false)
  }

  /* RUN */

  const handleRun = async () => {
    setRunning(true)

    setRightPanel('output')

    setOutput('')

    await new Promise((r) => setTimeout(r, 900))

    setOutput(
      `>>> Running ${language}...\n\nOutput:\n[0, 1]\n\n✓ Finished in 0.03s`
    )

    setRunning(false)
  }

  /* COPY */

  const handleCopyId = async () => {
    if (!roomId) return

    await navigator.clipboard.writeText(roomId)

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  /* COMMENTS */

  const handleAddComment = () => {
    if (!newComment.trim()) return

    setComments((c) => [
      ...c,
      {
        id: Date.now(),
        author: 'You',
        line: 0,
        text: newComment,
        time: 'just now',
      },
    ])

    setNewComment('')
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#05050b] text-[#e8e8f0]">
      {/* TOP BAR */}

      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#05050b]/80 px-4 backdrop-blur-xl">
        {/* LEFT */}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,1)]" />

            <span className="text-sm font-bold tracking-tight text-white">
              cocode
            </span>
          </div>

          <div className="hidden h-4 w-px bg-white/10 sm:block" />

          <button
            onClick={handleCopyId}
            className="hidden items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] text-[#8b8ba7] transition hover:border-white/15 hover:text-white sm:flex"
          >
            <span className="font-mono">
              {roomId?.slice(0, 8)}...
            </span>

            <span>{copied ? '✓ copied' : '⎘ copy'}</span>
          </button>
        </div>

        {/* TIMER */}

        <div className="flex items-center gap-2 rounded-full border border-white/8 bg-black/30 px-4 py-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />

          <span className="font-mono text-xs font-semibold tabular-nums text-[#e8e8f0]">
            {fmt(elapsed)}
          </span>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {participants.map((p) => (
                <div
                  key={p.name}
                  title={`${p.name} (${p.role})`}
                  className={`flex size-7 items-center justify-center rounded-full border-2 border-[#05050b] text-[10px] font-bold text-white ${p.color}`}
                >
                  {p.name[0]}
                </div>
              ))}
            </div>

            <span className="hidden text-[11px] text-[#5e5e73] sm:block">
              2 in room
            </span>
          </div>

          <button className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/20">
            End
          </button>
        </div>
      </header>

      {/* BODY */}

      <div className="flex min-h-0 flex-1">
        {/* EDITOR */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOOLBAR */}

          <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.05] bg-black/20 px-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setLangOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-[#a0a0b8] transition hover:border-violet-500/30 hover:text-violet-300"
                >
                  <span className="font-mono">
                    {language}
                  </span>

                  <span className="text-[9px]">▾</span>
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -4,
                        scale: 0.97,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -4,
                        scale: 0.97,
                      }}
                      transition={{
                        duration: 0.15,
                      }}
                      className="absolute left-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#0e0e1a] shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          onClick={() =>
                            handleLangChange(lang)
                          }
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition hover:bg-violet-500/10 ${
                            lang === language
                              ? 'text-violet-400'
                              : 'text-[#8b8ba7]'
                          }`}
                        >
                          {lang === language && (
                            <span className="text-violet-500">
                              ✓
                            </span>
                          )}

                          <span className="font-mono">
                            {lang}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-4 w-px bg-white/8" />

              <span className="text-[10px] text-[#4a4a5e]">
                solution.
                {language === 'cpp'
                  ? 'cpp'
                  : language === 'java'
                  ? 'java'
                  : language === 'javascript'
                  ? 'js'
                  : 'py'}
              </span>
            </div>

            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(139,92,246,0.3)] transition hover:bg-violet-500 disabled:opacity-60"
            >
              {running ? 'Running...' : '▶ Run'}
            </button>
          </div>

          {/* MONACO */}

          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              defaultLanguage={MONACO_LANG.python}
              language={MONACO_LANG[language]}
              theme="vs-dark"
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily:
                  '"JetBrains Mono", "Fira Code", monospace',
                fontLigatures: true,
                minimap: {
                  enabled: false,
                },
                padding: {
                  top: 20,
                  bottom: 20,
                },
                lineHeight: 24,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
              }}
            />
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="flex w-[320px] shrink-0 flex-col border-l border-white/[0.06]">
          {/* TABS */}

          <div className="flex h-10 shrink-0 border-b border-white/[0.05] bg-black/20">
            {(['output', 'comments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightPanel(tab)}
                className={[
                  'flex-1 text-[11px] font-semibold capitalize transition',
                  rightPanel === tab
                    ? 'border-b-2 border-violet-500 text-violet-400'
                    : 'text-[#5e5e73] hover:text-[#8b8ba7]',
                ].join(' ')}
              >
                {tab}

                {tab === 'comments' &&
                  comments.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] text-violet-400">
                      {comments.length}
                    </span>
                  )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {rightPanel === 'output' ? (
              <motion.div
                key="output"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex min-h-0 flex-1 flex-col p-4"
              >
                <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/6 bg-black/40">
                  {output ? (
                    <pre className="overflow-auto whitespace-pre-wrap p-4 font-mono text-[12px] leading-6 text-emerald-400">
                      {output}
                    </pre>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                      <span className="text-2xl">▶</span>

                      <p className="text-[12px] text-[#4a4a5e]">
                        Run your code to see output
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="comments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  <div className="flex flex-col gap-2">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-xl border border-white/6 bg-white/[0.03] p-3"
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                                c.author === 'You'
                                  ? 'bg-indigo-500'
                                  : 'bg-violet-600'
                              }`}
                            >
                              {c.author[0]}
                            </div>

                            <span className="text-[11px] font-semibold text-[#c0c0d8]">
                              {c.author}
                            </span>

                            {c.line > 0 && (
                              <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[9px] text-violet-400">
                                L{c.line}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-[#3a3a4e]">
                            {c.time}
                          </span>
                        </div>

                        <p className="text-[12px] leading-5 text-[#8b8ba7]">
                          {c.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COMMENT INPUT */}

                <div className="shrink-0 border-t border-white/[0.05] p-3">
                  <div className="flex gap-2">
                    <input
                      value={newComment}
                      onChange={(e) =>
                        setNewComment(e.target.value)
                      }
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        handleAddComment()
                      }
                      placeholder="Add a comment..."
                      className="min-w-0 flex-1 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[12px] text-white outline-none transition placeholder:text-[#3a3a4e] focus:border-violet-500/40"
                    />

                    <button
                      onClick={handleAddComment}
                      className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
                    >
                      ↵
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
