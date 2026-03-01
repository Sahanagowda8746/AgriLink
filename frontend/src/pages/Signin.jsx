import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function Signin() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/auth/signin', form)
            login(res.data.user, res.data.token)
            navigate(res.data.user.role === 'farmer' ? '/farmer' : '/buyer')
        } catch (err) {
            setError(err.response?.data?.error || 'Sign in failed. Check your credentials.')
        }
        setLoading(false)
    }

    return (
        <div className="auth-page">
            <div className="auth-card animate-slide">
                <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: 8 }}>🌾</div>
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your AgriLink account</p>

                <div className="alert alert-info" style={{ fontSize: '0.8rem' }}>
                    <strong>Demo accounts:</strong><br />
                    👨‍🌾 Farmer: farmer@demo.com / password123<br />
                    🛍️ Buyer: buyer@demo.com / password123
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error">{error}</div>}
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="Your password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Signing In…</> : 'Sign In →'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--green-400)', fontWeight: 600 }}>Sign Up</Link>
                </p>
            </div>
        </div>
    )
}
