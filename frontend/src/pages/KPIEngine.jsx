import React, { useState, useEffect } from 'react'
import KPICard from '../components/KPICard'
import Modal from '../components/Modal'
import { kpisAPI } from '../utils/api'

const KPIEngine = () => {
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingKpi, setEditingKpi] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    target_value: '',
    current_value: '',
    formula: '',
    description: '',
  })

  useEffect(() => {
    fetchKpis()
  }, [])

  const fetchKpis = async () => {
    try {
      setLoading(true)
      const data = await kpisAPI.getAll()
      setKpis(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load KPIs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (kpi = null) => {
    if (kpi) {
      setEditingKpi(kpi)
      setFormData({
        name: kpi.name,
        category: kpi.category,
        unit: kpi.unit,
        target_value: kpi.target_value,
        current_value: kpi.current_value,
        formula: kpi.formula,
        description: kpi.description,
      })
    } else {
      setEditingKpi(null)
      setFormData({
        name: '',
        category: '',
        unit: '',
        target_value: '',
        current_value: '',
        formula: '',
        description: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingKpi(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.unit) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setModalLoading(true)
      if (editingKpi) {
        await kpisAPI.update(editingKpi.id, formData)
      } else {
        await kpisAPI.create(formData)
      }
      await fetchKpis()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save KPI')
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (kpi) => {
    if (!confirm(`Delete KPI "${kpi.name}"?`)) return

    try {
      await kpisAPI.delete(kpi.id)
      await fetchKpis()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete KPI')
      console.error(err)
    }
  }

  const categories = Array.from(new Set(kpis.map((k) => k.category)))
  const filteredKpis =
    selectedCategory === 'all'
      ? kpis
      : kpis.filter((k) => k.category === selectedCategory)

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
          KPI Engine
        </h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add KPI
        </button>
      </div>

      {error && (
        <div className="bloomberg-card p-4 text-red-400 border-l-4 border-akb-red">
          {error}
        </div>
      )}

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded text-sm font-bold transition ${
              selectedCategory === 'all'
                ? 'bg-akb-green text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded text-sm font-bold transition ${
                selectedCategory === cat
                  ? 'bg-akb-green text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKpis.map((kpi) => (
          <KPICard
            key={kpi.id}
            title={kpi.name}
            value={kpi.current_value}
            unit={kpi.unit}
            trend={kpi.trend || 0}
            status={kpi.status}
            threshold={kpi.target_value}
            onClick={() => handleOpenModal(kpi)}
            onEdit={() => handleOpenModal(kpi)}
            onDelete={() => handleDelete(kpi)}
          />
        ))}
      </div>

      {filteredKpis.length === 0 && (
        <div className="bloomberg-card p-8 text-center text-muted">
          No KPIs found in this category
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingKpi ? 'Edit KPI' : 'Add New KPI'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingKpi ? 'Update' : 'Create'}
        loading={modalLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="e.g., Resource Utilization"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="e.g., Delivery"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Unit *</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="e.g., %"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Current Value
              </label>
              <input
                type="number"
                name="current_value"
                value={formData.current_value}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Target Value</label>
              <input
                type="number"
                name="target_value"
                value={formData.target_value}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Formula</label>
            <input
              type="text"
              name="formula"
              value={formData.formula}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="e.g., (Available Hours / Total Hours) * 100"
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
              placeholder="KPI description and context..."
            ></textarea>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default KPIEngine
