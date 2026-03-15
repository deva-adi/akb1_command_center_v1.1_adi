import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import { resourcesAPI } from '../utils/api'

const Resources = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    role: '',
    allocation_percent: '',
    utilization_percent: '',
    capacity_hours: '',
    billable: false,
  })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const data = await resourcesAPI.getAll()
      setResources(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource)
      setFormData({
        name: resource.name,
        team: resource.team,
        role: resource.role,
        allocation_percent: resource.allocation_percent,
        utilization_percent: resource.utilization_percent,
        capacity_hours: resource.capacity_hours,
        billable: resource.billable,
      })
    } else {
      setEditingResource(null)
      setFormData({
        name: '',
        team: '',
        role: '',
        allocation_percent: '',
        utilization_percent: '',
        capacity_hours: '',
        billable: false,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingResource(null)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.team) {
      setError('Name and team are required')
      return
    }

    try {
      setModalLoading(true)
      if (editingResource) {
        await resourcesAPI.update(editingResource.id, formData)
      } else {
        await resourcesAPI.create(formData)
      }
      await fetchResources()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save resource')
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (resource) => {
    if (!confirm(`Remove resource "${resource.name}"?`)) return

    try {
      await resourcesAPI.delete(resource.id)
      await fetchResources()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resource')
      console.error(err)
    }
  }

  const getUtilizationColor = (util) => {
    if (util >= 85) return '#ff1744'
    if (util >= 70) return '#ff9100'
    return '#00c853'
  }

  const tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'team', label: 'Team' },
    { key: 'role', label: 'Role' },
    { key: 'allocation_percent', label: 'Allocation', render: (val) => `${val}%` },
    {
      key: 'utilization_percent',
      label: 'Utilization',
      render: (val) => (
        <span style={{ color: getUtilizationColor(val) }} className="font-bold">
          {val}%
        </span>
      ),
    },
    { key: 'capacity_hours', label: 'Capacity (hrs)' },
    {
      key: 'billable',
      label: 'Billable',
      render: (val) => (val ? 'Yes' : 'No'),
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  const totalAllocation = resources.reduce(
    (sum, r) => sum + (r.allocation_percent || 0),
    0
  )
  const avgUtilization =
    resources.length > 0
      ? (resources.reduce((sum, r) => sum + (r.utilization_percent || 0), 0) /
          resources.length).toFixed(1)
      : 0
  const billableCount = resources.filter((r) => r.billable).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-akb-green tracking-wider">
          Resource Management
        </h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add Resource
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
          <div className="text-xs text-muted mb-2">TOTAL RESOURCES</div>
          <div className="text-2xl font-bold text-akb-green">{resources.length}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">BILLABLE</div>
          <div className="text-2xl font-bold text-akb-green">{billableCount}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">TOTAL ALLOCATION</div>
          <div className="text-2xl font-bold text-akb-amber">
            {totalAllocation.toFixed(1)}%
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">AVG UTILIZATION</div>
          <div className="text-2xl font-bold text-akb-amber">{avgUtilization}%</div>
        </div>
      </div>

      {/* Utilization Heatmap */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          UTILIZATION HEATMAP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="p-3 rounded border"
              style={{
                borderColor: getUtilizationColor(resource.utilization_percent),
                backgroundColor: `${getUtilizationColor(resource.utilization_percent)}20`,
              }}
            >
              <div className="font-bold text-sm">{resource.name}</div>
              <div className="text-xs text-muted mb-2">{resource.team}</div>
              <div className="h-2 bg-gray-800 rounded overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${resource.utilization_percent}%`,
                    backgroundColor: getUtilizationColor(resource.utilization_percent),
                  }}
                ></div>
              </div>
              <div className="text-xs font-bold mt-2">
                {resource.utilization_percent}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources Table */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          RESOURCE REGISTER
        </h3>
        <DataTable
          columns={tableColumns}
          data={resources}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No resources allocated"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingResource ? 'Edit Resource' : 'Add New Resource'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingResource ? 'Update' : 'Create'}
        loading={modalLoading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Team *</label>
              <input
                type="text"
                name="team"
                value={formData.team}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Backend"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Senior Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Capacity (hrs/week)
              </label>
              <input
                type="number"
                name="capacity_hours"
                value={formData.capacity_hours}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Allocation (%)
              </label>
              <input
                type="number"
                name="allocation_percent"
                value={formData.allocation_percent}
                onChange={handleInputChange}
                className="form-input w-full"
                min="0"
                max="100"
                placeholder="80"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Utilization (%)
              </label>
              <input
                type="number"
                name="utilization_percent"
                value={formData.utilization_percent}
                onChange={handleInputChange}
                className="form-input w-full"
                min="0"
                max="100"
                placeholder="85"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="billable"
              id="billable"
              checked={formData.billable}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <label htmlFor="billable" className="text-sm font-bold">
              Billable Resource
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Resources
