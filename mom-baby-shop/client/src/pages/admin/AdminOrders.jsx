import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const load = () => {
    setLoading(true)
    axios.get('/api/admin/orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (o, status) => {
    await axios.put(`/api/admin/orders/${o.id}/status`, { status })
    load()
  }

  if (loading) return <div>Đang tải...</div>

  return (
    <div>
      <h3>Đơn hàng</h3>
      <table border='1' cellPadding='6' style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th><th>User</th><th>Trạng thái</th><th>Tổng</th><th>Ngày</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.user_id}</td>
              <td>{o.status}</td>
              <td>{Number(o.total).toLocaleString()}</td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
              <td>
                <select value={o.status} onChange={e => updateStatus(o, e.target.value)}>
                  {['pending','paid','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}