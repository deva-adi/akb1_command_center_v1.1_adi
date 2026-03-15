import React, { useState, useEffect } from 'react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { risksAPI } from '../utils/api'

const RiskMatrix = () => {
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingRisk, setEditingRisk] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    probability: '3',
    impact: '3',
    status: 'ACTIVE',
    mitigation_plan: '',
    owner: '',
  })

  useEffect(() => {
    fetchRisks()
  }, [])

  const fetchRisks = async () => {
    try {
      setLoading(true)
      const data = await risksAPI.getAll()
      setRisks(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load risks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (risk = null) => {
    if (risk) {
      setEditingRisk(risk)
      setFormData({
        title: risk.title,
        description: risk.description,
        probability: risk.probability,
        impact: risk.impact,
        status: risk.status,
        mitigation_plan: risk.mitigation_plan,
        owner: risk.owner,
      })
    } else {
      setEditingRisk(null)
      setFormData({
        title: '',
        description: '',
        probability: '3',
        impact: '3',
        status: 'ACTIVE',
        mitigation_plan: '',
        owner: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRisk(null)
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
      setError('Risk title is required')
      return
    }

    try {
      setModalLoading(true)
      if (editingRisk) {
        await risksAPI.update(editingRisk.id, formData)
      } else {
        await risksAPI.create(formData)
      }
      await fetchRisks()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save risk')
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (risk) => {
    if (!confirm(`Delete risk "${risk.title}"?`)) return

    try {
      await risksAPI.delete(risk.id)
      await fetchRisks()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete risk')
      console.error(err)
    }
  }

  const getRiskColor = (probability, impact) => {
    const score = probability * impact
    if (score >= 15) return '#ff1744'
    if (score >= 9) return '#ff9100'
    return '#00c853'
  }

  const getRiskSeverity = (probability, impact) => {
    const score = probability * impact
    if (score >= 15) return 'CRITICAL'
    if (score >= 9) return 'HIGH'
    return 'MEDIUM'
  }

  const tableColumns = [
    { key: 'title', label: 'Risk Title' },
    { key: 'probability', label: 'Probability' },
    { key: 'impact', label: 'Impact' },
    {
      key: 'id',
      label: 'Severity',
      render: (_, row) => (
        <StatusBadge
          status={getRiskSeverity(row.probability, row.impact)}
        />
      ),
    },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'owner', label: 'Owner' },
  ]

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
          Risk Matrix
        </h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add Risk
        </button>
      </div>

      {error && (
        <div className="bloomberg-card p-4 text-red-400 border-l-4 border-akb-red">
          {error}
        </div>
      )}

      {/* 5x5 Risk Matrix */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          RISK HEATMAP
        </h3>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-max">
            <div className="flex">
              <div className="w-16"></div>
              {[1, 2, 3, 4, 5].map((impact) => (
                <div
                  key={`impact-${impact}`}
                  className="w-24 h-8 flex items-center justify-center text-xs font-bold border-b border-r border-gray-600"
                >
                  Impact {impact}
                </div>
              ))}
            </div>

            {[5, 4, 3, 2, 1].map((probability) => (
              <div key={`prob-${probability}`} className="flex">
                <div className="w-16 h-24 flex items-center justify-center text-xs font-bold border-r border-gray-600">
                  Prob {probability}
                </div>
                {[1, 2, 3, 4, 5].map((impact) => {
                  const cellRisks = risks.filter(
                    (r) => r.probability === probability && r.impact === impact
                  )
                  const color =
                    cellRisks.length > 0
                      ? getRiskColor(probability, impact)
                      : 'transparent'

                  return (
                    <div
                      key={`${probability}-${impact}`}
                      className="w-24 h-24 flex flex-wrap items-center justify-center gap-1 border-b border-r border-gray-600 p-1"
                      style={{
                        backgroundColor:
                          cellRisks.length > 0
                            ? `${color}20`
                            : 'transparent',
                      }}
                    >
                      {cellRisks.map((risk) => (
                        <div
                          key={risk.id}
                          className="w-4 h-4 rounded-full cursor-pointer hover:w-5 hover:h-5 transition"
                          style={{ backgroundColor: color }}
                          title={risk.title}
                          onClick={() => handleOpenModal(risk)}
                        ></div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk List Table */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          RISK REGISTER
        </h3>
        <DataTable
          columns={tableColumns}
          data={risks}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No risks registered"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingRisk ? 'Edit Risk' : 'Add New Risk'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingRisk ? 'Update' : 'Create'}
        loading={modalLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Risk Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="e.g., Resource Shortage"
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
              placeholder="Detailed risk description..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Probability (1-5)
              </label>
              <select
                name="probability"
                value={formData.probability}
                onChange={handleInputChange}
                className="form-select w-full"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} - {['Very Low', 'Low', 'Medium', 'High', 'Very High'][num - 1]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Impact (1-5)
              </label>
              <select
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                className="form-select w-full"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} - {['Very Low', 'Low', 'Medium', 'High', 'Very High'][num - 1]}
                  </option>
                ))}
              </select>
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
                <option value="ACTIVE">Active</option>
                <option value="MITIGATED">Mitigated</option>
                <option value="RESOLVED">Resolved</option>
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
                placeholder="Risk owner name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Mitigation Plan
            </label>
            <textarea
              name="mitigation_plan"
              value={formData.mitigation_plan}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="3"
              placeholder="Steps to mitigate this risk..."
            ></textarea>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RiskMatrix
