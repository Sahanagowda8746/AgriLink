import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function OrderStatus() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')

    useEffect(() => {
        api.get('/buyer/orders')
            .then(r => { setOrders(r.data.orders); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const STATUSES = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered']

    const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)

    const statusColor = s => ({ Pending: 'badge-amber', Confirmed: 'badge-blue', Shipped: 'badge-green', Delivered: 'badge-green' }[s] || 'badge-gray')
    const statusIcon = s => ({ Pending: '⏳', Confirmed: '✅', Shipped: '🚚', Delivered: '📦' }[s] || '📋')

    if (loading) return <div className="loading-center"><div className="spinner"></div><span>Loading orders…</span></div>

    return (
        <div className="page-container animate-fade">
            <h1 className="page-title">📦 My Orders</h1>
            <p className="page-subtitle">Track all your crop purchases and deliveries</p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                    <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(s)}>{s}</button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <div className="empty-title">No orders found</div>
                    <div className="empty-desc">{filter !== 'All' ? `No ${filter} orders.` : 'You have not placed any orders yet.'}</div>
                    <Link to="/buyer/marketplace" className="btn btn-primary">🛒 Browse Marketplace</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {filtered.map(order => (
                        <div key={order.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{order.crop_name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Order #{order.id} • {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className={`badge ${statusColor(order.status)}`}>{statusIcon(order.status)} {order.status}</span>
                                    <span className={`badge ${order.payment_status === 'Paid' ? 'badge-green' : 'badge-amber'}`}>
                                        {order.payment_status === 'Paid' ? '✅ Paid' : '💳 Unpaid'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
                                {[
                                    { label: 'Quantity', value: order.quantity },
                                    { label: 'Total Amount', value: `₹${order.total_price}`, highlight: true },
                                    { label: 'Farmer', value: order.farmer_name },
                                    { label: 'Transport', value: order.transport_needed ? '🚚 Requested' : '—' },
                                ].map(d => (
                                    <div key={d.label} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.label}</div>
                                        <div style={{ fontWeight: 700, color: d.highlight ? 'var(--green-400)' : 'var(--text-primary)', fontSize: d.highlight ? '1rem' : '0.9rem' }}>{d.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Transport info */}
                            {order.transport && (
                                <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: '0.85rem' }}>
                                    <strong style={{ color: '#93c5fd', display: 'block', marginBottom: 6 }}>🚚 Transport Details</strong>
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                        Driver: {order.transport.driver_name} • Vehicle: {order.transport.vehicle_type} • Status: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.transport.status}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                                        📍 Delivery to: {order.transport.delivery_address} • ETA: {order.transport.estimated_delivery}
                                    </div>
                                </div>
                            )}

                            {/* Delivery address */}
                            {order.delivery_address && !order.transport && (
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
                                    📍 Delivery: {order.delivery_address}
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {order.payment_status === 'Unpaid' && (
                                    <Link to={`/buyer/payment/${order.id}`} className="btn btn-primary btn-sm">💳 Pay Now</Link>
                                )}
                                {order.payment_status === 'Paid' && !order.transport && (
                                    <Link to={`/buyer/transport/${order.id}`} className="btn btn-secondary btn-sm">🚚 Book Transport</Link>
                                )}
                                {order.transport && (
                                    <span style={{ fontSize: '0.85rem', color: 'var(--green-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        ✅ Transport booked
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
