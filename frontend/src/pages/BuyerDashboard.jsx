import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function BuyerDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({ total_orders: 0, total_spent: 0, pending_orders: 0 })
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    api.get('/buyer/stats'),
                    api.get('/buyer/orders')
                ])
                setStats(statsRes.data)
                setOrders(ordersRes.data.orders.slice(0, 5))
            } catch { }
            setLoading(false)
        }
        fetchData()
    }, [])

    const statusColor = s => ({ Pending: 'badge-amber', Confirmed: 'badge-blue', Shipped: 'badge-green', Delivered: 'badge-green' }[s] || 'badge-gray')

    if (loading) return <div className="loading-center"><div className="spinner"></div><span>Loading…</span></div>

    return (
        <div className="page-container animate-fade">
            <h1 className="page-title">Buyer Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user?.name}! Find fresh crops and track your orders.</p>

            <div className="stats-grid" style={{ marginBottom: 32 }}>
                <div className="stat-card"><div className="stat-value">{stats.total_orders}</div><div className="stat-label">📦 Total Orders</div></div>
                <div className="stat-card"><div className="stat-value">₹{stats.total_spent.toLocaleString()}</div><div className="stat-label">💳 Total Spent</div></div>
                <div className="stat-card"><div className="stat-value">{stats.pending_orders}</div><div className="stat-label">⏳ Pending Orders</div></div>
            </div>

            <h2 className="section-title" style={{ marginBottom: 16 }}>🚀 Quick Actions</h2>
            <div className="quick-links" style={{ marginBottom: 36 }}>
                <Link to="/buyer/marketplace" className="quick-link-card"><span className="quick-link-icon">🛒</span><span className="quick-link-label">Browse Marketplace</span></Link>
                <Link to="/buyer/orders" className="quick-link-card"><span className="quick-link-icon">📦</span><span className="quick-link-label">My Orders</span></Link>
            </div>

            <div className="section-header">
                <h2 className="section-title">📦 Recent Orders</h2>
                <Link to="/buyer/orders" className="btn btn-secondary btn-sm">View All →</Link>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🛒</div>
                    <div className="empty-title">No orders yet</div>
                    <div className="empty-desc">Head to the marketplace to purchase your first crop!</div>
                    <Link to="/buyer/marketplace" className="btn btn-primary">🛒 Browse Marketplace</Link>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>Order</th><th>Crop</th><th>Farmer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{o.id}</td>
                                    <td style={{ fontWeight: 600 }}>{o.crop_name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{o.farmer_name}</td>
                                    <td style={{ color: 'var(--green-400)', fontWeight: 700 }}>₹{o.total_price}</td>
                                    <td><span className={`badge ${o.payment_status === 'Paid' ? 'badge-green' : 'badge-amber'}`}>{o.payment_status}</span></td>
                                    <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {o.payment_status === 'Unpaid' && (
                                                <Link to={`/buyer/payment/${o.id}`} className="btn btn-primary btn-sm">💳 Pay</Link>
                                            )}
                                            {o.transport_needed === false && o.payment_status === 'Paid' && !o.transport && (
                                                <Link to={`/buyer/transport/${o.id}`} className="btn btn-secondary btn-sm">🚚 Book</Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
