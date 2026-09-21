import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  Bot, Send, Sparkles, BookOpen, ShieldCheck, Zap,
  Clock, HeartHandshake, Lightbulb, CornerDownLeft,
} from 'lucide-react'
import { selectUser } from '../store/slices/authSlice'

// Comprehensive hostel rulebook & knowledge base
const KNOWLEDGE_BASE = [
  {
    keywords: ['gate', 'timing', 'curfew', 'close', 'lock', 'night', 'entry'],
    reply: `**Hostel Gate & Curfew Guidelines:**
• Main hostel gates close strictly at **10:00 PM** every evening and reopen at **06:00 AM**.
• Late entry between 10:00 PM and 10:30 PM requires biometric verification at Gate 1 and late-entry logging.
• Repeated late entries without prior warden outpass clearance are reported to your academic department mentor.
• Early morning departure before 6:00 AM is permitted with an approved Gate Pass.`,
  },
  {
    keywords: ['visitor', 'guest', 'friend', 'parents', 'stay', 'overnight'],
    reply: `**Visitor & Overnight Guest Policy:**
• Parents and registered guardians may visit students in the **Front Desk Reception Lounge** between **09:00 AM and 06:30 PM**.
• No day-scholars, friends, or outside visitors are permitted into resident corridors or dorm rooms at any time.
• Overnight stay for guests is not permitted in student dormitories. For visiting parents, university campus guest house suites can be booked via the Warden Administrative Desk.`,
  },
  {
    keywords: ['outpass', 'leave', 'home', 'travel', 'pass', 'permission'],
    reply: `**Leave Request & Outpass Procedure:**
1. Navigate to the **Leave & Outpasses** tab in your portal.
2. Submit your departure date, return date, and reason at least **12 hours in advance**.
3. Once approved by the Chief Warden, an official **Digital Gate Outpass** with a secure verification QR code is generated.
4. Show the QR pass on your mobile at Campus Gate 1 biometric turnstiles for instant exit clearance.`,
  },
  {
    keywords: ['appliance', 'electricity', 'iron', 'heater', 'induction', 'power'],
    reply: `**Electrical Appliances & Room Power Cap:**
• Permitted in rooms: Laptop chargers, mobile chargers, personal study lamps, and electric mosquito repellents.
• **Strictly Prohibited**: Induction hotplates, immersion heating rods, electric room heaters, and high-wattage kettles (> 500W).
• Electric irons are strictly permitted only at the dedicated ironing stations in the **Laundry Hub** to eliminate fire hazards.`,
  },
  {
    keywords: ['silence', 'noise', 'study', 'quiet', 'music'],
    reply: `**Campus Silence Hours:**
• Official silence hours are observed campus-wide from **10:30 PM to 06:00 AM**.
• Loud music, group corridor gatherings, or disruptive noise during these hours are strictly barred to respect roommate sleep and academic study schedules.
• For midnight group study, the **Block B 24-Hour Study Lounge** remains illuminated and open.`,
  },
  {
    keywords: ['mess', 'food', 'diet', 'meal', 'lunch', 'dinner', 'breakfast'],
    reply: `**Dining Hall Timings & Catering Protocols:**
• **Breakfast**: 07:30 AM – 09:30 AM
• **Lunch**: 12:30 PM – 02:30 PM
• **Evening Snacks & Tea**: 04:30 PM – 05:45 PM
• **Dinner**: 07:30 PM – 09:30 PM
• Food is freshly prepared per the daily rotating menu. Non-veg and special diet feasts are served on Wednesdays and Sundays. Special sick-diet (kanji / hot soup) can be requested via the Mess Warden.`,
  },
  {
    keywords: ['laundry', 'wash', 'clothes', 'ironing', 'pickup'],
    reply: `**Laundry Hub Guidelines:**
• **Zero Billing**: Laundry services are 100% included in your annual hostel establishment fee!
• Students are entitled to up to **3 washes per week** (up to 8 items per request).
• Place clothes inside your numbered Vidudhi laundry mesh bag before dropping at the collection chute.
• Normal turnaround time is **24 to 36 hours**. You will receive an in-app notification when your clothes are marked "Ready for Pickup".`,
  },
  {
    keywords: ['motivat', 'stress', 'study', 'exam', 'tired', 'focus', 'anxious', 'routine'],
    reply: `**Academic Wellness & Motivational Spark:**
• *"You don't have to be great to start, but you have to start to be great."*
• **Smart Study Technique**: Try the 50-10 Pomodoro rule — 50 minutes of deep distraction-free study, followed by a 10-minute walk to the hostel courtyard.
• **Brain Health**: Stay hydrated from the floor RO station and aim for at least 7 hours of sleep before university exams.
• Need a mental reset? Borrow a badminton racket from the Facilities Hub or take an evening jog around the campus quadrangle!`,
  },
]

const PROMPT_SUGGESTIONS = [
  'What are the campus gate closing timings?',
  'Can a friend stay overnight in my room?',
  'How do I apply for a weekend gate outpass?',
  'What are the rules for electrical appliances?',
  'Give me a motivational study tip for exams',
  'What are the mess meal timings and diet types?',
]

export default function Copilot() {
  const user = useSelector(selectUser)
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'bot',
      text: `Hello ${user.name.split(' ')[0]}! I am your **Vidudhi AI Hostel Copilot**.\n\nYou can ask me about campus rules, gate curfew, mess dining schedules, laundry turnarounds, outpasses, or ask for study motivation tips during exam weeks. How can I help you today?`,
      timestamp: 'Just now',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const findBestReply = (query) => {
    const q = query.toLowerCase()
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some((k) => q.includes(k))) {
        return item.reply
      }
    }
    return `**Hostel Copilot Assistance:**
I noted your question about *"${query}"*.

• For official accommodation rules, refer to the **Hostel Resident Handbook** or contact the Chief Warden desk at +91 94440 01101.
• For maintenance issues in your room, you can directly submit a ticket under the **Complaints** tab.
• Feel free to ask about gate curfew, leave outpasses, mess menus, or request a motivational spark!`
  }

  const handleSend = (textToSend) => {
    const userText = textToSend || input
    if (!userText.trim()) return

    const userMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInput('')
    setIsTyping(true)

    // Simulate natural AI thinking & response streaming
    setTimeout(() => {
      const botResponse = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: findBestReply(userText),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 700)
  }

  return (
    <div className="page" style={{ height: 'calc(100vh - 84px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent-border)' }}>
            <Sparkles size={13} /> Context-Aware Campus Assistant
          </span>
          <h1>AI Hostel Copilot</h1>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-ok" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span className="badge-dot" /> Rulebook &amp; Wellness Active
          </span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div
        className="panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}
      >
        {/* Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: 12,
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
              }}
            >
              {m.sender === 'bot' && (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-border)',
                    color: 'var(--accent-border)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={18} />
                </div>
              )}

              <div
                style={{
                  background: m.sender === 'user' ? 'var(--accent)' : 'var(--surface-2)',
                  color: m.sender === 'user' ? 'var(--accent-ink)' : 'var(--ink)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  boxShadow: 'var(--shadow-tag)',
                  whiteSpace: 'pre-line',
                }}
              >
                {m.text}
                <div
                  style={{
                    fontSize: 10.5,
                    marginTop: 6,
                    color: m.sender === 'user' ? 'rgba(11, 37, 4, 0.7)' : 'var(--ink-faint)',
                    textAlign: 'right',
                  }}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', alignSelf: 'flex-start' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent-border)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Bot size={16} />
              </div>
              <div
                style={{
                  background: 'var(--surface-2)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  color: 'var(--ink-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Sparkles size={13} className="spin-slow" color="var(--accent-border)" />
                <span>Copilot is searching hostel rulebook…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div
          style={{
            padding: '8px 18px',
            background: 'var(--bg-alt)',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {PROMPT_SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => handleSend(s)}
              style={{ fontSize: 11.5, padding: '4px 10px', background: 'var(--surface)', borderRadius: 16 }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Text Input Box */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend() }}
          style={{
            display: 'flex',
            gap: 10,
            padding: '12px 18px',
            background: 'var(--surface)',
            borderTop: '1px solid var(--line)',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about hostel rules, mess timings, gate outpasses, or exam motivation…"
            style={{
              flex: 1,
              padding: '11px 15px',
              borderRadius: 8,
              border: '1px solid var(--line)',
              background: 'var(--surface-2)',
              fontSize: 13.5,
              color: 'var(--ink)',
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }} disabled={!input.trim()}>
            <Send size={15} /> Send
          </button>
        </form>
      </div>
    </div>
  )
}
