import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { statusReportsAPI } from '../utils/api'

const StatusReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    period: '',
    project_name: '',
    overall_status: 'ON_TRACK',
    summary: '',
    achievements: '',
    risks: '',
    issues: '',
    next_steps: '',
    prepared_by: '',
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await statusReportsAPI.getAll()
      setReports(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load status reports')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (report = null) => {
    if (report) {
      setEditingReport(report)
      setFormData({
        title: report.title,
        period: report.period,
        project_name: report.project_name,
        overall_status: report.overall_status,
        summary: report.summary,
        achievements: report.achievements,
        risks: report.risks,
        issues: report.issues,
        next_steps: report.next_steps,
        prepared_by: report.prepared_by,
      })
    } else {
      setEditingReport(null)
      setFormData({
        title: '',
        period: '',
        project_name: '',
        overall_status: 'ON_TRACK',
        summary: '',
        achievements: '',
        risks: '',
        issues: '',
        next_steps: '',
        prepared_by: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingReport(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.period) {
      setError('Title and period are required')
      return
    }

    try {
      setModalLoading(true)
      if (editingReport) {
        await statusReportsAPI.update(editingReport.id, formData)
      } else {
        await statusReportsAPI.create(formData)
      }
      await fetchReports()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save report')
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (report) => {
    if (!confirm(`Delete report "${report.title}"?`)) return

    try {
      await statusReportsAPI.delete(report.id)
      await fetchReports()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report')
      console.error(err)
    }
  }

  const tableColumns = [
    { key: 'title', label: 'Report Title' },
    { key: 'period', label: 'Period' },
    { key: 'project_name', label: 'Project' },
    {
      key: 'overall_status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    { key: 'prepared_by', label: 'Prepared By' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  const statusCounts = {
    ON_TRACK: reports.filter((r) => r.overall_status === 'ON_TRACK').length,
    AT_RISK: reports.filter((r) => r.overall_status === 'AT_RISK').length,
    OFF_TRACK: reports.filter((r) => r.overall_status === 'OFF_TRACK').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-akb-green tracking-wider">
          Status Reports
        </h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Create Report
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
          <div className="text-xs text-muted mb-2">TOTAL REPORTS</div>
          <div className="text-2xl font-bold text-akb-green">{reports.length}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">ON TRACK</div>
          <div className="text-2xl font-bold text-akb-green">
            {statusCounts.ON_TRACK}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">AT RISK</div>
          <div className="text-2xl font-bold text-akb-amber">{statusCounts.AT_RISK}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">OFF TRACK</div>
          <div className="text-2xl font-bold text-akb-red">
            {statusCounts.OFF_TRACK}
          </div>
        </div>
      </div>

      {/* Recent Reports Timeline */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          RECENT REPORTS
        </h3>
        <div className="space-y-3">
          {reports
            .sort((a, b) => new Date(b.period) - new Date(a.period))
            .slice(0, 5)
            .map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded border border-gray-700 hover:border-akb-green transition cursor-pointer"
                onClick={() => handleOpenModal(report)}
              >
                <div className="flex-1">
                  <div className="font-bold">{report.title}</div>
                  <div className="text-xs text-muted">
                    {report.project_name} • {report.period}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={report.overall_status} />
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenModal(report)
                      }}
                      className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(report)
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

      {/* Reports Table */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          ALL REPORTS
        </h3>
        <DataTable
          columns={tableColumns}
          data={reports}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No status reports created"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingReport ? 'Edit Status Report' : 'Create Status Report'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingReport ? 'Update' : 'Create'}
        loading={modalLoading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Report Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="e.g., Weekly Status - Week 12"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Period *</label>
              <input
                type="text"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="e.g., 2026-03-08 to 2026-03-14"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Project Name</label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Project name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Overall Status
              </label>
              <select
                name="overall_status"
                value={formData.overall_status}
                onChange={handleInputChange}
                className="form-select w-full"
              >
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="OFF_TRACK">Off Track</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Executive Summary
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="3"
              placeholder="High-level overview of status..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Achievements</label>
            <textarea
              name="achievements"
              value={formData.achievements}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="2"
              placeholder="Key accomplishments this period..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Risks</label>
              <textarea
                name="risks"
                value={formData.risks}
                onChange={handleInputChange}
                className="form-textarea w-full"
                rows="2"
                placeholder="Identified risks..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Issues</label>
              <textarea
                name="issues"
                value={formData.issues}
                onChange={handleInputChange}
                className="form-textarea w-full"
                rows="2"
                placeholder="Current blockers..."
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Next Steps</label>
            <textarea
              name="next_steps"
              value={formData.next_steps}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="2"
              placeholder="Planned actions for next period..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Prepared By</label>
            <input
              type="text"
              name="prepared_by"
              value={formData.prepared_by}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="Report author"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StatusReports
