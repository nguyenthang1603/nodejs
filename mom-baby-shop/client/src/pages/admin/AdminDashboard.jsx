import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  useEffect(() => {
    axios.get('/api/admin/overview').then(r => setData(r.data)).catch(() => setData({ products:0, users:0, orders:0 }))
  }, [])
  if (!data) return <div>Đang tải...</div>
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8 }}>Sản phẩm: <strong>{data.products}</strong></div>
      <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8 }}>Người dùng: <strong>{data.users}</strong></div>
      <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8 }}>Đơn hàng: <strong>{data.orders}</strong></div>
    </div>
  )
}