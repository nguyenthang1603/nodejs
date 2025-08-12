import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  useEffect(() => { axios.get('/api/admin/users').then(r => setUsers(r.data)) }, [])
  return (
    <div>
      <h3>Người dùng</h3>
      <table border='1' cellPadding='6' style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th><th>Họ tên</th><th>Email</th><th>Phone</th><th>Vai trò</th><th>Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.role}</td>
              <td>{new Date(u.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}