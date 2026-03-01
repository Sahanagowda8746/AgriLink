import { useState } from 'react'
import api from '../api'

export default function DiseaseDetection() {
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleImage = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setImage(file); setPreview(URL.createObjectURL(file)); setResult(null); setError('')
    }

    const handleAnalyze = async () => {
        if (!image) return
        setLoading(true); setError('')
        const fd = new FormData()
        fd.append('image', image)
        try {
            const res = await api.post('/ml/disease', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
            setResult(res.data.result)
        } catch {
            setError('Analysis failed. Please try again with a clearer image.')
        }
        setLoading(false)
    }

    const severityColor = s => ({ None: 'badge-green', Mild: 'badge-blue', Moderate: 'badge-amber', Severe: 'badge-red', Unknown: 'badge-gray' }[s] || 'badge-gray')

    return (
        <div className="page-container animate-fade">
            <h1 className="page-title">🔬 Crop Disease Detection</h1>
            <p className="page-subtitle">Upload a crop image to detect diseases using AI analysis</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                <div className="card">
                    <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📷 Upload Crop Image</h3>
                    <label className="upload-area" style={{ cursor: 'pointer' }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                        {preview ? (
                            <img src={preview} alt="Crop" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 8 }} />
                        ) : (
                            <>
                                <div className="upload-area-icon">🌿</div>
                                <div className="upload-area-text">
                                    <span className="upload-area-link">Click to upload</span> a crop image<br />
                                    Best results with clear leaf or plant photos
                                </div>
                            </>
                        )}
                    </label>
                    {preview && (
                        <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={handleAnalyze} disabled={loading}>
                            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Analyzing…</> : '🔬 Analyze Disease'}
                        </button>
                    )}
                    {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

                    <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>🤖 How it works</strong>
                        Our AI analyzes your crop image using color and texture patterns to identify possible diseases.
                        Results include the disease name, severity, treatment advice, and confidence score.
                    </div>
                </div>

                <div>
                    {!result && !loading && (
                        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🌱</div>
                            <div style={{ color: 'var(--text-secondary)' }}>
                                Upload a crop image and click <strong style={{ color: 'var(--text-primary)' }}>Analyze</strong> to see the disease detection result.
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="card loading-center" style={{ minHeight: 300 }}>
                            <div className="spinner" style={{ width: 48, height: 48 }}></div>
                            <div>Analyzing crop image…</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>This may take a few seconds</div>
                        </div>
                    )}

                    {result && (
                        <div className="animate-slide">
                            <div className="result-card" style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>
                                    {result.name === 'Healthy' ? '✅' : '⚠️'}
                                </div>
                                <div className="result-disease-name" style={{ color: result.name === 'Healthy' ? 'var(--green-400)' : 'var(--amber-400)' }}>
                                    {result.name}
                                </div>
                                <span className={`badge ${severityColor(result.severity)}`} style={{ marginBottom: 16, display: 'inline-block' }}>
                                    Severity: {result.severity}
                                </span>
                                <div className="confidence-bar-wrap">
                                    <div className="confidence-label">Confidence: {result.confidence}%</div>
                                    <div className="confidence-bar">
                                        <div className="confidence-fill" style={{ width: `${result.confidence}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ marginBottom: 16 }}>
                                <h4 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>📋 Description</h4>
                                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{result.description}</p>
                            </div>

                            <div className="card" style={{ marginBottom: 16, borderColor: result.name === 'Healthy' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)' }}>
                                <h4 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>💊 Recommended Treatment</h4>
                                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{result.treatment}</p>
                            </div>

                            {result.alternatives?.length > 0 && (
                                <div className="card">
                                    <h4 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>🔍 Other Possibilities</h4>
                                    {result.alternatives.map(alt => (
                                        <div key={alt.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                                            <span>{alt.name}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{alt.probability}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
