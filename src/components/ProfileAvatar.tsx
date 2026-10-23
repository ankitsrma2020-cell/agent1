import type { SignupUser } from '../redux/slices/signupSlice.ts'
import { getUserDisplayName, getUserInitials } from './profileUtils.ts'

export function ProfileAvatar({ user, className = '' }: { user: SignupUser | null; className?: string }) {
  const name = getUserDisplayName(user)
  if (user?.profileImage) {
    return <img className={`profile-avatar ${className}`} src={user.profileImage} alt={`${name} profile`} />
  }
  return <span className={`profile-avatar ${className}`} aria-label={`${name} profile`}>{getUserInitials(name)}</span>
}
