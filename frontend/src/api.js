import axios from 'axios'

const api = axios.create({
    baseURL: 'https://agrilink-m2r1.onrender.com/api/health',
    headers: { 'Content-Type': 'application/json' }
})

// Automatically attach JWT token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('agrilink_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle 401 globally
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('agrilink_token')
            localStorage.removeItem('agrilink_user')
        }
        return Promise.reject(err)
    }
)

export default api
