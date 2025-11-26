import { GraphQLClient } from 'graphql-request'

// Use relative URL in production (via nginx proxy), or absolute for development
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || '/graphql'

const getClient = () => {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return new GraphQLClient(GRAPHQL_URL, { headers })
}


export const studentDashboardQuery = `
  query StudentDashboard($studentId: String!) {
    studentDashboard(studentId: $studentId) {
      bookings {
        id
        resourceId
        startTime
        endTime
        status
        resourceName
        resourceType
        location
      }
      requests {
        id
        title
        description
        status
      }
      hostel {
        roomId
        roomNo
        status
      }
      maintenance {
        id
        roomId
        issue
        status
      }
    }
  }
`;



export const fetchStudentDashboard = async (studentId) => {
  const client = getClient()
  const data = await client.request(studentDashboardQuery, { studentId })
  return data.studentDashboard
}

