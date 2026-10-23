import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../redux/types/index.ts'
import { changePasswordRequested, profileUpdateRequested } from '../redux/actions/index.ts'
import { getUserDisplayName } from './profileUtils.ts'

const maxImageSize = 2 * 1024 * 1024
const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp']

type AccountDialogsProps = {
  profileOpen: boolean
  passwordOpen: boolean
  onCloseProfile: () => void
  onClosePassword: () => void
}

export default function AccountDialogs({ profileOpen, passwordOpen, onCloseProfile, onClosePassword }: AccountDialogsProps) {
  return (
    <>
      {profileOpen && <ProfileDialog onClose={onCloseProfile} />}
      {passwordOpen && <PasswordDialog onClose={onClosePassword} />}
    </>
  )
}

function ProfileDialog({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.signup.user)
  const profileStatus = useSelector((state: RootState) => state.signup.profileStatus)
  const profileError = useSelector((state: RootState) => state.signup.profileError)
  const [name, setName] = useState(getUserDisplayName(user))
  const [email, setEmail] = useState(user?.email ?? '')
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? '')
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageError(null)
    if (!supportedImageTypes.includes(file.type)) {
      setImageError('Choose a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > maxImageSize) {
      setImageError('Profile images must be 2 MB or smaller.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setProfileImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch(profileUpdateRequested({ name, email, profileImage }))
  }

  return (
    <DialogShell title="Update Profile" onClose={onClose}>
      <form className="dashboard-profile-form" onSubmit={handleSubmit}>
        <div className="dashboard-image-upload">
          {profileImage ? <img className="dashboard-profile-preview" src={profileImage} alt="Selected profile preview" /> : <span className="dashboard-profile-preview dashboard-profile-placeholder"><ImagePlus size={24} /></span>}
          <div>
            <button className="dashboard-button secondary" type="button" onClick={() => fileInputRef.current?.click()}><ImagePlus size={16} />Choose image</button>
            <input ref={fileInputRef} className="dashboard-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
            <small className="dashboard-upload-hint">JPEG, PNG, or WebP up to 2 MB</small>
          </div>
        </div>
        {imageError && <p className="dashboard-form-error" role="alert">{imageError}</p>}
        <label htmlFor="dashboard-profile-name">Name<input id="dashboard-profile-name" value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label htmlFor="dashboard-profile-email">Email<input id="dashboard-profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        {profileError && <p className="dashboard-form-error" role="alert">{profileError}</p>}
        {profileStatus === 'succeeded' && <p className="dashboard-form-success" role="status">Profile updated successfully.</p>}
        <div className="dashboard-modal-actions"><button className="dashboard-button secondary" type="button" onClick={onClose}>Cancel</button><button className="dashboard-button" type="submit" disabled={profileStatus === 'loading'}>{profileStatus === 'loading' ? 'Saving...' : 'Save Changes'}</button></div>
      </form>
    </DialogShell>
  )
}

function PasswordDialog({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>()
  const passwordStatus = useSelector((state: RootState) => state.signup.passwordStatus)
  const passwordError = useSelector((state: RootState) => state.signup.passwordError)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationError(null)
    if (!currentPassword || !newPassword || !confirmPassword) return setValidationError('All password fields are required.')
    if (newPassword !== confirmPassword) return setValidationError('New passwords do not match.')
    dispatch(changePasswordRequested({ currentPassword, newPassword }))
  }

  return (
    <DialogShell title="Change Password" onClose={onClose}>
      <form className="dashboard-profile-form" onSubmit={handleSubmit}>
        <label htmlFor="dashboard-current-password">Current Password<input id="dashboard-current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
        <label htmlFor="dashboard-new-password">New Password<input id="dashboard-new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
        <label htmlFor="dashboard-confirm-password">Confirm Password<input id="dashboard-confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
        {(validationError || passwordError) && <p className="dashboard-form-error" role="alert">{validationError || passwordError}</p>}
        {passwordStatus === 'succeeded' && <p className="dashboard-form-success" role="status">Password changed successfully.</p>}
        <div className="dashboard-modal-actions"><button className="dashboard-button secondary" type="button" onClick={onClose}>Cancel</button><button className="dashboard-button" type="submit" disabled={passwordStatus === 'loading'}>{passwordStatus === 'loading' ? 'Changing...' : 'Change Password'}</button></div>
      </form>
    </DialogShell>
  )
}

function DialogShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title"><div className="dashboard-modal-heading"><h2 id="account-dialog-title">{title}</h2><button className="dashboard-modal-close" type="button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>{children}</section></div>
}
