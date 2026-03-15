import React from 'react'

const StatusBadge = ({ status, className = '' }) => {
  const statusMap = {
    'GREEN': { color: '#00c853', label: 'GREEN', bgClass: 'bg-green-transparent' },
    'AMBER': { color: '#ff9100', label: 'AMBER', bgClass: 'bg-amber-transparent' },
    'RED': { color: '#ff1744', label: 'RED', bgClass: 'bg-red-transparent' },
    'ON_TRACK': { color: '#00c853', label: 'ON TRACK', bgClass: 'bg-green-transparent' },
    'AT_RISK': { color: '#ff9100', label: 'AT RISK', bgClass: 'bg-amber-transparent' },
    'OFF_TRACK': { color: '#ff1744', label: 'OFF TRACK', bgClass: 'bg-red-transparent' },
    'LOW': { color: '#00c853', label: 'LOW', bgClass: 'bg-green-transparent' },
    'MEDIUM': { color: '#ff9100', label: 'MEDIUM', bgClass: 'bg-amber-transparent' },
    'HIGH': { color: '#ff1744', label: 'HIGH', bgClass: 'bg-red-transparent' },
    'CRITICAL': { color: '#ff1744', label: 'CRITICAL', bgClass: 'bg-red-transparent' },
  }

  const config = statusMap[status?.toUpperCase()] || {
    color: '#999',
    label: status || 'UNKNOWN',
    bgClass: 'bg-gray-700',
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded text-xs font-bold ${config.bgClass} ${className}`}
      style={{ color: config.color }}
    >
      {config.label}
    </span>
  )
}

export default StatusBadge
