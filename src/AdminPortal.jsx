import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  FileImage,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  LogOut,
  Megaphone,
  Newspaper,
  Save,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react'
import './admin.css'

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    error.status = response.status
    error.code = body.code
    throw error
  }
  return body
}

function AuthLayout({ mode }) {
  const isRegister = mode === 'register'
  const [form, setForm] = useState({
    username: '',
    password: '',
    displayName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setMessage('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      await apiRequest(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      window.location.assign('/admin')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-page__glow auth-page__glow--one" />
      <div className="auth-page__glow auth-page__glow--two" />
      <a className="auth-page__back" href="/">
        <ArrowLeft size={18} />
        กลับหน้าเว็บไซต์
      </a>
      <section className="auth-card">
        <div className="auth-card__brand">
          <span><img src="/np.png" alt="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร" /></span>
          <div>
            <strong>โรงเรียนบ้านน้ำพร</strong>
            <small>Bannamporn School</small>
          </div>
        </div>
        <div className="auth-card__heading">
          <span className="auth-card__icon">
            {isRegister ? <UserPlus size={24} /> : <ShieldCheck size={24} />}
          </span>
          <div>
            <p>{isRegister ? 'สร้างบัญชีผู้ใช้งาน' : 'ระบบสำหรับผู้ดูแล'}</p>
            <h1>{isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</h1>
          </div>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {isRegister && (
            <label>
              <span>ชื่อที่ใช้แสดง</span>
              <div className="auth-input">
                <User size={19} />
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={update}
                  placeholder="ชื่อ–นามสกุล"
                  autoComplete="name"
                  required
                />
              </div>
            </label>
          )}
          <label>
            <span>ชื่อผู้ใช้</span>
            <div className="auth-input">
              <User size={19} />
              <input
                name="username"
                value={form.username}
                onChange={update}
                placeholder="ชื่อผู้ใช้ภาษาอังกฤษ"
                autoComplete="username"
                minLength={4}
                required
              />
            </div>
          </label>
          <label>
            <span>รหัสผ่าน</span>
            <div className="auth-input">
              <LockKeyhole size={19} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={update}
                placeholder={isRegister ? 'อย่างน้อย 8 ตัวอักษร' : 'กรอกรหัสผ่าน'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={8}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {message && (
            <p className="auth-form__message" role="alert">
              <AlertCircle size={17} />
              {message}
            </p>
          )}

          <button className="admin-button admin-button--primary" type="submit" disabled={submitting}>
            {submitting ? <LoaderCircle className="spin" size={19} /> : isRegister ? <UserPlus size={19} /> : <LogIn size={19} />}
            {submitting ? 'กำลังดำเนินการ...' : isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="auth-card__switch">
          {isRegister ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}
          <a href={isRegister ? '/login' : '/register'}>
            {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </a>
        </p>
        <div className="auth-card__security">
          <LockKeyhole size={15} />
          รหัสผ่านถูกเข้ารหัสและไม่แสดงในฐานข้อมูล
        </div>
      </section>
    </main>
  )
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function NewsForm({ githubConfigured, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    category: 'ประชาสัมพันธ์',
    summary: '',
    content: '',
    status: 'published',
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setMessage(null)
  }

  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    setImage(file || null)
    setPreview(file ? URL.createObjectURL(file) : '')
    setMessage(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!githubConfigured) {
      setMessage({ type: 'error', text: 'กรุณาเชื่อมต่อ GitHub ใน Vercel ก่อนบันทึกข้อมูล' })
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      const imageData = image
        ? { name: image.name, type: image.type, data: await fileToDataUrl(image) }
        : null
      const result = await apiRequest('/api/news', {
        method: 'POST',
        body: JSON.stringify({ ...form, image: imageData }),
      })
      setForm({
        title: '',
        category: 'ประชาสัมพันธ์',
        summary: '',
        content: '',
        status: 'published',
      })
      setImage(null)
      setPreview('')
      setMessage({ type: 'success', text: 'บันทึกข่าวและส่งขึ้น GitHub เรียบร้อยแล้ว' })
      onCreated(result.news)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="news-editor" onSubmit={submit}>
      <div className="admin-section-heading">
        <div>
          <span>NEWS & ANNOUNCEMENT</span>
          <h2>เพิ่มข่าวสารและประกาศ</h2>
        </div>
        <Megaphone size={28} />
      </div>

      <div className="news-editor__grid">
        <label className="news-field news-field--wide">
          <span>หัวข้อข่าว</span>
          <input
            name="title"
            value={form.title}
            onChange={update}
            placeholder="กรอกหัวข้อข่าวหรือประกาศ"
            maxLength={180}
            required
          />
        </label>
        <label className="news-field">
          <span>หมวดหมู่</span>
          <select name="category" value={form.category} onChange={update}>
            <option>ประชาสัมพันธ์</option>
            <option>วิชาการ</option>
            <option>กิจกรรม</option>
            <option>ประกาศ</option>
          </select>
        </label>
        <label className="news-field">
          <span>สถานะ</span>
          <select name="status" value={form.status} onChange={update}>
            <option value="published">เผยแพร่</option>
            <option value="draft">ฉบับร่าง</option>
          </select>
        </label>
        <label className="news-field news-field--wide">
          <span>ข้อความสรุป</span>
          <textarea
            name="summary"
            value={form.summary}
            onChange={update}
            placeholder="ข้อความสั้นสำหรับสรุปเนื้อหา"
            rows={2}
          />
        </label>
        <label className="news-field news-field--wide">
          <span>รายละเอียด</span>
          <textarea
            name="content"
            value={form.content}
            onChange={update}
            placeholder="กรอกรายละเอียดข่าวสารหรือประกาศ"
            rows={7}
            maxLength={20_000}
            required
          />
        </label>
      </div>

      <label className={`image-uploader ${preview ? 'image-uploader--selected' : ''}`}>
        {preview ? (
          <img src={preview} alt="ตัวอย่างรูปข่าว" />
        ) : (
          <>
            <span><FileImage size={27} /></span>
            <strong>เลือกรูปภาพข่าว</strong>
            <small>JPG, PNG หรือ WebP ขนาดไม่เกิน 3 MB</small>
          </>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} />
      </label>

      {message && (
        <p className={`admin-message admin-message--${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </p>
      )}

      <button className="admin-button admin-button--primary" type="submit" disabled={submitting || !githubConfigured}>
        {submitting ? <LoaderCircle className="spin" size={19} /> : <Save size={19} />}
        {submitting ? 'กำลังอัปโหลดและบันทึก...' : 'บันทึกและอัปโหลดขึ้น GitHub'}
      </button>
    </form>
  )
}

function NewsList({ news, loading }) {
  if (loading) {
    return <div className="admin-empty"><LoaderCircle className="spin" />กำลังโหลดข่าวสาร...</div>
  }
  if (!news.length) {
    return (
      <div className="admin-empty">
        <Newspaper size={34} />
        <strong>ยังไม่มีข่าวในฐานข้อมูล</strong>
        <span>ข่าวที่เพิ่มใหม่จะแสดงในรายการนี้</span>
      </div>
    )
  }

  return (
    <div className="admin-news-list">
      {news.map((item) => (
        <article key={item.id}>
          <div className="admin-news-list__image">
            {item.image_url ? <img src={item.image_url} alt="" /> : <Newspaper size={25} />}
          </div>
          <div>
            <span>{item.category} · {item.status === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}</span>
            <h3>{item.title}</h3>
            <small>{new Date(item.created_at).toLocaleString('th-TH')}</small>
          </div>
        </article>
      ))}
    </div>
  )
}

function Dashboard() {
  const [session, setSession] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const sessionData = await apiRequest('/api/auth/session')
        if (!active) return
        setSession(sessionData)
        const newsData = await apiRequest('/api/news')
        if (active) setNews(newsData.news || [])
      } catch (error) {
        if (error.status === 401) window.location.replace('/login')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(
    () => ({
      total: news.length,
      published: news.filter((item) => item.status === 'published').length,
      draft: news.filter((item) => item.status === 'draft').length,
    }),
    [news],
  )

  const logout = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST', body: '{}' }).catch(() => undefined)
    window.location.assign('/login')
  }

  if (!session && loading) {
    return <main className="admin-loading"><LoaderCircle className="spin" />กำลังเตรียมหน้าบริหารจัดการ...</main>
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <a className="admin-sidebar__brand" href="/">
          <img src="/np.png" alt="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร" />
          <span><strong>โรงเรียนบ้านน้ำพร</strong><small>ADMINISTRATION</small></span>
        </a>
        <nav>
          <a className="is-active" href="#dashboard"><LayoutDashboard size={19} />ภาพรวม</a>
          <a href="#news-editor"><Megaphone size={19} />จัดการข่าวสาร</a>
        </nav>
        <div className="admin-sidebar__user">
          <span><User size={20} /></span>
          <div>
            <strong>{session?.user.displayName}</strong>
            <small>{session?.user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}</small>
          </div>
        </div>
        <button type="button" onClick={logout}><LogOut size={18} />ออกจากระบบ</button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar" id="dashboard">
          <div>
            <p>ยินดีต้อนรับกลับ</p>
            <h1>ระบบบริหารจัดการข้อมูล</h1>
          </div>
          <a href="/" target="_blank" rel="noreferrer">เปิดหน้าเว็บไซต์<ArrowLeft size={17} /></a>
        </header>

        {!session?.githubConfigured && (
          <div className="admin-config-alert">
            <AlertCircle size={22} />
            <div>
              <strong>รอการเชื่อมต่อ GitHub</strong>
              <p>เข้าสู่ระบบได้แล้ว แต่การสมัครสมาชิกและบันทึกข่าวจะเปิดใช้งานเมื่อเพิ่ม GITHUB_TOKEN ใน Vercel</p>
            </div>
          </div>
        )}

        <section className="admin-stats">
          <article><span><Newspaper size={22} /></span><div><small>ข่าวทั้งหมด</small><strong>{stats.total}</strong></div></article>
          <article><span><CheckCircle2 size={22} /></span><div><small>เผยแพร่</small><strong>{stats.published}</strong></div></article>
          <article><span><FileImage size={22} /></span><div><small>ฉบับร่าง</small><strong>{stats.draft}</strong></div></article>
        </section>

        <section className="admin-content-grid">
          <div id="news-editor">
            <NewsForm
              githubConfigured={Boolean(session?.githubConfigured)}
              onCreated={(item) => setNews((current) => [item, ...current])}
            />
          </div>
          <div className="admin-list-card">
            <div className="admin-section-heading">
              <div><span>DATABASE</span><h2>รายการล่าสุด</h2></div>
              <Newspaper size={27} />
            </div>
            <NewsList news={news} loading={loading} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default function AdminPortal() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/register') return <AuthLayout mode="register" />
  if (path === '/login') return <AuthLayout mode="login" />
  return <Dashboard />
}
