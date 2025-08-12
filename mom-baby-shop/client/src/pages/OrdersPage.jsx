import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!user) { setLoading(false); return }
    axios.get('/api/orders', { params: { userId: user.id } }).then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 16 }}>Đang tải...</div>

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h2>Đơn hàng của tôi</h2>
      {!orders.length ? 'Chưa có đơn hàng' : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {orders.map(o => (
            <li key={o.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
              <div>Mã đơn: #{o.id}</div>
              <div>Trạng thái: {o.status}</div>
              <div>Tổng: {Number(o.total).toLocaleString()} đ</div>
              <div>Ngày đặt: {new Date(o.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}