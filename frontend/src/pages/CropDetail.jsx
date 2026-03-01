import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const CROP_EMOJI = {
    Vegetables: '🥬', Fruits: '🍎', Grains: '🌾', Pulses: '🫘', Spices: '🌶️', Oilseeds: '🌻', General: '🌿'
}

export default function CropDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [crop, setCrop] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [transport, setTransport] = useState(false)
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(true)
    const [ordering, setOrdering] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get(`/buyer/crops/${id}`)
            .then(r => { setCrop(r.data.crop); setLoading(false) })
            .catch(() => setLoading(false))
    }, [id])

    const handlePurchase = async () => {
        setError('')
        if (quantity <= 0) { setError('Quantity must be greater than 0'); return }
        if (transport && !address.trim()) { setError('Please enter a delivery address for transport'); return }
        setOrdering(true)
        try {
            const res = await api.post('/buyer/purchase', {
                crop_id: parseInt(id),
                quantity,
                transport_needed: transport,
                delivery_address: address
            })
            navigate(`/buyer/payment/${res.data.order.id}`)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to place order')
        }
        setOrdering(false)
    }

    if (loading) return <div className="loading-center"><div className="spinner"></div><span>Loading crop details…</span></div>
    if (!crop) return <div className="page-container"><div className="empty-state"><div className="empty-icon">❌</div><div className="empty-title">Crop not found</div></div></div>

    const total = (quantity * crop.price).toFixed(2)

    return (
        <div className="page-container animate-fade">
            <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>← Back</button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
                {/* Left - Crop Info */}
                <div>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 20 }}>
                        {crop.image_path ? (
                            <img src={crop.image_path} alt={crop.name} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
                        ) : (
                            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', background: 'linear-gradient(135deg, var(--green-900), var(--gray-800))' }}>
                                {CROP_EMOJI[crop.category] || '🌿'}
                            </div>
                        )}
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>{crop.name}</h1>
                                <span className="badge badge-green">{crop.category}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-400)' }}>₹{crop.price}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>per {crop.unit}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>AVAILABLE</div>
                                <div style={{ fontWeight: 700 }}>{crop.quantity} {crop.unit}</div>
                            </div>
                            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>LOCATION</div>
                                <div style={{ fontWeight: 700 }}>📍 {crop.location}</div>
                            </div>
                            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>FARMER</div>
                                <div style={{ fontWeight: 700 }}>👨‍🌾 {crop.farmer_name}</div>
                            </div>
                            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>LISTED ON</div>
                                <div style={{ fontWeight: 700 }}>{new Date(crop.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {crop.description && (
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Description</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{crop.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right - Purchase Form */}
                <div className="card">
                    <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 20 }}>🛒 Place Order</h2>

                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Quantity ({crop.unit})</label>
                        <input
                            className="form-input"
                            type="number"
                            min="0.1"
                            max={crop.quantity}
                            step="0.1"
                            value={quantity}
                            onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
                        />
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Max: {crop.quantity} {crop.unit}</div>
                    </div>

                    <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span>Price per {crop.unit}</span><span>₹{crop.price}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span>Quantity</span><span>{quantity} {crop.unit}</span>
                        </div>
                        <hr className="divider" style={{ margin: '8px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}>
                            <span>Total</span><span style={{ color: 'var(--green-400)' }}>₹{total}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer' }} onClick={() => setTransport(t => !t)}>
                            <div style={{
                                width: 22, height: 22, borderRadius: 6, border: '2px solid',
                                borderColor: transport ? 'var(--green-500)' : 'var(--border-color)',
                                background: transport ? 'var(--green-600)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s',
                                flexShrink: 0
                            }}>
                                {transport && <span style={{ color: 'white', fontSize: '0.75rem' }}>✓</span>}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>🚚 Book Transportation</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Optional — arrange delivery to your address</div>
                            </div>
                        </div>

                        {transport && (
                            <div className="form-group" style={{ marginTop: 12 }}>
                                <label className="form-label">Delivery Address *</label>
                                <textarea
                                    className="form-input"
                                    rows={2}
                                    placeholder="Enter your full delivery address…"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <button className="btn btn-primary btn-full btn-lg" onClick={handlePurchase} disabled={ordering || quantity <= 0}>
                        {ordering ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Placing Order…</> : '🛒 Place Order & Pay'}
                    </button>

                    <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        🔒 Secure transaction — You will be redirected to payment
                    </div>
                </div>
            </div>
        </div>
    )
}
