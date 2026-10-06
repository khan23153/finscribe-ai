'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import Sheet from '@/components/Sheet'
import { Prose, cx } from '@/components/ui'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type AiResponse = {
  reply?: string
  error?: string
}

const quickPrompts = [
  'Help me build a simple monthly budget',
  'How is a loan EMI calculated?',
  'What is a sensible emergency fund?',
]

export default function AssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, open, isLoading])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || isLoading) return

    const nextMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The API accepts at most 20 messages; keep the most recent context.
        body: JSON.stringify({ messages: nextMessages.slice(-20) }),
      })
      const data = await response.json() as AiResponse

      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? 'The assistant returned an invalid response.')
      }

      setMessages([...nextMessages, { role: 'assistant', content: data.reply }])
    } catch (caughtError) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: caughtError instanceof Error
            ? caughtError.message
            : 'Something went wrong. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      placement="right"
      title="Assistant"
      description="Educational guidance only. Not financial advice."
      bodyClassName=""
      footer={
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void send(input)
          }}
          className="flex items-end gap-2 rounded-xl border border-border bg-background p-1.5 focus-within:border-accent"
        >
          <label htmlFor="assistant-input" className="sr-only">Message the assistant</label>
          <textarea
            ref={inputRef}
            id="assistant-input"
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send(input)
              }
            }}
            placeholder="Ask about budgeting, loans, saving…"
            maxLength={4000}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-subtle focus:outline-none max-h-32"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-8 w-8 shrink-0 rounded-lg bg-accent text-accent-foreground flex items-center justify-center disabled:opacity-40"
            aria-label="Send"
          >
            <ArrowUp size={16} strokeWidth={2.4} />
          </button>
        </form>
      }
    >
      <div className="px-5 py-4 min-h-[45dvh] sm:min-h-0">
        {messages.length === 0 ? (
          <div>
            <p className="text-sm text-foreground-2">
              Ask general questions about budgeting, loans, saving, or investing concepts.
              The assistant only knows figures you type here.
            </p>
            <div className="mt-4 grid gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void send(prompt)}
                  className="text-left text-[13px] px-3 py-2.5 rounded-lg border border-border text-foreground-2 hover:bg-surface-2 hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="space-y-5">
            {messages.map((message, index) => (
              <li key={index} className={cx('flex', message.role === 'user' && 'justify-end')}>
                {message.role === 'user' ? (
                  <p className="max-w-[85%] rounded-xl rounded-br-sm bg-surface-2 border border-border px-3.5 py-2 text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                ) : (
                  <div className="max-w-full">
                    <Prose text={message.content} />
                  </div>
                )}
              </li>
            ))}
            {isLoading && (
              <li className="flex items-center gap-1.5 h-5" aria-label="Assistant is typing">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 rounded-full bg-subtle animate-pulse"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </li>
            )}
          </ol>
        )}
        <div ref={endRef} />
      </div>
    </Sheet>
  )
}
