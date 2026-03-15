import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import { settingsAPI, kpisAPI } from '../utils/api'

const Settings = () => {
  const [settings, setSettings] = useState(null)
  const [customKpis, setCustomKpis] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showKpiModal, setShowKpiModal] = useState(false)
  const [newKpi, setNewKpi] = useState({
    name: '',
    category: '',
    unit: '',
    target_value: '',
    formula: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsAPI.getAll()
      setSettings(data)

      const kpiData = await kpisAPI.getAll()
      setCustomKpis(kpiData)

      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      await settingsAPI.update(settings)
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleAddKpi = async () => {
    if (!newKpi.name || !newKpi.category || !newKpi.unit) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      await kpisAPI.create(newKpi)
      await fetchSettings()
      setNewKpi({
        name: '',
        category: '',
        unit: '',
        target_value: '',
        formula: '',
      })
      setShowKpiModal(false)
      setSuccess('KPI added successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add KPI')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKpi = async (kpi) => {
    if (!confirm(`Delete KPI "${kpi.name}"?`)) return

    try {
      await kpisAPI.delete(kpi.id)
      await fetchSettings()
      setSuccess('KPI deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete KPI')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="bloomberg-card p-6 text-red-400">
        Failed to load settings
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-akb-green tracking-wider">
        Settings & Configuration
      </h1>

      {error && (
        <div className="bloomberg-card p-4 text-red-400 border-l-4 border-akb-red">
          {error}
        </div>
      )}

      {success && (
        <div className="bloomberg-card p-4 text-green-400 border-l-4 border-akb-green">
          {success}
        </div>
      )}

      {/* General Settings */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          GENERAL SETTINGS
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">
              Application Name
            </label>
            <input
              type="text"
              value={settings.general?.app_name || ''}
              onChange={(e) =>
                handleSettingChange('general', 'app_name', e.target.value)
              }
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={settings.general?.organization_name || ''}
              onChange={(e) =>
                handleSettingChange(
                  'general',
                  'organization_name',
                  e.target.value
                )
              }
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Default Theme
            </label>
            <select
              value={settings.general?.theme || 'dark'}
              onChange={(e) =>
                handleSettingChange('general', 'theme', e.target.value)
              }
              className="form-select w-full"
            >
              <option value="dark">Dark (Bloomberg)</option>
              <option value="light">Light</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Reports Email Recipients
            </label>
            <input
              type="text"
              value={settings.general?.report_recipients || ''}
              onChange={(e) =>
                handleSettingChange(
                  'general',
                  'report_recipients',
                  e.target.value
                )
              }
              className="form-input w-full"
              placeholder="email1@company.com, email2@company.com"
            />
          </div>
        </div>
      </div>

      {/* Module Configuration */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          MODULE CONFIGURATION
        </h3>
        <div className="space-y-4">
          {[
            { key: 'kpi_engine', label: 'KPI Engine' },
            { key: 'portfolio_mgmt', label: 'Portfolio Management' },
            { key: 'risk_matrix', label: 'Risk Matrix' },
            { key: 'sprint_planner', label: 'Sprint Planner' },
            { key: 'resource_mgmt', label: 'Resource Management' },
            { key: 'dependency_tracker', label: 'Dependency Tracker' },
            { key: 'release_mgmt', label: 'Release Management' },
            { key: 'change_requests', label: 'Change Requests' },
          ].map((module) => (
            <div key={module.key} className="flex items-center justify-between">
              <span className="text-sm font-bold">{module.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.modules?.[module.key] !== false}
                  onChange={(e) =>
                    handleSettingChange('modules', module.key, e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-akb-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-akb-green"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Settings */}
      <div className="bloomberg-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-akb-green tracking-wider">
            KPI MANAGEMENT
          </h3>
          <button
            onClick={() => setShowKpiModal(true)}
            className="btn btn-primary btn-sm"
          >
            + Add Custom KPI
          </button>
        </div>

        <div className="space-y-3">
          {customKpis.length === 0 ? (
            <div className="text-center text-muted py-4">
              No custom KPIs configured
            </div>
          ) : (
            customKpis.map((kpi) => (
              <div
                key={kpi.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700"
              >
                <div>
                  <div className="font-bold">{kpi.name}</div>
                  <div className="text-xs text-muted">
                    {kpi.category} • {kpi.unit}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteKpi(kpi)}
                  className="text-xs px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Display Settings */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          DISPLAY SETTINGS
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">
              Items Per Page
            </label>
            <input
              type="number"
              value={settings.display?.items_per_page || 25}
              onChange={(e) =>
                handleSettingChange('display', 'items_per_page', parseInt(e.target.value))
              }
              className="form-input w-full max-w-xs"
              min="5"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Chart Display Mode
            </label>
            <select
              value={settings.display?.chart_mode || 'interactive'}
              onChange={(e) =>
                handleSettingChange('display', 'chart_mode', e.target.value)
              }
              className="form-select w-full max-w-xs"
            >
              <option value="interactive">Interactive</option>
              <option value="static">Static Images</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_tooltips"
              checked={settings.display?.show_tooltips !== false}
              onChange={(e) =>
                handleSettingChange('display', 'show_tooltips', e.target.checked)
              }
              className="w-4 h-4"
            />
            <label htmlFor="show_tooltips" className="text-sm font-bold">
              Show Tooltips
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto_refresh"
              checked={settings.display?.auto_refresh !== false}
              onChange={(e) =>
                handleSettingChange('display', 'auto_refresh', e.target.checked)
              }
              className="w-4 h-4"
            />
            <label htmlFor="auto_refresh" className="text-sm font-bold">
              Auto-Refresh Dashboard
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveSettings}
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
        <button onClick={fetchSettings} className="btn btn-secondary">
          Reset
        </button>
      </div>

      {/* Add KPI Modal */}
      <Modal
        isOpen={showKpiModal}
        title="Add Custom KPI"
        onClose={() => setShowKpiModal(false)}
        onSubmit={handleAddKpi}
        submitLabel="Add KPI"
        loading={saving}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Name *</label>
            <input
              type="text"
              value={newKpi.name}
              onChange={(e) =>
                setNewKpi({ ...newKpi, name: e.target.value })
              }
              className="form-input w-full"
              placeholder="e.g., Cost Efficiency"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Category *</label>
              <input
                type="text"
                value={newKpi.category}
                onChange={(e) =>
                  setNewKpi({ ...newKpi, category: e.target.value })
                }
                className="form-input w-full"
                placeholder="e.g., Finance"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Unit *</label>
              <input
                type="text"
                value={newKpi.unit}
                onChange={(e) =>
                  setNewKpi({ ...newKpi, unit: e.target.value })
                }
                className="form-input w-full"
                placeholder="e.g., %"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Target Value
            </label>
            <input
              type="number"
              value={newKpi.target_value}
              onChange={(e) =>
                setNewKpi({ ...newKpi, target_value: e.target.value })
              }
              className="form-input w-full"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Formula</label>
            <input
              type="text"
              value={newKpi.formula}
              onChange={(e) =>
                setNewKpi({ ...newKpi, formula: e.target.value })
              }
              className="form-input w-full"
              placeholder="e.g., (Cost / Revenue) * 100"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings
