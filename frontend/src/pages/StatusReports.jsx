import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import ProjectSelector from '../components/ProjectSelector'
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
    report_date: '',
    period: '',
    executive_summary: '',
    key_achievements: '',
    risks_issues: '',
    next_steps: '',
    project_id: null,
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
        report_date: report.report_date,
        period: report.period,
        executive_summary: report.executive_summary,
        key_achievements: report.key_achievements,
        risks_issues: report.risks_issues,
        next_steps: report.next_steps,
        project_id: report.project_id,
      })
    } else {
      setEditingReport(null)
      setFormData({
        title: '',
        report_date: '',
        period: '',
        executive_summary: '',
        key_achievements: '',
        risks_issues: '',
        next_steps: '',
        project_id: null,
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
    if (!formData.title || !formData.report_date || !formData.period || !formData.project_id) {
      setError('Title, report date, period, and project are required')
      return
    }

    try {
      setModalLoading(true)
      const submitData = {
        ...formData,
        project_id: parseInt(formData.project_id),
      }
      if (editingReport) {
        await statusReportsAPI.update(editingReport.id, submitData)
      } else {
        await statusReportsAPI.create(submitData)
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
    { key: 'report_date', label: 'Report Date' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  const reportCounts = {
    TOTAL: reports.length,
    THIS_WEEK: reports.filter((r) => {
      const reportDate = new Date(r.report_date)
      const today = new Date()
      const oneWeekAgo = new Date(today.setDate(today.getDate() - 7))
      return reportDate >= oneWeekAgo
    }).length,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">TOTAL REPORTS</div>
          <div className="text-2xl font-bold text-akb-green">{reportCounts.TOTAL}</div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">THIS WEEK</div>
          <div className="text-2xl font-bold text-akb-amber">{reportCounts.THIS_WEEK}</div>
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
                    {report.period} • {report.report_date}
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
              <label className="block text-sm font-bold mb-2">Report Date *</label>
              <input
                type="date"
                name="report_date"
                value={formData.report_date}
                onChange={handleInputChange}
                className="form-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-bold mb-2">Project *</label>
              <ProjectSelector
                value={formData.project_id}
                onChange={(projectId) =>
                  setFormData((prev) => ({
                    ...prev,
                    project_id: projectId,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Executive Summary
            </label>
            <textarea
              name="executive_summary"
              value={formData.executive_summary}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="3"
              placeholder="High-level overview of status..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Key Achievements</label>
            <textarea
              name="key_achievements"
              value={formData.key_achievements}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="2"
              placeholder="Key accomplishments this period..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Risks & Issues</label>
            <textarea
              name="risks_issues"
              value={formData.risks_issues}
              onChange={handleInputChange}
              className="form-textarea w-full"
              rows="3"
              placeholder="Identified risks and current blockers..."
            ></textarea>
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
        </div>
      </Modal>
    </div>
  )
}

export default StatusReports
