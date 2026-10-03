import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Users, UserPlus, Trash2, Search, ShieldCheck, DoorOpen,
  Filter, CheckCircle2, UserCog, ShieldAlert, Loader2, Download,
  Edit3, ScanFace, Fingerprint, KeyRound, RefreshCw, XCircle, Check
} from 'lucide-react'
import { selectUsersList, addUser, removeUser, toggleUserStatus } from '../store/slices/usersSlice'
import { selectAuth } from '../store/slices/authSlice'
import { pushToast } from '../store/slices/uiSlice'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import { api } from '../api/client'
import { exportToCsv } from '../utils/exportCsv'

export default function UserManagement() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const fallbackUsers = useSelector(selectUsersList)

  const [atlasUsers, setAtlasUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'student',
    rollNo: '',
    department: '',
    block: '',
    roomNumber: '',
    phone: '',
    newPassword: '',
    resetFaceId: false,
    resetFingerprint: false,
  })

  // Add User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    role: 'student',
    rollNo: '',
    department: 'Computer Science',
    block: 'A Block',
    roomNumber: 'A-104',
    email: '',
    phone: '',
  })

  // Role Protection: Admin & Warden Only!
  if (role !== 'admin' && role !== 'warden') {
    return (
      <div className="page">
        <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <ShieldAlert size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
          <h2>Access Restricted</h2>
          <p style={{ color: 'var(--ink-soft)', maxWidth: 460, margin: '8px auto 20px' }}>
            The Resident Directory is restricted strictly to Hostel Wardens and Central Administrators. Students do not have account provisioning privileges.
          </p>
          <span className="badge badge-bad">Access Level: Staff & Administration Only</span>
        </div>
      </div>
    )
  }

  const loadUsersFromAtlas = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/admin/users?limit=100')
      if (res && res.users) {
        setAtlasUsers(
          res.users.map((u) => ({
            id: u._id,
            name: u.name,
            role: u.role,
            rollNo: u.rollNo || u.staffId || '—',
            department: u.department || 'General',
            block: u.block || 'A Block',
            roomNumber: u.roomNumber || '—',
            email: u.email,
            phone: u.phone || '—',
            status: u.isActive ? 'Active' : 'Deactivated',
            isFaceEnrolled: Boolean(u.isFaceEnrolled),
            isFingerprintEnrolled: Boolean(u.isFingerprintEnrolled),
            faceEnrolledAt: u.faceEnrolledAt,
            fingerprintEnrolledAt: u.fingerprintEnrolledAt,
            facePhoto: u.facePhoto,
          }))
        )
      }
    } catch (err) {
      console.warn('Could not fetch from Atlas:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenEdit = (u) => {
    setEditingUser(u)
    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      rollNo: u.rollNo === '—' ? '' : u.rollNo,
      department: u.department === 'General' ? '' : u.department,
      block: u.block || 'A Block',
      roomNumber: u.roomNumber === '—' ? '' : u.roomNumber,
      phone: u.phone === '—' ? '' : u.phone,
      newPassword: '',
      resetFaceId: false,
      resetFingerprint: false,
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        role: editForm.role,
        department: editForm.department.trim(),
        block: editForm.block.trim(),
        roomNumber: editForm.roomNumber.trim(),
        phone: editForm.phone.trim(),
      }
      if (editForm.role === 'student') {
        payload.rollNo = editForm.rollNo.trim()
      } else {
        payload.staffId = editForm.rollNo.trim()
      }
      if (editForm.newPassword && editForm.newPassword.trim()) {
        payload.newPassword = editForm.newPassword.trim()
      }
      if (editForm.resetFaceId) {
        payload.resetFaceId = true
      }
      if (editForm.resetFingerprint) {
        payload.resetFingerprint = true
      }

      const res = await api.patch(`/admin/users/${editingUser.id}`, payload)
      if (res && res.success) {
        dispatch(pushToast(`User ${editForm.name} updated successfully in MongoDB Atlas!`, 'ok'))
        setEditingUser(null)
        await loadUsersFromAtlas()
      }
    } catch (err) {
      console.error('[Update User Error]', err)
      dispatch(pushToast(err.message || 'Failed to update user', 'danger'))
    }
  }

  useEffect(() => {
    if (role === 'admin' || role === 'warden') {
      loadUsersFromAtlas()
    }
  }, [role])

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!newUser.name.trim() || !newUser.rollNo.trim()) {
      dispatch(pushToast('Name and ID are required.', 'warn'))
      return
    }
    if (!newUser.email.trim()) {
      dispatch(pushToast('Gmail or email address is required for login authorization.', 'warn'))
      return
    }

    try {
      const res = await api.post('/admin/users', {
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        role: newUser.role,
        rollNo: newUser.role === 'student' ? newUser.rollNo.trim() : undefined,
        staffId: newUser.role !== 'student' ? newUser.rollNo.trim() : undefined,
        department: newUser.department,
        block: newUser.block,
        roomNumber: newUser.roomNumber,
        phone: newUser.phone,
        password: 'Vidudhi@2026',
      })

      if (res && res.success) {
        dispatch(pushToast(`User ${newUser.name} saved to MongoDB Atlas!`, 'ok'))
        setShowAddModal(false)
        setNewUser({
          name: '',
          role: 'student',
          rollNo: '',
          department: 'Computer Science',
          block: 'A Block',
          roomNumber: 'A-104',
          email: '',
          phone: '',
        })
        await loadUsersFromAtlas()
      }
    } catch (err) {
      console.error('[Add User Error]', err)
      const errorMsg = err.data?.message || err.message || 'Failed to save user.'
      dispatch(pushToast(`Failed to add user: ${errorMsg}`, 'danger'))
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingUser) return
    try {
      await api.delete(`/admin/users/${deletingUser.id}`)
      dispatch(pushToast(`User ${deletingUser.name} deactivated in MongoDB Atlas.`, 'info'))
      setDeletingUser(null)
      await loadUsersFromAtlas()
    } catch (err) {
      console.error('[Delete User Error]', err)
      dispatch(pushToast(`Failed to delete user: ${err.message}`, 'danger'))
    }
  }

  const displayUsers = atlasUsers.length > 0 ? atlasUsers : fallbackUsers

  const filteredUsers = displayUsers.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.rollNo.toLowerCase().includes(q) || u.department.toLowerCase().includes(q) || u.roomNumber.toLowerCase().includes(q)
    }
    return true
  })

  const handleExportUsers = () => {
    const dataToExport = filteredUsers.length > 0 ? filteredUsers : displayUsers
    if (!dataToExport || dataToExport.length === 0) {
      dispatch(pushToast({ message: 'No users found to export', tone: 'warn' }))
      return
    }
    exportToCsv('vidudhi_users_roster.csv', dataToExport, {
      id: 'User ID',
      name: 'Full Name',
      role: 'Role',
      rollNo: 'Roll / Staff ID',
      department: 'Department',
      block: 'Block',
      roomNumber: 'Room Number',
      email: 'Email',
      phone: 'Phone',
      status: 'Status',
    })
    dispatch(pushToast({ message: `Exported ${dataToExport.length} users to CSV successfully!`, tone: 'ok' }))
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-border)' }}>
            <UserCog size={14} /> Administration &amp; Warden Operations
          </span>
          <h1>Hostel Resident Directory &amp; Provisioning</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleExportUsers}>
            <Download size={15} /> Export Users (.CSV)
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={15} /> Add New User
          </button>
        </div>
      </div>

      {/* Directory Filter Bar */}
      <div className="panel">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <input
              type="text"
              placeholder="Search by student name, roll number, department, or room…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'student', 'warden', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setRoleFilter(r)}
                style={{ textTransform: 'capitalize' }}
              >
                {r === 'All' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Active Campus Roster</h3>
            <p>{filteredUsers.length} accounts found on the central registry</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Roll / Staff ID</th>
                <th>Department / Unit</th>
                <th>Block &amp; Room</th>
                <th>Contact</th>
                <th>Biometrics Proof</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="mono" style={{ fontSize: 11.5 }}>{u.id}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                        background: u.role === 'admin' ? 'var(--navy-soft)' : u.role === 'warden' ? 'var(--accent-soft)' : 'var(--surface-2)',
                        color: u.role === 'admin' ? 'var(--navy)' : u.role === 'warden' ? 'var(--accent-border)' : 'var(--ink)',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="mono" style={{ fontWeight: 600 }}>{u.rollNo}</td>
                  <td>{u.department}</td>
                  <td>{u.roomNumber} ({u.block})</td>
                  <td style={{ fontSize: 12 }}>
                    <div>{u.phone}</div>
                    <div style={{ color: 'var(--ink-faint)', fontSize: 11 }}>{u.email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10.5,
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: u.isFaceEnrolled ? 'rgba(34, 197, 94, 0.15)' : 'var(--surface-sunken)',
                          color: u.isFaceEnrolled ? '#16A34A' : 'var(--ink-muted)',
                          border: u.isFaceEnrolled ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--line)',
                        }}
                      >
                        <ScanFace size={11} /> {u.isFaceEnrolled ? 'Face Enrolled' : 'Face Pending'}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10.5,
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: u.isFingerprintEnrolled ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface-sunken)',
                          color: u.isFingerprintEnrolled ? '#0284C7' : 'var(--ink-muted)',
                          border: u.isFingerprintEnrolled ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid var(--line)',
                        }}
                      >
                        <Fingerprint size={11} /> {u.isFingerprintEnrolled ? 'Fingerprint Linked' : 'Fingerprint Pending'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => dispatch(toggleUserStatus(u.id))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      title="Click to toggle status"
                    >
                      <Badge tone={u.status === 'Active' ? 'ok' : 'bad'}>{u.status}</Badge>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--accent-border)', padding: '4px 8px' }}
                        onClick={() => handleOpenEdit(u)}
                        title="Edit User Details in DB"
                      >
                        <Edit3 size={13} />
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#DC2626', padding: '4px 8px' }}
                          onClick={() => setDeletingUser(u)}
                          title="Remove User"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <Modal
          title="Register New Hostel User"
          subtitle="Provision a student or warden account on the portal"
          onClose={() => setShowAddModal(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" form="add-user-form" className="btn btn-primary">
                Provision Account
              </button>
            </div>
          }
        >
          <form id="add-user-form" onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Full Legal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Anandha Krishnan"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>System Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="warden">Warden</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>{newUser.role === 'student' ? 'Roll / Register No.' : 'Staff Identification ID'}</label>
                <input
                  type="text"
                  required
                  placeholder={newUser.role === 'student' ? '24104045' : 'WRD-1005'}
                  value={newUser.rollNo}
                  onChange={(e) => setNewUser({ ...newUser, rollNo: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Department / Office Unit</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Assigned Block</label>
                <select
                  value={newUser.block}
                  onChange={(e) => setNewUser({ ...newUser, block: e.target.value })}
                >
                  <option>A Block</option>
                  <option>B Block</option>
                  <option>C Block</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Room Number</label>
                <input
                  type="text"
                  value={newUser.roomNumber}
                  onChange={(e) => setNewUser({ ...newUser, roomNumber: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98401 00000"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label>Google Account / Gmail Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. resident@gmail.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <span style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2, display: 'block' }}>
                This Gmail will be authorized in MongoDB Atlas for Google OAuth login.
              </span>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <Modal
          title={`Edit User: ${editingUser.name}`}
          subtitle={`Update profile, room, password, or biometrics for ID: ${editingUser.id}`}
          onClose={() => setEditingUser(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
              <button type="submit" form="edit-user-form" className="btn btn-primary">
                Save Changes to Database
              </button>
            </div>
          }
        >
          <form id="edit-user-form" onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Full Legal Name</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>System Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="warden">Warden</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>{editForm.role === 'student' ? 'Roll / Register No.' : 'Staff ID'}</label>
                <input
                  type="text"
                  required
                  value={editForm.rollNo}
                  onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Block / Wing</label>
                <input
                  type="text"
                  value={editForm.block}
                  onChange={(e) => setEditForm({ ...editForm, block: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Room Number</label>
                <input
                  type="text"
                  value={editForm.roomNumber}
                  onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Department / Branch</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Contact Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label>Institutional Email / Login ID</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>

            {/* Password Reset Field */}
            <div style={{ background: 'var(--surface-sunken)', padding: '12px', borderRadius: 8, border: '1px solid var(--line)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <KeyRound size={14} color="var(--accent-border)" /> Reset Password (Optional)
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current, or enter new password"
                value={editForm.newPassword}
                onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                style={{ marginTop: 6 }}
              />
              <span style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4, display: 'block' }}>
                Default initial password for students is 123.
              </span>
            </div>

            {/* Biometric Controls */}
            <div style={{ background: 'var(--surface-sunken)', padding: '12px', borderRadius: 8, border: '1px solid var(--line)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, marginBottom: 8 }}>
                <ShieldCheck size={14} color="#16A34A" /> Biometric Proof Status &amp; Re-enrollment Controls
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={editForm.resetFaceId}
                    onChange={(e) => setEditForm({ ...editForm, resetFaceId: e.target.checked })}
                  />
                  <span>
                    Reset Face ID Proof (Current: <strong>{editingUser.isFaceEnrolled ? 'Enrolled in MongoDB' : 'Not Enrolled'}</strong>)
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={editForm.resetFingerprint}
                    onChange={(e) => setEditForm({ ...editForm, resetFingerprint: e.target.checked })}
                  />
                  <span>
                    Reset Fingerprint Proof (Current: <strong>{editingUser.isFingerprintEnrolled ? 'Linked in MongoDB' : 'Not Linked'}</strong>)
                  </span>
                </label>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingUser && (
        <Modal
          title="Confirm User Removal"
          subtitle={`Remove ${deletingUser.name} (${deletingUser.rollNo})`}
          onClose={() => setDeletingUser(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setDeletingUser(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-sm" style={{ background: '#DC2626', color: '#fff' }} onClick={handleConfirmDelete}>
                Delete User
              </button>
            </div>
          }
        >
          <p style={{ fontSize: 13, color: 'var(--ink)' }}>
            Are you sure you want to remove <strong>{deletingUser.name}</strong> from the active hostel resident registry? This will revoke door access and room allocation.
          </p>
        </Modal>
      )}
    </div>
  )
}
