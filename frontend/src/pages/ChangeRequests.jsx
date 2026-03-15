import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { changeRequestsAPI } from '../utils/api'

const ChangeRequests = () => {
  const [changeRequests, setChangeRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCR, setEditingCR] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'DRAFT',
    impact_area: '',
    requested_by: '',
    approval_date: '',
    implementation_date: '',
  })

  useEffect(() => {
    fetchChangeRequests()
  }, [])

  const fetchChangeRequests = async () => {
    try {
      setLoading(true)
      const data = await changeRequestsAPI.getAll()
      setChangeRequests(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load change requests')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (cr = null) => {
    if (cr) {
      setEditingCR(cr)
      setFormData({
        title: cr.title,
        description: cr.description,
        priority: cr.priority,
        status: cr.status,
        impact_area: cr.impact_area,
        requested_by: cr.requested_by,
        approval_date: cr.approval_date,
        implementation_date: cr.implementation_date,
      })
    } else {
      setEditingCR(null)
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'DRAFT',
        impact_area: '',
        requested_by: '',
        approval_date: '',
        implementation_date: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCR(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.title) {
      setError('Change request title is required')
      return
    }

    try {
      setModalLoading(true)
      if (editingCR) {
        await changeRequestsAPI.update(editingCR.id, formData)
      } else {
        await changeRequestsAPI.create(formData)
      }
      await fetchChangeRequests()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save change request')
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (cr) => {
    if (!confirm(`Delete change request "${cr.title}"?`)) return

    try {
      await changeRequestsAPI.delete(cr.id)
      await fetchChangeRequests()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete change request')
      console.error(err)
    }
  }

  const filteredCRs =
    priorityFilter === 'all'
      ? changeRequests
      : changeRequests.filter((cr) => cr.priority === priorityFilter)

  const tableColumns = [
    { key: 'title', label: 'Title' },
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
    { key: 'impact_area', label: 'Impact Area' },
    { key: 'requested_by', label: 'Requested By' },
    { key: 'approval_date', label: 'Approval Date' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  const priorityCounts = {
    LOW: changeRequests.filter((cr) => cr.priority === 'LOW').length,
    MEDIUM: changeRequests.filter((cr) => cr.priority === 'MEDIUM').length,
    HIGH: changeRequests.filter((cr) => cr.priority === 'HIGH').length,
    CRITICAL: changeRequests.filter((cr) => cr.priority === 'CRITICAL').length,
  }

  const statusCounts = {
    DRAFT: changeRequests.filter((cr) => cr.status === 'DRAFT').length,
    SUBMITTED: changeRequests.filter((cr) => cr.status === 'SUBMITTED').length,
    APPROVED: changeRequests.filter((cr) => cr.status === 'APPROVED').length,
    IMPLEMENTED: changeRequests.filter((cr) => cr.status === 'IMPLEMENTED').length,
    REJECTED: changeRequests.filter((cr) => cr.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-akb-green tracking-wider">
          Change Request Manager
        </h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + New CR
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
          <div className="text-xs text-muted mb-2">TOTAL CRs</div>
          <div className="text-2xl font-bold text-akb-green">
            {changeRequests.length}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">PENDING APPROVAL</div>
          <div className="text-2xl font-bold text-akb-amber">
            {statusCounts.SUBMITTED}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">APPROVED</div>
          <div className="text-2xl font-bold text-akb-green">
            {statusCounts.APPROVED}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">CRITICAL</div>
          <div className="text-2xl font-bold text-akb-red">
            {priorityCounts.CRITICAL}
          </div>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setPriorityFilter('all')}
          className={`px-4 py-2 rounded text-sm font-bold transition ${
            priorityFilter === 'all'
              ? 'bg-akb-green text-black'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => (
          <button
            key={priority}
            onClick={() => setPriorityFilter(priority)}
            className={`px-4 py-2 rounded text-sm font-bold transition ${
              priorityFilter === priority
                ? 'bg-akb-green text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {priority}
          </button>
        ))}
      </div>

      {/* Change Requests Table */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          CHANGE REQUESTS
        </h3>
        <DataTable
          columns={tableColumns}
          data={filteredCRs}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No change requests"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingCR ? 'Edit Change Request' : 'Create New Change Request'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingCR ? 'Update' : 'Create'}
        loading={modalLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">
              Change Request Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="e.g., Update API Rate Limits"
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
              placeholder="Detailed description of the change..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-bold mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select w-full"
              >
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="IMPLEMENTED">Implemented</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Impact Area</label>
            <input
              type="text"
              name="impact_area"
              value={formData.impact_area}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="e.g., API, Database, Frontend"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Requested By
              </label>
              <input
                type="text"
                name="requested_by"
                value={formData.requested_by}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Requester name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Approval Date
              </label>
              <input
                type="date"
                name="approval_date"
                value={formData.approval_date}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Implementation Date
            </label>
            <input
              type="date"
              name="implementation_date"
              value={formData.implementation_date}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ChangeRequests
