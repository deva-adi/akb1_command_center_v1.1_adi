import React, { useState, useEffect } from 'react'
import { projectsAPI } from '../utils/api'

const ProjectSelector = ({ value, onChange, className = '' }) => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectsAPI.getAll()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const selectedValue = e.target.value
    // Convert to integer if not empty string
    const projectId = selectedValue === '' ? '' : parseInt(selectedValue, 10)
    onChange(projectId)
  }

  return (
    <select
      value={value || ''}
      onChange={handleChange}
      className={`form-select w-full ${className}`}
      disabled={loading}
    >
      {loading ? (
        <option value="">Loading projects...</option>
      ) : (
        <>
          <option value="">Select Project...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </>
      )}
    </select>
  )
}

export default ProjectSelector
