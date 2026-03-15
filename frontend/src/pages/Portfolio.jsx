import React, { useState, useEffect } from 'react'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { projectsAPI } from '../utils/api'

const Portfolio = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ON_TRACK',
    health_score: '',
    budget_planned: '',
    budget_actual: '',
    start_date: '',
    end_date: '',
    manager: '',
  })

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

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        health_score: project.health_score,
        budget_planned: project.budget_planned,
        budget_actual: project.budget_actual,
        start_date: project.start_date,
        end_date: project.end_date,
        manager: project.manager,
      })
    } else {
      setEditingProject(null)
      setFormData({
        name: '',
        description: '',
        status: 'ON_TRACK',
        health_score: '',
        budget_planned: '',
        budget_actual: '',
        start_date: '',
        end_date: '',
        manager: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProject(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('Project name is required')
      return
    }

    try {
      setModalLoading(true)
      if (editingProject) {
        await projectsAPI.update(editingProject.id, formData)
      } else {
        await projectsAPI.create(formData)
      }
      await fetchProjects()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project')
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (project) => {
    if (!confirm(`Delete project "${project.name}"?`)) return

    try {
      await projectsAPI.delete(project.id)
      await fetchProjects()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project')
      console.error(err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ON_TRACK':
        return '#00c853'
      case 'AT_RISK':
        return '#ff9100'
      case 'OFF_TRACK':
        return '#ff1744'
      default:
        return '#999'
    }
  }

  const greenCount = projects.filter((p) => p.status === 'ON_TRACK').length
  const amberCount = projects.filter((p) => p.status === 'AT_RISK').length
  const redCount = projects.filter((p) => p.status === 'OFF_TRACK').length
  const totalBudgetPlanned = projects.reduce((sum, p) => sum + (p.budget_planned || 0), 0)
  const totalBudgetActual = projects.reduce((sum, p) => sum + (p.budget_actual || 0), 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-akb-green tracking-wider">
          Portfolio Management
        </h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add Project
        </button>
      </div>

      {error && (
        <div className="bloomberg-card p-4 text-red-400 border-l-4 border-akb-red">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">TOTAL PROJECTS</div>
          <div className="text-2xl font-bold text-akb-green">{projects.length}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">GREEN</div>
          <div className="text-2xl font-bold text-akb-green">{greenCount}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">AMBER</div>
          <div className="text-2xl font-bold text-akb-amber">{amberCount}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">RED</div>
          <div className="text-2xl font-bold text-akb-red">{redCount}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">BURN RATE</div>
          <div className="text-2xl font-bold text-akb-amber">
            {totalBudgetPlanned > 0
              ? ((totalBudgetActual / totalBudgetPlanned) * 100).toFixed(1)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          BUDGET OVERVIEW
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-muted mb-2">PLANNED BUDGET</div>
            <div className="text-2xl font-bold text-akb-green">
              ${(totalBudgetPlanned / 1000000).toFixed(1)}M
            </div>
          </div>
          <div>
            <div className="text-xs text-muted mb-2">ACTUAL BUDGET</div>
            <div className="text-2xl font-bold text-akb-amber">
              ${(totalBudgetActual / 1000000).toFixed(1)}M
            </div>
          </div>
          <div>
            <div className="text-xs text-muted mb-2">VARIANCE</div>
            <div
              className="text-2xl font-bold"
              style={{
                color:
                  totalBudgetActual > totalBudgetPlanned ? '#ff1744' : '#00c853',
              }}
            >
              ${((totalBudgetActual - totalBudgetPlanned) / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bloomberg-card p-6"
            style={{ borderTopColor: getStatusColor(project.status), borderTopWidth: '3px' }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{project.name}</h3>
                <StatusBadge status={project.status} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenModal(project)}
                  className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project)}
                  className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="text-xs text-muted mb-3 line-clamp-2">
              {project.description}
            </div>

            <div className="space-y-2 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Health Score</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{project.health_score}%</span>
              </div>
              <div className="h-2 rounded overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div
                  className="h-full"
                  style={{
                    width: `${project.health_score}%`,
                    backgroundColor:
                      project.health_score >= 80
                        ? '#00c853'
                        : project.health_score >= 50
                          ? '#ff9100'
                          : '#ff1744',
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Manager</span>
                <span style={{ color: 'var(--text-primary)' }}>{project.manager || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Budget</span>
                <span className="text-white">
                  ${(project.budget_actual || 0) / 1000}K / ${(project.budget_planned || 0) / 1000}K
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Period</span>
                <span className="text-white">
                  {project.start_date} to {project.end_date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="bloomberg-card p-8 text-center text-muted">
          No projects found. Create one to get started.
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingProject ? 'Update' : 'Create'}
        loading={modalLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Project Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="e.g., Cloud Migration"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="3"
              placeholder="Project description..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select w-full"
              >
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="OFF_TRACK">Off Track</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Health Score (%)</label>
              <input
                type="number"
                name="health_score"
                value={formData.health_score}
                onChange={handleInputChange}
                className="form-input w-full"
                min="0"
                max="100"
                placeholder="75"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Planned Budget ($)
              </label>
              <input
                type="number"
                name="budget_planned"
                value={formData.budget_planned}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="1000000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Actual Budget ($)
              </label>
              <input
                type="number"
                name="budget_actual"
                value={formData.budget_actual}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="950000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Manager</label>
            <input
              type="text"
              name="manager"
              value={formData.manager}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="John Doe"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Portfolio
