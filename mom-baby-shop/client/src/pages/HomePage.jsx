import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/products?featured=1').then(r => setProducts(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h1>Mẹ & Bé Shop</h1>
      <section style={{ background: '#fff0f6', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <h3>Khuyến mãi</h3>
        <ul>
          <li>Miễn phí vận chuyển đơn từ 500k</li>
          <li>Giảm 10% cho sản phẩm nổi bật</li>
        </ul>
      </section>
      <h3>Sản phẩm nổi bật</h3>
      {loading ? 'Đang tải...' : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {products.map(p => (
            <Link key={p.id} to={`/product/${p.slug}`} style={{ textDecoration: 'none', color: '#333', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
              <img src={(p.images?.[0]) || 'https://via.placeholder.com/300'} alt={p.name} style={{ width: '100%', borderRadius: 8 }} />
              <div style={{ marginTop: 8 }}>
                <div>{p.name}</div>
                <strong>{Number(p.price).toLocaleString()} đ</strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}