import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, LogOut, Pencil, Search, ShieldCheck, UserRound, KeyRound } from 'lucide-react'
import type { SignupUser } from '../redux/slices/signupSlice.ts'
import { getUserDisplayName } from './profileUtils.ts'
import { ProfileAvatar } from './ProfileAvatar.tsx'

type DashboardNavbarProps = {
  user: SignupUser | null
  searchValue?: string
  onSearchChange?: (value: string) => void
  onViewProfile: () => void
  onUpdateProfile: () => void
  onChangePassword: () => void
  onLogout: () => void
  activePage?: 'dashboard' | 'users' | 'activity' | 'leaderboard' | 'sessions'
}

function DashboardNavbar({ user, searchValue, onSearchChange, onViewProfile, onUpdateProfile, onChangePassword, onLogout, activePage = 'dashboard' }: DashboardNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const displayName = getUserDisplayName(user)
  const currentSearch = searchValue ?? localSearch

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const closeAndRun = (action: () => void) => {
    setMenuOpen(false)
    action()
  }

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  return (
    <header className="dashboard-navbar">
      <a className="dashboard-brand" href="/dashboard" aria-label="API Practice dashboard">
        <span className="dashboard-brand-icon"><ShieldCheck size={21} /></span>
        API Practice
      </a>
      <nav className="dashboard-nav-links" aria-label="Main navigation">
        <a className={`dashboard-nav-link ${activePage === 'dashboard' ? 'active' : ''}`} href="/dashboard">Dashboard</a>
        <a className={`dashboard-nav-link ${activePage === 'users' ? 'active' : ''}`} href="/users">Users</a>
        <a className={`dashboard-nav-link ${activePage === 'activity' ? 'active' : ''}`} href="/activity">Activity</a>
        <a className={`dashboard-nav-link ${activePage === 'leaderboard' ? 'active' : ''}`} href="/leaderboard">Leaderboard</a>
        <a className={`dashboard-nav-link ${activePage === 'sessions' ? 'active' : ''}`} href="/sessions">Sessions</a>
      </nav>
      <label className="dashboard-search">
        <Search size={18} aria-hidden="true" />
        <input type="search" value={currentSearch} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search users, profiles..." aria-label="Search users and profiles" />
      </label>
      <span className="dashboard-nav-spacer" />
      <button className="dashboard-icon-button" type="button" aria-label="Notifications"><Bell size={20} /></button>
      <div className="dashboard-nav-account" ref={menuRef}>
        <button className="dashboard-nav-user" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-haspopup="menu">
          <ProfileAvatar user={user} className="dashboard-avatar" />
          <span className="dashboard-nav-user-copy"><strong>{displayName}</strong><span>{user?.email ?? 'Loading account...'}</span></span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        {menuOpen && (
          <div className="dashboard-user-menu" role="menu">
            <div className="dashboard-menu-user"><ProfileAvatar user={user} className="dashboard-menu-avatar" /><span><strong>{displayName}</strong><small>{user?.email ?? 'Loading account...'}</small></span></div>
            <button type="button" role="menuitem" onClick={() => closeAndRun(onViewProfile)}><UserRound size={16} />View Profile</button>
            <button type="button" role="menuitem" onClick={() => closeAndRun(onUpdateProfile)}><Pencil size={16} />Update Profile</button>
            <button type="button" role="menuitem" onClick={() => closeAndRun(onChangePassword)}><KeyRound size={16} />Change Password</button>
            <button className="dashboard-menu-logout" type="button" role="menuitem" onClick={() => closeAndRun(onLogout)}><LogOut size={16} />Logout</button>
          </div>
        )}
      </div>
    </header>
  )
}

export default DashboardNavbar
