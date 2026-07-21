import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileText,
  FileImage,
  GalleryHorizontalEnd,
  HelpCircle,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  LogOut,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Pencil,
  Plus,
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
import { displayImageUrl } from './driveUrls'
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

const maxUploadBytes = 100 * 1024 * 1024

function uploadFileBytes(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', uploadUrl)
    request.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () => {
      let body = {}
      try {
        body = request.responseText ? JSON.parse(request.responseText) : {}
      } catch {
        body = {}
      }
      if (request.status === 200 || request.status === 201) {
        resolve(body)
        return
      }
      reject(new Error(body.error?.message || 'อัปโหลดไฟล์ไป Google Drive ไม่สำเร็จ'))
    }
    request.onerror = () => reject(new Error('การเชื่อมต่อระหว่างอัปโหลดไฟล์ขัดข้อง กรุณาลองใหม่'))
    request.send(file)
  })
}

async function uploadFileToDrive(file, category, onProgress) {
  if (!file) return null
  if (file.size <= 0 || file.size > maxUploadBytes) {
    throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 100 MB')
  }
  const started = await apiRequest('/api/services?resource=uploads', {
    method: 'POST',
    body: JSON.stringify({
      action: 'start',
      category,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    }),
  })
  const uploaded = await uploadFileBytes(started.uploadUrl, file, onProgress)
  if (!uploaded.id) throw new Error('Google Drive ไม่ได้ส่งรหัสไฟล์กลับมา กรุณาลองใหม่')
  const completed = await apiRequest('/api/services?resource=uploads', {
    method: 'POST',
    body: JSON.stringify({ action: 'complete', category, fileId: uploaded.id }),
  })
  return completed.file
}

const awardTypeLabels = {
  school: 'ผลงาน/รางวัลโรงเรียน',
  personnel: 'ผลงาน/รางวัลผู้บริหาร/ครู/บุคลากร',
  student: 'ผลงาน/รางวัลนักเรียน',
  teacher_work: 'Best Practice/นวัตกรรม/วิจัยชั้นเรียน',
}

const permissionOptions = [
  { id: 'news', label: 'ข่าวสาร', icon: Megaphone },
  { id: 'events', label: 'ปฏิทินกิจกรรม', icon: CalendarDays },
  { id: 'awards', label: 'ผลงานและรางวัล', icon: Trophy },
  { id: 'newsletters', label: 'จดหมายข่าวประชาสัมพันธ์', icon: GalleryHorizontalEnd },
  { id: 'quality', label: 'งานประกันคุณภาพ (สมศ.)', icon: ShieldCheck },
  { id: 'documents', label: 'เอกสารและแบบคำร้อง', icon: Download },
  { id: 'qa', label: 'ถาม-ตอบ (Q&A)', icon: HelpCircle },
  { id: 'complaints', label: 'เรื่องร้องเรียน', icon: MessageSquareWarning },
]

const modules = {
  news: {
    endpoint: '/api/news',
    responseKey: 'news',
    listKey: 'news',
    label: 'ข่าวสาร',
    eyebrow: 'NEWS & ANNOUNCEMENT',
    icon: Megaphone,
    image: true,
    imageUploadCategory: 'news-image',
    attachmentUploadCategory: 'news-attachment',
    defaults: {
      title: '',
      category: 'ประชาสัมพันธ์',
      publish_date: '',
      summary: '',
      content: '',
      display_order: '',
      status: 'published',
    },
    fields: [
      { name: 'title', label: 'หัวข้อข่าว', wide: true, required: true, placeholder: 'กรอกหัวข้อข่าวหรือประกาศ' },
      { name: 'category', label: 'หมวดหมู่', type: 'select', options: ['กิจกรรม', 'ประชาสัมพันธ์', 'ประกาศ'] },
      { name: 'publish_date', label: 'วันที่เผยแพร่', type: 'date', required: true },
      { name: 'status', label: 'สถานะ', type: 'status' },
      { name: 'summary', label: 'ข้อความสรุป', type: 'textarea', wide: true, rows: 2, placeholder: 'ข้อความสั้นสำหรับสรุปเนื้อหา' },
      { name: 'content', label: 'รายละเอียด', type: 'textarea', wide: true, rows: 7, required: true, placeholder: 'กรอกรายละเอียดข่าวสารหรือประกาศ' },
      { name: 'display_order', label: 'ลำดับภายในวันที่เดียวกัน (เลขมากแสดงก่อน)', type: 'number', adminOnly: true, placeholder: 'เว้นว่างเพื่อให้ระบบนับต่อภายในวันที่นี้' },
    ],
    meta: (item) => `${item.category} · ${item.status === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}`,
    date: (item) => item.publish_date || item.created_at,
    title: (item) => item.title,
  },
  events: {
    endpoint: '/api/events',
    responseKey: 'event',
    listKey: 'events',
    label: 'กิจกรรม',
    eyebrow: 'SCHOOL ACTIVITIES',
    icon: CalendarDays,
    attachmentUploadCategory: 'event-attachment',
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
    imageUploadCategory: 'award-image',
    attachmentUploadCategory: 'award-attachment',
    defaults: {
      title: '',
      award_type: 'school',
      award_date: '',
      level: '',
      recipient: '',
      description: '',
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
      { name: 'level', label: 'ระดับรางวัล/ประเภทผลงาน', placeholder: 'เช่น ระดับจังหวัด, Best Practice หรือวิจัยชั้นเรียน' },
      { name: 'recipient', label: 'ผู้ได้รับรางวัล/เจ้าของผลงาน', wide: true, placeholder: 'นักเรียน ครู บุคลากร หรือโรงเรียน' },
      { name: 'description', label: 'รายละเอียด', type: 'textarea', wide: true, rows: 5, placeholder: 'รายละเอียดผลงานและความภาคภูมิใจ' },
      { name: 'display_order', label: 'ลำดับภายในวันที่เดียวกัน (เลขมากแสดงก่อน)', type: 'number', adminOnly: true, placeholder: 'เว้นว่างเพื่อให้ระบบนับต่อภายในวันที่นี้' },
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
    imageUploadCategory: 'newsletter-image',
    attachmentUploadCategory: 'newsletter-attachment',
    imageRequired: true,
    imageHint: 'ภาพแนวตั้ง อัตราส่วนประมาณ 1:1.4 · JPG, PNG หรือ WebP ไม่เกิน 100 MB',
    imageClass: 'image-uploader--portrait',
    defaults: { issue_number: '', publish_date: '', display_order: '' },
    fields: [
      { name: 'issue_number', label: 'หมายเลขฉบับ', wide: true, required: true, placeholder: 'เช่น ฉบับที่ 1/2569' },
      { name: 'publish_date', label: 'วันที่เผยแพร่', type: 'date', required: true },
      { name: 'display_order', label: 'ลำดับภายในวันที่เดียวกัน (เลขมากแสดงก่อน)', type: 'number', adminOnly: true, placeholder: 'เว้นว่างเพื่อให้ระบบนับต่อภายในวันที่นี้' },
    ],
    meta: () => 'จดหมายข่าวประชาสัมพันธ์',
    date: (item) => item.publish_date || item.created_at,
    title: (item) => item.issue_number,
  },
  documents: {
    endpoint: '/api/services?resource=documents',
    responseKey: 'document',
    listKey: 'documents',
    label: 'เอกสารและแบบคำร้อง',
    eyebrow: 'SCHOOL DOCUMENTS',
    icon: Download,
    attachmentUploadCategory: 'school-attachment',
    defaults: {
      title: '',
      category: 'แบบคำร้อง',
      description: '',
      publish_date: '',
      display_order: '',
      status: 'published',
    },
    fields: [
      { name: 'title', label: 'ชื่อเอกสาร', wide: true, required: true, placeholder: 'เช่น แบบคำร้องขอใบรับรองการเป็นนักเรียน' },
      { name: 'category', label: 'ประเภทเอกสาร', type: 'select', options: ['แบบคำร้อง', 'เอกสารวิชาการ', 'คู่มือ', 'เอกสารทั่วไป'] },
      { name: 'publish_date', label: 'วันที่เผยแพร่', type: 'date', required: true },
      { name: 'description', label: 'รายละเอียด', type: 'textarea', wide: true, rows: 3, placeholder: 'คำอธิบายสั้น ๆ หรือเงื่อนไขการใช้เอกสาร' },
      { name: 'display_order', label: 'ลำดับภายในวันที่เดียวกัน (เลขมากแสดงก่อน)', type: 'number', adminOnly: true, placeholder: 'เว้นว่างเพื่อให้ระบบนับต่อภายในวันที่นี้' },
      { name: 'status', label: 'สถานะ', type: 'status' },
    ],
    meta: (item) => `${item.category} · ${item.status === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}`,
    date: (item) => item.publish_date || item.created_at,
    title: (item) => item.title,
  },
}

function sortRecords(items) {
  return [...items].sort((left, right) => {
    const leftDate = String(
      left.publish_date
      || left.award_date
      || left.event_date
      || left.created_at
      || left.createdAt
      || '',
    ).slice(0, 10)
    const rightDate = String(
      right.publish_date
      || right.award_date
      || right.event_date
      || right.created_at
      || right.createdAt
      || '',
    ).slice(0, 10)
    const dateDifference = rightDate.localeCompare(leftDate)
    if (dateDifference) return dateDifference
    const orderDifference = Number(right.display_order || 0) - Number(left.display_order || 0)
    if (orderDifference) return orderDifference
    return String(right.created_at || right.createdAt || right.id || '')
      .localeCompare(String(left.created_at || left.createdAt || left.id || ''))
  })
}

function RecordAudit({ item, date }) {
  const createdDate = date ? new Date(date).toLocaleDateString('th-TH') : ''
  const author = item.author_name || item.author || 'ไม่ระบุผู้บันทึก'
  const editor = item.updated_by_name || item.updated_by

  return (
    <small className="admin-record-list__audit">
      {createdDate && <>{createdDate} · </>}
      บันทึกโดย {author}
      {editor && <> · แก้ไขโดย {editor}</>}
    </small>
  )
}

function recordAttachmentUrls(item) {
  return [...new Set([
    ...(Array.isArray(item.document_urls) ? item.document_urls : []),
    item.document_url,
    item.document_url_2,
    item.document_url_3,
    item.document_url_4,
    item.document_url_5,
    item.photo_url,
  ].map((url) => String(url || '').trim()).filter(Boolean))].slice(0, 5)
}

function RecordManager({ type, items, setItems, isAdmin, githubConfigured }) {
  const config = modules[type]
  const Icon = config.icon
  const [form, setForm] = useState(config.defaults)
  const [editingId, setEditingId] = useState(null)
  const [image, setImage] = useState(null)
  const [attachmentFiles, setAttachmentFiles] = useState([])
  const [attachmentUrls, setAttachmentUrls] = useState([''])
  const [preview, setPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setForm(config.defaults)
    setEditingId(null)
    setImage(null)
    setAttachmentFiles([])
    setAttachmentUrls([''])
    setPreview('')
    setUploadProgress(0)
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
    setAttachmentFiles([])
    setAttachmentUrls([''])
    setPreview('')
    setUploadProgress(0)
  }

  const edit = (item) => {
    setForm(Object.fromEntries(Object.keys(config.defaults).map((key) => [key, item[key] || ''])))
    setEditingId(item.id)
    setImage(null)
    setAttachmentFiles([])
    const itemUrls = recordAttachmentUrls(item)
    setAttachmentUrls(itemUrls.length ? itemUrls : [''])
    setPreview(displayImageUrl(item.image_url))
    setMessage(null)
    setUploadProgress(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateAttachmentUrl = (index, value) => {
    setAttachmentUrls((current) => current.map((url, urlIndex) => (
      urlIndex === index ? value : url
    )))
    setMessage(null)
  }

  const addAttachmentUrl = () => {
    setAttachmentUrls((current) => (
      current.length + attachmentFiles.length >= 5 ? current : [...current, '']
    ))
    setMessage(null)
  }

  const removeAttachmentUrl = (index) => {
    setAttachmentUrls((current) => {
      const next = current.filter((_, urlIndex) => urlIndex !== index)
      return next.length ? next : ['']
    })
    setMessage(null)
  }

  const selectAttachmentFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    event.target.value = ''
    if (!selectedFiles.length) return
    const linkCount = attachmentUrls.filter((url) => url.trim()).length
    const availableSlots = Math.max(0, 5 - linkCount - attachmentFiles.length)
    if (selectedFiles.length > availableSlots) {
      setMessage({ type: 'error', text: `เลือกเพิ่มได้อีกไม่เกิน ${availableSlots} ไฟล์ โดยนับรวมลิงก์และไฟล์สูงสุด 5 รายการ` })
      return
    }
    const oversizedFile = selectedFiles.find((selectedFile) => (
      selectedFile.size <= 0 || selectedFile.size > maxUploadBytes
    ))
    if (oversizedFile) {
      setMessage({ type: 'error', text: `ไฟล์ “${oversizedFile.name}” ต้องมีขนาดไม่เกิน 100 MB` })
      return
    }
    setAttachmentFiles((current) => [...current, ...selectedFiles])
    setMessage(null)
  }

  const removeAttachmentFile = (index) => {
    setAttachmentFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
    setMessage(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    const cleanUrls = attachmentUrls.filter((url) => url.trim())
    if (cleanUrls.length + attachmentFiles.length > 5) {
      setMessage({ type: 'error', text: 'แนบไฟล์หรือลิงก์ได้รวมไม่เกิน 5 รายการ' })
      return
    }
    if (type === 'documents' && cleanUrls.length + attachmentFiles.length === 0) {
      setMessage({ type: 'error', text: 'กรุณาแนบไฟล์หรือกรอกลิงก์เอกสารอย่างน้อย 1 รายการ' })
      return
    }
    setSubmitting(true)
    setUploadProgress(0)
    setMessage(null)
    try {
      const uploadedImage = image
        ? await uploadFileToDrive(image, config.imageUploadCategory, setUploadProgress)
        : null
      const uploadedAttachments = []
      for (let index = 0; index < attachmentFiles.length; index += 1) {
        const uploadedFile = await uploadFileToDrive(
          attachmentFiles[index],
          config.attachmentUploadCategory,
          (progress) => setUploadProgress(Math.round(((index + (progress / 100)) / attachmentFiles.length) * 100)),
        )
        uploadedAttachments.push(uploadedFile)
      }
      const result = await apiRequest(config.endpoint, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...form,
          id: editingId,
          image_url: uploadedImage?.imageUrl,
          document_urls: [
            ...uploadedAttachments.map((uploadedFile) => uploadedFile?.viewUrl),
            ...cleanUrls,
          ].filter(Boolean),
        }),
      })
      const item = result[config.responseKey]
      setItems((current) =>
        sortRecords(editingId
          ? current.map((existing) => (existing.id === editingId ? item : existing))
          : [item, ...current]),
      )
      setMessage({
        type: 'success',
        text: editingId
          ? 'บันทึกการแก้ไขเรียบร้อยแล้ว'
          : 'เพิ่มข้อมูลเรียบร้อยแล้ว ไฟล์ถูกฝากไว้ที่ Google Drive และข้อมูลถูกบันทึกขึ้น GitHub',
      })
      reset()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
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
              <><span><FileImage size={27} /></span><strong>เลือกรูปภาพ</strong><small>{config.imageHint || 'JPG, PNG หรือ WebP ขนาดไม่เกิน 100 MB'}</small></>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={chooseImage}
              required={config.imageRequired && !editingId}
            />
          </label>
        )}
        <div className="news-field quality-link-fields record-attachment-links">
          <div className="quality-link-fields__heading">
            <span>ลิงก์ไฟล์แนบ</span>
            <button
              type="button"
              onClick={addAttachmentUrl}
              disabled={attachmentUrls.length + attachmentFiles.length >= 5}
            >
              <Plus size={16} /> เพิ่มลิงก์
            </button>
          </div>
          {attachmentUrls.map((url, index) => (
            <div className="quality-link-fields__row" key={index}>
              <input
                type="url"
                value={url}
                onChange={(event) => updateAttachmentUrl(index, event.target.value)}
                placeholder={`ลิงก์ไฟล์แนบที่ ${index + 1}`}
                aria-label={`ลิงก์ไฟล์แนบที่ ${index + 1}`}
              />
              {attachmentUrls.length > 1 && (
                <button type="button" onClick={() => removeAttachmentUrl(index)} aria-label={`ลบลิงก์ไฟล์แนบที่ ${index + 1}`}>
                  <X size={17} />
                </button>
              )}
            </div>
          ))}
          <small>รองรับลิงก์ https ทุกประเภท โดยนับรวมกับไฟล์ที่อัปโหลดไม่เกิน 5 รายการ</small>
        </div>

        <label className={`quality-file-uploader ${attachmentFiles.length ? 'is-selected' : ''}`}>
            <span><FileText size={27} /></span>
            <div>
              <strong>{attachmentFiles.length ? `เลือกแล้ว ${attachmentFiles.length} ไฟล์` : 'อัปโหลดไฟล์แนบ'}</strong>
              <small>เลือกได้สูงสุด 5 ไฟล์ รองรับไฟล์ทุกประเภท ไฟล์ละไม่เกิน 100 MB และนับรวมกับลิงก์ด้านบน</small>
            </div>
            <input
              type="file"
              multiple
              onChange={selectAttachmentFiles}
            />
        </label>
        {attachmentFiles.length > 0 && (
          <div className="quality-upload-files" aria-label="ไฟล์แนบที่เลือก">
            {attachmentFiles.map((selectedFile, index) => (
              <div className="quality-upload-files__item" key={`${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}-${index}`}>
                <FileText size={17} />
                <span title={selectedFile.name}>{selectedFile.name}</span>
                <small>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</small>
                <button type="button" onClick={() => removeAttachmentFile(index)} aria-label={`ลบไฟล์ ${selectedFile.name}`}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        {message && (
          <p className={`admin-message admin-message--${message.type}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </p>
        )}
        <button className="admin-button admin-button--primary" type="submit" disabled={submitting || !githubConfigured}>
          {submitting ? <LoaderCircle className="spin" size={19} /> : <Save size={19} />}
          {submitting ? (uploadProgress ? `กำลังอัปโหลด ${uploadProgress}%` : 'กำลังบันทึก...') : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
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
                  {item.image_url ? <img src={displayImageUrl(item.image_url)} alt="" /> : <Icon size={24} />}
                </div>
                <div className="admin-record-list__copy">
                  <span>{config.meta(item)}</span>
                  <h3>{config.title(item)}</h3>
                  {recordAttachmentUrls(item).length > 0 && (
                    <small className="admin-record-list__links"><Link2 size={12} /> {recordAttachmentUrls(item).length} รายการแนบ</small>
                  )}
                  <RecordAudit item={item} date={config.date(item)} />
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
  document_urls: [''],
  display_order: '',
  status: 'published',
}

function QualityManager({ items, setItems, isAdmin, githubConfigured }) {
  const [form, setForm] = useState(qualityDefaults)
  const [editingId, setEditingId] = useState(null)
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
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
    setForm({ ...qualityDefaults, document_urls: [''] })
    setEditingId(null)
    setFiles([])
    setUploadProgress(0)
  }

  const edit = (item) => {
    const documentUrls = item.document_urls?.length
      ? item.document_urls
      : [
          item.document_url,
          item.document_url_2,
          item.document_url_3,
          item.document_url_4,
          item.document_url_5,
        ].filter(Boolean)
    setForm({
      ...Object.fromEntries(
        Object.keys(qualityDefaults)
          .filter((key) => key !== 'document_urls')
          .map((key) => [key, item[key] || '']),
      ),
      document_urls: documentUrls.length ? documentUrls : [''],
    })
    setEditingId(item.id)
    setFiles([])
    setUploadProgress(0)
    setMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateDocumentUrl = (index, value) => {
    setForm((current) => ({
      ...current,
      document_urls: current.document_urls.map((url, urlIndex) => (
        urlIndex === index ? value : url
      )),
    }))
    setMessage(null)
  }

  const addDocumentUrl = () => {
    setForm((current) => (
      current.document_urls.length + files.length >= 5
        ? current
        : { ...current, document_urls: [...current.document_urls, ''] }
    ))
    setMessage(null)
  }

  const removeDocumentUrl = (index) => {
    setForm((current) => {
      const documentUrls = current.document_urls.filter((_, urlIndex) => urlIndex !== index)
      return { ...current, document_urls: documentUrls.length ? documentUrls : [''] }
    })
    setMessage(null)
  }

  const selectFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    event.target.value = ''
    if (!selectedFiles.length) return

    const linkCount = form.document_urls.filter((url) => url.trim()).length
    const availableSlots = Math.max(0, 5 - linkCount - files.length)
    if (selectedFiles.length > availableSlots) {
      setMessage({
        type: 'error',
        text: `เลือกเพิ่มได้อีกไม่เกิน ${availableSlots} ไฟล์ โดยหลักฐานรวมทั้งลิงก์และไฟล์ต้องไม่เกิน 5 รายการ`,
      })
      return
    }

    const oversizedFile = selectedFiles.find((selectedFile) => (
      selectedFile.size <= 0 || selectedFile.size > maxUploadBytes
    ))
    if (oversizedFile) {
      setMessage({ type: 'error', text: `ไฟล์ “${oversizedFile.name}” ต้องมีขนาดไม่เกิน 100 MB` })
      return
    }

    setFiles((current) => [...current, ...selectedFiles])
    setMessage(null)
  }

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
    setMessage(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    const linkCount = form.document_urls.filter((url) => url.trim()).length
    if (linkCount + files.length > 5) {
      setMessage({ type: 'error', text: 'เพิ่มหลักฐานได้ไม่เกิน 5 รายการ โดยนับรวมลิงก์และไฟล์ที่อัปโหลด' })
      return
    }
    setSubmitting(true)
    setUploadProgress(0)
    setMessage(null)
    try {
      const uploadedFiles = []
      for (let index = 0; index < files.length; index += 1) {
        const uploadedFile = await uploadFileToDrive(
          files[index],
          'quality-evidence',
          (progress) => setUploadProgress(Math.round(((index + (progress / 100)) / files.length) * 100)),
        )
        uploadedFiles.push(uploadedFile)
      }
      const documentUrls = [
        ...uploadedFiles.map((uploadedFile) => uploadedFile?.viewUrl),
        ...form.document_urls,
      ].filter((url) => String(url || '').trim())
      const result = await apiRequest('/api/quality-evidence', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, id: editingId, document_urls: documentUrls }),
      })
      setItems((current) =>
        sortRecords(editingId
          ? current.map((item) => (item.id === editingId ? result.evidence : item))
          : [result.evidence, ...current]),
      )
      setMessage({
        type: 'success',
        text: editingId
          ? 'บันทึกการแก้ไขหลักฐานเรียบร้อยแล้ว'
          : 'เพิ่มหลักฐานเรียบร้อยแล้ว ไฟล์ถูกฝากไว้ที่ Google Drive และข้อมูลถูกบันทึกขึ้น GitHub',
      })
      reset()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
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
          <div className="news-field news-field--wide quality-link-fields">
            <div className="quality-link-fields__heading">
              <span>ลิงก์เอกสารบน Google Drive หรือเว็บไซต์ภายนอก</span>
              <button
                type="button"
                onClick={addDocumentUrl}
                disabled={form.document_urls.length + files.length >= 5}
              >
                <Plus size={16} /> เพิ่มลิงก์
              </button>
            </div>
            {form.document_urls.map((url, index) => (
              <div className="quality-link-fields__row" key={index}>
                <input
                  type="url"
                  value={url}
                  onChange={(event) => updateDocumentUrl(index, event.target.value)}
                  placeholder={`ลิงก์หลักฐานที่ ${index + 1}`}
                  aria-label={`ลิงก์หลักฐานที่ ${index + 1}`}
                />
                {form.document_urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDocumentUrl(index)}
                    aria-label={`ลบลิงก์หลักฐานที่ ${index + 1}`}
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            ))}
            <small>เพิ่มได้สูงสุด 5 รายการ โดยนับรวมไฟล์ที่อัปโหลด</small>
          </div>
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

        <label className={`quality-file-uploader ${files.length ? 'is-selected' : ''}`}>
          <span><FileText size={27} /></span>
          <div>
            <strong>{files.length ? `เลือกแล้ว ${files.length} ไฟล์` : 'อัปโหลดไฟล์หลักฐาน'}</strong>
            <small>เลือกได้สูงสุด 5 ไฟล์ รองรับไฟล์ทุกประเภท ไฟล์ละไม่เกิน 100 MB และนับรวมกับลิงก์ด้านบน</small>
          </div>
          <input
            type="file"
            multiple
            onChange={selectFiles}
          />
        </label>

        {files.length > 0 && (
          <div className="quality-upload-files" aria-label="ไฟล์หลักฐานที่เลือก">
            {files.map((selectedFile, index) => (
              <div className="quality-upload-files__item" key={`${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}-${index}`}>
                <FileText size={17} />
                <span title={selectedFile.name}>{selectedFile.name}</span>
                <small>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</small>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`ลบไฟล์ ${selectedFile.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

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
          {submitting ? (uploadProgress ? `กำลังอัปโหลด ${uploadProgress}%` : 'กำลังบันทึก...') : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มเอกสารหลักฐาน'}
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
                  <small className="admin-record-list__links">
                    <Link2 size={12} /> {(item.document_urls?.length || 1)} รายการหลักฐาน
                  </small>
                  <small>{item.status === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}</small>
                  <RecordAudit item={item} date={item.created_at} />
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

function QaManager({ items, setItems, isAdmin, githubConfigured }) {
  const [editingItem, setEditingItem] = useState(null)
  const [answer, setAnswer] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const openEditor = (item) => {
    setEditingItem(item)
    setAnswer(item.answer || '')
    setIsPublished(item.is_published === 'true')
    setMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeEditor = () => {
    setEditingItem(null)
    setAnswer('')
    setIsPublished(false)
  }

  const save = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const result = await apiRequest('/api/services?resource=questions', {
        method: 'PUT',
        body: JSON.stringify({
          id: editingItem.id,
          answer,
          is_published: isAdmin ? isPublished : editingItem.is_published,
        }),
      })
      setItems((current) => sortRecords(
        current.map((item) => (item.id === editingItem.id ? result.question : item)),
      ))
      setMessage({ type: 'success', text: 'บันทึกคำตอบเรียบร้อยแล้ว' })
      closeEditor()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`ยืนยันการลบคำถามจาก “${item.name}” หรือไม่`)) return
    try {
      await apiRequest('/api/services?resource=questions', {
        method: 'DELETE',
        body: JSON.stringify({ id: item.id }),
      })
      setItems((current) => current.filter((question) => question.id !== item.id))
      setMessage({ type: 'success', text: 'ลบคำถามเรียบร้อยแล้ว' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <section className="admin-service-manager">
      {editingItem && (
        <form className="admin-service-editor" onSubmit={save}>
          <div className="admin-section-heading">
            <div><span>ANSWER QUESTION</span><h2>ตอบคำถามจาก {editingItem.name}</h2></div>
            <button className="admin-icon-button" type="button" onClick={closeEditor} aria-label="ยกเลิกตอบคำถาม"><X size={21} /></button>
          </div>
          <div className="admin-service-editor__question">
            <HelpCircle size={20} />
            <p>{editingItem.question}</p>
          </div>
          <label className="news-field">
            <span>คำตอบ</span>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={7}
              placeholder="พิมพ์คำตอบสำหรับผู้ถาม"
              required
            />
          </label>
          {isAdmin && (
            <label className="admin-publish-toggle">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) => setIsPublished(event.target.checked)}
              />
              <span>แสดงคำถามและคำตอบชุดนี้บนหน้าเว็บไซต์</span>
            </label>
          )}
          <button className="admin-button admin-button--primary" type="submit" disabled={submitting || !githubConfigured}>
            {submitting ? <LoaderCircle className="spin" size={19} /> : <Save size={19} />}
            {submitting ? 'กำลังบันทึก...' : 'บันทึกคำตอบ'}
          </button>
        </form>
      )}

      {message && (
        <p className={`admin-message admin-message--${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </p>
      )}

      <div className="admin-service-list">
        <div className="admin-section-heading">
          <div><span>Q&A INBOX</span><h2>คำถามจากหน้าเว็บไซต์</h2></div>
          <HelpCircle size={27} />
        </div>
        {!items.length ? (
          <div className="admin-empty"><HelpCircle size={34} /><strong>ยังไม่มีคำถามจากหน้าเว็บไซต์</strong></div>
        ) : items.map((item) => (
          <article className="admin-question-card" key={item.id}>
            <header>
              <div>
                <span>{new Date(item.created_at).toLocaleDateString('th-TH')} · {item.name}</span>
                <small>{item.email || 'ไม่ได้ระบุอีเมล'}</small>
              </div>
              <span className={`admin-content-status ${item.is_published === 'true' ? 'is-published' : ''}`}>
                {item.is_published === 'true' ? 'แสดงบนเว็บไซต์' : item.answer ? 'ตอบแล้ว / ซ่อนอยู่' : 'รอตอบ'}
              </span>
            </header>
            <h3>{item.question}</h3>
            {item.answer && (
              <div className="admin-question-card__answer">
                <strong>คำตอบ</strong>
                <p>{item.answer}</p>
                {item.answered_by_name && <small>ตอบโดย {item.answered_by_name}</small>}
              </div>
            )}
            <footer>
              <button type="button" onClick={() => openEditor(item)}><Pencil size={16} />{item.answer ? 'แก้ไขคำตอบ' : 'ตอบคำถาม'}</button>
              {isAdmin && <button type="button" className="is-danger" onClick={() => remove(item)}><Trash2 size={16} />ลบ</button>}
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}

function ComplaintsManager({ items, setItems, isAdmin, githubConfigured }) {
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({ status: 'new', internal_note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const statusLabels = { new: 'เรื่องใหม่', reviewing: 'กำลังตรวจสอบ', resolved: 'ดำเนินการแล้ว' }

  const openEditor = (item) => {
    setEditingItem(item)
    setForm({ status: item.status || 'new', internal_note: item.internal_note || '' })
    setMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeEditor = () => {
    setEditingItem(null)
    setForm({ status: 'new', internal_note: '' })
  }

  const save = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const result = await apiRequest('/api/services?resource=complaints', {
        method: 'PUT',
        body: JSON.stringify({ id: editingItem.id, ...form }),
      })
      setItems((current) => sortRecords(
        current.map((item) => (item.id === editingItem.id ? result.complaint : item)),
      ))
      setMessage({ type: 'success', text: 'อัปเดตเรื่องร้องเรียนเรียบร้อยแล้ว' })
      closeEditor()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`ยืนยันการลบเรื่อง “${item.subject}” หรือไม่`)) return
    try {
      await apiRequest('/api/services?resource=complaints', {
        method: 'DELETE',
        body: JSON.stringify({ id: item.id }),
      })
      setItems((current) => current.filter((complaint) => complaint.id !== item.id))
      setMessage({ type: 'success', text: 'ลบเรื่องร้องเรียนเรียบร้อยแล้ว' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <section className="admin-service-manager">
      {editingItem && (
        <form className="admin-service-editor" onSubmit={save}>
          <div className="admin-section-heading">
            <div><span>COMPLAINT WORKFLOW</span><h2>จัดการเรื่องร้องเรียน</h2></div>
            <button className="admin-icon-button" type="button" onClick={closeEditor} aria-label="ยกเลิกจัดการเรื่อง"><X size={21} /></button>
          </div>
          <div className="admin-service-editor__question">
            <MessageSquareWarning size={20} />
            <div><strong>{editingItem.subject}</strong><p>{editingItem.details}</p></div>
          </div>
          <div className="news-editor__grid">
            <label className="news-field">
              <span>สถานะ</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="new">เรื่องใหม่</option>
                <option value="reviewing">กำลังตรวจสอบ</option>
                <option value="resolved">ดำเนินการแล้ว</option>
              </select>
            </label>
            <label className="news-field news-field--wide">
              <span>บันทึกภายใน</span>
              <textarea
                value={form.internal_note}
                onChange={(event) => setForm((current) => ({ ...current, internal_note: event.target.value }))}
                rows={5}
                placeholder="บันทึกการตรวจสอบหรือการดำเนินงาน (ไม่แสดงบนหน้าเว็บไซต์)"
              />
            </label>
          </div>
          <button className="admin-button admin-button--primary" type="submit" disabled={submitting || !githubConfigured}>
            {submitting ? <LoaderCircle className="spin" size={19} /> : <Save size={19} />}
            {submitting ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}
          </button>
        </form>
      )}

      {message && (
        <p className={`admin-message admin-message--${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </p>
      )}

      <div className="admin-service-list">
        <div className="admin-section-heading">
          <div><span>COMPLAINT INBOX</span><h2>เรื่องร้องเรียนจากหน้าเว็บไซต์</h2></div>
          <MessageSquareWarning size={27} />
        </div>
        {!items.length ? (
          <div className="admin-empty"><MessageSquareWarning size={34} /><strong>ยังไม่มีเรื่องร้องเรียน</strong></div>
        ) : items.map((item) => (
          <article className="admin-complaint-card" key={item.id}>
            <header>
              <div>
                <span>{new Date(item.created_at).toLocaleString('th-TH')}</span>
                <h3>{item.subject}</h3>
              </div>
              <span className={`admin-content-status is-${item.status}`}>{statusLabels[item.status]}</span>
            </header>
            <p>{item.details}</p>
            <div className="admin-complaint-card__contact">
              <strong>ผู้แจ้ง:</strong> {item.complainant_name} · <strong>ติดต่อ:</strong> {item.contact}
            </div>
            {item.evidence_urls?.length > 0 && (
              <div className="admin-complaint-card__links">
                {item.evidence_urls.map((url, index) => (
                  <a href={url} target="_blank" rel="noreferrer" key={`${url}-${index}`}>
                    <Link2 size={14} /> หลักฐานที่ {index + 1}
                  </a>
                ))}
              </div>
            )}
            {item.internal_note && <div className="admin-complaint-card__note"><strong>บันทึกภายใน</strong><p>{item.internal_note}</p></div>}
            <footer>
              <button type="button" onClick={() => openEditor(item)}><Pencil size={16} />จัดการ</button>
              {isAdmin && <button type="button" className="is-danger" onClick={() => remove(item)}><Trash2 size={16} />ลบ</button>}
            </footer>
          </article>
        ))}
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
  const [documents, setDocuments] = useState([])
  const [questions, setQuestions] = useState([])
  const [complaints, setComplaints] = useState([])
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
          canManage('documents') ? apiRequest('/api/services?resource=documents') : Promise.resolve({ documents: [] }),
          canManage('qa') ? apiRequest('/api/services?resource=questions') : Promise.resolve({ questions: [] }),
          canManage('complaints') ? apiRequest('/api/services?resource=complaints') : Promise.resolve({ complaints: [] }),
          sessionData.user.role === 'admin' ? apiRequest('/api/members') : Promise.resolve({ members: [] }),
        ]
        const [
          newsData,
          eventData,
          awardData,
          newsletterData,
          qualityData,
          documentData,
          questionData,
          complaintData,
          memberData,
        ] = await Promise.all(requests)
        if (!active) return
        setNews(sortRecords(newsData.news || []))
        setEvents(sortRecords(eventData.events || []))
        setAwards(sortRecords(awardData.awards || []))
        setNewsletters(sortRecords(newsletterData.newsletters || []))
        setQualityEvidence(sortRecords(qualityData.evidence || []))
        setDocuments(sortRecords(documentData.documents || []))
        setQuestions(sortRecords(questionData.questions || []))
        setComplaints(sortRecords(complaintData.complaints || []))
        setMembers(sortRecords(memberData.members || []))
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
    documents: documents.length,
    questions: questions.filter((item) => !item.answer).length,
    complaints: complaints.filter((item) => item.status !== 'resolved').length,
    pending: members.filter((member) => member.status === 'pending').length,
  }), [news, events, awards, newsletters, qualityEvidence, documents, questions, complaints, members])

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
    { id: 'news', label: 'ข่าวสาร', icon: Megaphone },
    { id: 'events', label: 'ปฏิทินกิจกรรม', icon: CalendarDays },
    { id: 'awards', label: 'ผลงานและรางวัล', icon: Trophy },
    { id: 'newsletters', label: 'จดหมายข่าว', icon: GalleryHorizontalEnd },
    { id: 'quality', label: 'งานประกันคุณภาพ (สมศ.)', icon: ShieldCheck },
    { id: 'documents', label: 'เอกสารและแบบคำร้อง', icon: Download },
    { id: 'qa', label: `ถาม-ตอบ${stats.questions ? ` (${stats.questions})` : ''}`, icon: HelpCircle },
    { id: 'complaints', label: `เรื่องร้องเรียน${stats.complaints ? ` (${stats.complaints})` : ''}`, icon: MessageSquareWarning },
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
        {!session?.googleDriveConfigured && (
          <div className="admin-config-alert">
            <AlertCircle size={22} />
            <div><strong>รอการเชื่อมต่อ Google Drive</strong><p>การอัปโหลดไฟล์จะใช้งานได้หลังเพิ่ม OAuth 2.0 Client ID, Client Secret และ Refresh Token ใน Vercel</p></div>
          </div>
        )}

        <section className="admin-stats">
          <article><span><Newspaper size={22} /></span><div><small>ข่าวสาร</small><strong>{stats.news}</strong></div></article>
          <article><span><CalendarDays size={22} /></span><div><small>กิจกรรม</small><strong>{stats.events}</strong></div></article>
          <article><span><Trophy size={22} /></span><div><small>ผลงานและรางวัล</small><strong>{stats.awards}</strong></div></article>
          <article><span><GalleryHorizontalEnd size={22} /></span><div><small>จดหมายข่าว</small><strong>{stats.newsletters}</strong></div></article>
          <article><span><ShieldCheck size={22} /></span><div><small>หลักฐาน สมศ.</small><strong>{stats.quality}</strong></div></article>
          <article><span><Download size={22} /></span><div><small>เอกสาร</small><strong>{stats.documents}</strong></div></article>
          <article><span><HelpCircle size={22} /></span><div><small>คำถามรอตอบ</small><strong>{stats.questions}</strong></div></article>
          <article><span><MessageSquareWarning size={22} /></span><div><small>เรื่องที่กำลังดำเนินการ</small><strong>{stats.complaints}</strong></div></article>
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
        ) : activeModule === 'documents' ? (
          <RecordManager type="documents" items={documents} setItems={setDocuments} isAdmin={isAdmin} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'qa' ? (
          <QaManager items={questions} setItems={setQuestions} isAdmin={isAdmin} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'complaints' ? (
          <ComplaintsManager items={complaints} setItems={setComplaints} isAdmin={isAdmin} githubConfigured={session.githubConfigured} />
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
