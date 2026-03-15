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
} from 'recharts'
import KPICard from '../components/KPICard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import { dashboardAPI, activityLogAPI } from '../utils/api'

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
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

  const kpis = summary?.kpis || []
  const projectHealth = summary?.project_health || []
  const riskSummary = summary?.risk_summary || []
  const velocityTrend = summary?.velocity_trend || []

  const activityColumns = [
    { key: 'entity_type', label: 'Entity Type' },
    { key: 'action', label: 'Action' },
    { key: 'description', label: 'Description' },
    {
      key: 'timestamp',
      label: 'Time',
      render: (value) => new Date(value).toLocaleString(),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-akb-green tracking-wider">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.slice(0, 6).map((kpi) => (
          <KPICard
            key={kpi.id}
            title={kpi.name}
            value={kpi.current_value}
            unit={kpi.unit}
            trend={kpi.trend}
            status={kpi.status}
            threshold={kpi.target_value}
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
              <Bar dataKey="count" fill="#00c853" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Summary */}
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
                        width: `${(risk.count / 10) * 100}%`,
                        backgroundColor:
                          risk.severity === 'CRITICAL'
                            ? '#ff1744'
                            : risk.severity === 'HIGH'
                              ? '#ff9100'
                              : '#00c853',
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

      {/* Velocity Trend */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          VELOCITY TREND
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={velocityTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="sprint" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                color: '#e0e0e0',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#00c853"
              strokeWidth={2}
              dot={{ fill: '#00c853', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#ff9100"
              strokeWidth={2}
              dot={{ fill: '#ff9100', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
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
