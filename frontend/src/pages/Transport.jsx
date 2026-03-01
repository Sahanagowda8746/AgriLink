import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Transport() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [address, setAddress] = useState('')
    const [vehicleType, setVehicleType] = useState('Truck')
    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState(false)
    const [error, setError] = useState('')
    const [booked, setBooked] = useState(null)

    useEffect(() => {
        api.get('/buyer/orders')
            .then(r => {
                const o = r.data.orders.find(x => x.id === parseInt(orderId))
                setOrder(o)
                if (o?.delivery_address) setAddress(o.delivery_address)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [orderId])

    const handleBook = async () => {
        if (!address.trim()) { setError('Delivery address is required'); return }
        setBooking(true); setError('')
        try {
            const res = await api.post(`/buyer/transport/${orderId}`, { delivery_address: address, vehicle_type: vehicleType })
            setBooked(res.data.transport)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to book transport')
        }
        setBooking(false)
    }

    if (loading) return <div className="loading-center"><div className="spinner"></div></div>

    return (
        <div className="page-container animate-fade" style={{ maxWidth: 640 }}>
            <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate('/buyer/orders')}>← Back to Orders</button>
            <h1 className="page-title">🚚 Book Transportation</h1>
            <p className="page-subtitle">Arrange delivery of your order #{orderId}</p>

            {booked ? (
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                    <h2 style={{ fontWeight: 800, marginBottom: 8, color: 'var(--green-400)' }}>Transport Booked!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your delivery has been scheduled successfully.</p>
                    <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'left' }}>
                        {[
                            { label: 'Driver', value: `${booked.driver_name} (${booked.driver_phone})` },
                            { label: 'Vehicle', value: booked.vehicle_type },
                            { label: 'Delivery To', value: booked.delivery_address },
                            { label: 'Estimated Delivery', value: booked.estimated_delivery },
                            { label: 'Status', value: booked.status },
                        ].map(d => (
                            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
                                <span style={{ fontWeight: 600 }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary btn-full" onClick={() => navigate('/buyer/orders')}>View All Orders →</button>
                </div>
            ) : (
                <div className="card">
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Vehicle Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            {['Truck', 'Mini Truck', 'Tempo'].map(v => (
                                <div
                                    key={v}
                                    className={`payment-method ${vehicleType === v ? 'selected' : ''}`}
                                    style={{ justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: 12 }}
                                    onClick={() => setVehicleType(v)}
                                >
                                    <div style={{ fontSize: '1.5rem' }}>{v === 'Truck' ? '🚛' : v === 'Mini Truck' ? '🚚' : '🛻'}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: 4 }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Delivery Address *</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            placeholder="Enter your complete delivery address including city, state, PIN..."
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        🚛 Estimated delivery: <strong style={{ color: 'var(--text-primary)' }}>2-3 business days</strong><br />
                        👨‍✈️ Our professional driver will contact you before delivery.
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-secondary" onClick={() => navigate('/buyer/orders')}>Skip Transport</button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBook} disabled={booking}>
                            {booking ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Booking…</> : '🚚 Book Transport'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
