import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Oilseeds', 'General']
const UNITS = ['kg', 'quintal', 'ton', 'dozen', 'bag', 'litre']

export default function AddCrop() {
    const [form, setForm] = useState({ name: '', category: 'Vegetables', price: '', quantity: '', unit: 'kg', location: '', description: '' })
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleImage = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setImage(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(''); setSuccess('')
        if (!form.name || !form.price || !form.quantity || !form.location) { setError('Please fill in all required fields'); return }
        setLoading(true)
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        if (image) fd.append('image', image)
        try {
            await api.post('/farmer/crops', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
            setSuccess('Crop listed successfully! Redirecting…')
            setTimeout(() => navigate('/farmer'), 1500)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add crop.')
        }
        setLoading(false)
    }

    return (
        <div className="page-container animate-fade">
            <h1 className="page-title">Add New Crop</h1>
            <p className="page-subtitle">List your crop on the marketplace for buyers to discover</p>

            <div className="card" style={{ maxWidth: 700 }}>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Crop Name *</label>
                            <input className="form-input" placeholder="e.g. Fresh Tomatoes" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-row-3">
                        <div className="form-group">
                            <label className="form-label">Price (₹) *</label>
                            <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Quantity *</label>
                            <input className="form-input" type="number" min="0" step="0.1" placeholder="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Unit</label>
                            <select className="form-input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                                {UNITS.map(u => <option key={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location *</label>
                        <input className="form-input" placeholder="e.g. Bangalore, Karnataka" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows={3} placeholder="Describe your crop quality, harvest date, etc." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Crop Image</label>
                        <label className="upload-area" style={{ cursor: 'pointer' }}>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                            {preview ? (
                                <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8 }} />
                            ) : (
                                <>
                                    <div className="upload-area-icon">📷</div>
                                    <div className="upload-area-text">
                                        <span className="upload-area-link">Click to upload</span> or drag and drop<br />
                                        PNG, JPG, WEBP up to 16MB
                                    </div>
                                </>
                            )}
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/farmer')}>← Cancel</button>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Listing Crop…</> : '🌾 List Crop'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
