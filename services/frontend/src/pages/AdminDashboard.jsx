import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { bookingAPI, requestAPI, hostelAPI } from '../services/api'
import './Dashboard.css'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('resources')
  const [resources, setResources] = useState([])
  const [rooms, setRooms] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [maintenance, setMaintenance] = useState([])

  // Resource form
  const [resourceForm, setResourceForm] = useState({
    name: '',
    type: 'classroom',
    location: '',
    capacity: '',
  })

  // Room form
  const [roomForm, setRoomForm] = useState({
    room_no: '',
    capacity: '',
  })

  // Allocation form
  const [allocationForm, setAllocationForm] = useState({
    user_id: '',
    room_id: '',
    start_date: '',
  })


  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [resData, roomData, reqData, maintData] = await Promise.all([
        bookingAPI.getResources(),
        hostelAPI.getRooms(),
        requestAPI.getAllRequests().catch((err) => {
          console.error('Failed to load requests:', err)
          return []
        }),
        hostelAPI.getAllMaintenance().catch((err) => {
          console.error('Failed to load maintenance:', err)
          return []
        })
      ])

      setResources(resData || [])
      setRooms(roomData || [])
      setRequests(reqData || [])
      setMaintenance(maintData || [])

    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateResource = async (e) => {
    e.preventDefault()
    try {
      await bookingAPI.createResource({
        ...resourceForm,
        capacity: parseInt(resourceForm.capacity),
      })
      setResourceForm({ name: '', type: 'classroom', location: '', capacity: '' })
      loadData()
      alert('Resource created successfully')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create resource')
    }
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    try {
      await hostelAPI.createRoom({
        ...roomForm,
        capacity: parseInt(roomForm.capacity),
      })
      setRoomForm({ room_no: '', capacity: '' })
      loadData()
      alert('Room created successfully')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create room')
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, {user.username}</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={activeTab === 'resources' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
          <button
            className={activeTab === 'hostel' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('hostel')}
          >
            Hostel
          </button>
          <button
            className={activeTab === 'requests' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('requests')}
          >
            All Requests
          </button>
          <button
            className={activeTab === 'maintenance' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('maintenance')}
          >
            Maintenance
          </button>
        </div>

        {activeTab === 'resources' && (
          <section className="dashboard-section">
            <h2>Resource Management</h2>
            <div className="admin-form-card">
              <h3>Add New Resource</h3>
              <form onSubmit={handleCreateResource}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={resourceForm.name}
                      onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={resourceForm.type}
                      onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                      required
                    >
                      <option value="classroom">Classroom</option>
                      <option value="lab">Lab</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={resourceForm.location}
                      onChange={(e) => setResourceForm({ ...resourceForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacity</label>
                    <input
                      type="number"
                      value={resourceForm.capacity}
                      onChange={(e) => setResourceForm({ ...resourceForm, capacity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-button">Add Resource</button>
              </form>
            </div>

            <h3>All Resources</h3>
            {resources.length > 0 ? (
              <div className="cards-grid">
                {resources.map((resource) => (
                  <div key={resource._id || resource.id} className="card">
                    <h3>{resource.name}</h3>
                    <p><strong>Type:</strong> {resource.type}</p>
                    <p><strong>Location:</strong> {resource.location}</p>
                    <p><strong>Capacity:</strong> {resource.capacity}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No resources yet</p>
            )}
          </section>
        )}

        {activeTab === 'hostel' && (
          <section className="dashboard-section">
            <h2>Hostel Management</h2>
            <div className="admin-form-card">
              <h3>Add New Room</h3>
              <form onSubmit={handleCreateRoom}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Room Number</label>
                    <input
                      type="text"
                      value={roomForm.room_no}
                      onChange={(e) => setRoomForm({ ...roomForm, room_no: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacity</label>
                    <input
                      type="number"
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-button">Add Room</button>
              </form>
            </div>
            {/* Allocate Room */}
            <div className="admin-form-card" style={{ marginTop: "20px" }}>
              <h3>Allocate Room to Student</h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await hostelAPI.allocateRoom({
                      user_id: allocationForm.user_id,
                      room_id: allocationForm.room_id,
                      start_date: allocationForm.start_date,
                    })
                    alert('Room allocated successfully!')
                    setAllocationForm({ user_id: '', room_id: '', start_date: '' })
                    loadData()
                  } catch (err) {
                    alert(err.response?.data?.detail || 'Failed to allocate room')
                  }
                }}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Student ID</label>
                    <input
                      type="text"
                      value={allocationForm.user_id}
                      onChange={(e) =>
                        setAllocationForm({ ...allocationForm, user_id: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Room</label>
                    <select
                      value={allocationForm.room_id}
                      onChange={(e) =>
                        setAllocationForm({ ...allocationForm, room_id: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Room</option>
                      {rooms.map((room) => (
                        <option key={room._id || room.id} value={room._id || room.id}>
                          Room {room.room_no} (Available:{' '}
                          {(room.capacity || 0) - (room.occupied || 0)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={allocationForm.start_date}
                    onChange={(e) =>
                      setAllocationForm({ ...allocationForm, start_date: e.target.value })
                    }
                    required
                  />
                </div>

                <button type="submit" className="submit-button">
                  Allocate Room
                </button>
              </form>
            </div>

            <h3>All Rooms</h3>
            {rooms.length > 0 ? (
              <div className="cards-grid">
                {rooms.map((room) => (
                  <div key={room._id || room.id} className="card">
                    <h3>Room {room.room_no}</h3>
                    <p><strong>Capacity:</strong> {room.capacity}</p>
                    <p><strong>Occupied:</strong> {room.occupied || 0}</p>
                    <p><strong>Available:</strong> {(room.capacity || 0) - (room.occupied || 0)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No rooms yet</p>
            )}
          </section>
        )}

        {activeTab === 'requests' && (
          <section className="dashboard-section">
            <h2>All Service Requests</h2>
            {requests.length > 0 ? (
              <div className="cards-grid">
                {requests.map((request) => (
                  <div key={request._id || request.id} className="card">
                    <h3>{request.title}</h3>
                    <p><strong>Description:</strong> {request.description}</p>
                    <p><strong>Student ID:</strong> {request.user_id}</p>
                    <p><strong>Status:</strong> <span className={`status-${request.status?.toLowerCase()}`}>{request.status}</span></p>
                    <p><strong>Created:</strong> {new Date(request.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No requests in system</p>
            )}
          </section>
        )}

        {activeTab === 'maintenance' && (
            <section className="dashboard-section">
              <h2>Hostel Maintenance Requests</h2>
              
              {maintenance.length > 0 ? (
                <div className="cards-grid">
                  {maintenance.map((m) => (
                    <div key={m._id || m.id} className="card">
                      <h3>Room {m.room_id}</h3>
                      <p><strong>Issue:</strong> {m.issue}</p>
                      <p><strong>Student:</strong> {m.user_id}</p>
                      <p><strong>Status:</strong> {m.status || 'PENDING'}</p>
                      <p><strong>Created:</strong> {new Date(m.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No maintenance requests</p>
              )}

            </section>
          )}

      </div>
    </div>
  )
}

export default AdminDashboard

