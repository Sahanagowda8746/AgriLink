import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Oilseeds', 'General']

const CROP_EMOJI = {
    Vegetables: '🥬', Fruits: '🍎', Grains: '🌾', Pulses: '🫘', Spices: '🌶️', Oilseeds: '🌻', General: '🌿'
}

export default function Marketplace({ publicView }) {
    const [crops, setCrops] = useState([])
    const [search, setSearch] = useState('')
    const [location, setLocation] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [loading, setLoading] = useState(true)

    const fetchCrops = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (location) params.append('location', location)
            if (selectedCategory !== 'All') params.append('category', selectedCategory)
            const res = await api.get(`/buyer/marketplace?${params}`)
            setCrops(res.data.crops)
        } catch { }
        setLoading(false)
    }

    useEffect(() => { fetchCrops() }, [selectedCategory])

    const handleSearch = (e) => { e.preventDefault(); fetchCrops() }

    return (
        <div className="page-container animate-fade">
            <h1 className="page-title">🛒 Marketplace</h1>
            <p className="page-subtitle">Discover fresh crops directly from farmers across India</p>

            <form className="search-bar" onSubmit={handleSearch}>
                <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                        className="search-input"
                        placeholder="Search crops by name…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="search-input-wrap" style={{ maxWidth: 240 }}>
                    <span className="search-icon">📍</span>
                    <input
                        className="search-input"
                        placeholder="Filter by location…"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat !== 'All' && CROP_EMOJI[cat]} {cat}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="loading-center"><div className="spinner"></div><span>Loading crops…</span></div>
            )}

            {!loading && crops.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🌾</div>
                    <div className="empty-title">No crops found</div>
                    <div className="empty-desc">Try adjusting your search or category filter.</div>
                </div>
            )}

            {!loading && crops.length > 0 && (
                <>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                        Showing {crops.length} crop{crops.length !== 1 ? 's' : ''}
                    </div>
                    <div className="crops-grid">
                        {crops.map(crop => (
                            <div key={crop.id} className="crop-card">
                                <div className="crop-card-img">
                                    {crop.image_path
                                        ? <img src={crop.image_path} alt={crop.name} />
                                        : <span>{CROP_EMOJI[crop.category] || '🌿'}</span>
                                    }
                                </div>
                                <div className="crop-card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <div className="crop-card-name">{crop.name}</div>
                                        <span className="badge badge-green" style={{ fontSize: '0.7rem', flexShrink: 0 }}>{crop.category}</span>
                                    </div>
                                    <div className="crop-card-location">📍 {crop.location}</div>
                                    <div className="crop-card-price">₹{crop.price}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/{crop.unit}</span></div>
                                    <div className="crop-card-qty">Available: {crop.quantity} {crop.unit}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {crop.farmer_name}</span>
                                        {publicView ? (
                                            <Link to="/signin" className="btn btn-primary btn-sm">Buy Now</Link>
                                        ) : (
                                            <Link to={`/buyer/crop/${crop.id}`} className="btn btn-primary btn-sm">View →</Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
