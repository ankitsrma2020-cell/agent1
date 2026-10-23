import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Award, ChevronLeft, ChevronRight, Medal, Trophy } from 'lucide-react'
import type { RootState } from '../redux/types/index.ts'
import { clearAuthSession } from '../redux/auth/storage.ts'
import { getUserDisplayName, getUserInitials } from '../components/profileUtils.ts'
import AccountDialogs from '../components/AccountDialogs.tsx'
import DashboardNavbar from '../components/DashboardNavbar.tsx'
import ProtectedRoute from '../routes/ProtectedRoute.tsx'
import './Leaderboard.css'

type LeaderboardPeriod = 'week' | 'month' | 'all'
type SortField = 'points' | 'activities'

type LeaderboardEntry = {
  name: string
  email: string
  points: number
  activities: number
  lastActive: string
  status: 'Active' | 'Away'
}

const sampleEntries: LeaderboardEntry[] = [
  { name: 'Neha Sharma', email: 'neha@example.com', points: 2480, activities: 42, lastActive: 'Today, 10:24 AM', status: 'Active' },
  { name: 'Gouri Test', email: 'gouri@example.com', points: 2260, activities: 38, lastActive: 'Today, 9:42 AM', status: 'Active' },
  { name: 'Rohan Kumar', email: 'rohan@example.com', points: 1985, activities: 34, lastActive: 'Yesterday, 4:18 PM', status: 'Active' },
  { name: 'Sheetal Test', email: 'sheetal@example.com', points: 1760, activities: 29, lastActive: 'Yesterday, 1:06 PM', status: 'Away' },
  { name: 'Anjali Patil', email: 'anjali@example.com', points: 1535, activities: 25, lastActive: 'Sep 21, 2026', status: 'Active' },
  { name: 'Khushi Test', email: 'khushi@example.com', points: 1290, activities: 21, lastActive: 'Sep 20, 2026', status: 'Away' },
  { name: 'Arjun Mehta', email: 'arjun@example.com', points: 1125, activities: 18, lastActive: 'Sep 18, 2026', status: 'Active' },
]

function LeaderboardContent() {
  const user = useSelector((state: RootState) => state.signup.user)
  const [period, setPeriod] = useState<LeaderboardPeriod>('week')
  const [sortBy, setSortBy] = useState<SortField>('points')
  const [page, setPage] = useState(1)
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const pageSize = 4

  const entries = useMemo(() => {
    const actualName = getUserDisplayName(user)
    return sampleEntries.map((entry) => entry.email === user?.email ? { ...entry, name: actualName } : entry)
  }, [user])

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => b[sortBy] - a[sortBy]), [entries, sortBy])
  const pageCount = Math.max(1, Math.ceil(sortedEntries.length / pageSize))
  const visibleEntries = sortedEntries.slice((page - 1) * pageSize, page * pageSize)
  const topEntries = sortedEntries.slice(0, 3)

  const changePeriod = (nextPeriod: LeaderboardPeriod) => {
    setPeriod(nextPeriod)
    setPage(1)
  }

  const changeSort = (nextSort: SortField) => {
    setSortBy(nextSort)
    setPage(1)
  }

  const handleLogout = () => {
    clearAuthSession()
    window.location.replace('/login')
  }

  return (
    <main className="leaderboard-page">
      <DashboardNavbar user={user} activePage="leaderboard" onViewProfile={() => setProfileOpen(true)} onUpdateProfile={() => setProfileOpen(true)} onChangePassword={() => setPasswordOpen(true)} onLogout={handleLogout} />
      <div className="leaderboard-content">
        <header className="leaderboard-heading">
          <div>
            <h1>Leaderboard</h1>
            <p>See the most active users and their performance.</p>
          </div>
          <div className="leaderboard-heading-icon"><Trophy size={27} /></div>
        </header>

        <div className="leaderboard-periods" role="tablist" aria-label="Leaderboard period">
          {([['week', 'This Week'], ['month', 'This Month'], ['all', 'All Time']] as const).map(([value, label]) => <button key={value} className={period === value ? 'active' : ''} type="button" role="tab" aria-selected={period === value} onClick={() => changePeriod(value)}>{label}</button>)}
        </div>

        <section className="leaderboard-top-three" aria-label="Top three users">
          {topEntries.map((entry, index) => <TopRankCard key={entry.email} entry={entry} rank={index + 1} />)}
        </section>

        <section className="leaderboard-panel" aria-labelledby="leaderboard-table-title">
          <div className="leaderboard-panel-heading">
            <div><h2 id="leaderboard-table-title">User rankings</h2><p>Ranked by your selected performance metric.</p></div>
            <label className="leaderboard-sort">Sort by
              <select value={sortBy} onChange={(event) => changeSort(event.target.value as SortField)}>
                <option value="points">Points</option>
                <option value="activities">Activities</option>
              </select>
            </label> 
          </div>
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead><tr><th>Rank</th><th>User</th><th>Activities</th><th>Points</th><th>Last Active</th><th>Status</th></tr></thead>
              <tbody>{visibleEntries.map((entry, index) => <LeaderboardRow key={entry.email} entry={entry} rank={(page - 1) * pageSize + index + 1} current={entry.email === user?.email} />)}</tbody>
            </table>
          </div>
          <div className="leaderboard-pagination">
            <span>Page {page} of {pageCount}</span>
            <div><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button><button type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button></div>
          </div>
        </section>
      </div>
      <AccountDialogs profileOpen={profileOpen} passwordOpen={passwordOpen} onCloseProfile={() => setProfileOpen(false)} onClosePassword={() => setPasswordOpen(false)} />
    </main>
  )
}

function TopRankCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const icon = rank === 1 ? <Trophy size={20} /> : rank === 2 ? <Medal size={20} /> : <Award size={20} />
  return <article className={`leaderboard-rank-card rank-${rank}`}><div className="leaderboard-rank-icon">{icon}</div><span className="leaderboard-rank-label">{rank === 1 ? '🥇 1st Place' : rank === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}</span><span className="leaderboard-avatar">{getUserInitials(entry.name)}</span><strong>{entry.name}</strong><b>{entry.points.toLocaleString()} <small>points</small></b><span>{entry.activities} activities</span></article>
}

function LeaderboardRow({ entry, rank, current }: { entry: LeaderboardEntry; rank: number; current: boolean }) {
  return <tr className={current ? 'current-user' : ''}><td><span className="leaderboard-rank-number">{rank}</span></td><td><div className="leaderboard-user"><span className="leaderboard-avatar small">{getUserInitials(entry.name)}</span><span><strong>{entry.name}</strong>{current && <em>You</em>}<small>{entry.email}</small></span></div></td><td>{entry.activities}</td><td><strong className="leaderboard-points">{entry.points.toLocaleString()}</strong></td><td>{entry.lastActive}</td><td><span className={`leaderboard-status ${entry.status.toLowerCase()}`}>{entry.status}</span></td></tr>
}

function Leaderboard() {
  return <ProtectedRoute><LeaderboardContent /></ProtectedRoute>
}

export default Leaderboard
