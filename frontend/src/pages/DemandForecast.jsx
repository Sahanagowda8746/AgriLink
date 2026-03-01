import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import api from '../api'

const CATEGORIES = ['General', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Oilseeds']

export default function DemandForecast() {
    const [category, setCategory] = useState('Vegetables')
    const [forecast, setForecast] = useState(null)
    const [allCats, setAllCats] = useState([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('chart')

    const fetchForecast = async (cat) => {
        setLoading(true)
        try {
            const [forecastRes, allRes] = await Promise.all([
                api.get(`/ml/demand?category=${cat}`),
                api.get('/ml/demand/all')
            ])
            setForecast(forecastRes.data.forecast)
            setAllCats(allRes.data.categories)
        } catch { }
        setLoading(false)
    }

    useEffect(() => { fetchForecast(category) }, [])

    const handleCategoryChange = (cat) => {
        setCategory(cat)
        fetchForecast(cat)
    }

    const trendColor = t => t === 'Rising' ? 'var(--green-400)' : t === 'Falling' ? 'var(--red-500)' : 'var(--amber-400)'
    const trendIcon = t => t === 'Rising' ? '📈' : t === 'Falling' ? '📉' : '➡️'

    return (
        <div className="page-container animate-fade">
            <h1 className="page-title">📈 Demand Forecasting</h1>
            <p className="page-subtitle">AI-powered 12-month crop demand predictions to help you plan better</p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => handleCategoryChange(cat)}
                    >{cat}</button>
                ))}
            </div>

            {loading && <div className="loading-center"><div className="spinner"></div><span>Generating forecast…</span></div>}

            {!loading && forecast && (
                <>
                    <div className="stats-grid" style={{ marginBottom: 24 }}>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: trendColor(forecast.trend) }}>
                                {trendIcon(forecast.trend)} {forecast.trend}
                            </div>
                            <div className="stat-label">Current Trend</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{forecast.current_demand_index}/100</div>
                            <div className="stat-label">Current Demand Index</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{forecast.best_selling_months?.join(', ')}</div>
                            <div className="stat-label">Best Selling Months</div>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 16, background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.2)' }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>💡 Market Insight</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 10 }}>{forecast.insight}</p>
                        <div style={{ color: 'var(--green-400)', fontWeight: 600, fontSize: '0.9rem' }}>🎯 {forecast.recommended_price_action}</div>
                    </div>

                    <div className="tabs">
                        <button className={`tab ${activeTab === 'chart' ? 'active' : ''}`} onClick={() => setActiveTab('chart')}>📈 Line Chart</button>
                        <button className={`tab ${activeTab === 'bar' ? 'active' : ''}`} onClick={() => setActiveTab('bar')}>📊 Bar Chart</button>
                        <button className={`tab ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>⚖️ Category Comparison</button>
                    </div>

                    {activeTab !== 'compare' && (
                        <div className="card">
                            <h3 style={{ marginBottom: 20, fontWeight: 700 }}>12-Month Demand Forecast — {category}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                {activeTab === 'chart' ? (
                                    <LineChart data={forecast.forecast}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 100]} stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }}
                                            labelStyle={{ color: 'var(--text-primary)' }}
                                            formatter={(v, n) => [v, 'Demand Index']}
                                        />
                                        <Line type="monotone" dataKey="demand_index" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 7 }} />
                                    </LineChart>
                                ) : (
                                    <BarChart data={forecast.forecast}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 100]} stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }}
                                            formatter={(v) => [v, 'Demand Index']}
                                        />
                                        <Bar dataKey="demand_index" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}

                    {activeTab === 'compare' && (
                        <div className="card">
                            <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Current Demand — All Categories</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {allCats.map(cat => (
                                    <div key={cat.category}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.category}</span>
                                            <span style={{ color: 'var(--green-400)', fontWeight: 700 }}>{cat.demand_index} <span className={`badge badge-${cat.label.includes('High') ? 'green' : cat.label.includes('Low') ? 'red' : 'amber'}`} style={{ fontSize: '0.7rem' }}>{cat.label}</span></span>
                                        </div>
                                        <div className="confidence-bar">
                                            <div className="confidence-fill" style={{ width: `${cat.demand_index}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
