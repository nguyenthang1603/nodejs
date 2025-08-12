import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const submit = async () => {
    try {
      await axios.post('/api/register', { email, phone, password, fullName })
      setMessage('Đăng ký thành công')
      navigate('/login')
    } catch (e) {
      setMessage('Đăng ký thất bại')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 16 }}>
      <h2>Đăng ký</h2>
      <div>
        <input placeholder="Họ tên" value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
        <input placeholder="Số điện thoại" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
        <input placeholder="Mật khẩu" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%' }} />
        <button onClick={submit} style={{ marginTop: 12 }}>Đăng ký</button>
        <div>{message}</div>
      </div>
    </div>
  )
}