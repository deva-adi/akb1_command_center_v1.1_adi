import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

import Dashboard from './pages/Dashboard'
import KPIEngine from './pages/KPIEngine'
import Portfolio from './pages/Portfolio'
import RiskMatrix from './pages/RiskMatrix'
import SprintPlanner from './pages/SprintPlanner'
import Resources from './pages/Resources'
import Dependencies from './pages/Dependencies'
import Releases from './pages/Releases'
import ChangeRequests from './pages/ChangeRequests'
import Estimations from './pages/Estimations'
import StatusReports from './pages/StatusReports'
import ActivityLog from './pages/ActivityLog'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kpis" element={<KPIEngine />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/risks" element={<RiskMatrix />} />
          <Route path="/sprints" element={<SprintPlanner />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/dependencies" element={<Dependencies />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/change-requests" element={<ChangeRequests />} />
          <Route path="/estimations" element={<Estimations />} />
          <Route path="/status-reports" element={<StatusReports />} />
          <Route path="/activity-log" element={<ActivityLog />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
