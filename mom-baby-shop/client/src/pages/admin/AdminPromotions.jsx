import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminPromotions() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ title:'', discount_percent:0, active:true })
  const load = () => { axios.get('/api/admin/promotions').then(r => setList(r.data)) }
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.title) return
    await axios.post('/api/admin/promotions', form)
    setForm({ title:'', discount_percent:0, active:true })
    load()
  }
  const remove = async (p) => { if (!confirm('Xóa khuyến mãi?')) return; await axios.delete(`/api/admin/promotions/${p.id}`); load() }

  return (
    <div>
      <h3>Khuyến mãi</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder='Tiêu đề' value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input type='number' placeholder='% giảm' value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: Number(e.target.value) })} />
        <label><input type='checkbox' checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Kích hoạt</label>
        <button onClick={create}>Tạo</button>
      </div>
      <table border='1' cellPadding='6' style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            <th>ID</th><th>Tiêu đề</th><th>%</th><th>Hoạt động</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {list.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.title}</td>
              <td>{p.discount_percent}</td>
              <td>{p.active ? 'Có' : 'Không'}</td>
              <td><button onClick={() => remove(p)}>Xóa</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}