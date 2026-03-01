import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
    const [params] = useSearchParams()
    const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') || 'farmer' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!form.name || !form.email || !form.password) { setError('All fields are required'); return }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
        setLoading(true)
        try {
            const res = await api.post('/auth/signup', form)
            login(res.data.user, res.data.token)
            navigate(form.role === 'farmer' ? '/farmer' : '/buyer')
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.')
        }
        setLoading(false)
    }

    return (
        <div className="auth-page">
            <div className="auth-card animate-slide">
                <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: 8 }}>🌾</div>
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join AgriLink and start trading crops directly</p>

                <div className="role-selector">
                    {[{ val: 'farmer', icon: '👨‍🌾', label: 'Farmer' }, { val: 'buyer', icon: '🛍️', label: 'Buyer' }].map(r => (
                        <div
                            key={r.val}
                            className={`role-option ${form.role === r.val ? 'selected' : ''}`}
                            onClick={() => setForm(f => ({ ...f, role: r.val }))}
                        >
                            <span className="role-option-icon">{r.icon}</span>
                            <div className="role-option-label">{r.label}</div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error">{error}</div>}
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" placeholder="Enter your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Creating Account…</> : `Create ${form.role === 'farmer' ? 'Farmer' : 'Buyer'} Account`}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/signin" style={{ color: 'var(--green-400)', fontWeight: 600 }}>Sign In</Link>
                </p>
            </div>
        </div>
    )
}
