
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import MapView from './pages/MapView'
import Signup from './pages/Signup'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <BrowserRouter>
     <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route
          path="/map/:id"
          element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
