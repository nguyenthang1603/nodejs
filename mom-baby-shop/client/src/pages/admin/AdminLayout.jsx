import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export function AdminLayout() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user || user.role !== 'admin') {
    return <div style={{ padding: 16 }}>Bạn không có quyền truy cập trang quản trị.</div>
  }
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
      <h2>Trang quản trị</h2>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Link to="/admin">Tổng quan</Link>
        <Link to="/admin/products">Sản phẩm</Link>
        <Link to="/admin/orders">Đơn hàng</Link>
        <Link to="/admin/users">Người dùng</Link>
        <Link to="/admin/promotions">Khuyến mãi</Link>
      </nav>
      <Outlet />
    </div>
  )
}