import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

export default function CartPage() {
  const [cart, setCart] = useState([])
  const [products, setProducts] = useState([])
  const navigate = useNavigate()
  const sessionId = localStorage.getItem('sessionId') || ''

  useEffect(() => {
    if (!sessionId) return
    // In-memory cart on server, no fetch endpoint; store locally as fallback
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(localCart)
  }, [sessionId])

  useEffect(() => {
    if (!cart.length) return
    const ids = cart.map(c => c.productId)
    axios.get('/api/products', { params: { ids: ids.join(',') } }).then(r => setProducts(r.data))
  }, [cart])

  const removeItem = async (productId) => {
    const next = cart.filter(i => i.productId !== productId)
    setCart(next)
    localStorage.setItem('cart', JSON.stringify(next))
    if (sessionId) {
      try { await axios.post('/api/cart/remove', { sessionId, productId }) } catch {}
    }
  }

  const total = cart.reduce((sum, i) => {
    const p = products.find(x => x.id === i.productId)
    return sum + (p ? p.price * i.quantity : 0)
  }, 0)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h2>Giỏ hàng</h2>
      {!cart.length ? (
        <div>Giỏ hàng trống. <Link to="/">Tiếp tục mua sắm</Link></div>
      ) : (
        <div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cart.map(item => {
              const p = products.find(x => x.id === item.productId)
              return (
                <li key={item.productId} style={{ borderBottom: '1px solid #eee', padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <div>{p ? p.name : 'Sản phẩm'}</div>
                  <div>x{item.quantity}</div>
                  <div>{p ? Number(p.price * item.quantity).toLocaleString() : '-'} đ</div>
                  <button onClick={() => removeItem(item.productId)}>Xóa</button>
                </li>
              )
            })}
          </ul>
          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <strong>Tổng: {Number(total).toLocaleString()} đ</strong>
          </div>
          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <button onClick={() => navigate('/checkout')}>Thanh toán</button>
          </div>
        </div>
      )}
    </div>
  )
}