import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowRight, CalendarDays, LogOut, Pencil, ShieldCheck, TrendingUp, UserRound, UsersRound, Zap } from 'lucide-react'
import type { AppDispatch, RootState } from '../redux/types/index.ts'
import { usersRequested } from '../redux/actions/index.ts'
import { clearAuthSession } from '../redux/auth/storage.ts'
import ProtectedRoute from '../routes/ProtectedRoute.tsx'
import AccountDialogs from '../components/AccountDialogs.tsx'
import DashboardNavbar from '../components/DashboardNavbar.tsx'
import { ProfileAvatar } from '../components/ProfileAvatar.tsx'
import './Dashboard.css'

function DashboardView() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.signup.user)
  const { users, status: usersStatus } = useSelector((state: RootState) => state.users)
  const [search, setSearch] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (usersStatus === 'idle') dispatch(usersRequested({ sortBy: 'createdAt', order: 'desc' }))
  }, [dispatch, usersStatus])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setCalendarOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const displayName = user ? getUserName(user) : 'Your dashboard'
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users
      .filter((managedUser) => !query || `${managedUser.name} ${managedUser.email}`.toLowerCase().includes(query))
      .slice(0, 5)
  }, [search, users])

  const handleLogout = () => {
    clearAuthSession()
    window.location.replace('/login')
  }

  const openProfile = () => setProfileOpen(true)

  return (
    <main className="dashboard-page">
      <DashboardNavbar
        user={user}
        searchValue={search}
        onSearchChange={setSearch}
        onViewProfile={openProfile}
        onUpdateProfile={openProfile}
        onChangePassword={() => setPasswordOpen(true)}
        onLogout={handleLogout}
      />

      <div className="dashboard-main">
        <section className="dashboard-welcome" aria-labelledby="dashboard-title">
          <div className="dashboard-welcome-copy">
            <span className="dashboard-welcome-icon"><UserRound size={31} /></span>
            <div>
              <p className="dashboard-eyebrow">Welcome back</p>
              <h2 id="dashboard-title">Hello Everyone, {displayName}!</h2>
              <p>Here&apos;s what&apos;s happening with your account today.</p>
              <div className="dashboard-date-picker" ref={calendarRef}>
                <button className="dashboard-date" type="button" onClick={() => setCalendarOpen((open) => !open)} aria-expanded={calendarOpen} aria-haspopup="dialog">
                  <CalendarDays size={15} /> {formatSelectedDate(selectedDate)}
                </button>
                {calendarOpen && (
                  <CalendarPopover
                    month={calendarMonth}
                    selectedDate={selectedDate}
                    onMonthChange={setCalendarMonth}
                    onDateSelect={(date) => { setSelectedDate(date); setCalendarOpen(false) }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="dashboard-quote"><span className="dashboard-quote-mark">“</span>Small steps every day<br />lead to big results.</div>
        </section>

        <section className="dashboard-stats" aria-label="Account statistics">
          <StatCard icon={<UsersRound size={22} />} label="Total Users" value={users.length} note="Registered accounts" />
          <StatCard icon={<UserRound size={22} />} label="Active Users" value="—" note="Activity data unavailable" />
          <StatCard icon={<UserRound size={22} />} label="Profile Information" value={user?.email && displayName !== 'Your dashboard' ? 'Complete' : 'Pending'} note={user ? 'Your profile is up to date' : 'Loading your profile'} />
          <StatCard icon={<ShieldCheck size={22} />} label="Account Status" value="Active" note="JWT authentication is active" />
        </section>

        <section className="dashboard-content-grid">
          <article className="dashboard-card">
            <div className="dashboard-card-heading"><h2 className="dashboard-card-title"><TrendingUp size={20} /> User Growth</h2></div>
            <p className="dashboard-card-subtitle">Historical registration data</p>
            <div className="dashboard-growth-empty"><div><TrendingUp size={28} /><p>Growth history is not available from the current users API.</p></div></div>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-heading"><h2 className="dashboard-card-title"><UserRound size={20} /> Recent Users</h2><a className="dashboard-card-link" href="/users">View All <ArrowRight size={14} /></a></div>
            {usersStatus === 'loading' && <p className="dashboard-growth-empty">Loading users...</p>}
            {usersStatus === 'failed' && <p className="dashboard-growth-empty">Unable to load recent users.</p>}
            {usersStatus === 'succeeded' && filteredUsers.length === 0 && <p className="dashboard-growth-empty">No users match your search.</p>}
            {filteredUsers.length > 0 && <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Name</th><th>Email</th><th>Created Date</th><th>Status</th></tr></thead><tbody>{filteredUsers.map((managedUser) => <tr key={managedUser.id}><td><span className="dashboard-table-user"><span className="dashboard-table-avatar">{getInitials(managedUser.name)}</span>{managedUser.name}</span></td><td>{managedUser.email}</td><td>{formatDate(managedUser.createdAt)}</td><td><span className="dashboard-status">Registered</span></td></tr>)}</tbody></table></div>}
          </article>

          <article className="dashboard-card dashboard-profile">
            <ProfileAvatar user={user} className="dashboard-card-icon dashboard-profile-avatar" />
            <h3>{displayName}</h3>
            <p className="dashboard-profile-email">{user?.email ?? 'Loading account...'}</p>
            <div className="dashboard-profile-actions">
              <button className="dashboard-button" type="button" onClick={openProfile}><UserRound size={16} /> View Profile</button>
              <button className="dashboard-button secondary" type="button" onClick={handleLogout}><LogOut size={16} /> Logout</button>
            </div>
          </article>
        </section>

        <section className="dashboard-lower-grid">
          <article className="dashboard-card">
            <div className="dashboard-card-heading"><h2 className="dashboard-card-title"><Zap size={20} /> Quick Actions</h2></div>
            <p className="dashboard-card-subtitle">Manage your account and explore features.</p>
            <div className="dashboard-quick-actions">
              <a className="dashboard-action-card" href="/users"><span className="dashboard-card-icon"><UserRound size={19} /></span><span className="dashboard-action-copy"><strong>View Users</strong><span>See all registered users in the system.</span></span><ArrowRight size={17} /></a>
              <button className="dashboard-action-card" type="button" onClick={openProfile}><span className="dashboard-card-icon"><Pencil size={19} /></span><span className="dashboard-action-copy"><strong>Update Profile</strong><span>Keep your information up to date.</span></span><ArrowRight size={17} /></button>
              <button className="dashboard-action-card" type="button" onClick={handleLogout}><span className="dashboard-card-icon"><LogOut size={19} /></span><span className="dashboard-action-copy"><strong>Logout</strong><span>Sign out of your account securely.</span></span><ArrowRight size={17} /></button>
            </div>
          </article>
          <article className="dashboard-card"><div className="dashboard-card-heading"><h2 className="dashboard-card-title"><ShieldCheck size={20} /> Security</h2></div><div className="dashboard-secure-copy"><strong>Your account is secure</strong><span>JWT authentication is active.</span></div></article>
        </section>
      </div>

      <AccountDialogs profileOpen={profileOpen} passwordOpen={passwordOpen} onCloseProfile={() => setProfileOpen(false)} onClosePassword={() => setPasswordOpen(false)} />
    </main>
  )
}

function StatCard({ icon, label, value, note }: { icon: ReactNode; label: string; value: string | number; note: string }) {
  return <article className="dashboard-stat-card"><div className="dashboard-stat-top"><span className="dashboard-card-icon">{icon}</span></div><p className="dashboard-stat-label">{label}</p><div className="dashboard-stat-value">{value}</div><p className="dashboard-stat-note">{note}</p></article>
}

function getUserName(user: { firstName: string; lastName: string }) { return `${user.firstName} ${user.lastName}`.trim() }
function getInitials(value: string) { return value.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U' }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString() }
function formatSelectedDate(date: Date) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', weekday: 'long' }).format(date) }

function CalendarPopover({ month, selectedDate, onMonthChange, onDateSelect }: { month: Date; selectedDate: Date; onMonthChange: (date: Date) => void; onDateSelect: (date: Date) => void }) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1).getDay()
  const days = Array.from({ length: 42 }, (_, index) => new Date(year, monthIndex, index - firstDay + 1))
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(month)

  return (
    <div className="dashboard-calendar-popover" role="dialog" aria-label="Choose a date">
      <div className="dashboard-calendar-header">
        <button type="button" onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))} aria-label="Previous month">‹</button>
        <strong>{monthLabel}</strong>
        <button type="button" onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))} aria-label="Next month">›</button>
      </div>
      <div className="dashboard-calendar-weekdays">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="dashboard-calendar-grid">
        {days.map((date) => {
          const currentMonth = date.getMonth() === monthIndex
          const selected = isSameDate(date, selectedDate)
          return <button key={date.toISOString()} className={`${currentMonth ? '' : 'outside-month'} ${selected ? 'selected' : ''}`} type="button" onClick={() => onDateSelect(date)}>{date.getDate()}</button>
        })}
      </div>
    </div>
  )
}

function isSameDate(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate()
}

function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardView />
    </ProtectedRoute>
  )
}

export default Dashboard
