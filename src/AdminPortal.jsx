import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  FileImage,
  GalleryHorizontalEnd,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  LogOut,
  Megaphone,
  Newspaper,
  Pencil,
  Save,
  ShieldCheck,
  Trash2,
  Trophy,
  User,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import './admin.css'
import { qualityIndicator, qualityLevelMap, qualityLevels } from './qualityStandards'

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
  const [form, setForm] = useState({ username: '', password: '', displayName: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setMessage(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const result = await apiRequest(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      if (isRegister) {
        setMessage({ type: 'success', text: result.message })
        setForm({ username: '', password: '', displayName: '' })
      } else {
        window.location.assign('/admin')
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
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
          <div><strong>โรงเรียนบ้านน้ำพร</strong><small>Bannamporn School</small></div>
        </div>
        <div className="auth-card__heading">
          <span className="auth-card__icon">
            {isRegister ? <UserPlus size={24} /> : <ShieldCheck size={24} />}
          </span>
          <div>
            <p>{isRegister ? 'สร้างบัญชีผู้ใช้งาน' : 'ระบบจัดการข้อมูลโรงเรียน'}</p>
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
            <p className={`auth-form__message auth-form__message--${message.type}`} role="alert">
              {message.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
              {message.text}
            </p>
          )}
          <button className="admin-button admin-button--primary" type="submit" disabled={submitting}>
            {submitting ? <LoaderCircle className="spin" size={19} /> : isRegister ? <UserPlus size={19} /> : <LogIn size={19} />}
            {submitting ? 'กำลังดำเนินการ...' : isRegister ? 'ส่งคำขอสมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <p className="auth-card__switch">
          {isRegister ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}
          <a href={isRegister ? '/login' : '/register'}>{isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</a>
        </p>
        <div className="auth-card__security">
          <LockKeyhole size={15} />
          {isRegister ? 'สมาชิกใหม่ต้องรอผู้ดูแลระบบอนุมัติก่อนเข้าใช้งาน' : 'ระบบยืนยันตัวตนที่ปลอดภัย'}
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

const awardTypeLabels = {
  school: 'ผลงาน/รางวัลโรงเรียน',
  personnel: 'ผลงาน/รางวัลผู้บริหาร/ครู/บุคลากร',
  student: 'ผลงาน/รางวัลนักเรียน',
}

const permissionOptions = [
  { id: 'news', label: 'ข่าวสาร / ประชาสัมพันธ์ / ประกาศ', icon: Megaphone },
  { id: 'events', label: 'ปฏิทินกิจกรรม', icon: CalendarDays },
  { id: 'awards', label: 'ผลงานและรางวัล', icon: Trophy },
  { id: 'newsletters', label: 'จดหมายข่าวประชาสัมพันธ์', icon: GalleryHorizontalEnd },
  { id: 'quality', label: 'งานประกันคุณภาพ (สมศ.)', icon: ShieldCheck },
]

const modules = {
  news: {
    endpoint: '/api/news',
    responseKey: 'news',
    listKey: 'news',
    label: 'ข่าวสารและประกาศ',
    eyebrow: 'NEWS & ANNOUNCEMENT',
    icon: Megaphone,
    image: true,
    defaults: {
      title: '',
      category: 'ประชาสัมพันธ์',
      summary: '',
      content: '',
      document_url: '',
      photo_url: '',
      display_order: '',
      status: 'published',
    },
    fields: [
      { name: 'title', label: 'หัวข้อข่าว', wide: true, required: true, placeholder: 'กรอกหัวข้อข่าวหรือประกาศ' },
      { name: 'category', label: 'หมวดหมู่', type: 'select', options: ['กิจกรรม', 'ประชาสัมพันธ์', 'ประกาศ'] },
      { name: 'status', label: 'สถานะ', type: 'status' },
      { name: 'summary', label: 'ข้อความสรุป', type: 'textarea', wide: true, rows: 2, placeholder: 'ข้อความสั้นสำหรับสรุปเนื้อหา' },
      { name: 'content', label: 'รายละเอียด', type: 'textarea', wide: true, rows: 7, required: true, placeholder: 'กรอกรายละเอียดข่าวสารหรือประกาศ' },
      { name: 'document_url', label: 'ลิงก์ PDF บน Google Drive', type: 'url', wide: true, placeholder: 'https://drive.google.com/...' },
      { name: 'photo_url', label: 'ลิงก์ Google Photos', type: 'url', wide: true, placeholder: 'https://photos.app.goo.gl/...' },
      { name: 'display_order', label: 'ลำดับการแสดงผล (เลขมากแสดงก่อน)', type: 'number', adminOnly: true, placeholder: 'เว้นว่างเพื่อเรียงรายการล่าสุดก่อน' },
    ],
    meta: (item) => `${item.category} · ${item.status === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}`,
    date: (item) => item.created_at,
    title: (item) => item.title,
  },
  events: {
    endpoint: '/api/events',
    responseKey: 'event',
    listKey: 'events',
    label: 'กิจกรรม',
    eyebrow: 'SCHOOL ACTIVITIES',
    icon: CalendarDays,
    defaults: { title: '', event_date: '', start_time: '', location: '', details: '', status: 'published' },
    fields: [
      { name: 'title', label: 'ชื่อกิจกรรม', wide: true, required: true, placeholder: 'กรอกชื่อกิจกรรม' },
      { name: 'event_date', label: 'วันที่', type: 'date', required: true },
      { name: 'start_time', label: 'เวลา', type: 'time' },
      { name: 'location', label: 'สถานที่', wide: true, placeholder: 'สถานที่จัดกิจกรรม' },
      { name: 'details', label: 'รายละเอียด', type: 'textarea', wide: true, rows: 5, placeholder: 'รายละเอียดเพิ่มเติม' },
      { name: 'status', label: 'สถานะ', type: 'status' },
    ],
    meta: (item) => `${item.event_date}${item.start_time ? ` · ${item.start_time} น.` : ''}`,
    date: (item) => item.created_at,
    title: (item) => item.title,
  },
  awards: {
    endpoint: '/api/awards',
    responseKey: 'award',
    listKey: 'awards',
    label: 'ผลงานและรางวัล',
    eyebrow: 'ACHIEVEMENTS & AWARDS',
    icon: Trophy,
    image: true,
    defaults: {
      title: '',
      award_type: 'school',
      award_date: '',
      level: '',
      recipient: '',
      description: '',
      document_url: '',
      photo_url: '',
      display_order: '',
      status: 'published',
    },
    fields: [
      { name: 'title', label: 'ชื่อผลงานหรือรางวัล', wide: true, required: true, placeholder: 'กรอกชื่อผลงานหรือรางวัล' },
      {
        name: 'award_type',
        label: 'ประเภทผลงานและรางวัล',
        type: 'select',
        wide: true,
        options: Object.entries(awardTypeLabels).map(([value, label]) => ({ value, label })),
      },
      { name: 'award_date', label: 'วันที่ได้รับ', type: 'date', required: true },
      { name: 'level', label: 'ระดับรางวัล', placeholder: 'เช่น ระดับจังหวัด' },
      { name: 'recipient', label: 'ผู้ได้รับรางวัล', wide: true, placeholder: 'นักเรียน ครู หรือโรงเรียน' },
      { name: 'description', label: 'รายละเอียด', type: 'textarea', wide: true, rows: 5, placeholder: 'รายละเอียดผลงานและความภาคภูมิใจ' },
      { name: 'document_url', label: 'ลิงก์ PDF บน Google Drive', type: 'url', wide: true, placeholder: 'https://drive.google.com/...' },
      { name: 'photo_url', label: 'ลิงก์ Google Photos', type: 'url', wide: true, placeholder: 'https://photos.app.goo.gl/...' },
      { name: 'display_order', label: 'ลำดับการแสดงผล (เลขมากแสดงก่อน)', type: 'number', adminOnly: true, placeholder: 'เว้นว่างเพื่อเรียงรายการล่าสุดก่อน' },
      { name: 'status', label: 'สถานะ', type: 'status' },
    ],
    meta: (item) => `${awardTypeLabels[item.award_type] || awardTypeLabels.school} · ${item.status === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}`,
    date: (item) => item.award_date,
    title: (item) => item.title,
  },
  newsletters: {
    endpoint: '/api/newsletters',
    responseKey: 'newsletter',
    listKey: 'newsletters',
    label: 'จดหมายข่าวประชาสัมพันธ์',
    eyebrow: 'SCHOOL NEWSLETTER',
    icon: GalleryHorizontalEnd,
    image: true,
    imageRequired: true,
    imageHint: 'ภาพแนวตั้ง อัตราส่วนประมาณ 1:1.4 · JPG, PNG หรือ WebP ไม่เกิน 3 MB',
    imageClass: 'image-uploader--portrait',
    defaults: { issue_number: '', display_order: '' },
    fields: [
      { name: 'issue_number', label: 'หมายเลขฉบับ', wide: true, required: true, placeholder: 'เช่น ฉบับที่ 1/2569' },
      { name: 'display_order', label: 'ลำดับการแสดงผล (เลขมากแสดงก่อน)', type: 'number', adminOnly: true, placeholder: 'เว้นว่างเพื่อเรียงรายการล่าสุดก่อน' },
    ],
    meta: () => 'จดหมายข่าวประชาสัมพันธ์',
    date: (item) => item.created_at,
    title: (item) => item.issue_number,
  },
}

function sortRecords(items) {
  return [...items].sort((left, right) => {
    const orderDifference = Number(right.display_order || 0) - Number(left.display_order || 0)
    if (orderDifference) return orderDifference
    return String(right.created_at || '').localeCompare(String(left.created_at || ''))
  })
}

function RecordManager({ type, items, setItems, isAdmin, githubConfigured }) {
  const config = modules[type]
  const Icon = config.icon
  const [form, setForm] = useState(config.defaults)
  const [editingId, setEditingId] = useState(null)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setForm(config.defaults)
    setEditingId(null)
    setImage(null)
    setPreview('')
    setMessage(null)
  }, [config])

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setMessage(null)
  }

  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    setImage(file || null)
    setPreview(file ? URL.createObjectURL(file) : '')
  }

  const reset = () => {
    setForm(config.defaults)
    setEditingId(null)
    setImage(null)
    setPreview('')
  }

  const edit = (item) => {
    setForm(Object.fromEntries(Object.keys(config.defaults).map((key) => [key, item[key] || ''])))
    setEditingId(item.id)
    setImage(null)
    setPreview(item.image_url || '')
    setMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const imageData = image
        ? { name: image.name, type: image.type, data: await fileToDataUrl(image) }
        : null
      const result = await apiRequest(config.endpoint, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, id: editingId, image: imageData }),
      })
      const item = result[config.responseKey]
      setItems((current) =>
        sortRecords(editingId
          ? current.map((existing) => (existing.id === editingId ? item : existing))
          : [item, ...current]),
      )
      setMessage({ type: 'success', text: editingId ? 'บันทึกการแก้ไขเรียบร้อยแล้ว' : 'เพิ่มข้อมูลและส่งขึ้น GitHub เรียบร้อยแล้ว' })
      reset()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`ยืนยันการลบ “${config.title(item)}” หรือไม่`)) return
    try {
      await apiRequest(config.endpoint, {
        method: 'DELETE',
        body: JSON.stringify({ id: item.id }),
      })
      setItems((current) => current.filter((existing) => existing.id !== item.id))
      setMessage({ type: 'success', text: 'ลบรายการเรียบร้อยแล้ว' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <section className="admin-content-grid">
      <form className="news-editor" onSubmit={submit}>
        <div className="admin-section-heading">
          <div><span>{config.eyebrow}</span><h2>{editingId ? `แก้ไข${config.label}` : `เพิ่ม${config.label}`}</h2></div>
          {editingId ? <button className="admin-icon-button" type="button" onClick={reset} aria-label="ยกเลิกแก้ไข"><X size={21} /></button> : <Icon size={28} />}
        </div>
        <div className="news-editor__grid">
          {config.fields.filter((field) => !field.adminOnly || isAdmin).map((field) => (
            <label className={`news-field ${field.wide ? 'news-field--wide' : ''}`} key={field.name}>
              <span>{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={form[field.name]}
                  onChange={update}
                  placeholder={field.placeholder}
                  rows={field.rows}
                  required={field.required}
                />
              ) : field.type === 'select' ? (
                <select name={field.name} value={form[field.name]} onChange={update}>
                  {field.options.map((option) => {
                    const value = typeof option === 'string' ? option : option.value
                    const label = typeof option === 'string' ? option : option.label
                    return <option value={value} key={value}>{label}</option>
                  })}
                </select>
              ) : field.type === 'status' ? (
                <select name={field.name} value={form[field.name]} onChange={update}>
                  <option value="published">เผยแพร่</option>
                  <option value="draft">ฉบับร่าง</option>
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={form[field.name]}
                  onChange={update}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </label>
          ))}
        </div>
        {config.image && (
          <label className={`image-uploader ${config.imageClass || ''} ${preview ? 'image-uploader--selected' : ''}`}>
            {preview ? <img src={preview} alt="ตัวอย่างรูปภาพ" /> : (
              <><span><FileImage size={27} /></span><strong>เลือกรูปภาพ</strong><small>{config.imageHint || 'JPG, PNG หรือ WebP ขนาดไม่เกิน 3 MB'}</small></>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={chooseImage}
              required={config.imageRequired && !editingId}
            />
          </label>
        )}
        {message && (
          <p className={`admin-message admin-message--${message.type}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </p>
        )}
        <button className="admin-button admin-button--primary" type="submit" disabled={submitting || !githubConfigured}>
          {submitting ? <LoaderCircle className="spin" size={19} /> : <Save size={19} />}
          {submitting ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
        </button>
      </form>

      <div className="admin-list-card">
        <div className="admin-section-heading">
          <div><span>DATABASE</span><h2>รายการที่บันทึก</h2></div>
          <Icon size={27} />
        </div>
        {!items.length ? (
          <div className="admin-empty"><Icon size={34} /><strong>ยังไม่มีข้อมูลในหมวดนี้</strong></div>
        ) : (
          <div className="admin-record-list">
            {items.map((item) => (
              <article key={item.id}>
                <div className="admin-news-list__image">
                  {item.image_url ? <img src={item.image_url} alt="" /> : <Icon size={24} />}
                </div>
                <div className="admin-record-list__copy">
                  <span>{config.meta(item)}</span>
                  <h3>{config.title(item)}</h3>
                  {(item.document_url || item.photo_url) && (
                    <small className="admin-record-list__links"><Link2 size={12} /> มีลิงก์แนบ</small>
                  )}
                  <small>{config.date(item) ? new Date(config.date(item)).toLocaleDateString('th-TH') : ''}</small>
                </div>
                {isAdmin && (
                  <div className="admin-record-list__actions">
                    <button type="button" onClick={() => edit(item)} aria-label={`แก้ไข ${config.title(item)}`}><Pencil size={16} /></button>
                    <button type="button" className="is-danger" onClick={() => remove(item)} aria-label={`ลบ ${config.title(item)}`}><Trash2 size={16} /></button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const qualityDefaults = {
  education_level: 'early',
  indicator_code: '1.1',
  title: '',
  description: '',
  document_url: '',
  display_order: '',
  status: 'published',
}

function QualityManager({ items, setItems, isAdmin, githubConfigured }) {
  const [form, setForm] = useState(qualityDefaults)
  const [editingId, setEditingId] = useState(null)
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const selectedLevel = qualityLevelMap[form.education_level] || qualityLevels[0]
  const indicators = selectedLevel.standards.flatMap((standard) => standard.indicators)

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => {
      if (name !== 'education_level') return { ...current, [name]: value }
      const nextLevel = qualityLevelMap[value]
      return {
        ...current,
        education_level: value,
        indicator_code: nextLevel.standards[0].indicators[0].code,
      }
    })
    setMessage(null)
  }

  const reset = () => {
    setForm(qualityDefaults)
    setEditingId(null)
    setFile(null)
  }

  const edit = (item) => {
    setForm(Object.fromEntries(Object.keys(qualityDefaults).map((key) => [key, item[key] || ''])))
    setEditingId(item.id)
    setFile(null)
    setMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const fileData = file
        ? { name: file.name, type: file.type, data: await fileToDataUrl(file) }
        : null
      const result = await apiRequest('/api/quality-evidence', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, id: editingId, file: fileData }),
      })
      setItems((current) =>
        sortRecords(editingId
          ? current.map((item) => (item.id === editingId ? result.evidence : item))
          : [result.evidence, ...current]),
      )
      setMessage({
        type: 'success',
        text: editingId ? 'บันทึกการแก้ไขหลักฐานเรียบร้อยแล้ว' : 'เพิ่มหลักฐานและส่งขึ้น GitHub เรียบร้อยแล้ว',
      })
      reset()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`ยืนยันการลบ “${item.title}” หรือไม่`)) return
    try {
      await apiRequest('/api/quality-evidence', {
        method: 'DELETE',
        body: JSON.stringify({ id: item.id }),
      })
      setItems((current) => current.filter((existing) => existing.id !== item.id))
      setMessage({ type: 'success', text: 'ลบเอกสารหลักฐานเรียบร้อยแล้ว' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <section className="admin-content-grid">
      <form className="news-editor" onSubmit={submit}>
        <div className="admin-section-heading">
          <div>
            <span>EXTERNAL QUALITY ASSURANCE</span>
            <h2>{editingId ? 'แก้ไขเอกสารหลักฐาน สมศ.' : 'เพิ่มเอกสารหลักฐาน สมศ.'}</h2>
          </div>
          {editingId ? (
            <button className="admin-icon-button" type="button" onClick={reset} aria-label="ยกเลิกแก้ไข">
              <X size={21} />
            </button>
          ) : <ShieldCheck size={28} />}
        </div>

        <div className="news-editor__grid">
          <label className="news-field">
            <span>ระดับการศึกษา</span>
            <select name="education_level" value={form.education_level} onChange={update}>
              {qualityLevels.map((level) => (
                <option value={level.id} key={level.id}>{level.label}</option>
              ))}
            </select>
          </label>
          <label className="news-field">
            <span>ตัวชี้วัด</span>
            <select name="indicator_code" value={form.indicator_code} onChange={update}>
              {indicators.map((indicator) => (
                <option value={indicator.code} key={indicator.code}>
                  {indicator.code} {indicator.title}
                </option>
              ))}
            </select>
          </label>
          <label className="news-field news-field--wide">
            <span>ชื่อเอกสารหลักฐาน</span>
            <input
              name="title"
              value={form.title}
              onChange={update}
              placeholder="เช่น รายงานการประเมินตนเองของสถานศึกษา ปีการศึกษา 2568"
              required
            />
          </label>
          <label className="news-field news-field--wide">
            <span>คำอธิบาย</span>
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              placeholder="รายละเอียดสั้น ๆ ของเอกสาร"
              rows={3}
            />
          </label>
          <label className="news-field news-field--wide">
            <span>ลิงก์เอกสารบน Google Drive หรือเว็บไซต์ภายนอก</span>
            <input
              type="url"
              name="document_url"
              value={form.document_url}
              onChange={update}
              placeholder="https://drive.google.com/..."
            />
          </label>
          {isAdmin && (
            <label className="news-field">
              <span>ลำดับการแสดงผล</span>
              <input
                type="number"
                name="display_order"
                value={form.display_order}
                onChange={update}
                placeholder="เลขมากแสดงก่อน"
              />
            </label>
          )}
          <label className="news-field">
            <span>สถานะ</span>
            <select name="status" value={form.status} onChange={update}>
              <option value="published">เผยแพร่</option>
              <option value="draft">ฉบับร่าง</option>
            </select>
          </label>
        </div>

        <label className={`quality-file-uploader ${file ? 'is-selected' : ''}`}>
          <span><FileText size={27} /></span>
          <div>
            <strong>{file ? file.name : 'อัปโหลดไฟล์ PDF'}</strong>
            <small>เลือกอัปโหลดไฟล์ PDF ไม่เกิน 3 MB หรือใช้ลิงก์เอกสารด้านบน</small>
          </div>
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>

        <div className="quality-selected-indicator">
          <span>ตัวชี้วัดที่ {form.indicator_code}</span>
          <p>{qualityIndicator(form.education_level, form.indicator_code)?.title}</p>
        </div>

        {message && (
          <p className={`admin-message admin-message--${message.type}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </p>
        )}
        <button className="admin-button admin-button--primary" type="submit" disabled={submitting || !githubConfigured}>
          {submitting ? <LoaderCircle className="spin" size={19} /> : <Save size={19} />}
          {submitting ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มเอกสารหลักฐาน'}
        </button>
      </form>

      <div className="admin-list-card">
        <div className="admin-section-heading">
          <div><span>EVIDENCE DATABASE</span><h2>เอกสารหลักฐานที่บันทึก</h2></div>
          <FileText size={27} />
        </div>
        {!items.length ? (
          <div className="admin-empty"><FileText size={34} /><strong>ยังไม่มีเอกสารหลักฐาน</strong></div>
        ) : (
          <div className="admin-record-list quality-record-list">
            {items.map((item) => (
              <article key={item.id}>
                <div className="admin-news-list__image"><FileText size={24} /></div>
                <div className="admin-record-list__copy">
                  <span>{qualityLevelMap[item.education_level]?.shortLabel} · ตัวชี้วัดที่ {item.indicator_code}</span>
                  <h3>{item.title}</h3>
                  <small className="admin-record-list__links"><Link2 size={12} /> เอกสารหลักฐาน</small>
                  <small>{item.status === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}</small>
                </div>
                {isAdmin && (
                  <div className="admin-record-list__actions">
                    <button type="button" onClick={() => edit(item)} aria-label={`แก้ไข ${item.title}`}><Pencil size={16} /></button>
                    <button type="button" className="is-danger" onClick={() => remove(item)} aria-label={`ลบ ${item.title}`}><Trash2 size={16} /></button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function MembersManager({ members, setMembers, currentUsername }) {
  const [editingMember, setEditingMember] = useState(null)
  const [form, setForm] = useState({
    username: '',
    displayName: '',
    role: 'member',
    status: 'pending',
    password: '',
    permissions: [],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const openEditor = (member) => {
    setEditingMember(member)
    setForm({
      username: member.username,
      displayName: member.displayName,
      role: member.role,
      status: member.status,
      password: '',
      permissions: member.permissions || [],
    })
    setShowPassword(false)
    setMessage(null)
  }

  const closeEditor = () => {
    setEditingMember(null)
    setForm({
      username: '',
      displayName: '',
      role: 'member',
      status: 'pending',
      password: '',
      permissions: [],
    })
    setShowPassword(false)
    setMessage(null)
  }

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setMessage(null)
  }

  const togglePermission = (permission) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }))
    setMessage(null)
  }

  const replaceMember = (updatedMember) => {
    setMembers((current) =>
      current.map((member) => (member.id === updatedMember.id ? updatedMember : member)),
    )
  }

  const saveMember = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const result = await apiRequest('/api/members', {
        method: 'PATCH',
        body: JSON.stringify({ id: editingMember.id, ...form }),
      })
      replaceMember(result.member)
      setEditingMember(result.member)
      setForm((current) => ({ ...current, password: '' }))
      setMessage({
        type: 'success',
        text: result.passwordChanged
          ? 'บันทึกข้อมูลและเปลี่ยนรหัสผ่านเรียบร้อยแล้ว'
          : 'บันทึกข้อมูลสมาชิกเรียบร้อยแล้ว',
      })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (member, status) => {
    try {
      const result = await apiRequest('/api/members', {
        method: 'PATCH',
        body: JSON.stringify({ id: member.id, status }),
      })
      replaceMember(result.member)
    } catch (error) {
      window.alert(error.message)
    }
  }

  const statusLabel = { true: 'อนุมัติแล้ว', pending: 'รออนุมัติ', suspended: 'ระงับใช้งาน' }
  const editingSelf = editingMember?.username === currentUsername

  return (
    <section className="admin-list-card admin-members-card">
      <div className="admin-section-heading">
        <div><span>USER MANAGEMENT</span><h2>จัดการสมาชิก</h2></div>
        <Users size={28} />
      </div>
      {editingMember && (
        <form className="admin-member-editor" onSubmit={saveMember}>
          <div className="admin-member-editor__heading">
            <div>
              <span><User size={18} /></span>
              <div><strong>แก้ไขข้อมูลผู้ใช้งาน</strong><small>รหัสสมาชิก: {editingMember.id}</small></div>
            </div>
            <button type="button" onClick={closeEditor} aria-label="ปิดแบบฟอร์มแก้ไขสมาชิก">
              <X size={19} />
            </button>
          </div>
          <div className="admin-member-editor__grid">
            <label>
              <span>ชื่อผู้ใช้</span>
              <input
                name="username"
                value={form.username}
                onChange={updateForm}
                disabled={editingSelf}
                required
              />
            </label>
            <label>
              <span>ชื่อที่ใช้แสดง</span>
              <input
                name="displayName"
                value={form.displayName}
                onChange={updateForm}
                required
              />
            </label>
            <label>
              <span>บทบาทผู้ใช้งาน</span>
              <select name="role" value={form.role} onChange={updateForm} disabled={editingSelf}>
                <option value="member">สมาชิก</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
            </label>
            <label>
              <span>สถานะบัญชี</span>
              <select name="status" value={form.status} onChange={updateForm} disabled={editingSelf}>
                <option value="true">อนุมัติแล้ว</option>
                <option value="pending">รออนุมัติ</option>
                <option value="suspended">ระงับใช้งาน</option>
              </select>
            </label>
            <label className="admin-member-editor__password">
              <span>ตั้งรหัสผ่านใหม่</span>
              <div>
                <LockKeyhole size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={updateForm}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <small>รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร</small>
            </label>
          </div>
          <fieldset className="admin-permissions" disabled={form.role === 'admin'}>
            <legend>
              <strong>สิทธิ์การบริหารจัดการข้อมูล</strong>
              <small>
                {form.role === 'admin'
                  ? 'ผู้ดูแลระบบสามารถจัดการข้อมูลทุกส่วนโดยอัตโนมัติ'
                  : 'เลือกเฉพาะส่วนที่สมาชิกคนนี้รับผิดชอบ'}
              </small>
            </legend>
            <div>
              {permissionOptions.map(({ id, label, icon: Icon }) => (
                <label className={form.permissions.includes(id) || form.role === 'admin' ? 'is-checked' : ''} key={id}>
                  <input
                    type="checkbox"
                    checked={form.role === 'admin' || form.permissions.includes(id)}
                    onChange={() => togglePermission(id)}
                  />
                  <span><Icon size={18} /></span>
                  <strong>{label}</strong>
                  <Check size={17} />
                </label>
              ))}
            </div>
          </fieldset>
          {editingSelf && (
            <p className="admin-member-editor__note">
              บัญชีที่กำลังใช้งานเปลี่ยนชื่อผู้ใช้ บทบาท หรือสถานะไม่ได้ เพื่อป้องกันการหลุดจากระบบ
            </p>
          )}
          {message && (
            <p className={`admin-message admin-message--${message.type}`}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </p>
          )}
          <div className="admin-member-editor__footer">
            <button type="button" onClick={closeEditor}>ยกเลิก</button>
            <button type="submit" className="is-primary" disabled={submitting}>
              {submitting ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}
              {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสมาชิก'}
            </button>
          </div>
        </form>
      )}
      <div className="admin-member-list">
        {members.map((member) => (
          <article className={editingMember?.id === member.id ? 'is-editing' : ''} key={member.id}>
            <span className="admin-member-list__avatar"><User size={20} /></span>
            <div>
              <strong>{member.displayName}</strong>
              <small>@{member.username} · {member.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}</small>
              <small>
                {member.role === 'admin'
                  ? 'จัดการได้ทุกส่วน'
                  : `ได้รับสิทธิ์ ${member.permissions?.length || 0} ส่วน`}
              </small>
            </div>
            <span className={`member-status member-status--${member.status}`}>
              {statusLabel[member.status] || member.status}
            </span>
            <div className="admin-member-list__actions">
              <button type="button" className="is-edit" onClick={() => openEditor(member)}>
                <Pencil size={16} />แก้ไข
              </button>
              {member.username !== currentUsername && member.status !== 'true' && (
                <button type="button" className="is-approve" onClick={() => updateStatus(member, 'true')}>
                  <Check size={16} />อนุมัติ
                </button>
              )}
              {member.username !== currentUsername && member.status === 'true' && (
                <button type="button" className="is-suspend" onClick={() => updateStatus(member, 'suspended')}>
                  <XCircle size={16} />ระงับ
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Dashboard() {
  const [session, setSession] = useState(null)
  const [activeModule, setActiveModule] = useState('news')
  const [news, setNews] = useState([])
  const [events, setEvents] = useState([])
  const [awards, setAwards] = useState([])
  const [newsletters, setNewsletters] = useState([])
  const [qualityEvidence, setQualityEvidence] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const sessionData = await apiRequest('/api/auth/session')
        if (!active) return
        setSession(sessionData)
        const allowed = new Set(sessionData.user.permissions || [])
        const canManage = (permission) =>
          sessionData.user.role === 'admin' || allowed.has(permission)
        const firstAllowed = permissionOptions.find((item) => canManage(item.id))
        setActiveModule(firstAllowed?.id || (sessionData.user.role === 'admin' ? 'members' : 'none'))
        const requests = [
          canManage('news') ? apiRequest('/api/news') : Promise.resolve({ news: [] }),
          canManage('events') ? apiRequest('/api/events') : Promise.resolve({ events: [] }),
          canManage('awards') ? apiRequest('/api/awards') : Promise.resolve({ awards: [] }),
          canManage('newsletters') ? apiRequest('/api/newsletters') : Promise.resolve({ newsletters: [] }),
          canManage('quality') ? apiRequest('/api/quality-evidence') : Promise.resolve({ evidence: [] }),
          sessionData.user.role === 'admin' ? apiRequest('/api/members') : Promise.resolve({ members: [] }),
        ]
        const [newsData, eventData, awardData, newsletterData, qualityData, memberData] = await Promise.all(requests)
        if (!active) return
        setNews(newsData.news || [])
        setEvents(eventData.events || [])
        setAwards(awardData.awards || [])
        setNewsletters(newsletterData.newsletters || [])
        setQualityEvidence(qualityData.evidence || [])
        setMembers(memberData.members || [])
      } catch (error) {
        if (error.status === 401 || error.status === 403) window.location.replace('/login')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const stats = useMemo(() => ({
    news: news.length,
    events: events.length,
    awards: awards.length,
    newsletters: newsletters.length,
    quality: qualityEvidence.length,
    pending: members.filter((member) => member.status === 'pending').length,
  }), [news, events, awards, newsletters, qualityEvidence, members])

  const logout = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST', body: '{}' }).catch(() => undefined)
    window.location.assign('/login')
  }

  if (!session && loading) {
    return <main className="admin-loading"><LoaderCircle className="spin" />กำลังเตรียมหน้าบริหารจัดการ...</main>
  }

  const isAdmin = session?.user.role === 'admin'
  const allowedPermissions = new Set(session?.user.permissions || [])
  const moduleNavItems = [
    { id: 'news', label: 'ข่าวสาร / ประชาสัมพันธ์ / ประกาศ', icon: Megaphone },
    { id: 'events', label: 'ปฏิทินกิจกรรม', icon: CalendarDays },
    { id: 'awards', label: 'ผลงานและรางวัล', icon: Trophy },
    { id: 'newsletters', label: 'จดหมายข่าว', icon: GalleryHorizontalEnd },
    { id: 'quality', label: 'งานประกันคุณภาพ (สมศ.)', icon: ShieldCheck },
  ].filter((item) => isAdmin || allowedPermissions.has(item.id))
  const navItems = [
    ...moduleNavItems,
    ...(isAdmin ? [{ id: 'members', label: `สมาชิก${stats.pending ? ` (${stats.pending})` : ''}`, icon: Users }] : []),
  ]

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <a className="admin-sidebar__brand" href="/">
          <img src="/np.png" alt="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร" />
          <span><strong>โรงเรียนบ้านน้ำพร</strong><small>ADMINISTRATION</small></span>
        </a>
        <nav>
          <button className="is-overview" type="button"><LayoutDashboard size={19} />ระบบจัดการข้อมูล</button>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              className={activeModule === id ? 'is-active' : ''}
              type="button"
              onClick={() => setActiveModule(id)}
              key={id}
            >
              <Icon size={19} />{label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__user">
          <span><User size={20} /></span>
          <div>
            <strong>{session?.user.displayName}</strong>
            <small>{isAdmin ? 'ผู้ดูแลระบบ' : 'สมาชิกที่ได้รับอนุมัติ'}</small>
          </div>
        </div>
        <button type="button" onClick={logout}><LogOut size={18} />ออกจากระบบ</button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div><p>ยินดีต้อนรับกลับ</p><h1>ระบบบริหารจัดการข้อมูล</h1></div>
          <a href="/" target="_blank" rel="noreferrer">เปิดหน้าเว็บไซต์<ArrowLeft size={17} /></a>
        </header>

        {!session?.githubConfigured && (
          <div className="admin-config-alert">
            <AlertCircle size={22} />
            <div><strong>รอการเชื่อมต่อ GitHub</strong><p>การบันทึกข้อมูลจะเปิดใช้งานเมื่อเพิ่ม GITHUB_TOKEN ใน Vercel</p></div>
          </div>
        )}

        <section className="admin-stats">
          <article><span><Newspaper size={22} /></span><div><small>ข่าวสาร</small><strong>{stats.news}</strong></div></article>
          <article><span><CalendarDays size={22} /></span><div><small>กิจกรรม</small><strong>{stats.events}</strong></div></article>
          <article><span><Trophy size={22} /></span><div><small>ผลงานและรางวัล</small><strong>{stats.awards}</strong></div></article>
          <article><span><GalleryHorizontalEnd size={22} /></span><div><small>จดหมายข่าว</small><strong>{stats.newsletters}</strong></div></article>
          <article><span><ShieldCheck size={22} /></span><div><small>หลักฐาน สมศ.</small><strong>{stats.quality}</strong></div></article>
          {isAdmin && <article><span><Users size={22} /></span><div><small>รออนุมัติ</small><strong>{stats.pending}</strong></div></article>}
        </section>

        <div className="admin-mobile-tabs">
          {navItems.map(({ id, label }) => (
            <button className={activeModule === id ? 'is-active' : ''} type="button" onClick={() => setActiveModule(id)} key={id}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div className="admin-empty"><LoaderCircle className="spin" />กำลังโหลดข้อมูล...</div>
        ) : activeModule === 'members' && isAdmin ? (
          <MembersManager
            members={members}
            setMembers={setMembers}
            currentUsername={session.user.username}
          />
        ) : activeModule === 'events' ? (
          <RecordManager type="events" items={events} setItems={setEvents} isAdmin={isAdmin} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'awards' ? (
          <RecordManager type="awards" items={awards} setItems={setAwards} isAdmin={isAdmin} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'newsletters' ? (
          <RecordManager type="newsletters" items={newsletters} setItems={setNewsletters} isAdmin={isAdmin} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'quality' ? (
          <QualityManager
            items={qualityEvidence}
            setItems={setQualityEvidence}
            isAdmin={isAdmin}
            githubConfigured={session.githubConfigured}
          />
        ) : activeModule === 'none' ? (
          <div className="admin-empty admin-no-permission">
            <ShieldCheck size={36} />
            <strong>ยังไม่ได้รับสิทธิ์จัดการข้อมูล</strong>
            <p>กรุณาติดต่อผู้ดูแลระบบเพื่อกำหนดส่วนงานที่รับผิดชอบ</p>
          </div>
        ) : (
          <RecordManager type="news" items={news} setItems={setNews} isAdmin={isAdmin} githubConfigured={session.githubConfigured} />
        )}
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
