import React, { useState, useEffect } from 'react'
import DataTable from '../components/DataTable'
import { activityLogAPI } from '../utils/api'

const ActivityLog = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [entityFilter, setEntityFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (entityFilter !== 'all') filters.entity_type = entityFilter
      if (actionFilter !== 'all') filters.action = actionFilter
      if (searchTerm) filters.search = searchTerm

      const data = await activityLogAPI.getAll(filters)
      setActivities(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load activity log')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchActivities, 300)
    return () => clearTimeout(timer)
  }, [entityFilter, actionFilter, searchTerm])

  const entityTypes = Array.from(new Set(activities.map((a) => a.entity_type)))
  const actionTypes = Array.from(new Set(activities.map((a) => a.action)))

  const filteredActivities =
    entityFilter === 'all' && actionFilter === 'all' && !searchTerm
      ? activities
      : activities.filter(
          (a) =>
            (entityFilter === 'all' || a.entity_type === entityFilter) &&
            (actionFilter === 'all' || a.action === actionFilter) &&
            (searchTerm === '' ||
              a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.action?.toLowerCase().includes(searchTerm.toLowerCase()))
        )

  const tableColumns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (val) => new Date(val).toLocaleString(),
    },
    { key: 'entity_type', label: 'Entity' },
    { key: 'action', label: 'Action' },
    { key: 'description', label: 'Details' },
    { key: 'user', label: 'User' },
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
      <h1 className="text-3xl font-bold text-akb-green tracking-wider">
        Activity Log & Audit Trail
      </h1>

      {error && (
        <div className="bloomberg-card p-4 text-red-400 border-l-4 border-akb-red">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">TOTAL ACTIVITIES</div>
          <div className="text-2xl font-bold text-akb-green">
            {activities.length}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">ENTITY TYPES</div>
          <div className="text-2xl font-bold text-akb-amber">
            {entityTypes.length}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">ACTION TYPES</div>
          <div className="text-2xl font-bold text-akb-amber">
            {actionTypes.length}
          </div>
        </div>
        <div className="bloomberg-card p-4">
          <div className="text-xs text-muted mb-2">TODAY</div>
          <div className="text-2xl font-bold text-akb-green">
            {activities.filter((a) => {
              const actDate = new Date(a.timestamp).toDateString()
              const today = new Date().toDateString()
              return actDate === today
            }).length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bloomberg-card p-4 space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Search Activities</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input w-full"
            placeholder="Search by description, entity, or action..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Entity Type</label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="form-select w-full"
            >
              <option value="all">All Entity Types</option>
              {entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="form-select w-full"
            >
              <option value="all">All Actions</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          ACTIVITY TIMELINE
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="text-center text-muted py-8">No activities found</div>
          ) : (
            filteredActivities.map((activity, idx) => {
              const actionColors = {
                CREATE: '#00c853',
                UPDATE: '#ff9100',
                DELETE: '#ff1744',
                READ: '#2196F3',
              }
              const actionColor = actionColors[activity.action] || '#999'

              return (
                <div
                  key={activity.id || idx}
                  className="flex gap-4 p-3 border-l-2"
                  style={{ borderLeftColor: actionColor }}
                >
                  <div className="text-xs text-muted whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          color: actionColor,
                          backgroundColor: `${actionColor}20`,
                        }}
                      >
                        {activity.action}
                      </span>
                      <span className="text-sm font-bold">
                        {activity.entity_type}
                      </span>
                      {activity.user && (
                        <span className="text-xs text-muted">
                          by {activity.user}
                        </span>
                      )}
                    </div>
                    {activity.description && (
                      <div className="text-sm text-muted break-words">
                        {activity.description}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Activity Table */}
      <div className="bloomberg-card p-6">
        <h3 className="text-lg font-bold text-akb-green mb-4 tracking-wider">
          AUDIT REGISTER
        </h3>
        <DataTable
          columns={tableColumns}
          data={filteredActivities}
          emptyMessage="No activities recorded"
        />
      </div>
    </div>
  )
}

export default ActivityLog
