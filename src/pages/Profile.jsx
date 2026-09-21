import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, Trash2, DoorOpen, CreditCard, Briefcase, Phone, Mail, Edit3, ShieldCheck, User, Lock } from 'lucide-react'
import Modal from '../components/common/Modal'
import { selectAuth, selectUser, updateUserProfile } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import { selectPhotoForRole, setProfilePhoto, clearProfilePhoto } from '../store/slices/profileSlice'
import { pushToast } from '../store/slices/uiSlice'

export default function Profile() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const photo = useSelector(selectPhotoForRole(role))
  const fileInputRef = useRef(null)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '+91 98401 23456',
    email: user.email || 'resident@campus.edu',
    roomNumber: user.roomNumber || '',
    designation: user.designation || '',
  })

  const openEditModal = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || (role === 'admin' ? '+91 94440 01101' : '+91 98401 23456'),
      email: user.email || (role === 'admin' ? 'warden.office@campus.edu' : 'student@campus.edu'),
      roomNumber: user.roomNumber || '',
      designation: user.designation || '',
    })
    setIsEditing(true)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      dispatch(pushToast('Name cannot be empty.', 'warn'))
      return
    }

    const initials = formData.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    dispatch(
      updateUserProfile({
        role,
        updates: {
          ...formData,
          avatarInitials: initials || user.avatarInitials,
        },
      })
    )
    dispatch(pushToast('Profile information updated successfully!', 'ok'))
    setIsEditing(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      dispatch(pushToast('Please choose an image file.', 'warn'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      dispatch(setProfilePhoto({ role, dataUrl: reader.result }))
      dispatch(updateUserProfile({ role, updates: { avatarUrl: reader.result } }))
      dispatch(pushToast('Profile photo updated.', 'ok'))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemovePhoto = () => {
    dispatch(clearProfilePhoto(role))
    dispatch(updateUserProfile({ role, updates: { avatarUrl: '' } }))
    dispatch(pushToast('Profile photo removed.', 'info'))
  }

  const identifier = role === 'admin'
    ? (user.staffId || 'STAFF-1001')
    : (user.rollNo || user.regNo || '24104031')

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Institutional Account</span>
          <h1>My Profile</h1>
        </div>
        {/* Single, consolidated Edit Profile button */}
        <button className="btn btn-primary" onClick={openEditModal}>
          <Edit3 size={15} /> Edit Profile
        </button>
      </div>

      <div className="two-col">
        <div className="panel profile-card">
          <div className="profile-photo-wrap">
            <div className="profile-photo">
              {photo || user.avatarUrl ? (
                <img src={photo || user.avatarUrl} alt={`${user.name}'s profile`} />
              ) : (
                <span className="profile-photo-initials">{user.avatarInitials}</span>
              )}
            </div>
            <button
              className="profile-photo-edit"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              title="Upload new photo"
            >
              <Camera size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </div>

          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-role-label">
            {role === 'admin'
              ? `${user.designation || 'System Administrator'} · Central Administration`
              : role === 'warden'
              ? `${user.designation || 'Chief Warden'} · Residential Office`
              : `Resident · Roll No. ${identifier}`}
          </p>

          <div className="profile-actions">
            <button className="btn btn-blue btn-sm" onClick={() => fileInputRef.current?.click()}>
              <Camera size={14} /> Change photo
            </button>
            {(photo || user.avatarUrl) && (
              <button className="btn btn-ghost btn-sm" onClick={handleRemovePhoto}>
                <Trash2 size={14} /> Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Account Details</h3>
              <p>Verified information on record for your campus hostel profile</p>
            </div>
          </div>
          <div className="profile-detail-list">
            <div className="profile-detail-row">
              <User size={15} />
              <div>
                <span className="profile-detail-label">Full Name</span>
                <span className="profile-detail-value">{user.name}</span>
              </div>
            </div>

            <div className="profile-detail-row">
              <CreditCard size={15} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <span className="profile-detail-label">{role === 'student' ? 'Roll Number' : 'Staff ID'}</span>
                  <span className="profile-detail-value mono">{identifier}</span>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  <Lock size={11} /> Read-only
                </span>
              </div>
            </div>

            {role === 'student' ? (
              <div className="profile-detail-row">
                <DoorOpen size={15} />
                <div>
                  <span className="profile-detail-label">Hostel Room</span>
                  <span className="profile-detail-value">
                    {user.roomNumber || (room ? `${room.roomNumber} · ${room.block}, Floor ${room.floor}` : 'A-101')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="profile-detail-row">
                <Briefcase size={15} />
                <div>
                  <span className="profile-detail-label">Designation &amp; Office</span>
                  <span className="profile-detail-value">
                    {user.designation || (role === 'admin' ? 'Hostel Administrator' : 'Chief Warden')} · {user.roomNumber || 'Central Office'}
                  </span>
                </div>
              </div>
            )}

            <div className="profile-detail-row">
              <Phone size={15} />
              <div>
                <span className="profile-detail-label">Mobile Number</span>
                <span className="profile-detail-value mono">{user.phone || '+91 98401 23456'}</span>
              </div>
            </div>

            <div className="profile-detail-row">
              <Mail size={15} />
              <div>
                <span className="profile-detail-label">Campus Email</span>
                <span className="profile-detail-value">{user.email || 'resident@campus.edu'}</span>
              </div>
            </div>

            <div className="profile-detail-row">
              <ShieldCheck size={15} color="#059669" />
              <div>
                <span className="profile-detail-label">Verification Status</span>
                <span className="profile-detail-value" style={{ color: 'var(--accent-green)' }}>
                  Institutional Identity Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE EDIT PROFILE MODAL */}
      {isEditing && (
        <Modal
          title="Edit Profile"
          subtitle="Update your contact details and display preferences"
          onClose={() => setIsEditing(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="submit" form="edit-profile-form" className="btn btn-primary">
                Save Profile
              </button>
            </div>
          }
        >
          <form id="edit-profile-form" onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Keerthana G."
              />
            </div>

            {/* Read-only Staff ID / Roll Number */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>{role === 'student' ? 'Roll Number' : 'Staff ID'}</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Lock size={11} /> Cannot be edited
                </span>
              </div>
              <input
                type="text"
                disabled
                value={identifier}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'not-allowed',
                  opacity: 0.7,
                  color: 'var(--text-muted)',
                }}
              />
            </div>

            {role === 'student' ? (
              <div>
                <label>Room Number</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g. A-101"
                />
              </div>
            ) : (
              <div>
                <label>Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Chief Warden"
                />
              </div>
            )}

            <div>
              <label>Contact Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98401 23456"
              />
            </div>

            <div>
              <label>Campus Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. resident@campus.edu"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
