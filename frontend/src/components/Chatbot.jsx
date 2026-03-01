import { useState, useRef, useEffect } from 'react'
import api from '../api'

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
]

export default function Chatbot() {
    const [open, setOpen] = useState(false)
    const [lang, setLang] = useState('en')
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! Welcome to AgriLink. How can I help you today? 🌾' }
    ])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleLangChange = (e) => {
        const newLang = e.target.value
        setLang(newLang)
        const greetings = {
            en: 'Hello! Welcome to AgriLink. How can I help you? 🌾',
            kn: 'ನಮಸ್ಕಾರ! AgriLink ಗೆ ಸ್ವಾಗತ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? 🌾',
            hi: 'नमस्ते! AgriLink में आपका स्वागत है। मैं कैसे मदद करूं? 🌾',
            te: 'నమస్కారం! AgriLink కి స్వాగతం. నేను ఎలా సహాయం చేయగలను? 🌾',
        }
        setMessages([{ role: 'bot', text: greetings[newLang] }])
    }

    const sendMessage = async () => {
        if (!input.trim() || sending) return
        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setSending(true)
        try {
            const res = await api.post('/chatbot', { message: userMsg, language: lang })
            setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }])
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I could not connect. Please try again.' }])
        }
        setSending(false)
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    return (
        <>
            {open && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-avatar">🌾</div>
                        <div>
                            <div className="chatbot-name">AgriBot</div>
                            <div className="chatbot-status">● Online • Multilingual</div>
                        </div>
                        <select className="chatbot-lang-select" value={lang} onChange={handleLangChange}>
                            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                        </select>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
                        ))}
                        {sending && <div className="chat-msg bot" style={{ animation: 'pulse 1s infinite' }}>Typing…</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <input
                            className="chatbot-input"
                            placeholder="Type a message..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                        />
                        <button className="chatbot-send" onClick={sendMessage} disabled={sending}>➤</button>
                    </div>
                </div>
            )}
            <button className="chatbot-toggle" onClick={() => setOpen(o => !o)} title="AgriBot">
                {open ? '✕' : '💬'}
            </button>
        </>
    )
}
