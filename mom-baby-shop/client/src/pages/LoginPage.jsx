import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async () => {
    setError('')
    try {
      const res = await axios.post('/api/login', { emailOrPhone, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (e) {
      setError('Đăng nhập thất bại')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 16 }}>
      <h2>Đăng nhập</h2>
      <div>
        <input placeholder="Email hoặc SĐT" value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
        <input placeholder="Mật khẩu" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%' }} />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button onClick={submit} style={{ marginTop: 12 }}>Đăng nhập</button>
      </div>
    </div>
  )
}