import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import { estimationsAPI } from '../utils/api'

const Estimations = () => {
  const [estimations, setEstimations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingEstimation, setEditingEstimation] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    method: 'PERT',
    optimistic: '',
    most_likely: '',
    pessimistic: '',
    estimated_value: '',
    confidence: '',
    owner: '',
  })

  useEffect(() => {
    fetchEstimations()
  }, [])

  const fetchEstimations = async () => {
    try {
      setLoading(true)
      const data = await estimationsAPI.getAll()
      setEstimations(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load estimations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calculatePERT = (o, m, p) => {
    if (!o || !m || !p) return ''
    return (((parseFloat(o) + 4 * parseFloat(m) + parseFloat(p)) / 6).toFixed(2))
  }

  const handleOpenModal = (estimation = null) => {
    if (estimation) {
      setEditingEstimation(estimation)
      setFormData({
        title: estimation.title,
        description: estimation.description,
        method: estimation.method,
        optimistic: estimation.optimistic,
        most_likely: estimation.most_likely,
        pessimistic: estimation.pessimistic,
        estimated_value: estimation.estimated_value,
        confidence: estimation.confidence,
        owner: estimation.owner,
      })
    } else {
      setEditingEstimation(null)
      setFormData({
        title: '',
        description: '',
        method: 'PERT',
        optimistic: '',
        most_likely: '',
        pessimistic: '',
        estimated_value: '',
        confidence: '',
        owner: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEstimation(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let newFormData = {
      ...formData,
      [name]: value,
    }

    if (
      formData.method === 'PERT' &&
      ['optimistic', 'most_likely', 'pessimistic'].includes(name)
    ) {
      newFormData.estimated_value = calculatePERT(
        newFormData.optimistic,
        newFormData.most_likely,
        newFormData.pessimistic
      )
    }

    setFormData(newFormData)
  }

  const handleSubmit = async () => {
    if (!formData.title) {
      setError('Estimation title is required')
      return
    }

    try {
      setModalLoading(true)
      if (editingEstimation) {
        await estimationsAPI.update(editingEstimation.id, formData)
      } else {
        await estimationsAPI.create(formData)
      }
      await fetchEstimations()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save estimation')
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (estimation) => {
    if (!confirm(`Delete estimation "${estimation.title}"?`)) return

    try {
      await estimationsAPI.delete(estimation.id)
      await fetchEstimations()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete estimation')
      console.error(err)
    }
  }

  const tableColumns = [
    { key: 'title', label: 'Title' },
    { key: 'method', label: 'Method' },
    {
      key: 'estimated_value',
      label: 'Estimate',
      render: (val) => val ? val.toFixed(2) : '-',
    },
    {
      key: 'confidence',
      label: 'Confidence',
      render: (val) => val ? `${val}%` : '-',
    },
    { key: 'owner', label: 'Owner' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  const avgEstimate =
    estimations.length > 0
      ? (estimations.reduce((sum, e) => sum + (e.estimated_value || 0), 0) /
          estimations.length).toFixed(2)
      : 0
  const highConfidence = estimations.filter((e) => (e.confidence || 0) >= 80).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-akb-green tracking-wider">
          Estimation Engine
        </h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + New Estimation
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
          <div className="text-xs text-muted mb-2">TOTAL ESTIMATIONS</div>
          <div className="text-2xl font-bold text-akb-green">
            {estimations.length}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">PERT ESTIMATES</div>
          <div className="text-2xl font-bold text-akb-green">
            {estimations.filter((e) => e.method === 'PERT').length}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">AVG ESTIMATE</div>
          <div className="text-2xl font-bold text-akb-amber">{avgEstimate}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">HIGH CONFIDENCE (80%+)</div>
          <div className="text-2xl font-bold text-akb-green">
            {highConfidence}
          </div>
        </div>
      </div>

      {/* Estimations Table */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          ESTIMATIONS REGISTER
        </h3>
        <DataTable
          columns={tableColumns}
          data={estimations}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No estimations recorded"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingEstimation ? 'Edit Estimation' : 'Create New Estimation'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingEstimation ? 'Update' : 'Create'}
        loading={modalLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">
              Estimation Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="e.g., API Refactoring Effort"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="2"
              placeholder="What is being estimated..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Estimation Method
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                className="form-select w-full"
              >
                <option value="PERT">PERT</option>
                <option value="PLANNING_POKER">Planning Poker</option>
                <option value="THREE_POINT">Three-Point</option>
                <option value="ANALOGOUS">Analogous</option>
                <option value="PARAMETRIC">Parametric</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Owner</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Estimator name"
              />
            </div>
          </div>

          {formData.method === 'PERT' && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-sm font-bold text-akb-green mb-3">
                PERT Calculator: (O + 4M + P) / 6
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-bold mb-2">
                    Optimistic (O)
                  </label>
                  <input
                    type="number"
                    name="optimistic"
                    value={formData.optimistic}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="Best case"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2">
                    Most Likely (M)
                  </label>
                  <input
                    type="number"
                    name="most_likely"
                    value={formData.most_likely}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="Expected"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2">
                    Pessimistic (P)
                  </label>
                  <input
                    type="number"
                    name="pessimistic"
                    value={formData.pessimistic}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="Worst case"
                    step="0.5"
                  />
                </div>
              </div>
              {formData.estimated_value && (
                <div className="text-center p-3 bg-gray-700 rounded">
                  <div className="text-xs text-muted">Calculated Estimate</div>
                  <div className="text-2xl font-bold text-akb-green">
                    {formData.estimated_value}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.method !== 'PERT' && (
            <div>
              <label className="block text-sm font-bold mb-2">
                Estimated Value
              </label>
              <input
                type="number"
                name="estimated_value"
                value={formData.estimated_value}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="0"
                step="0.5"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2">
              Confidence Level (%)
            </label>
            <input
              type="number"
              name="confidence"
              value={formData.confidence}
              onChange={handleInputChange}
              className="form-input w-full"
              min="0"
              max="100"
              placeholder="75"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Estimations
