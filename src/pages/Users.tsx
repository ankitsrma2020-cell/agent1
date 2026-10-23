import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UsersRound } from 'lucide-react'
import type { AppDispatch, RootState } from '../redux/types/index.ts'
import { usersRequested } from '../redux/actions/index.ts'
import type { UserSortField, UserSortOrder } from '../redux/api/usersApi.ts'
import { clearAuthSession } from '../redux/auth/storage.ts'
import DashboardNavbar from '../components/DashboardNavbar.tsx'
import AccountDialogs from '../components/AccountDialogs.tsx'
import ProtectedRoute from '../routes/ProtectedRoute.tsx'
import './Users.css'

function UsersContent() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.signup.user)
  const { users, status, error } = useSelector((state: RootState) => state.users)
  const [sortBy, setSortBy] = useState<UserSortField>('name')
  const [order, setOrder] = useState<UserSortOrder>('asc')
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  useEffect(() => {
    dispatch(usersRequested({ sortBy, order }))
  }, [dispatch, order, sortBy])

  const retry = () => dispatch(usersRequested({ sortBy, order }))
  const handleLogout = () => {
    clearAuthSession()
    window.location.replace('/login')
  }

  return (
    <main className="users-page">
      <DashboardNavbar
        user={user}
        activePage="users"
        onViewProfile={() => setProfileOpen(true)}
        onUpdateProfile={() => setProfileOpen(true)}
        onChangePassword={() => setPasswordOpen(true)}
        onLogout={handleLogout}
      />
      <div className="users-content">
        <section className="users-card" aria-labelledby="users-title">
        <header className="users-header">
          <h1 id="users-title" className="users-title"><UsersRound size={27} aria-hidden="true" />Users Management</h1>
         
        </header>

        <div className="users-controls" aria-label="User sorting controls">
          <div className="users-control">
            <label htmlFor="users-sort-by">Sort by</label>
            <select
              id="users-sort-by"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as UserSortField)}
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>
          <div className="users-control">
            <label htmlFor="users-sort-order">Order</label>
            <select
              id="users-sort-order"
              value={order}
              onChange={(event) => setOrder(event.target.value as UserSortOrder)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {(status === 'idle' || status === 'loading') && (
          <p className="users-message" role="status">Loading users...</p>
        )}

        {status === 'failed' && (
          <div className="users-message users-error" role="alert">
            <p>{error || 'Unable to fetch users.'}</p>
            <button className="users-retry" type="button" onClick={retry}>Try again</button>
          </div>
        )}

        {status === 'succeeded' && users.length === 0 && (
          <p className="users-message">No users found.</p>
        )}

        {status === 'succeeded' && users.length > 0 && (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Created Date</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{formatCreatedDate(user.createdAt)}</td>
                    <td><button className="users-action-note" type="button" disabled>View only</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </section>
      </div>
      <AccountDialogs profileOpen={profileOpen} passwordOpen={passwordOpen} onCloseProfile={() => setProfileOpen(false)} onClosePassword={() => setPasswordOpen(false)} />
    </main>
  )
}

function formatCreatedDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

function Users() {
  return (
    <ProtectedRoute>
      <UsersContent />
    </ProtectedRoute>
  )
}

export default Users
