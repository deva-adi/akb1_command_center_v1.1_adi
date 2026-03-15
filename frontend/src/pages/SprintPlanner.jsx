import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import ProjectSelector from '../components/ProjectSelector'
import { sprintsAPI } from '../utils/api'

const SprintPlanner = () => {
  const [sprints, setSprints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingSprint, setEditingSprint] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    pi_number: '',
    sprint_number: '',
    status: 'PLANNING',
    planned_velocity: '',
    actual_velocity: '',
    capacity_hours: '',
    team_size: '',
    start_date: '',
    end_date: '',
    project_id: null,
  })

  useEffect(() => {
    fetchSprints()
  }, [])

  const fetchSprints = async () => {
    try {
      setLoading(true)
      const data = await sprintsAPI.getAll()
      setSprints(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sprints')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (sprint = null) => {
    if (sprint) {
      setEditingSprint(sprint)
      setFormData({
        name: sprint.name,
        pi_number: sprint.pi_number,
        sprint_number: sprint.sprint_number,
        status: sprint.status,
        planned_velocity: sprint.planned_velocity,
        actual_velocity: sprint.actual_velocity,
        capacity_hours: sprint.capacity_hours,
        team_size: sprint.team_size,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        project_id: sprint.project_id,
      })
    } else {
      setEditingSprint(null)
      setFormData({
        name: '',
        pi_number: '',
        sprint_number: '',
        status: 'PLANNING',
        planned_velocity: '',
        actual_velocity: '',
        capacity_hours: '',
        team_size: '',
        start_date: '',
        end_date: '',
        project_id: null,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingSprint(null)
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
      setError('Sprint name is required')
      return
    }
    if (!formData.project_id) {
      setError('Project is required')
      return
    }

    try {
      setModalLoading(true)
      const projectId = parseInt(formData.project_id, 10)
      if (isNaN(projectId) || projectId <= 0) {
        setError('Please select a valid project')
        setModalLoading(false)
        return
      }
      const submitData = {
        ...formData,
        pi_number: parseInt(formData.pi_number, 10) || 1,
        sprint_number: parseInt(formData.sprint_number, 10) || 1,
        planned_velocity: parseFloat(formData.planned_velocity) || 0,
        actual_velocity: parseFloat(formData.actual_velocity) || 0,
        capacity_hours: parseFloat(formData.capacity_hours) || 0,
        team_size: parseInt(formData.team_size, 10) || 1,
        project_id: projectId,
      }
      if (editingSprint) {
        await sprintsAPI.update(editingSprint.id, submitData)
      } else {
        await sprintsAPI.create(submitData)
      }
      await fetchSprints()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save sprint')
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (sprint) => {
    if (!confirm(`Delete sprint "${sprint.name}"?`)) return

    try {
      await sprintsAPI.delete(sprint.id)
      await fetchSprints()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete sprint')
      console.error(err)
    }
  }

  const velocityTrendData = sprints
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .map((sprint) => ({
      sprint: sprint.name,
      planned: sprint.planned_velocity || 0,
      actual: sprint.actual_velocity || 0,
    }))

  const tableColumns = [
    { key: 'name', label: 'Sprint Name' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'planned_velocity', label: 'Planned Velocity' },
    { key: 'actual_velocity', label: 'Actual Velocity' },
    { key: 'capacity_hours', label: 'Capacity (hrs)' },
    { key: 'team_size', label: 'Team Size' },
    {
      key: 'start_date',
      label: 'Period',
      render: (val, row) => `${val} to ${row.end_date}`,
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  const totalCapacity = sprints.reduce((sum, s) => sum + (s.capacity_hours || 0), 0)
  const avgUtilization =
    sprints.length > 0
      ? (
          (sprints.reduce(
            (sum, s) =>
              sum +
              (s.capacity_hours > 0
                ? (s.actual_velocity / s.capacity_hours) * 100
                : 0),
            0
          ) /
            sprints.length) *
          100
        ).toFixed(1)
      : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-akb-green tracking-wider">
          Sprint Planner
        </h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add Sprint
        </button>
      </div>

      {error && (
        <div className="bloomberg-card p-4 text-red-400 border-l-4 border-akb-red">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">TOTAL SPRINTS</div>
          <div className="text-2xl font-bold text-akb-green">{sprints.length}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">ACTIVE SPRINTS</div>
          <div className="text-2xl font-bold text-akb-green">
            {sprints.filter((s) => s.status === 'IN_PROGRESS').length}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">TOTAL CAPACITY</div>
          <div className="text-2xl font-bold text-akb-amber">
            {totalCapacity.toFixed(1)}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">AVG UTILIZATION</div>
          <div className="text-2xl font-bold text-akb-amber">{avgUtilization}%</div>
        </div>
      </div>

      {/* Velocity Trend */}
      {velocityTrendData.length > 0 && (
        <div className="bloomberg-card p-6">
          <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
            VELOCITY TREND
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={velocityTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="sprint" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  color: '#e0e0e0',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="#00c853"
                strokeWidth={2}
                dot={{ fill: '#00c853', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#ff9100"
                strokeWidth={2}
                dot={{ fill: '#ff9100', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sprints Table */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          SPRINTS
        </h3>
        <DataTable
          columns={tableColumns}
          data={sprints}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No sprints planned"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingSprint ? 'Edit Sprint' : 'Add New Sprint'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingSprint ? 'Update' : 'Create'}
        loading={modalLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Project *</label>
            <ProjectSelector
              value={formData.project_id}
              onChange={(projectId) =>
                setFormData((prev) => ({ ...prev, project_id: projectId }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Sprint Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="e.g., Sprint 23"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">PI Number</label>
              <input
                type="number"
                name="pi_number"
                value={formData.pi_number}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Sprint Number</label>
              <input
                type="number"
                name="sprint_number"
                value={formData.sprint_number}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="1"
              />
            </div>
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
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Team Size</label>
              <input
                type="number"
                name="team_size"
                value={formData.team_size}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="6"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Capacity Hours
              </label>
              <input
                type="number"
                name="capacity_hours"
                value={formData.capacity_hours}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="240"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Planned Velocity
              </label>
              <input
                type="number"
                name="planned_velocity"
                value={formData.planned_velocity}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="35"
                step="0.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Actual Velocity
              </label>
              <input
                type="number"
                name="actual_velocity"
                value={formData.actual_velocity}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="38"
                step="0.5"
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
        </div>
      </Modal>
    </div>
  )
}

export default SprintPlanner
