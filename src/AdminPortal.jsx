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
  GripVertical,
  HelpCircle,
  Images,
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

function inferMimeTypeFromUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    if (
      url.hostname.toLowerCase() === 'drive.google.com'
      && (/\/folders\//i.test(url.pathname) || /\/folderview\/?$/i.test(url.pathname))
    ) {
      return 'application/vnd.google-apps.folder'
    }
  } catch {
    // Continue with extension-based detection.
  }
  const path = String(value || '').split(/[?#]/)[0].toLowerCase()
  const extensionTypes = {
    '.avif': 'image/avif',
    '.bmp': 'image/bmp',
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  }
  return Object.entries(extensionTypes).find(([extension]) => path.endsWith(extension))?.[1] || ''
}

function uploadMimeType(file) {
  return file?.type || inferMimeTypeFromUrl(file?.name) || 'application/octet-stream'
}

function uploadFileBytes(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', uploadUrl)
    request.setRequestHeader('Content-Type', uploadMimeType(file))
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
      const error = new Error(body.error?.message || 'อัปโหลดไฟล์ไป Google Drive ไม่สำเร็จ')
      error.uploadMayHaveCompleted = request.status === 0 || request.status === 308
      reject(error)
    }
    request.onerror = () => {
      const error = new Error('เบราว์เซอร์ไม่ได้รับผลตอบกลับจาก Google Drive')
      error.uploadMayHaveCompleted = true
      reject(error)
    }
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
      mimeType: uploadMimeType(file),
      size: file.size,
    }),
  })
  const recoverUpload = () => apiRequest('/api/services?resource=uploads', {
    method: 'POST',
    body: JSON.stringify({
      action: 'recover',
      category,
      uploadUrl: started.uploadUrl,
      size: file.size,
    }),
  })
  let uploaded
  try {
    uploaded = await uploadFileBytes(started.uploadUrl, file, onProgress)
  } catch (error) {
    if (!error.uploadMayHaveCompleted) throw error
    const recovered = await recoverUpload()
    return recovered.file
  }
  if (!uploaded.id) {
    const recovered = await recoverUpload()
    return recovered.file
  }
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
  { id: 'sar', label: 'SAR สถานศึกษา', icon: FileText },
  { id: 'documents', label: 'เอกสารและแบบคำร้อง', icon: Download },
  { id: 'qa', label: 'ถาม-ตอบ (Q&A)', icon: HelpCircle },
  { id: 'complaints', label: 'เรื่องร้องเรียน', icon: MessageSquareWarning },
  { id: 'slides', label: 'ภาพหน้าเว็บไซต์', icon: Images },
  { id: 'staff', label: 'ข้อมูลบุคลากร', icon: Users },
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
    reorderable: true,
    reorderGroup: (item) => String(item.publish_date || item.created_at || '').slice(0, 10),
    defaults: {
      title: '',
      category: 'ประชาสัมพันธ์',
      publish_date: '',
      summary: '',
      content: '',
      video_url: '',
      display_order: '',
      status: 'published',
    },
    fields: [
      { name: 'title', label: 'หัวข้อข่าว', wide: true, required: true, placeholder: 'กรอกหัวข้อข่าวหรือประกาศ' },
      { name: 'category', label: 'หมวดหมู่', type: 'select', options: ['กิจกรรม', 'ประชาสัมพันธ์', 'ประกาศ', 'วิดีโอประชาสัมพันธ์'] },
      {
        name: 'video_url',
        label: 'ลิงก์วิดีโอ YouTube หรือ Google Drive',
        type: 'url',
        wide: true,
        required: true,
        showWhen: (form) => form.category === 'วิดีโอประชาสัมพันธ์',
        placeholder: 'https://www.youtube.com/watch?v=... หรือ https://drive.google.com/file/d/...',
      },
      { name: 'publish_date', label: 'วันที่เผยแพร่', type: 'date', required: true },
      { name: 'status', label: 'สถานะ', type: 'status' },
      { name: 'summary', label: 'ข้อความสรุป', type: 'textarea', wide: true, rows: 2, placeholder: 'ข้อความสั้นสำหรับสรุปเนื้อหา' },
      { name: 'content', label: 'รายละเอียด', type: 'textarea', wide: true, rows: 7, required: true, placeholder: 'กรอกรายละเอียดข่าวสารหรือประกาศ' },
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
    reorderable: true,
    reorderGroup: (item) => String(item.award_date || item.created_at || '').slice(0, 10),
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
    reorderable: true,
    reorderGroup: (item) => String(item.publish_date || item.created_at || '').slice(0, 10),
    defaults: { issue_number: '', publish_date: '', display_order: '' },
    fields: [
      { name: 'issue_number', label: 'หมายเลขฉบับ', wide: true, required: true, placeholder: 'เช่น ฉบับที่ 1/2569' },
      { name: 'publish_date', label: 'วันที่เผยแพร่', type: 'date', required: true },
    ],
    meta: () => 'จดหมายข่าวประชาสัมพันธ์',
    date: (item) => item.publish_date || item.created_at,
    title: (item) => item.issue_number,
  },
  sar: {
    endpoint: '/api/services?resource=sar',
    responseKey: 'sarDocument',
    listKey: 'sarDocuments',
    label: 'รายงาน SAR',
    eyebrow: 'SELF ASSESSMENT REPORT',
    icon: FileText,
    attachmentUploadCategory: 'sar-pdf',
    attachmentAccept: 'application/pdf,.pdf',
    attachmentRequired: true,
    maxAttachments: 1,
    attachmentLabel: 'ลิงก์ไฟล์รายงาน SAR (PDF)',
    attachmentHint: 'รองรับลิงก์ไฟล์ PDF จาก Google Drive หรือลิงก์ PDF แบบ https',
    uploadLabel: 'อัปโหลดไฟล์รายงาน SAR',
    uploadHint: 'รองรับไฟล์ PDF 1 ไฟล์ ขนาดไม่เกิน 100 MB',
    reorderable: true,
    reorderGroup: () => '__all__',
    defaults: {
      title: '',
      academic_year: '',
      description: '',
      display_order: '',
      status: 'published',
    },
    fields: [
      { name: 'title', label: 'ชื่อรายงาน', wide: true, required: true, placeholder: 'เช่น รายงานการประเมินตนเองของสถานศึกษา ปีการศึกษา 2569' },
      { name: 'academic_year', label: 'ปีการศึกษา', required: true, placeholder: 'เช่น 2569' },
      { name: 'description', label: 'รายละเอียด', type: 'textarea', wide: true, rows: 4, placeholder: 'สรุปรายละเอียดของรายงาน SAR' },
      { name: 'status', label: 'สถานะ', type: 'status' },
    ],
    meta: (item) => `ปีการศึกษา ${item.academic_year} · ${item.status === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}`,
    date: (item) => item.updated_at || item.created_at,
    title: (item) => item.title,
    sort: sortDisplayOrderDesc,
  },
  documents: {
    endpoint: '/api/services?resource=documents',
    responseKey: 'document',
    listKey: 'documents',
    label: 'เอกสารและแบบคำร้อง',
    eyebrow: 'SCHOOL DOCUMENTS',
    icon: Download,
    attachmentUploadCategory: 'school-attachment',
    reorderable: true,
    reorderGroup: (item) => String(item.publish_date || item.created_at || '').slice(0, 10),
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
      { name: 'status', label: 'สถานะ', type: 'status' },
    ],
    meta: (item) => `${item.category} · ${item.status === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}`,
    date: (item) => item.publish_date || item.created_at,
    title: (item) => item.title,
  },
  slides: {
    endpoint: '/api/services?resource=slides',
    responseKey: 'slide',
    listKey: 'slides',
    label: 'ภาพหน้าเว็บไซต์',
    eyebrow: 'WELCOME & BILLBOARD',
    icon: Images,
    image: true,
    imageRequired: true,
    imageUploadCategory: 'site-slide-image',
    imageClass: 'image-uploader--site-slide',
    imageHint: 'หน้าต้อนรับใช้ภาพแนวตั้งหรือแนวนอนได้ · Billboard แนะนำอัตราส่วน 4:1 · JPG, PNG หรือ WebP ไม่เกิน 100 MB',
    attachments: false,
    reorderable: true,
    reorderGroup: (item) => item.placement,
    defaults: {
      placement: 'welcome',
      title: '',
      alt_text: '',
      display_order: '',
      status: 'published',
    },
    fields: [
      {
        name: 'placement',
        label: 'ตำแหน่งที่แสดง',
        type: 'select',
        options: [
          { value: 'welcome', label: 'ภาพหน้าต้อนรับ' },
          { value: 'billboard', label: 'Billboard Banner' },
        ],
      },
      { name: 'title', label: 'ชื่อภาพสำหรับจัดการ', wide: true, required: true, placeholder: 'เช่น ภาพต้อนรับเปิดภาคเรียน' },
      { name: 'alt_text', label: 'คำอธิบายภาพสำหรับผู้ใช้โปรแกรมอ่านหน้าจอ', wide: true, placeholder: 'ถ้าเว้นว่าง ระบบจะใช้ชื่อภาพแทน' },
      {
        name: 'status',
        label: 'สถานะ',
        type: 'select',
        options: [
          { value: 'published', label: 'แสดงบนเว็บไซต์' },
          { value: 'draft', label: 'ปิดการแสดง' },
        ],
      },
    ],
    meta: (item) => `${item.placement === 'billboard' ? 'Billboard Banner' : 'ภาพหน้าต้อนรับ'} · ${item.status === 'draft' ? 'ปิดการแสดง' : 'เผยแพร่'}`,
    date: (item) => item.updated_at || item.created_at,
    title: (item) => item.title,
    sort: (items) => [...items].sort((left, right) => {
      const placementDifference = String(left.placement).localeCompare(String(right.placement))
      if (placementDifference) return placementDifference
      const orderDifference = Number(left.display_order || 0) - Number(right.display_order || 0)
      if (orderDifference) return orderDifference
      return String(left.created_at || '').localeCompare(String(right.created_at || ''))
    }),
  },
  staff: {
    endpoint: '/api/services?resource=staff',
    responseKey: 'staffMember',
    listKey: 'staff',
    label: 'ข้อมูลบุคลากร',
    eyebrow: 'SCHOOL PERSONNEL',
    icon: Users,
    image: true,
    imageRequired: true,
    imageUploadCategory: 'staff-image',
    imageClass: 'image-uploader--staff',
    imageHint: 'ภาพบุคลากรอัตราส่วน 4:3 · JPG, PNG หรือ WebP ไม่เกิน 100 MB',
    attachments: false,
    reorderable: true,
    reorderGroup: (item) => item.staff_type,
    defaults: {
      staff_type: 'teacher',
      name: '',
      position: '',
      website_url: '',
      display_order: '',
      status: 'published',
    },
    fields: [
      {
        name: 'staff_type',
        label: 'กลุ่มบุคลากร',
        type: 'select',
        options: [
          { value: 'director', label: 'ผู้บริหารสถานศึกษา' },
          { value: 'teacher', label: 'ครูผู้สอน' },
          { value: 'support', label: 'บุคลากรสนับสนุน' },
        ],
      },
      { name: 'name', label: 'ชื่อ–นามสกุล', wide: true, required: true, placeholder: 'ชื่อและนามสกุลบุคลากร' },
      { name: 'position', label: 'ตำแหน่ง', wide: true, required: true, placeholder: 'เช่น ครู โรงเรียนบ้านน้ำพร' },
      { name: 'website_url', label: 'เว็บไซต์ของครู/บุคลากร', type: 'url', wide: true, placeholder: 'https://example.com (ไม่บังคับ)' },
      {
        name: 'status',
        label: 'สถานะ',
        type: 'select',
        options: [
          { value: 'published', label: 'แสดงบนเว็บไซต์' },
          { value: 'draft', label: 'ปิดการแสดง' },
        ],
      },
    ],
    meta: (item) => {
      const typeLabels = {
        director: 'ผู้บริหารสถานศึกษา',
        teacher: 'ครูผู้สอน',
        support: 'บุคลากรสนับสนุน',
      }
      return `${typeLabels[item.staff_type] || 'บุคลากร'} · ${item.status === 'draft' ? 'ปิดการแสดง' : 'เผยแพร่'}`
    },
    date: (item) => item.updated_at || item.created_at,
    title: (item) => item.name,
    sort: (items) => {
      const typeOrder = { director: 0, teacher: 1, support: 2 }
      return [...items].sort((left, right) => {
        const typeDifference = (typeOrder[left.staff_type] ?? 99) - (typeOrder[right.staff_type] ?? 99)
        if (typeDifference) return typeDifference
        const orderDifference = Number(left.display_order || 0) - Number(right.display_order || 0)
        if (orderDifference) return orderDifference
        return String(left.created_at || '').localeCompare(String(right.created_at || ''))
      })
    },
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

function sortDisplayOrderDesc(items) {
  return [...items].sort((left, right) => {
    const orderDifference = Number(right.display_order || 0) - Number(left.display_order || 0)
    if (orderDifference) return orderDifference
    return String(right.created_at || right.id || '').localeCompare(String(left.created_at || left.id || ''))
  })
}

function sortQualityEvidence(items) {
  const levelOrder = Object.fromEntries(qualityLevels.map((level, index) => [level.id, index]))
  return [...items].sort((left, right) => {
    const levelDifference = (levelOrder[left.education_level] ?? 99)
      - (levelOrder[right.education_level] ?? 99)
    if (levelDifference) return levelDifference
    const indicatorDifference = String(left.indicator_code || '').localeCompare(
      String(right.indicator_code || ''),
      'th',
      { numeric: true },
    )
    if (indicatorDifference) return indicatorDifference
    const orderDifference = Number(right.display_order || 0) - Number(left.display_order || 0)
    if (orderDifference) return orderDifference
    return String(right.created_at || right.id || '').localeCompare(String(left.created_at || left.id || ''))
  })
}

function moveRecord(items, sourceId, targetId) {
  const sourceIndex = items.findIndex((item) => item.id === sourceId)
  const targetIndex = items.findIndex((item) => item.id === targetId)
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return items
  const next = [...items]
  const [moved] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, moved)
  return next
}

function RecordManager({ type, items, setItems, isAdmin, currentUsername, githubConfigured }) {
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
  const [draggedId, setDraggedId] = useState('')
  const [dropTargetId, setDropTargetId] = useState('')
  const [orderBaseline, setOrderBaseline] = useState([])
  const [orderSaving, setOrderSaving] = useState(false)
  const [orderMessage, setOrderMessage] = useState(null)
  const maxAttachments = config.maxAttachments || 5
  const isNewsVideo = type === 'news' && form.category === 'วิดีโอประชาสัมพันธ์'
  const orderDirty = orderBaseline.length > 0
  const canModifyItem = (item) => isAdmin
    || String(item.author || '').trim() === String(currentUsername || '').trim()

  useEffect(() => {
    setForm(config.defaults)
    setEditingId(null)
    setImage(null)
    setAttachmentFiles([])
    setAttachmentUrls([''])
    setPreview('')
    setUploadProgress(0)
    setMessage(null)
    setDraggedId('')
    setDropTargetId('')
    setOrderBaseline([])
    setOrderSaving(false)
    setOrderMessage(null)
  }, [config])

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (type === 'news' && name === 'category' && value === 'วิดีโอประชาสัมพันธ์') {
      setImage(null)
      setPreview('')
      setAttachmentFiles([])
      setAttachmentUrls([''])
    }
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
    setPreview(item.category === 'วิดีโอประชาสัมพันธ์' ? '' : displayImageUrl(item.image_url))
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
      current.length + attachmentFiles.length >= maxAttachments ? current : [...current, '']
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
    const availableSlots = Math.max(0, maxAttachments - linkCount - attachmentFiles.length)
    if (selectedFiles.length > availableSlots) {
      setMessage({ type: 'error', text: `เลือกเพิ่มได้อีกไม่เกิน ${availableSlots} ไฟล์ โดยนับรวมลิงก์และไฟล์สูงสุด ${maxAttachments} รายการ` })
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
    const cleanUrls = config.attachments === false || isNewsVideo
      ? []
      : attachmentUrls.filter((url) => url.trim())
    if (cleanUrls.length + attachmentFiles.length > maxAttachments) {
      setMessage({ type: 'error', text: `แนบไฟล์หรือลิงก์ได้รวมไม่เกิน ${maxAttachments} รายการ` })
      return
    }
    if (config.attachmentRequired && cleanUrls.length + attachmentFiles.length === 0) {
      setMessage({ type: 'error', text: 'กรุณาแนบไฟล์หรือกรอกลิงก์เอกสารอย่างน้อย 1 รายการ' })
      return
    }
    setSubmitting(true)
    setUploadProgress(0)
    setMessage(null)
    try {
      const uploadedImage = image && !isNewsVideo
        ? await uploadFileToDrive(image, config.imageUploadCategory, setUploadProgress)
        : null
      const uploadedAttachments = []
      for (
        let index = 0;
        config.attachments !== false && !isNewsVideo && index < attachmentFiles.length;
        index += 1
      ) {
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
        (config.sort || sortRecords)(editingId
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

  const dragStart = (event, item) => {
    if (!isAdmin || !config.reorderable || orderSaving) {
      event.preventDefault()
      return
    }
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id)
    setDraggedId(item.id)
    setOrderMessage(null)
  }

  const dragOver = (event, item) => {
    const source = items.find((record) => record.id === draggedId)
    if (!source || source.id === item.id) return
    event.preventDefault()
    event.dataTransfer.dropEffect = config.reorderGroup(source) === config.reorderGroup(item)
      ? 'move'
      : 'none'
    setDropTargetId(item.id)
  }

  const drop = (event, item) => {
    event.preventDefault()
    const sourceId = draggedId || event.dataTransfer.getData('text/plain')
    const source = items.find((record) => record.id === sourceId)
    setDraggedId('')
    setDropTargetId('')
    if (!source || source.id === item.id) return
    if (config.reorderGroup(source) !== config.reorderGroup(item)) {
      setOrderMessage({
        type: 'error',
        text: 'รายการนี้อยู่คนละกลุ่มกัน กรุณาลากสลับภายในวันที่ ประเภท หรือตัวชี้วัดเดียวกัน',
      })
      return
    }
    setOrderBaseline((current) => current.length ? current : items.map((record) => record.id))
    setItems((current) => moveRecord(current, source.id, item.id))
    setOrderMessage(null)
  }

  const cancelOrder = () => {
    const recordById = new Map(items.map((item) => [item.id, item]))
    setItems(orderBaseline.map((id) => recordById.get(id)).filter(Boolean))
    setOrderBaseline([])
    setDraggedId('')
    setDropTargetId('')
    setOrderMessage(null)
  }

  const saveOrder = async () => {
    setOrderSaving(true)
    setOrderMessage(null)
    try {
      const result = await apiRequest('/api/services?resource=reorder', {
        method: 'POST',
        body: JSON.stringify({
          resource: type,
          orderedIds: items.map((item) => item.id),
        }),
      })
      setItems((current) => (config.sort || sortRecords)(
        current.map((item) => ({
          ...item,
          display_order: result.orders?.[item.id] || item.display_order,
        })),
      ))
      setOrderBaseline([])
      setOrderMessage({ type: 'success', text: 'บันทึกลำดับการแสดงเรียบร้อยแล้ว' })
    } catch (error) {
      setOrderMessage({ type: 'error', text: error.message })
    } finally {
      setOrderSaving(false)
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
          {config.fields.filter((field) => (
            (!field.adminOnly || isAdmin) && (!field.showWhen || field.showWhen(form))
          )).map((field) => (
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
        {config.image && !isNewsVideo && (
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
        {config.attachments !== false && !isNewsVideo && (
          <>
            <div className="news-field quality-link-fields record-attachment-links">
              <div className="quality-link-fields__heading">
                <span>{config.attachmentLabel || 'ลิงก์ไฟล์แนบ'}</span>
                <button
                  type="button"
                  onClick={addAttachmentUrl}
                  disabled={attachmentUrls.length + attachmentFiles.length >= maxAttachments}
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
              <small>{config.attachmentHint || `รองรับลิงก์ https ทุกประเภท โดยนับรวมกับไฟล์ที่อัปโหลดไม่เกิน ${maxAttachments} รายการ`}</small>
            </div>

            <label className={`quality-file-uploader ${attachmentFiles.length ? 'is-selected' : ''}`}>
                <span><FileText size={27} /></span>
                <div>
                  <strong>{attachmentFiles.length ? `เลือกแล้ว ${attachmentFiles.length} ไฟล์` : (config.uploadLabel || 'อัปโหลดไฟล์แนบ')}</strong>
                  <small>{config.uploadHint || `เลือกได้สูงสุด ${maxAttachments} ไฟล์ รองรับไฟล์ทุกประเภท ไฟล์ละไม่เกิน 100 MB และนับรวมกับลิงก์ด้านบน`}</small>
                </div>
                <input
                  type="file"
                  accept={config.attachmentAccept}
                  multiple={maxAttachments > 1}
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
          </>
        )}
        {message && (
          <p className={`admin-message admin-message--${message.type}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </p>
        )}
        <button className="admin-button admin-button--primary" type="submit" disabled={submitting || !githubConfigured || orderDirty}>
          {submitting ? <LoaderCircle className="spin" size={19} /> : <Save size={19} />}
          {submitting ? (uploadProgress ? `กำลังอัปโหลด ${uploadProgress}%` : 'กำลังบันทึก...') : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
        </button>
      </form>

      <div className="admin-list-card">
        <div className="admin-section-heading">
          <div><span>DATABASE</span><h2>รายการที่บันทึก</h2></div>
          <Icon size={27} />
        </div>
        {config.reorderable && isAdmin && items.length > 1 && (
          <div className="admin-reorder-guide">
            <GripVertical size={17} />
            <span>ลากรายการจากสัญลักษณ์ด้านซ้ายเพื่อสลับลำดับภายในกลุ่มเดียวกัน</span>
          </div>
        )}
        {orderDirty && (
          <div className="admin-reorder-confirm">
            <div>
              <strong>มีการเปลี่ยนลำดับที่ยังไม่ได้บันทึก</strong>
              <small>กดยืนยันเพื่อให้ลำดับใหม่แสดงบนเว็บไซต์</small>
            </div>
            <button type="button" className="is-cancel" onClick={cancelOrder} disabled={orderSaving}>
              ยกเลิก
            </button>
            <button type="button" className="is-save" onClick={saveOrder} disabled={orderSaving || !githubConfigured}>
              {orderSaving ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />}
              {orderSaving ? 'กำลังบันทึก...' : 'ยืนยันการเปลี่ยนลำดับ'}
            </button>
          </div>
        )}
        {orderMessage && (
          <p className={`admin-order-message is-${orderMessage.type}`}>
            {orderMessage.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
            {orderMessage.text}
          </p>
        )}
        {!items.length ? (
          <div className="admin-empty"><Icon size={34} /><strong>ยังไม่มีข้อมูลในหมวดนี้</strong></div>
        ) : (
          <div className="admin-record-list">
            {items.map((item) => (
              <article
                className={[
                  config.reorderable && isAdmin ? 'is-reorderable' : '',
                  draggedId === item.id ? 'is-dragging' : '',
                  dropTargetId === item.id ? 'is-drop-target' : '',
                ].filter(Boolean).join(' ')}
                onDragOver={(event) => dragOver(event, item)}
                onDragLeave={() => setDropTargetId('')}
                onDrop={(event) => drop(event, item)}
                key={item.id}
              >
                {config.reorderable && isAdmin && (
                  <span
                    className="admin-record-list__drag"
                    title="ลากเพื่อเปลี่ยนลำดับ"
                    draggable={!orderSaving}
                    onDragStart={(event) => dragStart(event, item)}
                    onDragEnd={() => {
                      setDraggedId('')
                      setDropTargetId('')
                    }}
                    aria-hidden="true"
                  >
                    <GripVertical size={18} />
                  </span>
                )}
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
                {canModifyItem(item) && (
                  <div className="admin-record-list__actions">
                    <button type="button" onClick={() => edit(item)} disabled={orderDirty} aria-label={`แก้ไข ${config.title(item)}`}><Pencil size={16} /></button>
                    <button type="button" className="is-danger" onClick={() => remove(item)} disabled={orderDirty} aria-label={`ลบ ${config.title(item)}`}><Trash2 size={16} /></button>
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
  document_types: [''],
  document_names: [''],
  display_order: '',
  status: 'published',
}

function QualityManager({ items, setItems, isAdmin, currentUsername, githubConfigured }) {
  const [form, setForm] = useState(qualityDefaults)
  const [editingId, setEditingId] = useState(null)
  const [files, setFiles] = useState([])
  const [fileNames, setFileNames] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState(null)
  const [draggedId, setDraggedId] = useState('')
  const [dropTargetId, setDropTargetId] = useState('')
  const [orderBaseline, setOrderBaseline] = useState([])
  const [orderSaving, setOrderSaving] = useState(false)
  const [orderMessage, setOrderMessage] = useState(null)
  const orderDirty = orderBaseline.length > 0
  const canModifyItem = (item) => isAdmin
    || String(item.author || '').trim() === String(currentUsername || '').trim()
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
    setForm({
      ...qualityDefaults,
      document_urls: [''],
      document_types: [''],
      document_names: [''],
    })
    setEditingId(null)
    setFiles([])
    setFileNames([])
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
    const documentTypes = item.document_types?.length
      ? item.document_types
      : [
          item.document_type,
          item.document_type_2,
          item.document_type_3,
          item.document_type_4,
          item.document_type_5,
        ]
    const documentNames = item.document_names?.length
      ? item.document_names
      : [
          item.document_name,
          item.document_name_2,
          item.document_name_3,
          item.document_name_4,
          item.document_name_5,
        ]
    setForm({
      ...Object.fromEntries(
        Object.keys(qualityDefaults)
          .filter((key) => !['document_urls', 'document_types', 'document_names'].includes(key))
          .map((key) => [key, item[key] || '']),
      ),
      document_urls: documentUrls.length ? documentUrls : [''],
      document_types: documentUrls.length
        ? documentUrls.map((url, index) => documentTypes[index] || inferMimeTypeFromUrl(url))
        : [''],
      document_names: documentUrls.length
        ? documentUrls.map((_, index) => documentNames[index] || '')
        : [''],
    })
    setEditingId(item.id)
    setFiles([])
    setFileNames([])
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
      document_types: current.document_types.map((type, typeIndex) => (
        typeIndex === index ? inferMimeTypeFromUrl(value) : type
      )),
    }))
    setMessage(null)
  }

  const updateDocumentName = (index, value) => {
    setForm((current) => ({
      ...current,
      document_names: current.document_names.map((name, nameIndex) => (
        nameIndex === index ? value : name
      )),
    }))
    setMessage(null)
  }

  const updateDocumentType = (index, value) => {
    setForm((current) => ({
      ...current,
      document_types: current.document_types.map((type, typeIndex) => (
        typeIndex === index ? value : type
      )),
    }))
    setMessage(null)
  }

  const addDocumentUrl = () => {
    setForm((current) => (
      current.document_urls.length + files.length >= 5
        ? current
        : {
            ...current,
            document_urls: [...current.document_urls, ''],
            document_types: [...current.document_types, ''],
            document_names: [...current.document_names, ''],
          }
    ))
    setMessage(null)
  }

  const removeDocumentUrl = (index) => {
    setForm((current) => {
      const documentUrls = current.document_urls.filter((_, urlIndex) => urlIndex !== index)
      const documentTypes = current.document_types.filter((_, typeIndex) => typeIndex !== index)
      const documentNames = current.document_names.filter((_, nameIndex) => nameIndex !== index)
      return {
        ...current,
        document_urls: documentUrls.length ? documentUrls : [''],
        document_types: documentUrls.length ? documentTypes : [''],
        document_names: documentUrls.length ? documentNames : [''],
      }
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
    setFileNames((current) => [
      ...current,
      ...selectedFiles.map((selectedFile) => selectedFile.name.replace(/\.[^.]+$/, '')),
    ])
    setMessage(null)
  }

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
    setFileNames((current) => current.filter((_, nameIndex) => nameIndex !== index))
    setMessage(null)
  }

  const updateFileName = (index, value) => {
    setFileNames((current) => current.map((name, nameIndex) => (
      nameIndex === index ? value : name
    )))
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
      const linkedEvidence = form.document_urls
        .map((url, index) => ({
          url: String(url || '').trim(),
          type: form.document_types[index] || inferMimeTypeFromUrl(url),
          name: String(form.document_names[index] || '').trim(),
        }))
        .filter((item) => item.url)
      const documentUrls = [
        ...uploadedFiles.map((uploadedFile) => uploadedFile?.viewUrl),
        ...linkedEvidence.map((item) => item.url),
      ].filter(Boolean)
      const documentTypes = [
        ...uploadedFiles.map((uploadedFile) => uploadedFile?.mimeType || ''),
        ...linkedEvidence.map((item) => item.type),
      ]
      const documentNames = [
        ...uploadedFiles.map((_, index) => String(fileNames[index] || files[index]?.name || '').trim()),
        ...linkedEvidence.map((item) => item.name),
      ]
      const result = await apiRequest('/api/quality-evidence', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...form,
          id: editingId,
          document_urls: documentUrls,
          document_types: documentTypes,
          document_names: documentNames,
        }),
      })
      setItems((current) =>
        sortQualityEvidence(editingId
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

  const qualityGroup = (item) => `${item.education_level}\u001f${item.indicator_code}`

  const dragStart = (event, item) => {
    if (!isAdmin || orderSaving) {
      event.preventDefault()
      return
    }
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id)
    setDraggedId(item.id)
    setOrderMessage(null)
  }

  const dragOver = (event, item) => {
    const source = items.find((record) => record.id === draggedId)
    if (!source || source.id === item.id) return
    event.preventDefault()
    event.dataTransfer.dropEffect = qualityGroup(source) === qualityGroup(item) ? 'move' : 'none'
    setDropTargetId(item.id)
  }

  const drop = (event, item) => {
    event.preventDefault()
    const sourceId = draggedId || event.dataTransfer.getData('text/plain')
    const source = items.find((record) => record.id === sourceId)
    setDraggedId('')
    setDropTargetId('')
    if (!source || source.id === item.id) return
    if (qualityGroup(source) !== qualityGroup(item)) {
      setOrderMessage({
        type: 'error',
        text: 'เอกสารหลักฐานต้องลากสลับภายในระดับการศึกษาและตัวชี้วัดเดียวกัน',
      })
      return
    }
    setOrderBaseline((current) => current.length ? current : items.map((record) => record.id))
    setItems((current) => moveRecord(current, source.id, item.id))
    setOrderMessage(null)
  }

  const cancelOrder = () => {
    const recordById = new Map(items.map((item) => [item.id, item]))
    setItems(orderBaseline.map((id) => recordById.get(id)).filter(Boolean))
    setOrderBaseline([])
    setDraggedId('')
    setDropTargetId('')
    setOrderMessage(null)
  }

  const saveOrder = async () => {
    setOrderSaving(true)
    setOrderMessage(null)
    try {
      const result = await apiRequest('/api/services?resource=reorder', {
        method: 'POST',
        body: JSON.stringify({
          resource: 'quality',
          orderedIds: items.map((item) => item.id),
        }),
      })
      setItems((current) => sortQualityEvidence(
        current.map((item) => ({
          ...item,
          display_order: result.orders?.[item.id] || item.display_order,
        })),
      ))
      setOrderBaseline([])
      setOrderMessage({ type: 'success', text: 'บันทึกลำดับเอกสารหลักฐานเรียบร้อยแล้ว' })
    } catch (error) {
      setOrderMessage({ type: 'error', text: error.message })
    } finally {
      setOrderSaving(false)
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
                <div className="quality-link-fields__inputs">
                  <input
                    type="text"
                    value={form.document_names[index] || ''}
                    onChange={(event) => updateDocumentName(index, event.target.value)}
                    placeholder={`ชื่อหลักฐานที่ ${index + 1}`}
                    aria-label={`ชื่อหลักฐานที่ ${index + 1}`}
                    maxLength={180}
                  />
                  <input
                    type="url"
                    value={url}
                    onChange={(event) => updateDocumentUrl(index, event.target.value)}
                    placeholder={`ลิงก์หลักฐานที่ ${index + 1}`}
                    aria-label={`ลิงก์หลักฐานที่ ${index + 1}`}
                  />
                  <select
                    value={form.document_types[index] || ''}
                    onChange={(event) => updateDocumentType(index, event.target.value)}
                    aria-label={`ประเภทไฟล์หลักฐานที่ ${index + 1}`}
                  >
                    <option value="">ตรวจชนิดไฟล์อัตโนมัติ</option>
                    <option value="application/pdf">เอกสาร PDF</option>
                    <option value="image/jpeg">รูปภาพ</option>
                    <option value="application/vnd.google-apps.folder">โฟลเดอร์ Google Drive</option>
                    <option value="application/octet-stream">ไฟล์ประเภทอื่น</option>
                  </select>
                </div>
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
            <small>ระบบตรวจชนิดไฟล์ Google Drive ให้อัตโนมัติ หรือเลือก PDF/รูปภาพด้วยตนเองได้ หากไฟล์ตั้งค่าเป็นส่วนตัวระบบอาจตรวจไม่ได้</small>
          </div>
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
                <div className="quality-upload-files__copy">
                  <span title={selectedFile.name}>{selectedFile.name}</span>
                  <input
                    type="text"
                    value={fileNames[index] || ''}
                    onChange={(event) => updateFileName(index, event.target.value)}
                    placeholder={`ชื่อหลักฐานที่ ${index + 1}`}
                    aria-label={`ชื่อหลักฐานสำหรับไฟล์ ${selectedFile.name}`}
                    maxLength={180}
                  />
                </div>
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
        <button className="admin-button admin-button--primary" type="submit" disabled={submitting || !githubConfigured || orderDirty}>
          {submitting ? <LoaderCircle className="spin" size={19} /> : <Save size={19} />}
          {submitting ? (uploadProgress ? `กำลังอัปโหลด ${uploadProgress}%` : 'กำลังบันทึก...') : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มเอกสารหลักฐาน'}
        </button>
      </form>

      <div className="admin-list-card">
        <div className="admin-section-heading">
          <div><span>EVIDENCE DATABASE</span><h2>เอกสารหลักฐานที่บันทึก</h2></div>
          <FileText size={27} />
        </div>
        {isAdmin && items.length > 1 && (
          <div className="admin-reorder-guide">
            <GripVertical size={17} />
            <span>ลากเอกสารหลักฐานเพื่อสลับลำดับภายในตัวชี้วัดเดียวกัน</span>
          </div>
        )}
        {orderDirty && (
          <div className="admin-reorder-confirm">
            <div>
              <strong>มีการเปลี่ยนลำดับที่ยังไม่ได้บันทึก</strong>
              <small>กดยืนยันเพื่อให้ลำดับหลักฐานใหม่แสดงบนเว็บไซต์</small>
            </div>
            <button type="button" className="is-cancel" onClick={cancelOrder} disabled={orderSaving}>
              ยกเลิก
            </button>
            <button type="button" className="is-save" onClick={saveOrder} disabled={orderSaving || !githubConfigured}>
              {orderSaving ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />}
              {orderSaving ? 'กำลังบันทึก...' : 'ยืนยันการเปลี่ยนลำดับ'}
            </button>
          </div>
        )}
        {orderMessage && (
          <p className={`admin-order-message is-${orderMessage.type}`}>
            {orderMessage.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
            {orderMessage.text}
          </p>
        )}
        {!items.length ? (
          <div className="admin-empty"><FileText size={34} /><strong>ยังไม่มีเอกสารหลักฐาน</strong></div>
        ) : (
          <div className="admin-record-list quality-record-list">
            {items.map((item) => (
              <article
                className={[
                  isAdmin ? 'is-reorderable' : '',
                  draggedId === item.id ? 'is-dragging' : '',
                  dropTargetId === item.id ? 'is-drop-target' : '',
                ].filter(Boolean).join(' ')}
                onDragOver={(event) => dragOver(event, item)}
                onDragLeave={() => setDropTargetId('')}
                onDrop={(event) => drop(event, item)}
                key={item.id}
              >
                {isAdmin && (
                  <span
                    className="admin-record-list__drag"
                    title="ลากเพื่อเปลี่ยนลำดับ"
                    draggable={!orderSaving}
                    onDragStart={(event) => dragStart(event, item)}
                    onDragEnd={() => {
                      setDraggedId('')
                      setDropTargetId('')
                    }}
                    aria-hidden="true"
                  >
                    <GripVertical size={18} />
                  </span>
                )}
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
                {canModifyItem(item) && (
                  <div className="admin-record-list__actions">
                    <button type="button" onClick={() => edit(item)} disabled={orderDirty} aria-label={`แก้ไข ${item.title}`}><Pencil size={16} /></button>
                    <button type="button" className="is-danger" onClick={() => remove(item)} disabled={orderDirty} aria-label={`ลบ ${item.title}`}><Trash2 size={16} /></button>
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
  const [deletingId, setDeletingId] = useState(null)
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

  useEffect(() => {
    if (!editingMember) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !submitting) {
        setEditingMember(null)
        setShowPassword(false)
        setMessage(null)
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [editingMember, submitting])

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

  const removeMember = async (member) => {
    if (member.username === currentUsername) return
    if (!window.confirm(`ยืนยันการลบสมาชิก “${member.displayName}” (@${member.username}) ออกจากระบบหรือไม่\n\nสมาชิกจะไม่สามารถเข้าสู่ระบบได้อีก และการดำเนินการนี้ไม่สามารถย้อนกลับได้`)) return
    setDeletingId(member.id)
    setMessage(null)
    try {
      await apiRequest('/api/members', {
        method: 'DELETE',
        body: JSON.stringify({ id: member.id }),
      })
      setMembers((current) => current.filter((item) => item.id !== member.id))
      if (editingMember?.id === member.id) closeEditor()
      setMessage({ type: 'success', text: `ลบสมาชิก “${member.displayName}” ออกจากระบบเรียบร้อยแล้ว` })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setDeletingId(null)
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
        <div
          className="admin-member-modal"
          role="presentation"
          onMouseDown={() => { if (!submitting) closeEditor() }}
        >
        <form
          className="admin-member-editor"
          onSubmit={saveMember}
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-editor-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="admin-member-editor__heading">
            <div>
              <span><User size={18} /></span>
              <div><strong id="member-editor-title">แก้ไขข้อมูลผู้ใช้งาน</strong><small>รหัสสมาชิก: {editingMember.id}</small></div>
            </div>
            <button type="button" onClick={closeEditor} disabled={submitting} aria-label="ปิดแบบฟอร์มแก้ไขสมาชิก">
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
            <button type="button" onClick={closeEditor} disabled={submitting}>ยกเลิก</button>
            <button type="submit" className="is-primary" disabled={submitting}>
              {submitting ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />}
              {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสมาชิก'}
            </button>
          </div>
        </form>
        </div>
      )}
      {message && !editingMember && (
        <p className={`admin-message admin-message--${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </p>
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
              {member.username !== currentUsername && (
                <button
                  type="button"
                  className="is-delete"
                  onClick={() => removeMember(member)}
                  disabled={deletingId === member.id}
                >
                  {deletingId === member.id ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}
                  {deletingId === member.id ? 'กำลังลบ...' : 'ลบสมาชิก'}
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
  const [sarDocuments, setSarDocuments] = useState([])
  const [documents, setDocuments] = useState([])
  const [questions, setQuestions] = useState([])
  const [complaints, setComplaints] = useState([])
  const [siteSlides, setSiteSlides] = useState([])
  const [staff, setStaff] = useState([])
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
          canManage('sar') ? apiRequest('/api/services?resource=sar') : Promise.resolve({ sarDocuments: [] }),
          canManage('documents') ? apiRequest('/api/services?resource=documents') : Promise.resolve({ documents: [] }),
          canManage('qa') ? apiRequest('/api/services?resource=questions') : Promise.resolve({ questions: [] }),
          canManage('complaints') ? apiRequest('/api/services?resource=complaints') : Promise.resolve({ complaints: [] }),
          canManage('slides') ? apiRequest('/api/services?resource=slides') : Promise.resolve({ slides: [] }),
          canManage('staff') ? apiRequest('/api/services?resource=staff') : Promise.resolve({ staff: [] }),
          sessionData.user.role === 'admin' ? apiRequest('/api/members') : Promise.resolve({ members: [] }),
        ]
        const [
          newsData,
          eventData,
          awardData,
          newsletterData,
          qualityData,
          sarData,
          documentData,
          questionData,
          complaintData,
          siteSlideData,
          staffData,
          memberData,
        ] = await Promise.all(requests)
        if (!active) return
        setNews(sortRecords(newsData.news || []))
        setEvents(sortRecords(eventData.events || []))
        setAwards(sortRecords(awardData.awards || []))
        setNewsletters(sortRecords(newsletterData.newsletters || []))
        setQualityEvidence(sortQualityEvidence(qualityData.evidence || []))
        setSarDocuments(modules.sar.sort(sarData.sarDocuments || []))
        setDocuments(sortRecords(documentData.documents || []))
        setQuestions(sortRecords(questionData.questions || []))
        setComplaints(sortRecords(complaintData.complaints || []))
        setSiteSlides(modules.slides.sort(siteSlideData.slides || []))
        setStaff(modules.staff.sort(staffData.staff || []))
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
    sar: sarDocuments.length,
    documents: documents.length,
    questions: questions.filter((item) => !item.answer).length,
    complaints: complaints.filter((item) => item.status !== 'resolved').length,
    slides: siteSlides.filter((item) => item.status === 'published').length,
    staff: staff.filter((item) => item.status === 'published').length,
    pending: members.filter((member) => member.status === 'pending').length,
  }), [news, events, awards, newsletters, qualityEvidence, sarDocuments, documents, questions, complaints, siteSlides, staff, members])

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
    { id: 'sar', label: 'SAR สถานศึกษา', icon: FileText },
    { id: 'documents', label: 'เอกสารและแบบคำร้อง', icon: Download },
    { id: 'qa', label: `ถาม-ตอบ${stats.questions ? ` (${stats.questions})` : ''}`, icon: HelpCircle },
    { id: 'complaints', label: `เรื่องร้องเรียน${stats.complaints ? ` (${stats.complaints})` : ''}`, icon: MessageSquareWarning },
    { id: 'slides', label: 'ภาพหน้าเว็บไซต์', icon: Images },
    { id: 'staff', label: 'ข้อมูลบุคลากร', icon: Users },
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
          <article><span><FileText size={22} /></span><div><small>รายงาน SAR</small><strong>{stats.sar}</strong></div></article>
          <article><span><Download size={22} /></span><div><small>เอกสาร</small><strong>{stats.documents}</strong></div></article>
          <article><span><HelpCircle size={22} /></span><div><small>คำถามรอตอบ</small><strong>{stats.questions}</strong></div></article>
          <article><span><MessageSquareWarning size={22} /></span><div><small>เรื่องที่กำลังดำเนินการ</small><strong>{stats.complaints}</strong></div></article>
          <article><span><Images size={22} /></span><div><small>ภาพหน้าเว็บไซต์ที่เผยแพร่</small><strong>{stats.slides}</strong></div></article>
          <article><span><Users size={22} /></span><div><small>บุคลากรที่เผยแพร่</small><strong>{stats.staff}</strong></div></article>
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
          <RecordManager type="events" items={events} setItems={setEvents} isAdmin={isAdmin} currentUsername={session.user.username} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'awards' ? (
          <RecordManager type="awards" items={awards} setItems={setAwards} isAdmin={isAdmin} currentUsername={session.user.username} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'newsletters' ? (
          <RecordManager type="newsletters" items={newsletters} setItems={setNewsletters} isAdmin={isAdmin} currentUsername={session.user.username} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'quality' ? (
          <QualityManager
            items={qualityEvidence}
            setItems={setQualityEvidence}
            isAdmin={isAdmin}
            currentUsername={session.user.username}
            githubConfigured={session.githubConfigured}
          />
        ) : activeModule === 'sar' ? (
          <RecordManager type="sar" items={sarDocuments} setItems={setSarDocuments} isAdmin={isAdmin} currentUsername={session.user.username} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'documents' ? (
          <RecordManager type="documents" items={documents} setItems={setDocuments} isAdmin={isAdmin} currentUsername={session.user.username} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'qa' ? (
          <QaManager items={questions} setItems={setQuestions} isAdmin={isAdmin} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'complaints' ? (
          <ComplaintsManager items={complaints} setItems={setComplaints} isAdmin={isAdmin} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'slides' ? (
          <RecordManager type="slides" items={siteSlides} setItems={setSiteSlides} isAdmin={isAdmin} currentUsername={session.user.username} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'staff' ? (
          <RecordManager type="staff" items={staff} setItems={setStaff} isAdmin={isAdmin} currentUsername={session.user.username} githubConfigured={session.githubConfigured} />
        ) : activeModule === 'none' ? (
          <div className="admin-empty admin-no-permission">
            <ShieldCheck size={36} />
            <strong>ยังไม่ได้รับสิทธิ์จัดการข้อมูล</strong>
            <p>กรุณาติดต่อผู้ดูแลระบบเพื่อกำหนดส่วนงานที่รับผิดชอบ</p>
          </div>
        ) : (
          <RecordManager type="news" items={news} setItems={setNews} isAdmin={isAdmin} currentUsername={session.user.username} githubConfigured={session.githubConfigured} />
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
