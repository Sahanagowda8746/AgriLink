import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
    { icon: '🤝', title: 'Direct Farmer-Buyer Link', desc: 'Eliminate middlemen. Farmers sell directly to buyers for maximum profit and fair prices.' },
    { icon: '🔬', title: 'AI Disease Detection', desc: 'Upload a crop image and instantly detect diseases using machine learning. Get treatment advice.' },
    { icon: '📈', title: 'Demand Forecasting', desc: 'ML-powered predictions help farmers plan harvests based on 12-month seasonal demand trends.' },
    { icon: '🚚', title: 'Transport Booking', desc: 'Buyers can book transportation directly from the platform for doorstep crop delivery.' },
    { icon: '💬', title: 'Multilingual Chatbot', desc: 'Ask questions in English, Kannada, Hindi, or Telugu. Our AI assistant is always ready to help.' },
    { icon: '💳', title: 'Secure Payments', desc: 'Integrated payment simulation with UPI, Card, Net Banking, and Cash on Delivery support.' },
]

const testimonials = [
    { name: 'Rajesh Kumar', role: 'Farmer, Karnataka', text: 'AgriLink transformed my business! I now sell directly to buyers and earn 40% more than before.', stars: 5 },
    { name: 'Priya Sharma', role: 'Buyer, Mumbai', text: 'Fresh vegetables straight from farms at honest prices. The disease detection feature helped me trust the quality.', stars: 5 },
    { name: 'Venkat Rao', role: 'Farmer, Andhra Pradesh', text: 'The demand forecast helped me grow the right crops at the right time. The Telugu chatbot is a blessing!', stars: 5 },
]

export default function Home() {
    const { user } = useAuth()
    return (
        <div>
            {/* Hero */}
            <section className="hero">
                <div className="container">
                    <div style={{ marginBottom: 16 }}>
                        <span className="section-label">🌱 Smart Agri Platform</span>
                    </div>
                    <h1 className="hero-title">
                        Connecting Farmers<br />
                        <span className="highlight">Directly to Markets</span>
                    </h1>
                    <p className="hero-subtitle">
                        AgriLink eliminates middlemen, empowers farmers with AI-powered insights,
                        and connects buyers with fresh produce — all in one platform.
                    </p>
                    <div className="hero-cta">
                        {user ? (
                            <Link
                                to={user.role === 'farmer' ? '/farmer' : '/buyer'}
                                className="btn btn-primary btn-lg"
                            >
                                Go to Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free →</Link>
                                <Link to="/marketplace" className="btn btn-secondary btn-lg">Browse Marketplace</Link>
                            </>
                        )}
                    </div>
                    <div className="hero-stats">
                        <div>
                            <div className="hero-stat-value">10,000+</div>
                            <div className="hero-stat-label">Farmers Connected</div>
                        </div>
                        <div>
                            <div className="hero-stat-value">₹50Cr+</div>
                            <div className="hero-stat-label">Revenue Generated</div>
                        </div>
                        <div>
                            <div className="hero-stat-value">25+</div>
                            <div className="hero-stat-label">Crop Categories</div>
                        </div>
                        <div>
                            <div className="hero-stat-value">4</div>
                            <div className="hero-stat-label">Languages Supported</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <span className="section-label">Why AgriLink?</span>
                        <h2 className="section-heading">Everything Farmers &amp; Buyers Need</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto' }}>
                            A complete ecosystem for agricultural commerce powered by modern technology.
                        </p>
                    </div>
                    <div className="features-grid">
                        {features.map(f => (
                            <div key={f.title} className="feature-card animate-fade">
                                <span className="feature-icon">{f.icon}</span>
                                <div className="feature-title">{f.title}</div>
                                <div className="feature-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <span className="section-label">Simple Steps</span>
                        <h2 className="section-heading">How It Works</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
                        {[
                            { step: '01', icon: '📝', title: 'Create Account', desc: 'Sign up as a Farmer or Buyer in seconds.' },
                            { step: '02', icon: '🌾', title: 'List / Browse', desc: 'Farmers list crops; Buyers browse the marketplace.' },
                            { step: '03', icon: '🤝', title: 'Connect & Trade', desc: 'Buyers purchase directly from farmers.' },
                            { step: '04', icon: '🚚', title: 'Deliver & Pay', desc: 'Book transport and complete secure payment.' },
                        ].map(s => (
                            <div key={s.step} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-400)', letterSpacing: 2, marginBottom: 12 }}>{s.step}</div>
                                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{s.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{s.title}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <span className="section-label">Testimonials</span>
                        <h2 className="section-heading">What Our Users Say</h2>
                    </div>
                    <div className="testimonials-grid">
                        {testimonials.map(t => (
                            <div key={t.name} className="testimonial-card">
                                <div className="testimonial-stars">{'★'.repeat(t.stars)}</div>
                                <p className="testimonial-text">"{t.text}"</p>
                                <div className="testimonial-author">{t.name}</div>
                                <div className="testimonial-role">{t.role}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="section" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))', borderTop: '1px solid rgba(34,197,94,0.15)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 className="section-heading">Ready to Transform Your Farming?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>
                        Join thousands of farmers and buyers already using AgriLink.
                    </p>
                    {!user && (
                        <div className="hero-cta">
                            <Link to="/signup?role=farmer" className="btn btn-primary btn-lg">👨‍🌾 Join as Farmer</Link>
                            <Link to="/signup?role=buyer" className="btn btn-amber btn-lg">🛍️ Join as Buyer</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border-color)', padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--green-500)' }}>🌾 AgriLink</span> — Smart Farmer-to-Market Platform &nbsp;|&nbsp; © 2024 AgriLink. All rights reserved.
            </footer>
        </div>
    )
}
