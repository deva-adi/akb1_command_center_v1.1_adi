import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  GitBranch,
  Package,
  RotateCw,
  Zap,
  Calculator,
  FileText,
  ActivitySquare,
  Settings,
  Eye,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/', label: 'Dashboard', icon: Eye },
      ],
    },
    {
      title: 'DELIVERY',
      items: [
        { path: '/kpis', label: 'KPI Engine', icon: TrendingUp },
        { path: '/sprints', label: 'Sprint Planner', icon: GitBranch },
        { path: '/estimations', label: 'Estimations', icon: Calculator },
        { path: '/status-reports', label: 'Status Reports', icon: FileText },
      ],
    },
    {
      title: 'PORTFOLIO',
      items: [
        { path: '/portfolio', label: 'Portfolio', icon: BarChart3 },
        { path: '/releases', label: 'Releases', icon: Package },
        { path: '/change-requests', label: 'Change Requests', icon: RotateCw },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { path: '/risks', label: 'Risk Matrix', icon: AlertTriangle },
        { path: '/dependencies', label: 'Dependencies', icon: Zap },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { path: '/resources', label: 'Resources', icon: Users },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/activity-log', label: 'Activity Log', icon: ActivitySquare },
        { path: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-bloomberg-bg" style={{ color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 sidebar-nav transition-transform duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b border-bloomberg-border">
            <h1 className="text-sm font-bold text-akb-green tracking-wider">
              AKB1 v3.0
            </h1>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-4">
            {navGroups.map((group) => (
              <div key={group.title}>
                <div className="px-3 py-2 text-xs font-bold text-muted tracking-widest uppercase">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.path)
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item flex items-center gap-3 px-3 py-2 text-sm rounded transition ${
                          active
                            ? 'bg-akb-green bg-opacity-10 text-akb-green'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-bloomberg-border text-xs text-muted">
            <div>Enterprise Delivery Platform</div>
            <div className="mt-1">© 2026 AKB1</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bloomberg-header flex items-center justify-between px-6 py-4 border-b border-bloomberg-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-akb-green hover:text-white transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="status-dot active"></div>
              <span className="text-sm font-bold tracking-wider">
                AKB1 COMMAND CENTER v3.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={toggleTheme} className="theme-toggle-btn" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="text-right">
              <div className="text-xs text-muted">SYSTEM TIME</div>
              <div className="text-sm font-mono font-bold text-akb-green">
                {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-bloomberg-bg">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
