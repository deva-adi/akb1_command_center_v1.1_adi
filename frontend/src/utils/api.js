import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API Error]', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`)
    return response.data
  },
  (error) => {
    console.error('[API Error]', error.response?.status, error.config?.url, error.response?.data)
    // Extract meaningful error message from FastAPI validation errors
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail
      if (Array.isArray(detail)) {
        // Pydantic validation errors: [{loc: [...], msg: "...", type: "..."}]
        const messages = detail.map(d => {
          const field = d.loc ? d.loc.filter(l => l !== 'body').join('.') : 'unknown'
          return `${field}: ${d.msg}`
        })
        error.response.data.message = messages.join('; ')
      } else if (typeof detail === 'string') {
        error.response.data.message = detail
      }
    }
    return Promise.reject(error)
  }
)

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/data'),
  getMetrics: () => api.get('/dashboard/metrics'),
}

export const kpisAPI = {
  getAll: () => api.get('/kpis/'),
  create: (data) => api.post('/kpis/', data),
  update: (id, data) => api.put(`/kpis/${id}`, data),
  delete: (id) => api.delete(`/kpis/${id}`),
  getById: (id) => api.get(`/kpis/${id}`),
}

export const projectsAPI = {
  getAll: () => api.get('/projects/'),
  create: (data) => api.post('/projects/', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getById: (id) => api.get(`/projects/${id}`),
}

export const risksAPI = {
  getAll: () => api.get('/risks/'),
  create: (data) => api.post('/risks/', data),
  update: (id, data) => api.put(`/risks/${id}`, data),
  delete: (id) => api.delete(`/risks/${id}`),
  getById: (id) => api.get(`/risks/${id}`),
}

export const sprintsAPI = {
  getAll: () => api.get('/sprints/'),
  create: (data) => api.post('/sprints/', data),
  update: (id, data) => api.put(`/sprints/${id}`, data),
  delete: (id) => api.delete(`/sprints/${id}`),
  getById: (id) => api.get(`/sprints/${id}`),
}

export const resourcesAPI = {
  getAll: () => api.get('/resources/'),
  create: (data) => api.post('/resources/', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  getById: (id) => api.get(`/resources/${id}`),
}

export const dependenciesAPI = {
  getAll: () => api.get('/dependencies/'),
  create: (data) => api.post('/dependencies/', data),
  update: (id, data) => api.put(`/dependencies/${id}`, data),
  delete: (id) => api.delete(`/dependencies/${id}`),
  getById: (id) => api.get(`/dependencies/${id}`),
}

export const releasesAPI = {
  getAll: () => api.get('/releases/'),
  create: (data) => api.post('/releases/', data),
  update: (id, data) => api.put(`/releases/${id}`, data),
  delete: (id) => api.delete(`/releases/${id}`),
  getById: (id) => api.get(`/releases/${id}`),
}

export const changeRequestsAPI = {
  getAll: () => api.get('/change-requests/'),
  create: (data) => api.post('/change-requests/', data),
  update: (id, data) => api.put(`/change-requests/${id}`, data),
  delete: (id) => api.delete(`/change-requests/${id}`),
  getById: (id) => api.get(`/change-requests/${id}`),
}

export const estimationsAPI = {
  getAll: () => api.get('/estimations/'),
  create: (data) => api.post('/estimations/', data),
  update: (id, data) => api.put(`/estimations/${id}`, data),
  delete: (id) => api.delete(`/estimations/${id}`),
  getById: (id) => api.get(`/estimations/${id}`),
}

export const statusReportsAPI = {
  getAll: () => api.get('/status-reports/'),
  create: (data) => api.post('/status-reports/', data),
  update: (id, data) => api.put(`/status-reports/${id}`, data),
  delete: (id) => api.delete(`/status-reports/${id}`),
  getById: (id) => api.get(`/status-reports/${id}`),
}

export const activityLogAPI = {
  getAll: (filters = {}) => api.get('/activity-log/', { params: filters }),
  getRecent: (limit = 20) => api.get('/activity-log/?limit=' + limit),
}

export const settingsAPI = {
  getAll: () => api.get('/settings/'),
  update: (data) => api.put('/settings/', data),
}

export default api
