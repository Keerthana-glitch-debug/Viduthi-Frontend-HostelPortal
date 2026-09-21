import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Bot, X, Send, Sparkles, BookOpen, Clock, Minus, RefreshCw } from 'lucide-react'
import { selectAuth, selectUser } from '../../store/slices/authSlice'

const COPILOT_KNOWLEDGE_BASE = [
  {
    keywords: ['rule', 'rules', 'curfew', 'timing', 'time', 'gate', 'entry', 'in-time', 'night'],
    response: `Campus Residential Timing Regulations:
• Weekday Gate Closure: Strict in-time is 09:00 PM (Mon–Fri).
• Weekend Curfew: 10:00 PM (Sat–Sun).
• Late Entry: Requires Chief Warden digital clearance and logs an automatic SMS to parents.
• Silent Study Hours: 10:30 PM to 06:00 AM across Block A & Block B.`,
  },
  {
    keywords: ['mess', 'food', 'dining', 'lunch', 'breakfast', 'dinner', 'snacks', 'menu'],
    response: `Hostel Dining Timings:
• Breakfast: 07:30 AM – 09:30 AM
• Lunch: 12:30 PM – 02:30 PM
• Evening Snacks & Tea: 04:30 PM – 05:45 PM
• Dinner: 07:30 PM – 09:30 PM
Add-ons like Chicken Curry, Boiled Egg, and Omelette can be ordered directly from the Mess tab.`,
  },
  {
    keywords: ['sports', 'badminton', 'cricket', 'gym', 'workout', 'fitness', 'gear', 'equipment'],
    response: `Recreation & Fitness Access:
• Sports Gear: Badminton, Cricket kit, Basketball, and TT sets available in the Facilities tab. Max borrow duration is 2–4 hours.
• Campus Gym: Open 06:00 AM – 08:30 AM and 05:00 PM – 09:00 PM. Reserve workout slots in the Facilities tab to bypass turnstile queues.`,
  },
  {
    keywords: ['laundry', 'wash', 'cloth', 'clothes', 'iron', 'ironing', 'machine'],
    response: `Laundry & Garment Care:
• 3 Washing Machines (Machine 1, 2, 3) and Steam Iron Stations are active on the ground floor.
• Standard steam ironing fee is ₹20 per cloth.
• You can track progress across the visual stepper (Requested → Delivered) in the Laundry tab.`,
  },
  {
    keywords: ['leave', 'outpass', 'home', 'vacation', 'permission', 'pass'],
    response: `Outpass & Leave Protocols:
• Submit applications in the Leave & Outpasses tab before 05:00 PM for same-day departures.
• Requires two-step confirmation and student declaration.
• Once approved by the Chief Warden, your verified QR Gate Pass is activated for optical gate clearance.`,
  },
  {
    keywords: ['attendance', 'roll-call', 'rollcall', 'gps', 'faceid', 'fingerprint'],
    response: `Daily Night Roll-Call:
• Mandatory check-in between 08:00 PM – 09:30 PM.
• Uses GPS campus geofencing (must be within 300m of hostel) + Biometric FaceID/Fingerprint sensor verification in the Attendance tab.`,
  },
  {
    keywords: ['motivation', 'motivate', 'study', 'focus', 'stress', 'exam', 'tip', 'quote'],
    response: `💡 Copilot Daily Focus Boost:
"Discipline is choosing between what you want now and what you want most."
Remember to take a 5-minute deep breathing break every 45 minutes of intense coding or study. You're building your future step by step!`,
  },
]

function getCopilotReply(query) {
  const q = query.toLowerCase()
  for (const item of COPILOT_KNOWLEDGE_BASE) {
    if (item.keywords.some((k) => q.includes(k))) {
      return item.response
    }
  }
  return `I understand you're asking: "${query}". You can check our specific portal tabs for Facilities (Sports/Gym), Attendance (GPS Check-in), Mess Dining, or Leave Outpasses. Feel free to ask about gate rules or request study tips!`
}

export default function FloatingCopilot() {
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      sender: 'bot',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm your Vidudhi AI Copilot. Ask me about hostel gate timings, mess add-ons, gym slots, laundry, or ask for a study motivation tip!`,
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isTyping])

  if (role !== 'student') return null

  const handleSend = (textToSend) => {
    const query = (textToSend || input).trim()
    if (!query || isTyping) return

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: query }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const fullResponse = getCopilotReply(query)

    // Simulate character typing stream
    setTimeout(() => {
      let charIndex = 0
      const botMsgId = `b-${Date.now()}`
      setMessages((prev) => [...prev, { id: botMsgId, sender: 'bot', text: '' }])

      const interval = setInterval(() => {
        charIndex += 4
        if (charIndex >= fullResponse.length) {
          clearInterval(interval)
          setMessages((prev) =>
            prev.map((m) => (m.id === botMsgId ? { ...m, text: fullResponse } : m))
          )
          setIsTyping(false)
        } else {
          const chunk = fullResponse.slice(0, charIndex)
          setMessages((prev) =>
            prev.map((m) => (m.id === botMsgId ? { ...m, text: chunk } : m))
          )
        }
      }, 20)
    }, 300)
  }

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            background: 'linear-gradient(135deg, #132216 0%, #1f3724 100%)',
            border: '2px solid var(--accent-border, #7CFC00)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35), 0 0 12px rgba(124, 252, 0, 0.25)',
            cursor: 'pointer',
            color: '#FFFFFF',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="Vidudhi AI Copilot"
          aria-label="Open AI Copilot"
        >
          <Bot size={22} color="var(--accent-border, #7CFC00)" />
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: 'var(--accent-border, #7CFC00)',
              boxShadow: '0 0 8px var(--accent-border, #7CFC00)',
              border: '2px solid #132216',
            }}
          />
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 520,
            maxHeight: 'calc(100vh - 48px)',
            zIndex: 10000,
            background: 'var(--surface)',
            border: '1.5px solid var(--line-strong)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-lift)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--accent-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} color="var(--accent-border)" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                  Vidudhi AI Copilot
                </div>
                <div style={{ fontSize: 11, color: 'var(--teal-border)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal-border)' }} />
                  Online · Hostel Knowledge Base
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', padding: 4 }}
                title="Minimize"
              >
                <Minus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', padding: 4 }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: 'var(--bg-alt)',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.sender === 'user' ? 'var(--accent)' : 'var(--surface)',
                  color: m.sender === 'user' ? 'var(--accent-ink)' : 'var(--ink)',
                  border: m.sender === 'user' ? '1px solid var(--accent-border)' : '1px solid var(--line)',
                  fontWeight: m.sender === 'user' ? 600 : 400,
                  padding: '10px 14px',
                  borderRadius: 12,
                  borderBottomRightRadius: m.sender === 'user' ? 2 : 12,
                  borderBottomLeftRadius: m.sender === 'bot' ? 2 : 12,
                  fontSize: 12.5,
                  lineHeight: 1.45,
                  whiteSpace: 'pre-line',
                  boxShadow: 'var(--shadow-tag)',
                }}
              >
                {m.text}
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  padding: '8px 12px',
                  borderRadius: 12,
                  fontSize: 11,
                  color: 'var(--teal-border)',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-tag)',
                }}
              >
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              borderTop: '1px solid var(--line)',
              background: 'var(--surface-2)',
            }}
          >
            {[
              'Gate curfew & in-times',
              'Mess timings',
              'Laundry fee',
              'Study motivation tip',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSend(chip)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: 11,
                  padding: '5px 10px',
                  borderRadius: 12,
                  background: 'var(--surface)',
                  border: '1px solid var(--line-strong)',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  boxShadow: 'var(--shadow-sticker)',
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            style={{
              padding: 10,
              borderTop: '1px solid var(--line)',
              display: 'flex',
              gap: 8,
              background: 'var(--surface-2)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask hostel rules, mess, study tips..."
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: 12.5,
                borderRadius: 8,
                border: '1px solid var(--line-strong)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                border: '1px solid var(--accent-border)',
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !input.trim() || isTyping ? 0.5 : 1,
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
