import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import FarmerDashboard from './pages/FarmerDashboard'
import AddCrop from './pages/AddCrop'
import DiseaseDetection from './pages/DiseaseDetection'
import DemandForecast from './pages/DemandForecast'
import BuyerDashboard from './pages/BuyerDashboard'
import Marketplace from './pages/Marketplace'
import CropDetail from './pages/CropDetail'
import Transport from './pages/Transport'
import Payment from './pages/Payment'
import OrderStatus from './pages/OrderStatus'

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/signin" replace />
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'farmer' ? '/farmer' : '/buyer'} replace />
  }
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={user ? <Navigate to={user.role === 'farmer' ? '/farmer' : '/buyer'} /> : <Signup />} />
        <Route path="/signin" element={user ? <Navigate to={user.role === 'farmer' ? '/farmer' : '/buyer'} /> : <Signin />} />

        {/* Farmer routes */}
        <Route path="/farmer" element={<ProtectedRoute requiredRole="farmer"><FarmerDashboard /></ProtectedRoute>} />
        <Route path="/farmer/add-crop" element={<ProtectedRoute requiredRole="farmer"><AddCrop /></ProtectedRoute>} />
        <Route path="/farmer/disease" element={<ProtectedRoute requiredRole="farmer"><DiseaseDetection /></ProtectedRoute>} />
        <Route path="/farmer/demand" element={<ProtectedRoute requiredRole="farmer"><DemandForecast /></ProtectedRoute>} />

        {/* Buyer routes */}
        <Route path="/buyer" element={<ProtectedRoute requiredRole="buyer"><BuyerDashboard /></ProtectedRoute>} />
        <Route path="/buyer/marketplace" element={<ProtectedRoute requiredRole="buyer"><Marketplace /></ProtectedRoute>} />
        <Route path="/buyer/crop/:id" element={<ProtectedRoute requiredRole="buyer"><CropDetail /></ProtectedRoute>} />
        <Route path="/buyer/transport/:orderId" element={<ProtectedRoute requiredRole="buyer"><Transport /></ProtectedRoute>} />
        <Route path="/buyer/payment/:orderId" element={<ProtectedRoute requiredRole="buyer"><Payment /></ProtectedRoute>} />
        <Route path="/buyer/orders" element={<ProtectedRoute requiredRole="buyer"><OrderStatus /></ProtectedRoute>} />

        {/* Public marketplace */}
        <Route path="/marketplace" element={<Marketplace publicView />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Chatbot />
    </>
  )
}
