import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function CheckoutPage() {
  const [cart, setCart] = useState([])
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '' })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(localCart)
  }, [])

  const submit = async () => {
    const sessionId = localStorage.getItem('sessionId')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!sessionId || !user) { setMessage('Vui lòng đăng nhập'); return }
    try {
      const res = await axios.post('/api/checkout', { sessionId, userId: user.id, shippingAddress: shipping, paymentMethod })
      setMessage('Đặt hàng thành công #' + res.data.orderId)
      localStorage.removeItem('cart')
    } catch (e) {
      setMessage('Lỗi thanh toán')
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h2>Thanh toán</h2>
      <div>
        <div>
          <label>Họ tên</label>
          <input value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div>
          <label>Số điện thoại</label>
          <input value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div>
          <label>Địa chỉ</label>
          <input value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div>
          <label>Phương thức thanh toán</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="cod">COD</option>
            <option value="bank">Chuyển khoản</option>
            <option value="momo">MoMo</option>
            <option value="vnpay">VNPay</option>
          </select>
        </div>
        <button onClick={submit} style={{ marginTop: 12 }}>Đặt hàng</button>
        <div>{message}</div>
      </div>
    </div>
  )
}