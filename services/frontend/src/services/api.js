import axios from 'axios'


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },
  signup: async (username, password, role) => {
    const response = await api.post('/auth/signup', { username, password, role })
    return response.data
  },
  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

export const bookingAPI = {
  create: async (bookingData) => {
    const response = await api.post('/booking/create', bookingData)
    return response.data
  },
  getResources: async () => {
    const response = await api.get('/booking/resource')
    return response.data
  },
  createResource: async (resourceData) => {
    const response = await api.post('/booking/resource', resourceData)
    return response.data
  },
  getStudentBookings: async (userId) => {
    const response = await api.get(`/booking/student/${userId}`)
    return response.data
  },
}

export const requestAPI = {
  create: async (requestData) => {
    const response = await api.post('/request/create', requestData)
    return response.data
  },
  getStudentRequests: async (userId) => {
    const response = await api.get(`/request/student/${userId}`)
    return response.data
  },
  getFacultyRequests: async (facultyId) => {
    const response = await api.get(`/request/faculty/${facultyId}`)
    return response.data
  },
  getAllRequests: async () => {
    // This would need to be implemented in backend
    const response = await api.get('/request/all')
    return response.data
  },
  updateStatus: async (requestId, status) => {
    const response = await api.put(`/request/update/${requestId}`, { status })
    return response.data
  },
}

export const hostelAPI = {
  createRoom: async (roomData) => {
    const response = await api.post('/hostel/room', roomData)
    return response.data
  },
  getRooms: async () => {
    const response = await api.get('/hostel/room')
    return response.data
  },
  getStudentAllocations: async (userId) => {
    const response = await api.get(`/hostel/student/${userId}`)
    return response.data
  },
  createMaintenance: async (maintenanceData) => {
    const response = await api.post('/hostel/maintenance', maintenanceData)
    return response.data
  },
  allocateRoom: async (allocationData) => {
    const response = await api.post('/hostel/allocate', allocationData)
    return response.data
  },
  getAllMaintenance: async () => {
    const response = await api.get('/hostel/maintenance/all')
    return response.data
  },
  getMaintenanceByRoom: async (roomId) => {
    const response = await api.get(`/hostel/maintenance/${roomId}`)
    return response.data
  },
}

export default api

