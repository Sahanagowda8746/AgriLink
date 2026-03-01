import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const farmerLinks = [
        { to: '/farmer', label: '🏠 Dashboard' },
        { to: '/farmer/add-crop', label: '➕ Add Crop' },
        { to: '/farmer/disease', label: '🔬 Disease AI' },
        { to: '/farmer/demand', label: '📈 Demand' },
    ]

    const buyerLinks = [
        { to: '/buyer', label: '🏠 Dashboard' },
        { to: '/buyer/marketplace', label: '🛒 Marketplace' },
        { to: '/buyer/orders', label: '📦 My Orders' },
    ]

    const links = user?.role === 'farmer' ? farmerLinks : user?.role === 'buyer' ? buyerLinks : []

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <span className="brand-icon">🌾</span>
                AgriLink
            </Link>

            <div className="navbar-links">
                {links.map(l => (
                    <Link
                        key={l.to}
                        to={l.to}
                        className={`navbar-link ${location.pathname === l.to ? 'active' : ''}`}
                    >
                        {l.label}
                    </Link>
                ))}
                {!user && (
                    <Link to="/marketplace" className={`navbar-link ${location.pathname === '/marketplace' ? 'active' : ''}`}>
                        🛒 Marketplace
                    </Link>
                )}
            </div>

            <div className="navbar-actions">
                {user ? (
                    <>
                        <div className="navbar-user">
                            <span>{user.role === 'farmer' ? '👨‍🌾' : '🛍️'}</span>
                            <span>{user.name}</span>
                            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>{user.role}</span>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/signin" className="btn btn-secondary btn-sm">Sign In</Link>
                        <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
