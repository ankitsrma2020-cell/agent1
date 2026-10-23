import { useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { CalendarClock, CheckCircle2, Clock3, KeyRound, LogIn, Pencil, Plus } from 'lucide-react'
import type { RootState } from '../redux/types/index.ts'
import { clearAuthSession } from '../redux/auth/storage.ts'
import AccountDialogs from '../components/AccountDialogs.tsx'
import DashboardNavbar from '../components/DashboardNavbar.tsx'
import TimePickerPopover from '../components/TimePickerPopover.tsx'
import ProtectedRoute from '../routes/ProtectedRoute.tsx'
import './Activity.css'

type ActivityFilter = 'all' | 'login' | 'profile' | 'security'
type ActivityKind = Exclude<ActivityFilter, 'all'> | 'registration'

type ActivityRecord = {
  id: number
  userName: string
  description: string
  kind: ActivityKind
  timestamp: Date
  status?: 'Completed' | 'Successful'
}

const demoActivities: ActivityRecord[] = [
  { id: 1, userName: 'Gouri Test', description: 'User registered an account', kind: 'registration', timestamp: new Date(Date.now() - 18 * 60 * 1000), status: 'Completed' },
  { id: 2, userName: 'Sheetal Test', description: 'User logged in successfully', kind: 'login', timestamp: new Date(Date.now() - 42 * 60 * 1000), status: 'Successful' },
  { id: 3, userName: 'Rohan Kumar', description: 'Profile information updated', kind: 'profile', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), status: 'Completed' },
  { id: 4, userName: 'Anjali Patil', description: 'Profile image updated', kind: 'profile', timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), status: 'Completed' },
  { id: 5, userName: 'Khushi Test', description: 'Password changed successfully', kind: 'security', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'Successful' },
  { id: 6, userName: 'Neha Sharma', description: 'User logged out', kind: 'security', timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000) },
  { id: 7, userName: 'Gouri Test', description: 'User logged in successfully', kind: 'login', timestamp: new Date(Date.now() - 39 * 60 * 60 * 1000), status: 'Successful' },
  { id: 8, userName: 'Rohan Kumar', description: 'User registered an account', kind: 'registration', timestamp: new Date(Date.now() - 52 * 60 * 60 * 1000), status: 'Completed' },
]

const pageSize = 4

function ActivityContent() {
  const user = useSelector((state: RootState) => state.signup.user)
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [page, setPage] = useState(1)
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [timePickerOpen, setTimePickerOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const timePickerTriggerRef = useRef<HTMLButtonElement>(null)

  const filteredActivities = useMemo(() => filter === 'all'
    ? demoActivities
    : demoActivities.filter((activity) => activity.kind === filter), [filter])
  const pageCount = Math.max(1, Math.ceil(filteredActivities.length / pageSize))
  const visibleActivities = filteredActivities.slice((page - 1) * pageSize, page * pageSize)
  const today = new Date()
  const todaysActivities = demoActivities.filter((activity) => activity.timestamp.toDateString() === today.toDateString()).length
  const recentLogins = demoActivities.filter((activity) => activity.kind === 'login').length

  const selectFilter = (nextFilter: ActivityFilter) => {
    setFilter(nextFilter)
    setPage(1)
  }

  const handleLogout = () => {
    clearAuthSession()
    window.location.replace('/login')
  }

  return (
    <main className="activity-page">
      <DashboardNavbar
        user={user}
        activePage="activity"
        onViewProfile={() => setProfileOpen(true)}
        onUpdateProfile={() => setProfileOpen(true)}
        onChangePassword={() => setPasswordOpen(true)}
        onLogout={handleLogout}
      />
      <div className="activity-content">
        <header className="activity-heading">
          <div>
            <h1>User Activity</h1>
            <p>Track recent user actions and account activity</p>
          </div>
          <div className="activity-time-picker">
            <button ref={timePickerTriggerRef} className="activity-heading-icon" type="button" aria-label="Choose activity time" aria-expanded={timePickerOpen} aria-haspopup="dialog" onClick={() => setTimePickerOpen((open) => !open)}>
              <CalendarClock size={28} />
            </button>
            {selectedTime && <span className="activity-selected-time">{selectedTime}</span>}
            {timePickerOpen && <TimePickerPopover selectedTime={selectedTime} triggerRef={timePickerTriggerRef} onSelect={(time) => { setSelectedTime(time); setTimePickerOpen(false) }} onClose={() => setTimePickerOpen(false)} />}
          </div>
        </header>

        <section className="activity-summary" aria-label="Activity summary">
          <SummaryCard icon={<CheckCircle2 size={21} />} label="Total Activities" value={demoActivities.length} tone="blue" />
          <SummaryCard icon={<Clock3 size={21} />} label="Today's Activities" value={todaysActivities} tone="green" />
          <SummaryCard icon={<LogIn size={21} />} label="Recent Logins" value={recentLogins} tone="purple" />
        </section>

        <section className="activity-panel" aria-labelledby="activity-list-title">
          <div className="activity-panel-heading">
            <div><h2 id="activity-list-title">Recent Activity</h2><p>Review the latest actions across your account.</p></div>
            <span className="activity-total">{filteredActivities.length} activities</span>
          </div>
          <div className="activity-filters" role="tablist" aria-label="Activity filters">
            {([['all', 'All Activity'], ['login', 'Login'], ['profile', 'Profile'], ['security', 'Security']] as const).map(([value, label]) => (
              <button key={value} className={filter === value ? 'activity-filter active' : 'activity-filter'} type="button" role="tab" aria-selected={filter === value} onClick={() => selectFilter(value)}>{label}</button>
            ))}
          </div>
          <div className="activity-timeline">
            {visibleActivities.length === 0 && <p className="activity-empty">No activity found for this filter.</p>}
            {visibleActivities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)}
          </div>
          <div className="activity-pagination" aria-label="Activity pagination">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
            <span>Page {page} of {pageCount}</span>
            <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </section>
      </div>
      <AccountDialogs profileOpen={profileOpen} passwordOpen={passwordOpen} onCloseProfile={() => setProfileOpen(false)} onClosePassword={() => setPasswordOpen(false)} />
    </main>
  )
}

function SummaryCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: 'blue' | 'green' | 'purple' }) {
  return <article className={`activity-summary-card ${tone}`}><span className="activity-summary-icon">{icon}</span><div><p>{label}</p><strong>{value}</strong></div></article>
}

function ActivityItem({ activity }: { activity: ActivityRecord }) {
  const icon = activity.kind === 'login' ? <LogIn size={17} /> : activity.kind === 'profile' ? <Pencil size={17} /> : activity.kind === 'security' ? <KeyRound size={17} /> : <Plus size={17} />
  return <article className="activity-item"><span className={`activity-item-icon ${activity.kind}`}>{icon}</span><div className="activity-item-copy"><strong>{activity.userName}</strong><p>{activity.description}</p></div><time dateTime={activity.timestamp.toISOString()}>{formatActivityDate(activity.timestamp)}</time>{activity.status && <span className="activity-status">{activity.status}</span>}</article>
}

function formatActivityDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

function Activity() {
  return <ProtectedRoute><ActivityContent /></ProtectedRoute>
}

export default Activity
