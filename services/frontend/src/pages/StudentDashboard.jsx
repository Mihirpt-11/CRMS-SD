import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchStudentDashboard } from '../services/graphql'
import { bookingAPI, requestAPI, hostelAPI } from '../services/api'
import './Dashboard.css'

function StudentDashboard() {
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [resources, setResources] = useState([])
  const [rooms, setRooms] = useState([])

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    resource_id: '',
    start_time: '',
    end_time: '',
  })

  // Request form state
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
  })

  // Maintenance form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    room_id: '',
    issue: '',
  })

  useEffect(() => {
    loadDashboard()
    loadResources()
    loadRooms()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const data = await fetchStudentDashboard(user.sub || user.username)
      setDashboardData(data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadResources = async () => {
    try {
      const data = await bookingAPI.getResources()
      setResources(data)
    } catch (err) {
      console.error('Failed to load resources', err)
    }
  }

  const loadRooms = async () => {
    try {
      const data = await hostelAPI.getRooms()
      setRooms(data)
    } catch (err) {
      console.error('Failed to load rooms', err)
    }
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    try {
      // Convert datetime-local format to ISO format for backend
      const startTime = new Date(bookingForm.start_time).toISOString()
      const endTime = new Date(bookingForm.end_time).toISOString()
      
      await bookingAPI.create({
        resource_id: bookingForm.resource_id,
        user_id: user.sub || user.username,
        start_time: startTime,
        end_time: endTime,
      })
      setShowBookingModal(false)
      setBookingForm({ resource_id: '', start_time: '', end_time: '' })
      loadDashboard()
      alert('Booking created successfully!')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create booking')
    }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    try {
      await requestAPI.create({
        ...requestForm,
        user_id: user.sub || user.username,
      })
      setShowRequestModal(false)
      setRequestForm({ title: '', description: '' })
      loadDashboard()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create request')
    }
  }

  // const handleCreateMaintenance = async (e) => {
  //   e.preventDefault()
  //   try {
  //     await hostelAPI.createMaintenance({
  //       ...maintenanceForm,
  //       user_id: user.sub || user.username,
  //     })
  //     setShowMaintenanceModal(false)
  //     setMaintenanceForm({ room_id: '', issue: '' })
  //     alert('Maintenance request submitted successfully')
  //   } catch (err) {
  //     alert(err.response?.data?.detail || 'Failed to create maintenance request')
  //   }
  // }
  const handleCreateMaintenance = async (e) => {
  e.preventDefault()
  try {
    await hostelAPI.createMaintenance({
      ...maintenanceForm,
      user_id: user.sub || user.username,
    })
    setShowMaintenanceModal(false)
    setMaintenanceForm({ room_id: '', issue: '' })
    // <-- NEW: refresh the dashboard to get latest data
    await loadDashboard()
    alert('Maintenance request submitted successfully')
  } catch (err) {
    alert(err.response?.data?.detail || 'Failed to create maintenance request')
  }
}


  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, {user.username}</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button onClick={() => setShowBookingModal(true)} className="action-button">
            Create Booking
          </button>
          <button onClick={() => setShowRequestModal(true)} className="action-button">
            Submit Request
          </button>
          <button onClick={() => setShowMaintenanceModal(true)} className="action-button">
            Raise Maintenance
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="dashboard-sections">
          <section className="dashboard-section">
            <h2>My Bookings</h2>
            {dashboardData?.bookings?.length > 0 ? (
              <div className="cards-grid">
                {dashboardData.bookings.map((booking) => (
                  <div key={booking.id} className="card">
                    <h3>{booking.resource_name || 'Resource'}</h3>
                    {/* <p><strong>Type:</strong> {booking.resource_type}</p> */}
                    <p><strong>Location:</strong> {booking.location}</p>
                    {/* <p><strong>Start:</strong> {new Date(booking.start_time).toLocaleString()}</p>
                    <p><strong>End:</strong> {new Date(booking.end_time).toLocaleString()}</p> */}
                    <p><strong>Status:</strong> {booking.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No bookings yet</p>
            )}
          </section>

          <section className="dashboard-section">
            <h2>Service Requests</h2>
            {dashboardData?.requests?.length > 0 ? (
              <div className="cards-grid">
                {dashboardData.requests.map((request) => (
                  <div key={request.id} className="card">
                    <h3>{request.title}</h3>
                    <p>{request.description}</p>
                    <p><strong>Status:</strong> <span className={`status-${request.status?.toLowerCase()}`}>{request.status}</span></p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No requests yet</p>
            )}
          </section>

          <section className="dashboard-section">
            <h2>Hostel Information</h2>
            {dashboardData?.hostel?.length > 0 ? (
              <div className="cards-grid">
                {dashboardData.hostel.map((hostel, idx) => (
                  <div key={idx} className="card">
                    <h3>Room {hostel.room_no}</h3>
                    <p><strong>Status:</strong> {hostel.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No hostel allocation</p>
            )}
          </section>

          <section className="dashboard-section">
            <h2>Maintenance Requests</h2>

            {dashboardData?.maintenance?.length > 0 ? (
              <div className="cards-grid">
                {dashboardData.maintenance.map((m) => (
                  <div key={m.id} className="card">
                    <h3>Room: {m.room_id}</h3>
                    <p><strong>Issue:</strong> {m.issue}</p>
                    <p><strong>Status:</strong> {m.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No maintenance requests yet</p>
            )}
          </section>

        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Booking</h2>
            <form onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label>Resource</label>
                <select
                  value={bookingForm.resource_id}
                  onChange={(e) => setBookingForm({ ...bookingForm, resource_id: e.target.value })}
                  required
                >
                  <option value="">Select Resource</option>
                  {resources.map((r) => (
                    <option key={r._id || r.id} value={r._id || r.id}>
                      {r.name} ({r.type}) - {r.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={bookingForm.start_time}
                  onChange={(e) => setBookingForm({ ...bookingForm, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="datetime-local"
                  value={bookingForm.end_time}
                  onChange={(e) => setBookingForm({ ...bookingForm, end_time: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowBookingModal(false)}>Cancel</button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Submit Service Request</h2>
            <form onSubmit={handleCreateRequest}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  placeholder="e.g., Need Bonafide Certificate"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  rows="4"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowRequestModal(false)}>Cancel</button>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="modal-overlay" onClick={() => setShowMaintenanceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Raise Maintenance Request</h2>
            <form onSubmit={handleCreateMaintenance}>
              <div className="form-group">
                <label>Room</label>
                <select
                  value={maintenanceForm.room_id}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, room_id: e.target.value })}
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map((r) => (
                    <option key={r._id || r.id} value={r._id || r.id}>
                      Room {r.room_no}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Issue Description</label>
                <textarea
                  value={maintenanceForm.issue}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issue: e.target.value })}
                  rows="4"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowMaintenanceModal(false)}>Cancel</button>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard

