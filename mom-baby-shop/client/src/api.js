import axios from 'axios'

export function initApiClient() {
  const token = localStorage.getItem('token')
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// refresh header when token changes
export function setAuthToken(token) {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete axios.defaults.headers.common['Authorization']
}