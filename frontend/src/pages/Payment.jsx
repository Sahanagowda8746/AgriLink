import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const PAYMENT_METHODS = [
    { id: 'upi', icon: '📱', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', icon: '💳', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', icon: '🏦', label: 'Net Banking', desc: 'All major banks supported' },
    { id: 'cod', icon: '💵', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
]

export default function Payment() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [method, setMethod] = useState('upi')
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)
    const [step, setStep] = useState(1) // 1=select, 2=confirm, 3=done

    useEffect(() => {
        api.get('/buyer/orders')
            .then(r => {
                const o = r.data.orders.find(x => x.id === parseInt(orderId))
                setOrder(o)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [orderId])

    const handlePay = async () => {
        setPaying(true); setError('')
        try {
            const res = await api.post(`/buyer/payment/${orderId}`, { payment_method: method })
            setSuccess(res.data)
            setStep(3)
        } catch (err) {
            setError(err.response?.data?.error || 'Payment failed. Please try again.')
        }
        setPaying(false)
    }

    if (loading) return <div className="loading-center"><div className="spinner"></div></div>
    if (!order) return <div className="page-container"><div className="empty-state"><div className="empty-icon">❌</div><div className="empty-title">Order not found</div></div></div>

    return (
        <div className="page-container animate-fade" style={{ maxWidth: 600 }}>
            <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>← Back</button>
            <h1 className="page-title">💳 Payment</h1>
            <p className="page-subtitle">Complete your secure payment</p>

            {/* Progress steps */}
            <div className="steps" style={{ marginBottom: 32 }}>
                {['Select Method', 'Confirm', 'Done'].map((s, i) => (
                    <React.Fragment key={s}>
                        <div className="step-item">
                            <div className={`step-circle ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: step === i + 1 ? 'var(--green-400)' : 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
                        </div>
                        {i < 2 && <div className={`step-line ${step > i + 1 ? 'done' : ''}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            {step === 3 && success ? (
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 16, animation: 'fadeIn 0.5s ease' }}>✅</div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--green-400)', marginBottom: 8 }}>Payment Successful!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your order has been confirmed.</p>
                    <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
                        {[
                            { label: 'Transaction ID', value: success.transaction_id },
                            { label: 'Amount Paid', value: `₹${success.amount}` },
                            { label: 'Payment Method', value: PAYMENT_METHODS.find(m => m.id === method)?.label || method },
                            { label: 'Order Status', value: success.order.status },
                        ].map(d => (
                            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
                                <span style={{ fontWeight: 700 }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                    {!order.transport_needed && (
                        <button className="btn btn-secondary btn-full" style={{ marginBottom: 12 }} onClick={() => navigate(`/buyer/transport/${orderId}`)}>
                            🚚 Book Transport (Optional)
                        </button>
                    )}
                    <button className="btn btn-primary btn-full" onClick={() => navigate('/buyer/orders')}>
                        📦 View My Orders →
                    </button>
                </div>
            ) : (
                <div className="card">
                    {error && <div className="alert alert-error">{error}</div>}

                    {/* Order summary */}
                    <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                        <div style={{ fontWeight: 700, marginBottom: 12 }}>Order Summary</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span>Crop</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.crop_name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span>Quantity</span><span>{order.quantity}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                            <span>Total Amount</span><span style={{ color: 'var(--green-400)' }}>₹{order.total_price}</span>
                        </div>
                    </div>

                    {step === 1 && (
                        <>
                            <div style={{ fontWeight: 700, marginBottom: 12 }}>Select Payment Method</div>
                            {PAYMENT_METHODS.map(m => (
                                <div key={m.id} className={`payment-method ${method === m.id ? 'selected' : ''}`} onClick={() => setMethod(m.id)}>
                                    <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{m.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.desc}</div>
                                    </div>
                                    {method === m.id && <span style={{ marginLeft: 'auto', color: 'var(--green-400)' }}>✓</span>}
                                </div>
                            ))}
                            <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={() => setStep(2)}>
                                Continue →
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: '3rem', marginBottom: 10 }}>{PAYMENT_METHODS.find(m => m.id === method)?.icon}</div>
                                <div style={{ fontWeight: 700 }}>{PAYMENT_METHODS.find(m => m.id === method)?.label}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paying ₹{order.total_price} for {order.crop_name}</div>
                            </div>
                            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: '0.85rem', color: 'var(--amber-400)' }}>
                                ⚠️ This is a simulated payment for demonstration purposes. No real transaction occurs.
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePay} disabled={paying}>
                                    {paying ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Processing…</> : `💳 Pay ₹${order.total_price}`}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// Need React for Fragment in JSX
import React from 'react'
