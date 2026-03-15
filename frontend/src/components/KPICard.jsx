import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const KPICard = ({
  title,
  value,
  unit,
  trend,
  status = 'GREEN',
  threshold,
  onClick,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = () => {
    const s = status?.toUpperCase()
    if (s === 'RED' || s === 'OFF_TRACK') return '#ff1744'
    if (s === 'AMBER' || s === 'AT_RISK') return '#ff9100'
    return '#00c853'
  }

  const statusColor = getStatusColor()
  const isTrendingUp = trend > 0
  const TrendIcon = isTrendingUp ? TrendingUp : TrendingDown
  const trendColor = isTrendingUp ? '#00c853' : '#ff1744'

  return (
    <div
      className="bloomberg-card p-4 cursor-pointer flex flex-col"
      onClick={onClick}
      style={{ borderTopColor: statusColor, borderTopWidth: '3px' }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xs uppercase font-bold text-muted tracking-wider">
            {title}
          </h3>
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold" style={{ color: statusColor }}>
            {typeof value === 'number' ? value.toFixed(2) : value}
          </span>
          <span className="text-xs text-muted">{unit}</span>
        </div>

        {threshold && (
          <div className="text-xs text-muted mb-2">
            Target: <span style={{ color: statusColor }}>{threshold}</span>
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1 pt-2 border-t border-gray-600">
          <TrendIcon size={14} style={{ color: trendColor }} />
          <span className="text-xs font-bold" style={{ color: trendColor }}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default KPICard
