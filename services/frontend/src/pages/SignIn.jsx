import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'
import './SignIn.css'

function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (location.state?.message) {
      setInfo(location.state.message)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    try {
      const response = await authAPI.login(username, password)
      const token = response.access_token
      
      // Decode token to get role
      const tokenPayload = JSON.parse(atob(token.split('.')[1]))
      const userRole = tokenPayload.role

      // Verify role matches selected role
      if (userRole !== role) {
        setError('Role mismatch. Please select the correct role.')
        setLoading(false)
        return
      }

      login(token)

      // Redirect based on role
      if (userRole === 'student') {
        navigate('/student/dashboard')
      } else if (userRole === 'faculty') {
        navigate('/faculty/dashboard')
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = () => {
    navigate('/signup')
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h1>Campus Resource Management</h1>
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}
          {info && <div className="info-message">{info}</div>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="form-footer">
          <span>New here?</span>
          <button type="button" className="secondary-button" onClick={handleCreateAccount}>
            Create account
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignIn

