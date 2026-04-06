import { useState, useRef } from 'react'
import api from '../api'

// ── Error type constants ──────────────────────────────────────────────────────
const ERROR_TYPES = {
  INVALID_IMAGE: 'invalid_image',
  LOW_CONFIDENCE: 'low_confidence',
  NETWORK: 'network',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const severityColor = s =>
  ({ None: 'badge-green', Mild: 'badge-blue', Moderate: 'badge-amber', Severe: 'badge-red', Unknown: 'badge-gray' }[s] || 'badge-gray')

const severityIcon = s =>
  ({ None: '✅', Mild: '🟡', Moderate: '🟠', Severe: '🔴', Unknown: '⚪' }[s] || '⚪')

// ── Styles (inline) ───────────────────────────────────────────────────────────
const styles = {
  errorBanner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '20px 24px',
    borderRadius: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  errorIcon: { fontSize: '2.4rem', lineHeight: 1 },
  errorTitle: { fontWeight: 700, fontSize: '1rem', margin: 0 },
  errorMsg: { fontSize: '0.875rem', margin: 0, lineHeight: 1.5 },
  retryBtn: {
    marginTop: 4,
    padding: '8px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  infoBox: {
    marginTop: 16,
    padding: '12px 16px',
    borderRadius: 10,
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.25)',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.55,
  },
  fieldLabel: {
    fontWeight: 700,
    marginBottom: 6,
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tipBox: {
    display: 'flex',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 10,
    background: 'rgba(34,197,94,0.07)',
    border: '1px solid rgba(34,197,94,0.2)',
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: 12,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DiseaseDetection() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [appError, setAppError] = useState(null)   // { type, message }
  const fileInputRef = useRef(null)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setAppError(null)
  }

  const handleRetry = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setAppError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAnalyze = async () => {
    if (!image) return
    setLoading(true)
    setAppError(null)
    setResult(null)
    const fd = new FormData()
    fd.append('image', image)
    try {
      const res = await api.post('/ml/disease', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data.result)
    } catch (err) {
      if (err.response?.status === 422) {
        setAppError({
          type: err.response.data.type || ERROR_TYPES.INVALID_IMAGE,
          message: err.response.data.message || 'Invalid image. Please upload a clear plant image.',
        })
      } else {
        setAppError({
          type: ERROR_TYPES.NETWORK,
          message: 'Analysis failed due to a network error. Please try again.',
        })
      }
    }
    setLoading(false)
  }

  // ── Sub-components ────────────────────────────────────────────────────────
  const ErrorBanner = ({ type, message }) => {
    const isLowConf = type === ERROR_TYPES.LOW_CONFIDENCE
    return (
      <div
        style={{
          ...styles.errorBanner,
          background: isLowConf ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${isLowConf ? 'rgba(245,158,11,0.35)' : 'rgba(239,68,68,0.35)'}`,
        }}
      >
        <div style={styles.errorIcon}>{isLowConf ? '🔍' : '🚫'}</div>
        <p style={{ ...styles.errorTitle, color: isLowConf ? 'var(--amber-400)' : '#f87171' }}>
          {isLowConf ? 'Low Confidence' : 'Invalid Image'}
        </p>
        <p style={styles.errorMsg}>{message}</p>
        <button
          onClick={handleRetry}
          style={{
            ...styles.retryBtn,
            background: isLowConf ? 'rgba(245,158,11,0.18)' : 'rgba(239,68,68,0.15)',
            color: isLowConf ? 'var(--amber-400)' : '#f87171',
          }}
        >
          🔄 Try Another Image
        </button>
      </div>
    )
  }

  const ResultPanel = ({ r }) => (
    <div className="animate-slide">
      {/* Header card */}
      <div className="result-card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: '2.8rem', marginBottom: 10 }}>
          {r.name === 'Healthy' ? '✅' : severityIcon(r.severity)}
        </div>
        <div
          className="result-disease-name"
          style={{ color: r.name === 'Healthy' ? 'var(--green-400)' : 'var(--amber-400)' }}
        >
          {r.name}
        </div>
        <span
          className={`badge ${severityColor(r.severity)}`}
          style={{ marginBottom: 14, display: 'inline-block' }}
        >
          Severity: {r.severity}
        </span>
        <div className="confidence-bar-wrap">
          <div className="confidence-label">Confidence: {r.confidence}%</div>
          <div className="confidence-bar">
            <div className="confidence-fill" style={{ width: `${r.confidence}%` }} />
          </div>
        </div>
      </div>

      {/* User tip */}
      {r.user_tip && (
        <div style={styles.tipBox}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
          <span>{r.user_tip}</span>
        </div>
      )}

      {/* Description */}
      <div className="card" style={{ marginBottom: 12 }}>
        <p style={styles.fieldLabel}>📋 What We See</p>
        {r.visual_clues && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, fontStyle: 'italic' }}>
            Visual clues: {r.visual_clues}
          </p>
        )}
        <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{r.description}</p>
      </div>

      {/* Cause */}
      <div className="card" style={{ marginBottom: 12 }}>
        <p style={styles.fieldLabel}>🔬 Possible Cause</p>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{r.cause}</p>
      </div>

      {/* Treatment */}
      <div
        className="card"
        style={{
          marginBottom: 12,
          borderColor: r.name === 'Healthy' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)',
        }}
      >
        <p style={styles.fieldLabel}>💊 Recommended Treatment</p>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{r.treatment}</p>
      </div>

      {/* Alternatives */}
      {r.alternatives?.length > 0 && (
        <div className="card">
          <p style={styles.fieldLabel}>🔍 Other Possibilities</p>
          {r.alternatives.map(alt => (
            <div
              key={alt.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid var(--border-color)',
                fontSize: '0.855rem',
              }}
            >
              <span>{alt.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{alt.probability}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Retry */}
      <button
        className="btn"
        style={{
          marginTop: 16,
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
          borderRadius: 8,
          padding: '8px 0',
          cursor: 'pointer',
          fontSize: '0.85rem',
        }}
        onClick={handleRetry}
      >
        🔄 Analyze Another Image
      </button>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page-container animate-fade">
      <h1 className="page-title">🔬 Crop Disease Detection</h1>
      <p className="page-subtitle">
        Upload a clear close-up image of a plant leaf — our AI strictly validates the image before detecting any disease
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* ── Upload Panel ── */}
        <div className="card">
          <h3 style={{ marginBottom: 6, fontWeight: 700 }}>📷 Upload Crop Image</h3>

          {/* Instruction hint — spec-required text */}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '10px 14px', borderRadius: 10,
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.2)',
            marginBottom: 14,
          }}>
            <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>📌</span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Upload a clear close-up image of a plant leaf</strong>{' '}
              for accurate disease detection. Only real leaf images will be accepted.
            </p>
          </div>

          <label className="upload-area" style={{ cursor: 'pointer' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImage}
            />
            {preview ? (
              <img
                src={preview}
                alt="Uploaded crop"
                style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 8 }}
              />
            ) : (
              <>
                <div className="upload-area-icon">🌿</div>
                <div className="upload-area-text">
                  <span className="upload-area-link">Click to upload</span> a crop or leaf image
                  <br />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    JPG, PNG, WEBP — clear close-up for best accuracy
                  </span>
                </div>
              </>
            )}
          </label>

          {/* Analyze button */}
          {preview && !appError && (
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 14 }}
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Analyzing…</>
                : '🔬 Analyze Disease'}
            </button>
          )}

          {/* Error banner */}
          {appError && <ErrorBanner type={appError.type} message={appError.message} />}

          {/* How it works */}
          <div style={styles.infoBox}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
              🤖 How it works
            </strong>
            Our AI first checks whether your image is a valid plant or crop photo. If valid, it analyzes
            color patterns, texture, and tone to identify diseases. Results include the disease name,
            cause, severity, treatment advice, and confidence score.
          </div>
        </div>

        {/* ── Result Panel ── */}
        <div>
          {!result && !loading && !appError && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '3.8rem', marginBottom: 14 }}>🌿</div>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Upload a leaf image and click{' '}
                <strong style={{ color: 'var(--text-primary)' }}>Analyze</strong> to detect diseases.
              </div>

              {/* Valid examples */}
              <div style={{
                marginTop: 20, padding: '14px 16px', borderRadius: 10,
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.18)',
                textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7,
              }}>
                <strong style={{ color: 'var(--green-400)', fontSize: '0.82rem' }}>✅ Accepted images:</strong>
                <ul style={{ marginTop: 6, paddingLeft: 18, marginBottom: 0 }}>
                  <li>Close-up of a real plant leaf (single, in-focus)</li>
                  <li>Crop field or stem with visible leaf texture</li>
                  <li>Bright, clear photo with no heavy shadows</li>
                </ul>
              </div>

              {/* Rejected examples */}
              <div style={{
                marginTop: 12, padding: '14px 16px', borderRadius: 10,
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.18)',
                textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7,
              }}>
                <strong style={{ color: '#f87171', fontSize: '0.82rem' }}>🚫 Always rejected:</strong>
                <ul style={{ marginTop: 6, paddingLeft: 18, marginBottom: 0 }}>
                  <li>Mobile phone, book, paper, or any object</li>
                  <li>Human, face, or body parts</li>
                  <li>Buildings, backgrounds, or outdoor scenery</li>
                  <li>Cartoon or drawing of a plant</li>
                  <li>Blurry, dark, or blank images</li>
                </ul>
              </div>
            </div>
          )}

          {loading && (
            <div className="card loading-center" style={{ minHeight: 300 }}>
              <div className="spinner" style={{ width: 48, height: 48 }} />
              <div>Validating &amp; analyzing crop image…</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>This may take a few seconds</div>
            </div>
          )}

          {result && !loading && <ResultPanel r={result} />}
        </div>
      </div>
    </div>
  )
}
