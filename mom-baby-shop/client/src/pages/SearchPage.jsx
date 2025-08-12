import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useSearchParams } from 'react-router-dom'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const brand = searchParams.get('brand') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const ageMin = searchParams.get('ageMin') || ''
  const ageMax = searchParams.get('ageMax') || ''

  useEffect(() => {
    setLoading(true)
    axios.get('/api/products', { params: { q, category, brand, minPrice, maxPrice, ageMin, ageMax } })
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [q, category, brand, minPrice, maxPrice, ageMin, ageMax])

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: 16 }}>
      <h2>Tìm kiếm & Lọc</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
          <div>
            <label>Từ khóa</label>
            <input value={q} onChange={e => update('q', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label>Danh mục</label>
            <select value={category} onChange={e => update('category', e.target.value)} style={{ width: '100%' }}>
              <option value="">Tất cả</option>
              <option value="do-mac">Đồ mặc</option>
              <option value="do-cho-be">Đồ cho bé</option>
            </select>
          </div>
          <div>
            <label>Thương hiệu</label>
            <select value={brand} onChange={e => update('brand', e.target.value)} style={{ width: '100%' }}>
              <option value="">Tất cả</option>
              <option value="pigeon">Pigeon</option>
              <option value="huggies">Huggies</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div>
              <label>Giá từ</label>
              <input type="number" value={minPrice} onChange={e => update('minPrice', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label>đến</label>
              <input type="number" value={maxPrice} onChange={e => update('maxPrice', e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div>
              <label>Tuổi từ (tháng)</label>
              <input type="number" value={ageMin} onChange={e => update('ageMin', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label>đến</label>
              <input type="number" value={ageMax} onChange={e => update('ageMax', e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
        </div>
        <div>
          {loading ? 'Đang tải...' : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {data.map(p => (
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
      </div>
    </div>
  )
}