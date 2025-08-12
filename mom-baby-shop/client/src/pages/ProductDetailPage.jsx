import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`/api/products/${slug}`).then(r => setProduct(r.data)).finally(() => setLoading(false))
  }, [slug])

  const addToCart = async () => {
    const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID()
    localStorage.setItem('sessionId', sessionId)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const found = cart.find(i => i.productId === product.id)
    if (found) found.quantity += qty; else cart.push({ productId: product.id, quantity: qty })
    localStorage.setItem('cart', JSON.stringify(cart))
    try { await axios.post('/api/cart/add', { sessionId, productId: product.id, quantity: qty }) } catch {}
    navigate('/cart')
  }

  if (loading) return <div style={{ padding: 16 }}>Đang tải...</div>
  if (!product) return <div style={{ padding: 16 }}>Không tìm thấy</div>

  const image = (product.images?.[0]) || 'https://via.placeholder.com/600'

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <img src={image} alt={product.name} style={{ width: '100%', borderRadius: 8 }} />
        <div>
          <h2>{product.name}</h2>
          <div style={{ margin: '8px 0' }}><strong style={{ fontSize: 20 }}>{Number(product.price).toLocaleString()} đ</strong></div>
          <div dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') }} />
          <div style={{ marginTop: 12 }}>
            <label>Số lượng</label>
            <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} />
          </div>
          <button onClick={addToCart} style={{ marginTop: 12 }}>Thêm vào giỏ</button>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <h3>Đánh giá</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {(product.reviews || []).map(r => (
            <li key={r.id} style={{ borderTop: '1px solid #eee', padding: '8px 0' }}>
              <strong>{r.full_name || 'Khách'}</strong> - {r.rating}/5
              <div>{r.content}</div>
            </li>
          ))}
          {(!product.reviews || !product.reviews.length) && <li>Chưa có đánh giá</li>}
        </ul>
      </div>
    </div>
  )
}