import React, { useState, useEffect } from 'react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // ✅ Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    email: '',
    phone_no: ''
  });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  const ROLES = ['admin', 'student', 'datacell', 'assistant director', 'chairperson', 'society'];

  // --- Fetch all users on load ---
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/manage-users/all');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Open edit modal ---
  const handleEdit = (user) => {
    setSelectedUser(user);
    setNewUsername(user.username);
    setNewPassword('');
    setConfirmPassword('');
    setModalError('');
    setModalSuccess('');
    setShowModal(true);
  };

  // --- Save edit changes ---
  const handleSave = async () => {
    setModalError('');
    setModalSuccess('');

    if (!newUsername.trim()) {
      setModalError('Username cannot be empty.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setModalError('Passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      const body = { username: newUsername.trim() };
      if (newPassword) body.password = newPassword;

      const res = await fetch(`/api/manage-users/update/${selectedUser.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      setModalSuccess('✅ User updated successfully!');
      setUsers(prev => prev.map(u =>
        u.user_id === selectedUser.user_id ? { ...u, username: newUsername.trim() } : u
      ));
      setTimeout(() => setShowModal(false), 1200);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Open Add User Modal
  const handleOpenAddModal = () => {
    setAddForm({ username: '', password: '', confirmPassword: '', role: '', email: '', phone_no: '' });
    setAddError('');
    setAddSuccess('');
    setShowAddModal(true);
  };

  // ✅ Handle Add Form field change
  const handleAddFormChange = (field, value) => {
    setAddForm(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Save New User
  const handleAddUser = async () => {
    setAddError('');
    setAddSuccess('');

    const { username, password, confirmPassword, role, email, phone_no } = addForm;

    if (!username.trim()) return setAddError('Username / Roll No cannot be empty.');
    if (!password.trim()) return setAddError('Password cannot be empty.');
    if (password !== confirmPassword) return setAddError('Passwords do not match.');
    if (!role) return setAddError('Please select a role.');

    try {
      setAddSaving(true);
      const res = await fetch('/api/manage-users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          role,
          email: email.trim() || null,
          phone_no: phone_no.trim() || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');

      setAddSuccess('✅ User created successfully!');
      // Add to local list
      setUsers(prev => [...prev, {
        user_id: data.user_id,
        username: username.trim(),
        role,
        email: email.trim() || null,
        phone_no: phone_no.trim() || null
      }]);
      setTimeout(() => setShowAddModal(false), 1300);
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddSaving(false);
    }
  };

  // --- Role badge color ---
  const getRoleColor = (role) => {
    const map = {
      admin: '#00645c',
      student: '#1565c0',
      datacell: '#6a1b9a',
      'assistant director': '#e65100',
      chairperson: '#b71c1c',
      society: '#2e7d32',
    };
    const key = role?.toLowerCase();
    for (const k in map) {
      if (key?.includes(k)) return map[k];
    }
    return '#546e7a';
  };

  // --- Filtered users ---
  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===================== STYLES =====================
  const S = {
    page: {
      flex: 1,
      padding: '30px',
      backgroundColor: '#f0f4f3',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', sans-serif",
      overflowY: 'auto'
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '12px'
    },
    heading: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#00645c',
      margin: 0
    },
    rightControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap'
    },
    searchBox: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1.5px solid #b2dfdb',
      fontSize: '14px',
      width: '260px',
      outline: 'none',
      backgroundColor: 'white'
    },
    addBtn: {
      padding: '10px 18px',
      backgroundColor: '#00645c',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '700',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 8px rgba(0,100,92,0.25)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,100,92,0.1)'
    },
    th: {
      backgroundColor: '#00645c',
      color: 'white',
      padding: '14px 16px',
      textAlign: 'left',
      fontSize: '13px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    td: {
      padding: '13px 16px',
      borderBottom: '1px solid #e8f5e9',
      fontSize: '14px',
      color: '#333',
      verticalAlign: 'middle'
    },
    trEven: { backgroundColor: '#f9fffe' },
    trOdd: { backgroundColor: 'white' },
    roleBadge: (role) => ({
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      backgroundColor: getRoleColor(role),
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    }),
    editBtn: {
      padding: '7px 16px',
      backgroundColor: '#00645c',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      transition: '0.2s'
    },
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '14px',
      padding: '32px',
      width: '420px',
      maxWidth: '95vw',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      position: 'relative',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#00645c',
      marginBottom: '6px'
    },
    modalSubtitle: {
      fontSize: '13px',
      color: '#777',
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#444',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 13px',
      borderRadius: '8px',
      border: '1.5px solid #b2dfdb',
      fontSize: '14px',
      marginBottom: '16px',
      boxSizing: 'border-box',
      outline: 'none',
      color: '#222'
    },
    select: {
      width: '100%',
      padding: '10px 13px',
      borderRadius: '8px',
      border: '1.5px solid #b2dfdb',
      fontSize: '14px',
      marginBottom: '16px',
      boxSizing: 'border-box',
      outline: 'none',
      color: '#222',
      backgroundColor: 'white'
    },
    hint: {
      fontSize: '11px',
      color: '#999',
      marginTop: '-12px',
      marginBottom: '14px',
      display: 'block'
    },
    errorMsg: {
      backgroundColor: '#fdecea',
      color: '#c62828',
      padding: '10px 14px',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '14px'
    },
    successMsg: {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32',
      padding: '10px 14px',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '14px'
    },
    modalBtns: {
      display: 'flex',
      gap: '12px',
      marginTop: '4px'
    },
    saveBtn: {
      flex: 1,
      padding: '11px',
      backgroundColor: '#00645c',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer'
    },
    cancelBtn: {
      flex: 1,
      padding: '11px',
      backgroundColor: '#f5f5f5',
      color: '#555',
      border: '1.5px solid #ddd',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    closeX: {
      position: 'absolute',
      top: '14px',
      right: '18px',
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#999'
    },
    emptyMsg: {
      textAlign: 'center',
      padding: '40px',
      color: '#999',
      fontSize: '15px'
    },
    loadingMsg: {
      textAlign: 'center',
      padding: '60px',
      color: '#00645c',
      fontSize: '16px'
    },
    errorBox: {
      backgroundColor: '#fdecea',
      color: '#c62828',
      padding: '16px',
      borderRadius: '10px',
      margin: '20px 0'
    }
  };

  // ===================== RENDER =====================
  return (
    <div style={S.page}>

      {/* Top Bar */}
      <div style={S.topBar}>
        <h2 style={S.heading}>👥 Manage Users</h2>
        <div style={S.rightControls}>
          <input
            style={S.searchBox}
            type="text"
            placeholder="🔍 Search by name, role, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {/* ✅ Add New User Button */}
          <button style={S.addBtn} onClick={handleOpenAddModal}>
            ➕ Add New User
          </button>
        </div>
      </div>

      {/* States */}
      {loading && <div style={S.loadingMsg}>⏳ Loading users...</div>}
      {error && <div style={S.errorBox}>❌ {error}</div>}

      {/* Table */}
      {!loading && !error && (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>#</th>
              <th style={S.th}>Username</th>
              <th style={S.th}>Role</th>
              <th style={S.th}>Email</th>
              <th style={S.th}>Phone</th>
              <th style={S.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={S.emptyMsg}>No users found.</td>
              </tr>
            ) : (
              filtered.map((user, idx) => (
                <tr key={user.user_id} style={idx % 2 === 0 ? S.trEven : S.trOdd}>
                  <td style={S.td}>{idx + 1}</td>
                  <td style={{ ...S.td, fontWeight: '600' }}>{user.username}</td>
                  <td style={S.td}>
                    <span style={S.roleBadge(user.role)}>{user.role}</span>
                  </td>
                  <td style={S.td}>{user.email || '—'}</td>
                  <td style={S.td}>{user.phone_no || '—'}</td>
                  <td style={S.td}>
                    <button style={S.editBtn} onClick={() => handleEdit(user)}>
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Total count */}
      {!loading && !error && (
        <p style={{ marginTop: '12px', color: '#888', fontSize: '13px' }}>
          Showing {filtered.length} of {users.length} users
        </p>
      )}

      {/* ===== EDIT MODAL ===== */}
      {showModal && selectedUser && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>

            <button style={S.closeX} onClick={() => setShowModal(false)}>✕</button>

            <div style={S.modalTitle}>Edit User</div>
            <div style={S.modalSubtitle}>
              Editing: <strong>{selectedUser.username}</strong> &nbsp;|&nbsp;
              Role: <strong style={{ color: getRoleColor(selectedUser.role) }}>{selectedUser.role}</strong>
            </div>

            {modalError && <div style={S.errorMsg}>{modalError}</div>}
            {modalSuccess && <div style={S.successMsg}>{modalSuccess}</div>}

            <label style={S.label}>Username</label>
            <input
              style={S.input}
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="Enter new username"
            />

            <label style={S.label}>New Password</label>
            <input
              style={S.input}
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
            <span style={S.hint}>Leave blank if you don't want to change the password.</span>

            {newPassword && (
              <>
                <label style={S.label}>Confirm Password</label>
                <input
                  style={S.input}
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </>
            )}

            <div style={S.modalBtns}>
              <button style={S.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={S.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===== ADD NEW USER MODAL ===== */}
      {showAddModal && (
        <div style={S.overlay} onClick={() => setShowAddModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>

            <button style={S.closeX} onClick={() => setShowAddModal(false)}>✕</button>

            <div style={S.modalTitle}>➕ Add New User</div>
            <div style={S.modalSubtitle}>
              Fill in the details below to create a new user account.
            </div>

            {addError && <div style={S.errorMsg}>{addError}</div>}
            {addSuccess && <div style={S.successMsg}>{addSuccess}</div>}

            {/* Role — shown first so username label can update */}
            <label style={S.label}>Role *</label>
            <select
              style={S.select}
              value={addForm.role}
              onChange={e => handleAddFormChange('role', e.target.value)}
            >
              <option value="">-- Select Role --</option>
              {ROLES.map(r => (
                <option key={r} value={r} style={{ textTransform: 'capitalize' }}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>

            {/* Username label changes for student */}
            <label style={S.label}>
              {addForm.role === 'student' ? 'Roll No (used as Username) *' : 'Username *'}
            </label>
            <input
              style={S.input}
              type="text"
              value={addForm.username}
              onChange={e => handleAddFormChange('username', e.target.value)}
              placeholder={addForm.role === 'student' ? 'e.g. FA21-BCS-001' : 'Enter username'}
            />

            <label style={S.label}>Password *</label>
            <input
              style={S.input}
              type="password"
              value={addForm.password}
              onChange={e => handleAddFormChange('password', e.target.value)}
              placeholder="Enter password"
            />

            <label style={S.label}>Confirm Password *</label>
            <input
              style={S.input}
              type="password"
              value={addForm.confirmPassword}
              onChange={e => handleAddFormChange('confirmPassword', e.target.value)}
              placeholder="Re-enter password"
            />

            <label style={S.label}>Email</label>
            <input
              style={S.input}
              type="email"
              value={addForm.email}
              onChange={e => handleAddFormChange('email', e.target.value)}
              placeholder="Enter email (optional)"
            />

            <label style={S.label}>Phone No</label>
            <input
              style={S.input}
              type="text"
              value={addForm.phone_no}
              onChange={e => handleAddFormChange('phone_no', e.target.value)}
              placeholder="Enter phone number (optional)"
            />

            <div style={S.modalBtns}>
              <button style={S.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button style={S.saveBtn} onClick={handleAddUser} disabled={addSaving}>
                {addSaving ? 'Creating...' : '✅ Create User'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageUsers;