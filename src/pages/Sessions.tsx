import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Activity, Clock3, Laptop, LogIn, Monitor, RefreshCw, Smartphone, Tablet, UserRound, Wifi, X } from 'lucide-react'
import type { RootState } from '../redux/types/index.ts'
import { clearAuthSession } from '../redux/auth/storage.ts'
import { getUserInitials } from '../components/profileUtils.ts'
import AccountDialogs from '../components/AccountDialogs.tsx'
import DashboardNavbar from '../components/DashboardNavbar.tsx'
import ProtectedRoute from '../routes/ProtectedRoute.tsx'
import './Sessions.css'

type SessionStatus = 'Active' | 'Idle' | 'Expired'
type SessionRecord = {
  id: number
  name: string
  email: string
  status: SessionStatus
  device: 'Windows' | 'Android' | 'macOS' | 'iPad'
  browser: 'Chrome' | 'Edge' | 'Firefox' | 'Safari'
  ip: string
  loginTime: string
  lastActive: string
}

const demoSessions: SessionRecord[] = [
  { id: 1, name: 'Neha Sharma', email: 'neha@example.com', status: 'Active', device: 'Windows', browser: 'Chrome', ip: '192.168.1.24', loginTime: 'Today, 9:42 AM', lastActive: 'Just now' },
  { id: 2, name: 'Gouri Test', email: 'gouri@example.com', status: 'Active', device: 'macOS', browser: 'Safari', ip: '192.168.1.31', loginTime: 'Today, 8:18 AM', lastActive: '2 min ago' },
  { id: 3, name: 'Rohan Kumar', email: 'rohan@example.com', status: 'Idle', device: 'Android', browser: 'Chrome', ip: '10.0.0.18', loginTime: 'Today, 7:55 AM', lastActive: '24 min ago' },
  { id: 4, name: 'Sheetal Test', email: 'sheetal@example.com', status: 'Active', device: 'Windows', browser: 'Edge', ip: '172.16.0.44', loginTime: 'Yesterday, 6:30 PM', lastActive: '8 min ago' },
  { id: 5, name: 'Anjali Patil', email: 'anjali@example.com', status: 'Expired', device: 'iPad', browser: 'Safari', ip: '10.0.0.22', loginTime: 'Yesterday, 11:15 AM', lastActive: 'Yesterday' },
  { id: 6, name: 'Khushi Test', email: 'khushi@example.com', status: 'Idle', device: 'Android', browser: 'Firefox', ip: '192.168.1.58', loginTime: 'Sep 22, 2026, 4:12 PM', lastActive: '2 hours ago' },
  { id: 7, name: 'Rohit Sharma', email: 'rohit@example.com', status: 'Active', device: 'Windows', browser: 'Chrome', ip: '192.168.1.65', loginTime: 'Today, 9:00 AM', lastActive: 'Just now' }
]

function SessionsContent() {
  const user = useSelector((state: RootState) => state.signup.user)
  const [statusFilter, setStatusFilter] = useState<'All' | SessionStatus>('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [details, setDetails] = useState<SessionRecord | null>(null)
  const [loggedOutIds, setLoggedOutIds] = useState<number[]>([])
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const pageSize = 5

  const sessions = useMemo(() => demoSessions.map((session) => loggedOutIds.includes(session.id) ? { ...session, status: 'Expired' as const, lastActive: 'Logged out' } : session), [loggedOutIds])
  const filteredSessions = useMemo(() => sessions.filter((session) => {
    const matchesStatus = statusFilter === 'All' || session.status === statusFilter
    const query = search.trim().toLowerCase()
    return matchesStatus && (!query || session.name.toLowerCase().includes(query) || session.email.toLowerCase().includes(query) || session.ip.includes(query))
  }), [search, sessions, statusFilter])
  const pageCount = Math.max(1, Math.ceil(filteredSessions.length / pageSize))
  const visibleSessions = filteredSessions.slice((page - 1) * pageSize, page * pageSize)
  const activeCount = sessions.filter((session) => session.status === 'Active').length
  const onlineCount = sessions.filter((session) => session.status !== 'Expired').length
  const expiredCount = sessions.filter((session) => session.status === 'Expired').length

  const changeFilter = (nextFilter: 'All' | SessionStatus) => { setStatusFilter(nextFilter); setPage(1) }
  const handleLogout = () => { clearAuthSession(); window.location.replace('/login') }
  const logoutSession = (session: SessionRecord) => {
    if (session.status === 'Active' && window.confirm(`Log out ${session.name}'s active session?`)) setLoggedOutIds((ids) => ids.includes(session.id) ? ids : [...ids, session.id])
  }

  return (
    <main className="sessions-page">
      <DashboardNavbar user={user} activePage="sessions" onViewProfile={() => setProfileOpen(true)} onUpdateProfile={() => setProfileOpen(true)} onChangePassword={() => setPasswordOpen(true)} onLogout={handleLogout} />
      <div className="sessions-content">
        <header className="sessions-heading">
          <div><h1>Session Monitor</h1><p>Monitor active user sessions and recent login activity.</p></div>
          <button className="sessions-refresh" type="button" onClick={() => setRefreshedAt(new Date())}><RefreshCw size={16} />Refresh Sessions</button>
        </header>

        <section className="sessions-summary" aria-label="Session summary">
          <SummaryCard icon={<Wifi size={20} />} label="Active Sessions" value={activeCount} tone="blue" />
          <SummaryCard icon={<UserRound size={20} />} label="Online Users" value={onlineCount} tone="green" />
          <SummaryCard icon={<LogIn size={20} />} label="Recent Logins" value={sessions.length} tone="purple" />
          <SummaryCard icon={<Clock3 size={20} />} label="Expired Sessions" value={expiredCount} tone="yellow" />
        </section>

        <section className="sessions-panel" aria-labelledby="sessions-table-title">
          <div className="sessions-panel-heading"><div><h2 id="sessions-table-title">Active and recent sessions</h2><p>{refreshedAt ? `Last refreshed ${refreshedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Review devices currently connected to your account.'}</p></div><span className="sessions-total">{filteredSessions.length} sessions</span></div>
          <div className="sessions-controls"><label className="sessions-search"><Activity size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search user or IP address" aria-label="Search user or IP address" /></label><div className="sessions-filters" role="tablist" aria-label="Session status filters">{(['All', 'Active', 'Idle', 'Expired'] as const).map((filter) => <button key={filter} className={statusFilter === filter ? 'active' : ''} type="button" role="tab" aria-selected={statusFilter === filter} onClick={() => changeFilter(filter)}>{filter}</button>)}</div></div>
          <div className="sessions-table-wrap"><table className="sessions-table"><thead><tr><th>User</th><th>Status</th><th>Device</th><th>Browser</th><th>IP Address</th><th>Login Time</th><th>Last Active</th><th>Action</th></tr></thead><tbody>{visibleSessions.map((session) => <SessionRow key={session.id} session={session} onDetails={() => setDetails(session)} onLogout={() => logoutSession(session)} />)}</tbody></table>{visibleSessions.length === 0 && <p className="sessions-empty">No sessions match your search.</p>}</div>
          <div className="sessions-pagination"><span>Page {page} of {pageCount}</span><div><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>
        </section>
      </div>
      {details && <SessionDetails session={details} onClose={() => setDetails(null)} />}
      <AccountDialogs profileOpen={profileOpen} passwordOpen={passwordOpen} onCloseProfile={() => setProfileOpen(false)} onClosePassword={() => setPasswordOpen(false)} />
    </main>
  )
}

function SummaryCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) { return <article className={`sessions-summary-card ${tone}`}><span>{icon}</span><div><p>{label}</p><strong>{value}</strong></div></article> }

function SessionRow({ session, onDetails, onLogout }: { session: SessionRecord; onDetails: () => void; onLogout: () => void }) {
  const deviceIcon = session.device === 'Android' ? <Smartphone size={15} /> : session.device === 'iPad' ? <Tablet size={15} /> : session.device === 'macOS' ? <Laptop size={15} /> : <Monitor size={15} />
  return <tr><td data-label="User"><div className="session-user"><span className="session-avatar">{getUserInitials(session.name)}</span><span><strong>{session.name}</strong><small>{session.email}</small></span></div></td><td data-label="Status"><span className={`session-status ${session.status.toLowerCase()}`}><i />{session.status}</span></td><td data-label="Device"><span className="session-device">{deviceIcon}{session.device}</span></td><td data-label="Browser">{session.browser}</td><td data-label="IP Address">{session.ip}</td><td data-label="Login Time">{session.loginTime}</td><td data-label="Last Active">{session.lastActive}</td><td data-label="Action"><div className="session-actions"><button type="button" onClick={onDetails}>View Details</button>{session.status === 'Active' && <button className="logout" type="button" onClick={onLogout}>Logout</button>}</div></td></tr>
}

function SessionDetails({ session, onClose }: { session: SessionRecord; onClose: () => void }) { return <div className="session-modal-backdrop" role="presentation" onClick={onClose}><section className="session-modal" role="dialog" aria-modal="true" aria-labelledby="session-details-title" onClick={(event) => event.stopPropagation()}><button className="session-modal-close" type="button" aria-label="Close session details" onClick={onClose}><X size={18} /></button><div className="session-modal-icon"><Monitor size={22} /></div><h2 id="session-details-title">Session details</h2><p>Review connection information for {session.name}.</p><dl><dt>Status</dt><dd><span className={`session-status ${session.status.toLowerCase()}`}><i />{session.status}</span></dd><dt>Device</dt><dd>{session.device}</dd><dt>Browser</dt><dd>{session.browser}</dd><dt>IP Address</dt><dd>{session.ip}</dd><dt>Login Time</dt><dd>{session.loginTime}</dd><dt>Last Active</dt><dd>{session.lastActive}</dd></dl></section></div> }

function Sessions() { return <ProtectedRoute><SessionsContent /></ProtectedRoute> }

export default Sessions
