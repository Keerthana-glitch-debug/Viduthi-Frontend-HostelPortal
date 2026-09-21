import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Users, UserPlus, Trash2, Search, ShieldCheck, DoorOpen,
  Filter, CheckCircle2, UserCog, ShieldAlert,
} from 'lucide-react'
import { selectUsersList, addUser, removeUser, toggleUserStatus } from '../store/slices/usersSlice'
import { selectAuth } from '../store/slices/authSlice'
import { pushToast } from '../store/slices/uiSlice'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'

export default function UserManagement() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const users = useSelector(selectUsersList)

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)

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

  // Role Protection: Admin Only!
  if (role !== 'admin') {
    return (
      <div className="page">
        <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <ShieldAlert size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
          <h2>Access Restricted</h2>
          <p style={{ color: 'var(--ink-soft)', maxWidth: 460, margin: '8px auto 20px' }}>
            The User Management console is restricted strictly to Central Campus Administrators. Students and Wardens do not have administrative account privileges.
          </p>
          <span className="badge badge-bad">Access Level: Administrator Only</span>
        </div>
      </div>
    )
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!newUser.name.trim() || !newUser.rollNo.trim()) {
      dispatch(pushToast('Name and ID are required.', 'warn'))
      return
    }

    dispatch(addUser(newUser))
    dispatch(pushToast(`User ${newUser.name} created successfully.`, 'ok'))
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
  }

  const handleConfirmDelete = () => {
    if (!deletingUser) return
    dispatch(removeUser(deletingUser.id))
    dispatch(pushToast(`User ${deletingUser.name} removed from campus directory.`, 'info'))
    setDeletingUser(null)
  }

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.rollNo.toLowerCase().includes(q) || u.department.toLowerCase().includes(q) || u.roomNumber.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-border)' }}>
            <UserCog size={14} /> Administrator Control Suite
          </span>
          <h1>Hostel User Directory &amp; Access</h1>
        </div>
        <div className="page-header-actions">
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
              <label>Campus Email Address</label>
              <input
                type="email"
                placeholder="student@campus.edu"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
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
