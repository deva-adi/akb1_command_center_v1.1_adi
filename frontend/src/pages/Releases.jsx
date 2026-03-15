import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { releasesAPI } from '../utils/api'

const Releases = () => {
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingRelease, setEditingRelease] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    version: '',
    name: '',
    status: 'PLANNED',
    planned_date: '',
    actual_date: '',
    description: '',
    features: '',
    release_manager: '',
  })

  useEffect(() => {
    fetchReleases()
  }, [])

  const fetchReleases = async () => {
    try {
      setLoading(true)
      const data = await releasesAPI.getAll()
      setReleases(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load releases')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (release = null) => {
    if (release) {
      setEditingRelease(release)
      setFormData({
        version: release.version,
        name: release.name,
        status: release.status,
        planned_date: release.planned_date,
        actual_date: release.actual_date,
        description: release.description,
        features: release.features,
        release_manager: release.release_manager,
      })
    } else {
      setEditingRelease(null)
      setFormData({
        version: '',
        name: '',
        status: 'PLANNED',
        planned_date: '',
        actual_date: '',
        description: '',
        features: '',
        release_manager: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRelease(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.version || !formData.name) {
      setError('Version and name are required')
      return
    }

    try {
      setModalLoading(true)
      if (editingRelease) {
        await releasesAPI.update(editingRelease.id, formData)
      } else {
        await releasesAPI.create(formData)
      }
      await fetchReleases()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save release')
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (release) => {
    if (!confirm(`Delete release "${release.version}"?`)) return

    try {
      await releasesAPI.delete(release.id)
      await fetchReleases()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete release')
      console.error(err)
    }
  }

  const tableColumns = [
    { key: 'version', label: 'Version' },
    { key: 'name', label: 'Release Name' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    { key: 'planned_date', label: 'Planned Date' },
    { key: 'actual_date', label: 'Actual Date' },
    { key: 'release_manager', label: 'Manager' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  const statusCounts = {
    PLANNED: releases.filter((r) => r.status === 'PLANNED').length,
    IN_PROGRESS: releases.filter((r) => r.status === 'IN_PROGRESS').length,
    COMPLETED: releases.filter((r) => r.status === 'COMPLETED').length,
    CANCELLED: releases.filter((r) => r.status === 'CANCELLED').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-akb-green tracking-wider">
          Release Management
        </h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add Release
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
          <div className="text-xs text-muted mb-2">TOTAL RELEASES</div>
          <div className="text-2xl font-bold text-akb-green">{releases.length}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">PLANNED</div>
          <div className="text-2xl font-bold text-akb-amber">{statusCounts.PLANNED}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">IN PROGRESS</div>
          <div className="text-2xl font-bold text-akb-amber">
            {statusCounts.IN_PROGRESS}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">COMPLETED</div>
          <div className="text-2xl font-bold text-akb-green">
            {statusCounts.COMPLETED}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">CANCELLED</div>
          <div className="text-2xl font-bold text-akb-red">{statusCounts.CANCELLED}</div>
        </div>
      </div>

      {/* Releases Timeline */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          RELEASE TIMELINE
        </h3>
        <div className="space-y-3">
          {releases
            .sort((a, b) => new Date(b.planned_date) - new Date(a.planned_date))
            .map((release) => (
              <div
                key={release.id}
                className="flex items-center justify-between p-3 rounded border border-gray-700 hover:border-akb-green transition cursor-pointer"
                onClick={() => handleOpenModal(release)}
              >
                <div className="flex-1">
                  <div className="font-bold">{release.version} - {release.name}</div>
                  <div className="text-xs text-muted">
                    Planned: {release.planned_date}
                    {release.actual_date && ` | Actual: ${release.actual_date}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={release.status} />
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenModal(release)
                      }}
                      className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(release)
                      }}
                      className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Releases Table */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          RELEASE REGISTER
        </h3>
        <DataTable
          columns={tableColumns}
          data={releases}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No releases scheduled"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingRelease ? 'Edit Release' : 'Add New Release'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingRelease ? 'Update' : 'Create'}
        loading={modalLoading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Version *</label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="e.g., 3.2.0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Release Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="e.g., Q2 Release"
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
              rows="2"
              placeholder="Release description..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Key Features</label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="3"
              placeholder="Features included (one per line)..."
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
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Release Manager
              </label>
              <input
                type="text"
                name="release_manager"
                value={formData.release_manager}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Manager name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Planned Date
              </label>
              <input
                type="date"
                name="planned_date"
                value={formData.planned_date}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Actual Date
              </label>
              <input
                type="date"
                name="actual_date"
                value={formData.actual_date}
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

export default Releases
