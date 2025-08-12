import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name:'', slug:'', price:'', inventory:0, is_featured:false })
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    axios.get('/api/admin/products').then(r => setProducts(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.name || !form.slug || !form.price) return
    await axios.post('/api/admin/products', { ...form, price: Number(form.price), images: [] })
    setForm({ name:'', slug:'', price:'', inventory:0, is_featured:false })
    load()
  }
  const toggleFeatured = async (p) => {
    await axios.put(`/api/admin/products/${p.id}`, { is_featured: !p.is_featured })
    load()
  }
  const updateInventory = async (p, inv) => {
    await axios.put(`/api/admin/products/${p.id}/inventory`, { inventory: Number(inv) })
    load()
  }
  const remove = async (p) => {
    if (!confirm('Xóa sản phẩm?')) return
    await axios.delete(`/api/admin/products/${p.id}`)
    load()
  }

  if (loading) return <div>Đang tải...</div>

  return (
    <div>
      <h3>Thêm sản phẩm</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder='Tên' value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder='Slug' value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
        <input placeholder='Giá' type='number' value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        <input placeholder='Tồn kho' type='number' value={form.inventory} onChange={e => setForm({ ...form, inventory: Number(e.target.value) })} />
        <label><input type='checkbox' checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} /> Nổi bật</label>
        <button onClick={create}>Tạo</button>
      </div>
      <h3 style={{ marginTop: 16 }}>Danh sách</h3>
      <table border='1' cellPadding='6' style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th><th>Tên</th><th>Giá</th><th>Tồn</th><th>Nổi bật</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{Number(p.price).toLocaleString()}</td>
              <td>
                <input type='number' defaultValue={p.inventory} onBlur={e => updateInventory(p, e.target.value)} style={{ width: 80 }} />
              </td>
              <td><input type='checkbox' checked={!!p.is_featured} onChange={() => toggleFeatured(p)} /></td>
              <td>
                <button onClick={() => remove(p)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}