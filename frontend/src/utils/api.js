import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:5001' })

export function setAuth(token){
  if(token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete API.defaults.headers.common['Authorization']
}

// Restore token from localStorage on app load
const savedToken = localStorage.getItem('ai_token')
if(savedToken) setAuth(savedToken)

export default API
