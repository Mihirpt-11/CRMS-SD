import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { requestAPI } from '../services/api'
import './Dashboard.css'

function FacultyDashboard() {
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRequests()
    const interval = setInterval(loadRequests, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await requestAPI.getFacultyRequests(user.sub || user.username)
      setRequests(data || [])
    } catch (err) {
      setError('Failed to load requests: ' + (err.response?.data?.detail || err.message))
      console.error('Error loading requests:', err)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await requestAPI.updateStatus(requestId, newStatus)
      loadRequests()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update request status')
    }
  }

  if (loading && requests.length === 0) {
    return <div className="dashboard-loading">Loading requests...</div>
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Faculty Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, {user.username}</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {error && <div className="error-banner">{error}</div>}

        <section className="dashboard-section">
          <h2>Service Requests to Handle</h2>
          {requests.length > 0 ? (
            <div className="cards-grid">
              {requests.map((request) => (
                <div key={request._id || request.id} className="card">
                  <h3>{request.title}</h3>
                  <p><strong>Description:</strong> {request.description}</p>
                  <p><strong>Student ID:</strong> {request.user_id}</p>
                  <p><strong>Status:</strong> <span className={`status-${request.status?.toLowerCase()}`}>{request.status}</span></p>
                  <p><strong>Created:</strong> {new Date(request.created_at).toLocaleString()}</p>
                  
                  {request.status === 'PENDING' && (
                    <div className="card-actions">
                      <button
                        onClick={() => handleUpdateStatus(request._id || request.id, 'APPROVED')}
                        className="action-button approve"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(request._id || request.id, 'REJECTED')}
                        className="action-button reject"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No requests to handle</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default FacultyDashboard

