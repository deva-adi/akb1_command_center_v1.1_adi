import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import KPICard from '../components/KPICard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import { dashboardAPI, activityLogAPI } from '../utils/api'

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [activityLog, setActivityLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const summaryData = await dashboardAPI.getSummary()
        setSummary(summaryData)

        const metricsData = await dashboardAPI.getMetrics()
        setMetrics(metricsData)

        const activityData = await activityLogAPI.getRecent(20)
        setActivityLog(activityData)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bloomberg-card p-6 text-red-400 border-l-4 border-akb-red">
        Error: {error}
      </div>
    )
  }

  // Extract and transform KPIs from summary
  const kpis = summary?.kpis || []

  // Transform projects object into bar chart data
  const projectHealth = (() => {
    const projects = summary?.projects || { total: 0, green: 0, amber: 0, red: 0 }
    return [
      { status: 'GREEN', count: projects.green },
      { status: 'AMBER', count: projects.amber },
      { status: 'RED', count: projects.red },
    ]
  })()

  // Transform risks object into severity levels
  const riskSummary = (() => {
    const risks = summary?.risks || { critical: 0, high: 0, medium: 0, low: 0 }
    return [
      { severity: 'CRITICAL', count: risks.critical },
      { severity: 'HIGH', count: risks.high },
      { severity: 'MEDIUM', count: risks.medium },
      { severity: 'LOW', count: risks.low },
    ]
  })()

  // Executive metrics from /dashboard/metrics
  const executiveMetrics = (() => {
    const dm = metrics?.delivery_metrics || {}
    const pm = metrics?.project_metrics || {}
    const rm = metrics?.resource_metrics || {}
    const riskm = metrics?.risk_metrics || {}

    return [
      {
        label: 'Budget Utilization',
        value: (pm.budget_utilization_percent || 0).toFixed(1),
        unit: '%',
        status: pm.budget_utilization_percent > 85 ? 'AMBER' : 'GREEN',
      },
      {
        label: 'Velocity Efficiency',
        value: (dm.velocity_efficiency_percent || 0).toFixed(1),
        unit: '%',
        status: dm.velocity_efficiency_percent >= 90 ? 'GREEN' : dm.velocity_efficiency_percent >= 75 ? 'AMBER' : 'RED',
      },
      {
        label: 'Avg Utilization',
        value: (rm.average_utilization_percent || 0).toFixed(1),
        unit: '%',
        status: rm.average_utilization_percent > 85 ? 'AMBER' : 'GREEN',
      },
      {
        label: 'Risk Resolution',
        value: (riskm.risk_resolution_percent || 0).toFixed(1),
        unit: '%',
        status: riskm.risk_resolution_percent >= 80 ? 'GREEN' : 'AMBER',
      },
    ]
  })()

  const activityColumns = [
    { key: 'entity_type', label: 'Entity Type' },
    { key: 'action', label: 'Action' },
    { key: 'entity_name', label: 'Entity Name' },
    {
      key: 'timestamp',
      label: 'Time',
      render: (value) => new Date(value).toLocaleString(),
    },
  ]

  // Color mapping for project health and risks
  const getHealthColor = (status) => {
    switch (status) {
      case 'GREEN':
        return '#00c853'
      case 'AMBER':
        return '#ff9100'
      case 'RED':
        return '#ff1744'
      default:
        return '#666'
    }
  }

  const getRiskColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return '#ff1744'
      case 'HIGH':
        return '#ff9100'
      case 'MEDIUM':
        return '#ffb74d'
      case 'LOW':
        return '#00c853'
      default:
        return '#666'
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-akb-green tracking-wider">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.slice(0, 6).map((kpi) => (
          <KPICard
            key={kpi.id}
            title={kpi.name}
            value={kpi.value}
            unit={kpi.unit}
            status={kpi.status}
            threshold={kpi.target}
          />
        ))}
      </div>

      {/* Project Health & Risk Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Health */}
        <div className="bloomberg-card p-6">
          <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
            PROJECT HEALTH SUMMARY
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectHealth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="status" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  color: '#e0e0e0',
                }}
              />
              <Bar dataKey="count">
                {projectHealth.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getHealthColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bloomberg-card p-6">
          <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
            RISK DISTRIBUTION
          </h3>
          <div className="space-y-3">
            {riskSummary.map((risk) => (
              <div key={risk.severity} className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-wide">
                  {risk.severity}
                </span>
                <div className="flex items-center gap-3 flex-1 ml-4">
                  <div className="h-2 flex-1 bg-gray-700 rounded">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${(risk.count / Math.max(...riskSummary.map(r => r.count), 10)) * 100}%`,
                        backgroundColor: getRiskColor(risk.severity),
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold w-8 text-right">
                    {risk.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Metrics */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          EXECUTIVE METRICS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {executiveMetrics.map((metric, index) => {
            const statusColor =
              metric.status === 'GREEN'
                ? '#00c853'
                : metric.status === 'AMBER'
                  ? '#ff9100'
                  : '#ff1744'
            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-700 bg-gray-900"
              >
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                  {metric.label}
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: statusColor }}
                  >
                    {metric.value}
                  </span>
                  <span className="text-sm text-gray-400">{metric.unit}</span>
                </div>
                <div className="mt-2 h-1 w-full bg-gray-700 rounded">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${parseFloat(metric.value)}%`,
                      backgroundColor: statusColor,
                    }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          RECENT ACTIVITY
        </h3>
        <DataTable
          columns={activityColumns}
          data={activityLog}
          emptyMessage="No activity recorded"
        />
      </div>
    </div>
  )
}

export default Dashboard
