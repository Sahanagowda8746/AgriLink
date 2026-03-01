import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function FarmerDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({ total_crops: 0, total_orders: 0, total_revenue: 0 })
    const [orders, setOrders] = useState([])
    const [crops, setCrops] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('crops')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, cropsRes, ordersRes] = await Promise.all([
                    api.get('/farmer/stats'),
                    api.get('/farmer/crops'),
                    api.get('/farmer/orders')
                ])
                setStats(statsRes.data)
                setCrops(cropsRes.data.crops)
                setOrders(ordersRes.data.orders)
            } catch { }
            setLoading(false)
        }
        fetchData()
    }, [])

    const handleDeleteCrop = async (id) => {
        if (!confirm('Delete this crop?')) return
        try {
            await api.delete(`/farmer/crops/${id}`)
            setCrops(c => c.filter(x => x.id !== id))
        } catch { }
    }

    const statusColor = s => ({ Pending: 'badge-amber', Confirmed: 'badge-blue', Shipped: 'badge-green', Delivered: 'badge-green' }[s] || 'badge-gray')

    if (loading) return <div className="loading-center"><div className="spinner"></div><span>Loading dashboard…</span></div>

    return (
        <div className="page-container animate-fade">
            <h1 className="page-title">Farmer Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user?.name}! Manage your crops and orders.</p>

            <div className="stats-grid" style={{ marginBottom: 32 }}>
                <div className="stat-card"><div className="stat-value">{stats.total_crops}</div><div className="stat-label">🌾 Total Crops</div></div>
                <div className="stat-card"><div className="stat-value">{stats.total_orders}</div><div className="stat-label">📦 Orders Received</div></div>
                <div className="stat-card"><div className="stat-value">₹{stats.total_revenue.toLocaleString()}</div><div className="stat-label">💰 Revenue Earned</div></div>
            </div>

            <div className="section-header" style={{ marginBottom: 16 }}>
                <h2 className="section-title">🚀 Quick Actions</h2>
            </div>
            <div className="quick-links" style={{ marginBottom: 36 }}>
                <Link to="/farmer/add-crop" className="quick-link-card"><span className="quick-link-icon">➕</span><span className="quick-link-label">Add New Crop</span></Link>
                <Link to="/farmer/disease" className="quick-link-card"><span className="quick-link-icon">🔬</span><span className="quick-link-label">Disease Detection</span></Link>
                <Link to="/farmer/demand" className="quick-link-card"><span className="quick-link-icon">📈</span><span className="quick-link-label">Demand Forecast</span></Link>
            </div>

            <div className="tabs">
                <button className={`tab ${activeTab === 'crops' ? 'active' : ''}`} onClick={() => setActiveTab('crops')}>🌾 My Crops ({crops.length})</button>
                <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📦 Orders ({orders.length})</button>
            </div>

            {activeTab === 'crops' && (
                <>
                    {crops.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🌱</div>
                            <div className="empty-title">No crops listed yet</div>
                            <div className="empty-desc">Start by adding your first crop to reach buyers.</div>
                            <Link to="/farmer/add-crop" className="btn btn-primary">➕ Add First Crop</Link>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Crop</th><th>Category</th><th>Price</th><th>Quantity</th><th>Location</th><th>Date</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {crops.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: 600 }}>{c.name}</td>
                                            <td><span className="badge badge-green">{c.category}</span></td>
                                            <td style={{ color: 'var(--green-400)', fontWeight: 700 }}>₹{c.price}/{c.unit}</td>
                                            <td>{c.quantity} {c.unit}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>📍 {c.location}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                            <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteCrop(c.id)}>🗑️</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'orders' && (
                <>
                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <div className="empty-title">No orders yet</div>
                            <div className="empty-desc">Orders from buyers will appear here.</div>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr><th>Order ID</th><th>Crop</th><th>Buyer</th><th>Qty</th><th>Amount</th><th>Payment</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{o.id}</td>
                                            <td style={{ fontWeight: 600 }}>{o.crop_name}</td>
                                            <td>{o.buyer_name}</td>
                                            <td>{o.quantity}</td>
                                            <td style={{ color: 'var(--green-400)', fontWeight: 700 }}>₹{o.total_price}</td>
                                            <td><span className={`badge ${o.payment_status === 'Paid' ? 'badge-green' : 'badge-amber'}`}>{o.payment_status}</span></td>
                                            <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
