import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { dependenciesAPI } from '../utils/api'

const Dependencies = () => {
  const [dependencies, setDependencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingDependency, setEditingDependency] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    source_team: '',
    target_team: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    target_date: '',
    owner: '',
  })

  useEffect(() => {
    fetchDependencies()
  }, [])

  const fetchDependencies = async () => {
    try {
      setLoading(true)
      const data = await dependenciesAPI.getAll()
      setDependencies(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dependencies')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (dep = null) => {
    if (dep) {
      setEditingDependency(dep)
      setFormData({
        source_team: dep.source_team,
        target_team: dep.target_team,
        description: dep.description,
        status: dep.status,
        priority: dep.priority,
        target_date: dep.target_date,
        owner: dep.owner,
      })
    } else {
      setEditingDependency(null)
      setFormData({
        source_team: '',
        target_team: '',
        description: '',
        status: 'PENDING',
        priority: 'MEDIUM',
        target_date: '',
        owner: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDependency(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.source_team || !formData.target_team) {
      setError('Source and target teams are required')
      return
    }

    try {
      setModalLoading(true)
      if (editingDependency) {
        await dependenciesAPI.update(editingDependency.id, formData)
      } else {
        await dependenciesAPI.create(formData)
      }
      await fetchDependencies()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save dependency')
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (dep) => {
    if (!confirm('Delete this dependency?')) return

    try {
      await dependenciesAPI.delete(dep.id)
      await fetchDependencies()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete dependency')
      console.error(err)
    }
  }

  const filteredDependencies =
    statusFilter === 'all'
      ? dependencies
      : dependencies.filter((d) => d.status === statusFilter)

  const tableColumns = [
    { key: 'source_team', label: 'Source Team' },
    { key: 'target_team', label: 'Target Team' },
    { key: 'description', label: 'Description' },
    {
      key: 'priority',
      label: 'Priority',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    { key: 'target_date', label: 'Target Date' },
    { key: 'owner', label: 'Owner' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  const statusCounts = {
    PENDING: dependencies.filter((d) => d.status === 'PENDING').length,
    IN_PROGRESS: dependencies.filter((d) => d.status === 'IN_PROGRESS').length,
    RESOLVED: dependencies.filter((d) => d.status === 'RESOLVED').length,
    BLOCKED: dependencies.filter((d) => d.status === 'BLOCKED').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-akb-green tracking-wider">
          Dependency Tracker
        </h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add Dependency
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
          <div className="text-xs text-muted mb-2">TOTAL</div>
          <div className="text-2xl font-bold text-akb-green">{dependencies.length}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">PENDING</div>
          <div className="text-2xl font-bold text-akb-amber">{statusCounts.PENDING}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">IN PROGRESS</div>
          <div className="text-2xl font-bold text-akb-amber">
            {statusCounts.IN_PROGRESS}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">BLOCKED</div>
          <div className="text-2xl font-bold text-akb-red">{statusCounts.BLOCKED}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">RESOLVED</div>
          <div className="text-2xl font-bold text-akb-green">
            {statusCounts.RESOLVED}
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded text-sm font-bold transition ${
            statusFilter === 'all'
              ? 'bg-akb-green text-black'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {['PENDING', 'IN_PROGRESS', 'BLOCKED', 'RESOLVED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded text-sm font-bold transition ${
              statusFilter === status
                ? 'bg-akb-green text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Dependencies Table */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          DEPENDENCY REGISTER
        </h3>
        <DataTable
          columns={tableColumns}
          data={filteredDependencies}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No dependencies registered"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingDependency ? 'Edit Dependency' : 'Add New Dependency'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingDependency ? 'Update' : 'Create'}
        loading={modalLoading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Source Team *</label>
              <input
                type="text"
                name="source_team"
                value={formData.source_team}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="e.g., Backend"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Target Team *</label>
              <input
                type="text"
                name="target_team"
                value={formData.target_team}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="e.g., DevOps"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="3"
              placeholder="Dependency details..."
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
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-select w-full"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Target Date</label>
              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Owner</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Dependency owner"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Dependencies
