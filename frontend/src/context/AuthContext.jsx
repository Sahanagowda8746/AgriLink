import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('agrilink_user')
        return stored ? JSON.parse(stored) : null
    })
    const [loading, setLoading] = useState(false)

    const login = (userData, token) => {
        localStorage.setItem('agrilink_token', token)
        localStorage.setItem('agrilink_user', JSON.stringify(userData))
        setUser(userData)
    }

    const logout = async () => {
        try { await api.post('/auth/logout') } catch { }
        localStorage.removeItem('agrilink_token')
        localStorage.removeItem('agrilink_user')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
