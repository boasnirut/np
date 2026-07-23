import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUp,
  Bell,
  BookOpenText,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  HelpCircle,
  History,
  Images,
  Leaf,
  Link2,
  LoaderCircle,
  LogIn,
  Mail,
  MapPin,
  Menu,
  MessageSquareWarning,
  Newspaper,
  Phone,
  Plus,
  Quote,
  RotateCcw,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  activityItems,
  contactDetails,
  navItems,
  newsItems,
  schoolInfo,
  services,
  trustPoints,
  values,
} from './content'
import { displayImageUrl, displayPdfUrl } from './driveUrls'
import { qualityLevels } from './qualityStandards'

const categories = ['ทั้งหมด', 'กิจกรรม', 'ประชาสัมพันธ์', 'ประกาศ']
const welcomeSlides = [
  { src: '/P10.jpg', alt: 'สถิตกลางใจปวงประชา สมเด็จพระเจ้าลูกเธอ เจ้าฟ้าพัชรกิติยาภา' },
  { src: '/Q9.jpg', alt: 'สถิตในดวงใจตราบนิจนิรันดร์ สมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ' },
]
const billboardSlides = [
  { src: '/B1.jpg', alt: 'ป้ายประชาสัมพันธ์โรงเรียนบ้านน้ำพร ภาพที่ 1' },
  { src: '/B2.jpg', alt: 'ป้ายประชาสัมพันธ์โรงเรียนบ้านน้ำพร ภาพที่ 2' },
  { src: '/B3.jpg', alt: 'ป้ายประชาสัมพันธ์โรงเรียนบ้านน้ำพร ภาพที่ 3' },
  { src: '/B4.jpg', alt: 'ป้ายประชาสัมพันธ์โรงเรียนบ้านน้ำพร ภาพที่ 4' },
]

function contentAttachmentUrls(item) {
  return [...new Set([
    ...(Array.isArray(item?.document_urls) ? item.document_urls : []),
    item?.document_url,
    item?.document_url_2,
    item?.document_url_3,
    item?.document_url_4,
    item?.document_url_5,
    item?.photo_url,
  ].map((url) => String(url || '').trim()).filter(Boolean))].slice(0, 5)
}

function AttachmentLinks({ item, compact = false }) {
  const urls = contentAttachmentUrls(item)
  if (!urls.length) return null
  return (
    <div className={`content-links ${compact ? 'content-links--compact' : ''}`}>
      {urls.map((url, index) => (
        <a href={url} target="_blank" rel="noreferrer" key={url}>
          <FileText size={compact ? 16 : 18} /> ไฟล์แนบ {index + 1}
        </a>
      ))}
    </div>
  )
}
const getLocalDateKey = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function AutoFitText({ as: Component = 'span', children, className = '', minSize = 9 }) {
  const textRef = useRef(null)

  useEffect(() => {
    const element = textRef.current
    if (!element) return undefined

    let frame
    const fit = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        element.style.fontSize = ''
        const maximum = Number.parseFloat(window.getComputedStyle(element).fontSize)
        if (!element.clientWidth || element.scrollWidth <= element.clientWidth) return

        let low = minSize
        let high = maximum
        for (let index = 0; index < 12; index += 1) {
          const size = (low + high) / 2
          element.style.fontSize = `${size}px`
          if (element.scrollWidth <= element.clientWidth) low = size
          else high = size
        }
        element.style.fontSize = `${low}px`
      })
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [children, minSize])

  return (
    <Component ref={textRef} className={`auto-fit-line ${className}`.trim()}>
      {children}
    </Component>
  )
}

function WelcomeSlider() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem('ban-nam-phon-welcome-hidden-date') !== getLocalDateKey()
    } catch {
      return true
    }
  })
  const [activeSlide, setActiveSlide] = useState(0)
  const [hideToday, setHideToday] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % welcomeSlides.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [isOpen, activeSlide])

  useEffect(() => {
    document.body.classList.toggle('welcome-open', isOpen)
    return () => document.body.classList.remove('welcome-open')
  }, [isOpen])

  const enterWebsite = () => {
    if (hideToday) {
      try {
        localStorage.setItem('ban-nam-phon-welcome-hidden-date', getLocalDateKey())
      } catch {
        // Continue into the website even when storage is unavailable.
      }
    }
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-label="ข่าวประชาสัมพันธ์">
      <div className="welcome-overlay__backdrop" aria-hidden="true" />
      <section className="welcome-slider">
        <div className="welcome-slider__stage">
          {welcomeSlides.map((slide, index) => (
            <img
              key={slide.src}
              className={`welcome-slider__image ${activeSlide === index ? 'is-active' : ''}`}
              src={slide.src}
              alt={slide.alt}
              aria-hidden={activeSlide !== index}
            />
          ))}
        </div>

        <div className="welcome-slider__controls">
          <div className="welcome-slider__dots" role="group" aria-label="เลือกภาพประชาสัมพันธ์">
            {welcomeSlides.map((slide, index) => (
              <button
                key={slide.src}
                className={activeSlide === index ? 'is-active' : ''}
                type="button"
                aria-label={`แสดงภาพที่ ${index + 1}`}
                aria-pressed={activeSlide === index}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>

          <label className="welcome-slider__remember">
            <input
              type="checkbox"
              checked={hideToday}
              onChange={(event) => setHideToday(event.target.checked)}
            />
            <span className="welcome-slider__check"><Check size={15} /></span>
            ไม่แสดงข้อความนี้อีกวันนี้
          </label>

          <button className="welcome-slider__enter" type="button" onClick={enterWebsite}>
            เข้าสู่เว็บไซต์
            <ArrowRight size={19} />
          </button>
        </div>
      </section>
    </div>
  )
}

function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <span className="eyebrow">
        <span className="eyebrow__dot" />
        {eyebrow}
      </span>
      <AutoFitText as="h2" minSize={18}>{title}</AutoFitText>
      {description && <p>{description}</p>}
    </div>
  )
}

function Header({ menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [openMobileSection, setOpenMobileSection] = useState(null)
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const isItemActive = (item) =>
    item.children
      ? item.children.some((child) => child.href === currentPath)
      : item.href === currentPath

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => {
    setMenuOpen(false)
    setOpenDropdown(null)
    setOpenMobileSection(null)
  }

  return (
    <>
      <div className="notice-bar">
        <div className="container notice-bar__inner">
          <div className="notice-bar__message">
            <Bell size={15} aria-hidden="true" />
            <AutoFitText>ยินดีต้อนรับสู่เว็บไซต์โรงเรียนบ้านน้ำพร Bannamporn School</AutoFitText>
          </div>
          <div className="notice-bar__links">
            <a href={contactDetails.phoneHref}>
              <Phone size={14} aria-hidden="true" />
              {contactDetails.phone}
            </a>
            <span className="notice-bar__divider" />
            <span>จันทร์–ศุกร์ 08.00–16.30 น.</span>
          </div>
        </div>
      </div>

      <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
        <div className="container site-header__inner">
          <a className="brand" href="/" onClick={closeMenu} aria-label="โรงเรียนบ้านน้ำพร หน้าแรก">
            <span className="brand__logo">
              <img src="/np.png" alt="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร" />
            </span>
            <span className="brand__text">
              <AutoFitText as="strong">{schoolInfo.thaiName}</AutoFitText>
              <AutoFitText as="small">{schoolInfo.englishName}</AutoFitText>
            </span>
          </a>

          <nav className="desktop-nav" aria-label="เมนูหลัก">
            {navItems.map((item) =>
              item.children ? (
                <div
                  className={`nav-dropdown ${openDropdown === item.label ? 'nav-dropdown--open' : ''}`}
                  key={item.label}
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={`nav-dropdown__trigger ${isItemActive(item) ? 'is-active' : ''}`}
                    type="button"
                    aria-expanded={openDropdown === item.label}
                    onClick={() =>
                      setOpenDropdown((current) => (current === item.label ? null : item.label))
                    }
                  >
                    {item.label}
                    <ChevronDown size={15} aria-hidden="true" />
                  </button>
                  <div className="nav-dropdown__menu">
                    <span className="nav-dropdown__eyebrow">{item.label}</span>
                    {item.children.map((child) => (
                      <a
                        className={child.href === currentPath ? 'is-active' : ''}
                        key={`${item.label}-${child.label}`}
                        href={child.href}
                        target={child.external ? '_blank' : undefined}
                        rel={child.external ? 'noreferrer' : undefined}
                        onClick={closeMenu}
                      >
                        <span>{child.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  className={isItemActive(item) ? 'is-active' : ''}
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <a className="header-contact" href="/login" onClick={closeMenu}>
            เข้าสู่ระบบ
            <ArrowRight size={17} aria-hidden="true" />
          </a>

          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <div className={`mobile-nav ${menuOpen ? 'mobile-nav--open' : ''}`}>
          <nav className="container" aria-label="เมนูมือถือ">
            {navItems.map((item) =>
              item.children ? (
                <div
                  className={`mobile-nav__group ${openMobileSection === item.label ? 'mobile-nav__group--open' : ''}`}
                  key={item.label}
                >
                  <button
                    className={isItemActive(item) ? 'is-active' : ''}
                    type="button"
                    aria-expanded={openMobileSection === item.label}
                    onClick={() =>
                      setOpenMobileSection((current) => (current === item.label ? null : item.label))
                    }
                  >
                    {item.label}
                    <ChevronDown size={18} />
                  </button>
                  <div className="mobile-nav__submenu">
                    {item.children.map((child) => (
                      <a
                        className={child.href === currentPath ? 'is-active' : ''}
                        key={`${item.label}-${child.label}`}
                        href={child.href}
                        target={child.external ? '_blank' : undefined}
                        rel={child.external ? 'noreferrer' : undefined}
                        onClick={closeMenu}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  className={isItemActive(item) ? 'is-active' : ''}
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              ),
            )}
            <a className="mobile-nav__phone" href="/login">
              <LogIn size={18} />
              เข้าสู่ระบบ
            </a>
          </nav>
        </div>
      </header>
    </>
  )
}

function Hero() {
  return (
    <main id="home">
      <section className="hero">
        <div className="hero__texture" aria-hidden="true" />
        <div className="hero__orb hero__orb--one" aria-hidden="true" />
        <div className="hero__orb hero__orb--two" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="hero__badge">
              <Sparkles size={16} aria-hidden="true" />
              พื้นที่แห่งการเรียนรู้ของชุมชน
            </div>
            <AutoFitText as="p" className="hero__kicker">
              WELCOME TO BANNAMPORN SCHOOL
            </AutoFitText>
            <h1>
              <AutoFitText as="span" className="hero__title-line" minSize={20}>
                เรียนรู้อย่างมีความสุข
              </AutoFitText>
              <AutoFitText
                as="span"
                className="hero__title-line hero__title-line--accent"
                minSize={20}
              >
                เติบโตอย่างมีคุณภาพ
              </AutoFitText>
            </h1>
            <AutoFitText as="p" className="hero__lead" minSize={6}>
              เปิดสอนตั้งแต่ชั้นอนุบาล 2 - ม.3 เป็นโรงเรียนขยายโอกาส
              สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาเลย เขต 1
            </AutoFitText>
            <div className="hero__actions">
              <a className="button button--gold" href="#news">
                ดูข่าวสารล่าสุด
                <ArrowRight size={19} aria-hidden="true" />
              </a>
              <a className="button button--ghost" href="#about">
                รู้จักโรงเรียน
              </a>
            </div>
            <div className="hero__trust">
              {trustPoints.map(({ icon: Icon, label }) => (
                <span key={label}>
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="hero__visual" aria-label="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร">
            <div className="hero__ring hero__ring--outer" />
            <div className="hero__ring hero__ring--inner" />
            <div className="hero__logo-card">
              <div className="hero__logo-glow" />
              <img src="/np.png" alt="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร" />
            </div>
            <div className="hero__floating hero__floating--top">
              <span className="hero__floating-icon">
                <Leaf size={20} />
              </span>
              <span>
                <small>แนวคิดของเรา</small>
                <strong>รากฐานมั่นคง</strong>
              </span>
            </div>
            <div className="hero__floating hero__floating--bottom">
              <span className="hero__floating-check">
                <Check size={17} />
              </span>
              <span>
                <strong>เด็กทุกคนสำคัญ</strong>
                <small>ดูแลอย่างทั่วถึง</small>
              </span>
            </div>
          </div>
        </div>
        <div className="hero__wave" aria-hidden="true">
          <svg viewBox="0 0 1440 92" preserveAspectRatio="none">
            <path d="M0,56 C240,100 460,2 720,47 C980,93 1200,18 1440,53 L1440,92 L0,92 Z" />
          </svg>
        </div>
      </section>

    </main>
  )
}

function About() {
  return (
    <section className="section about" id="about">
      <div className="container about__grid">
        <div className="about__visual reveal">
          <div className="about__image about__image--director">
            <img src="/PO.png" alt="นางศิวาลัย แก้วเขียว ผู้อำนวยการโรงเรียนบ้านน้ำพร" />
            <div className="about__image-overlay">
              <span>ผู้อำนวยการโรงเรียน</span>
              <AutoFitText as="strong" minSize={13}>นางศิวาลัย แก้วเขียว</AutoFitText>
            </div>
          </div>
          <div className="about__seal" aria-label="โรงเรียนบ้านน้ำพร">
            <School size={45} aria-hidden="true" />
          </div>
          <div className="about__dots" aria-hidden="true" />
        </div>

        <div className="about__content reveal">
          <SectionHeading
            eyebrow="รู้จักโรงเรียนของเรา"
            title="เรียนรู้ต่อเนื่อง เติบโตอย่างมีคุณภาพ"
            description={`${schoolInfo.summary} มุ่งสร้างพื้นที่เรียนรู้ที่ปลอดภัย เป็นมิตร และเชื่อมโยงกับชีวิตจริง`}
          />
          <div className="values-list">
            {values.map((item) => (
              <article className="value-item" key={item.number}>
                <span className="value-item__number">{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
          <a className="text-link" href="#contact">
            พูดคุยกับโรงเรียน
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}

function Billboard() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % billboardSlides.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="billboard" aria-label="ป้ายประชาสัมพันธ์โรงเรียน">
      <div className="container">
        <div className="billboard__frame">
          {billboardSlides.map((slide, index) => (
            <img
              className={`billboard__image ${activeSlide === index ? 'is-active' : ''}`}
              src={slide.src}
              alt={slide.alt}
              aria-hidden={activeSlide !== index}
              key={slide.src}
            />
          ))}
        </div>
        <div className="billboard__dots" role="group" aria-label="เลือกภาพป้ายประชาสัมพันธ์">
          {billboardSlides.map((slide, index) => (
            <button
              className={activeSlide === index ? 'is-active' : ''}
              type="button"
              aria-label={`แสดงป้ายประชาสัมพันธ์ภาพที่ ${index + 1}`}
              aria-pressed={activeSlide === index}
              onClick={() => setActiveSlide(index)}
              key={slide.src}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function Pagination({ currentPage, totalPages, onChange, label }) {
  if (totalPages <= 1) return null
  const visiblePages = Array.from(
    new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages]),
  ).filter((page) => page >= 1 && page <= totalPages)

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        aria-label="หน้าก่อนหน้า"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        <ChevronLeft size={18} />
      </button>
      {visiblePages.map((page, index) => (
        <span className="pagination__item" key={page}>
          {index > 0 && page - visiblePages[index - 1] > 1 && (
            <span className="pagination__ellipsis" aria-hidden="true">…</span>
          )}
          <button
            className={page === currentPage ? 'is-active' : ''}
            type="button"
            aria-label={`หน้า ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        </span>
      ))}
      <button
        type="button"
        aria-label="หน้าถัดไป"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}

function News({
  liveNews = [],
  fixedCategory = '',
  paginate = true,
  eyebrow = 'ข่าวสารและประกาศ',
  title = 'เรื่องราวล่าสุดจากโรงเรียน',
  description = 'ติดตามประกาศ กิจกรรม และเรื่องราวการเรียนรู้ได้จากพื้นที่นี้',
}) {
  const [activeCategory, setActiveCategory] = useState(fixedCategory || 'ทั้งหมด')
  const [activeNews, setActiveNews] = useState(null)
  const [page, setPage] = useState(1)
  const sourceNews = useMemo(
    () =>
      liveNews.length
        ? liveNews.map((item, index) => ({
            ...item,
            date: new Date(
              item.publish_date
                ? `${item.publish_date}T00:00:00`
                : item.created_at,
            ).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            excerpt: item.summary || item.content,
            icon: Bell,
            accent: index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'green' : 'gold',
            featured: index === 0,
          }))
        : newsItems,
    [liveNews],
  )
  const filteredNews = useMemo(
    () =>
      activeCategory === 'ทั้งหมด'
        ? sourceNews
        : sourceNews.filter((item) => item.category === activeCategory),
    [activeCategory, sourceNews],
  )
  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const displayedNews = paginate
    ? filteredNews.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredNews

  useEffect(() => {
    if (!activeNews) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setActiveNews(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [activeNews])

  return (
    <>
      <section className="section news" id="news">
        <div className="container">
          <div className="news__header reveal">
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              description={description}
            />
            {!fixedCategory && <div className="news__filters" role="group" aria-label="กรองหมวดหมู่ข่าว">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={activeCategory === category ? 'active' : ''}
                  aria-pressed={activeCategory === category}
                  onClick={() => {
                    setActiveCategory(category)
                    setPage(1)
                  }}
                >
                  {category}
                </button>
              ))}
            </div>}
          </div>

          {displayedNews.length ? (
            <div className="news__grid">
              {displayedNews.map(({ icon: Icon, ...item }, index) => (
              <article
                className={`news-card news-card--${item.accent} ${index === 0 ? 'news-card--featured' : ''}`}
                key={item.title}
              >
                <div className="news-card__visual">
                  {!item.image_url && <div className="news-card__pattern" aria-hidden="true" />}
                  {item.image_url ? (
                    <img src={displayImageUrl(item.image_url)} alt="" />
                  ) : (
                    <Icon size={item.featured ? 64 : 48} strokeWidth={1.35} aria-hidden="true" />
                  )}
                  <span className="news-card__category">{item.category}</span>
                </div>
                <div className="news-card__body">
                  <div className="news-card__date">
                    <Clock3 size={15} aria-hidden="true" />
                    {item.date}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <button
                    className="news-card__link"
                    type="button"
                    aria-label={`อ่านเพิ่มเติม: ${item.title}`}
                    onClick={() => setActiveNews(item)}
                  >
                    อ่านเพิ่มเติม
                    <ArrowRight size={17} />
                  </button>
                </div>
              </article>
              ))}
            </div>
          ) : (
            <div className="content-empty">
              <span><Newspaper size={34} /></span>
              <strong>ยังไม่มีข้อมูลในหมวดนี้</strong>
              <p>เมื่อโรงเรียนเผยแพร่ข้อมูล รายการจะแสดงในหน้านี้โดยอัตโนมัติ</p>
            </div>
          )}

          {paginate && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setPage}
              label="เลือกหน้าข่าวสารและประกาศ"
            />
          )}
        </div>
      </section>

      {activeNews && (
        <div className="modal" role="presentation" onMouseDown={() => setActiveNews(null)}>
          <article
            className="modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal__close"
              type="button"
              aria-label="ปิดรายละเอียดข่าว"
              onClick={() => setActiveNews(null)}
            >
              <X size={20} />
            </button>
            <span className="modal__category">{activeNews.category}</span>
            <div className="modal__date">
              <Clock3 size={15} />
              {activeNews.date}
            </div>
            <h2 id="news-dialog-title">{activeNews.title}</h2>
            {activeNews.image_url && <img className="modal__image" src={displayImageUrl(activeNews.image_url)} alt="" />}
            <p className="modal__content">{activeNews.content || activeNews.excerpt}</p>
            <AttachmentLinks item={activeNews} />
            <div className="modal__note">
              <Bell size={18} />
              โปรดติดตามรายละเอียดเพิ่มเติมและประกาศฉบับเต็มจากทางโรงเรียน
            </div>
            <a className="button button--navy" href="/contact" onClick={() => setActiveNews(null)}>
              สอบถามโรงเรียน
              <ArrowRight size={18} />
            </a>
          </article>
        </div>
      )}
    </>
  )
}

function Newsletters({ newsletters = [], paginate = true }) {
  const [page, setPage] = useState(1)
  const pageSize = 4
  const totalPages = Math.max(1, Math.ceil(newsletters.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const displayedItems = paginate
    ? newsletters.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : newsletters

  return (
    <section className="section newsletters" id="newsletters">
      <div className="container">
        <SectionHeading
          eyebrow="จดหมายข่าวประชาสัมพันธ์"
          title="สรุปเรื่องราวและกิจกรรมของโรงเรียน"
          description="ติดตามจดหมายข่าวประชาสัมพันธ์โรงเรียนบ้านน้ำพรในรูปแบบที่อ่านง่ายและเปิดดูฉบับเต็มได้"
          align="center"
        />
        {displayedItems.length ? (
          <>
            <div className="newsletters__grid">
              {displayedItems.map((item) => (
                <article className="newsletter-card" key={item.id}>
                  <a href={displayImageUrl(item.image_url)} target="_blank" rel="noreferrer" aria-label={`เปิดจดหมายข่าว ${item.issue_number}`}>
                    <img src={displayImageUrl(item.image_url)} alt={`จดหมายข่าวประชาสัมพันธ์ ${item.issue_number}`} />
                    <span><ExternalLink size={17} /> เปิดดูฉบับเต็ม</span>
                  </a>
                  <div>
                    <Newspaper size={20} />
                    <span>
                      <strong>{item.issue_number}</strong>
                      <small>
                        {new Date(
                          item.publish_date
                            ? `${item.publish_date}T00:00:00`
                            : item.created_at,
                        ).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </small>
                    </span>
                  </div>
                  <AttachmentLinks item={item} compact />
                </article>
              ))}
            </div>
            {paginate && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={setPage}
                label="เลือกหน้าจดหมายข่าวประชาสัมพันธ์"
              />
            )}
          </>
        ) : (
          <div className="newsletters__empty">
            <span><Newspaper size={38} /></span>
            <strong>พื้นที่รวบรวมจดหมายข่าวประชาสัมพันธ์</strong>
            <p>จดหมายข่าวที่เผยแพร่จากระบบบริหารจะแสดงในส่วนนี้</p>
          </div>
        )}
      </div>
    </section>
  )
}

function Activities({ liveEvents = [] }) {
  const displayedEvents = liveEvents.length
    ? liveEvents.map((item, index) => {
        const date = new Date(`${item.event_date}T00:00:00`)
        return {
          id: item.id,
          day: String(date.getDate()).padStart(2, '0'),
          month: date.toLocaleDateString('th-TH', { month: 'short' }),
          title: item.title,
          meta: [item.start_time ? `${item.start_time} น.` : '', item.location, item.details]
            .filter(Boolean)
            .join(' · '),
          document_urls: contentAttachmentUrls(item),
          color: index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'green' : 'gold',
        }
      })
    : activityItems
  const calendarHeading = liveEvents.length
    ? new Date(`${liveEvents[0].event_date}T00:00:00`).toLocaleDateString('th-TH', {
        month: 'long',
        year: 'numeric',
      })
    : 'กรกฎาคม 2569'

  return (
    <section className="section activities" id="activities">
      <div className="activities__leaf activities__leaf--one" aria-hidden="true">
        <Leaf />
      </div>
      <div className="container activities__grid">
        <div className="activities__copy reveal">
          <SectionHeading
            eyebrow="ปฏิทินกิจกรรม"
            title="ทุกวันคือโอกาสในการเรียนรู้"
            description="กิจกรรมของโรงเรียนออกแบบให้เด็กได้เรียนรู้จากประสบการณ์จริง ทำงานร่วมกับผู้อื่น และสนุกกับการค้นพบสิ่งใหม่"
          />
          <div className="activities__quote">
            <Quote size={27} aria-hidden="true" />
            <p>ความรู้เติบโตได้ดี เมื่อเด็กมีพื้นที่ให้ลองคิดและลงมือทำ</p>
          </div>
          <a className="button button--navy" href="#contact">
            สอบถามกำหนดการ
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="schedule reveal">
          <div className="schedule__top">
            <div>
              <span>กิจกรรมที่กำลังจะมาถึง</span>
              <strong>{calendarHeading}</strong>
            </div>
            <CalendarDays size={30} aria-hidden="true" />
          </div>
          <div className="schedule__list">
            {displayedEvents.map((item) => (
              <article className="schedule-item" key={item.id || `${item.day}-${item.title}`}>
                <div className={`schedule-item__date schedule-item__date--${item.color}`}>
                  <strong>{item.day}</strong>
                  <span>{item.month}</span>
                </div>
                <div className="schedule-item__copy">
                  <h3>{item.title}</h3>
                  <p>{item.meta}</p>
                  <AttachmentLinks item={item} compact />
                </div>
                <ChevronRight size={21} aria-hidden="true" />
              </article>
            ))}
          </div>
          <p className="schedule__note">
            <Bell size={15} />
            กำหนดการอาจมีการเปลี่ยนแปลง โปรดติดตามประกาศจากโรงเรียน
          </p>
        </div>
      </div>
    </section>
  )
}

const achievementGroups = [
  {
    type: 'school',
    title: 'ผลงาน/รางวัลโรงเรียน',
    description: 'ผลงานและความสำเร็จในภาพรวมของสถานศึกษา',
    icon: School,
  },
  {
    type: 'personnel',
    title: 'ผลงาน/รางวัลผู้บริหาร/ครู/บุคลากร',
    description: 'ความสำเร็จของผู้บริหาร ครู และบุคลากรทางการศึกษา',
    icon: Users,
  },
  {
    type: 'student',
    title: 'ผลงาน/รางวัลนักเรียน',
    description: 'ความสามารถและความภาคภูมิใจของนักเรียนโรงเรียนบ้านน้ำพร',
    icon: GraduationCap,
  },
  {
    type: 'teacher_work',
    title: 'Best Practice/นวัตกรรม/วิจัยชั้นเรียน',
    description: 'พื้นที่เผยแพร่แนวปฏิบัติที่เป็นเลิศ นวัตกรรม และงานวิจัยในชั้นเรียนของครู',
    icon: Sparkles,
  },
]

function AchievementCard({ award, onOpen }) {
  return (
    <article className="achievement-card">
      <button
        className="achievement-card__visual"
        type="button"
        onClick={() => onOpen(award)}
        aria-label={`เปิดภาพและรายละเอียด ${award.title}`}
      >
        {award.image_url ? <img src={displayImageUrl(award.image_url)} alt="" /> : <Trophy size={48} />}
        <span>{award.level || 'ผลงานโรงเรียน'}</span>
        <span className="achievement-card__zoom"><Images size={17} /> ดูภาพเต็ม</span>
      </button>
      <div className="achievement-card__body">
        <small>
          {new Date(`${award.award_date}T00:00:00`).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </small>
        <h3>{award.title}</h3>
        {award.recipient && <strong>{award.recipient}</strong>}
        <p>{award.description}</p>
        <button className="achievement-card__detail" type="button" onClick={() => onOpen(award)}>
          ดูภาพและรายละเอียด <ArrowRight size={16} />
        </button>
        <AttachmentLinks item={award} compact />
      </div>
    </article>
  )
}

function Achievements({ awards = [], grouped = false }) {
  const [page, setPage] = useState(1)
  const [activeAward, setActiveAward] = useState(null)
  const pageSize = 6
  const regularAwards = awards.filter((award) => award.award_type !== 'teacher_work')
  const teacherWorks = awards.filter((award) => award.award_type === 'teacher_work')
  const totalPages = Math.max(1, Math.ceil(regularAwards.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const displayedAwards = regularAwards.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    if (!activeAward) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setActiveAward(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [activeAward])

  const awardDialog = activeAward && (
    <div className="modal achievement-modal" role="presentation" onMouseDown={() => setActiveAward(null)}>
      <article
        className="modal__dialog achievement-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="modal__close"
          type="button"
          aria-label="ปิดรายละเอียดผลงานและรางวัล"
          onClick={() => setActiveAward(null)}
        >
          <X size={20} />
        </button>
        {activeAward.image_url ? (
          <div className="achievement-modal__image">
            <img src={displayImageUrl(activeAward.image_url)} alt={activeAward.title} />
          </div>
        ) : (
          <div className="achievement-modal__placeholder"><Trophy size={58} /></div>
        )}
        <div className="achievement-modal__content">
          <span className="modal__category">{activeAward.level || 'ผลงานและรางวัล'}</span>
          <div className="modal__date">
            <CalendarDays size={15} />
            {new Date(`${activeAward.award_date}T00:00:00`).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <h2 id="achievement-dialog-title">{activeAward.title}</h2>
          {activeAward.recipient && (
            <div className="achievement-modal__recipient">
              <Trophy size={18} />
              <div><small>ผู้ได้รับรางวัล/เจ้าของผลงาน</small><strong>{activeAward.recipient}</strong></div>
            </div>
          )}
          <p className="modal__content">
            {activeAward.description || 'ยังไม่มีรายละเอียดเพิ่มเติมสำหรับรายการนี้'}
          </p>
          <AttachmentLinks item={activeAward} />
        </div>
      </article>
    </div>
  )

  if (grouped) {
    return (
      <>
        <section className="section achievements achievements--grouped" id="achievements">
          <div className="container">
            <SectionHeading
              eyebrow="ผลงานและรางวัล"
              title="ความภาคภูมิใจของโรงเรียนบ้านน้ำพร"
              description="แบ่งข้อมูลตามประเภทผู้ได้รับผลงานและรางวัล เพื่อให้ค้นหาและติดตามได้สะดวก"
              align="center"
            />
            <div className="achievement-groups">
              {achievementGroups.map(({ type, title, description, icon: Icon }) => {
                const groupAwards = awards.filter((award) => (award.award_type || 'school') === type)
                return (
                  <section className="achievement-group" key={type}>
                    <header>
                      <span><Icon size={25} /></span>
                      <div><h2>{title}</h2><p>{description}</p></div>
                      <strong>{groupAwards.length} รายการ</strong>
                    </header>
                    {groupAwards.length ? (
                      <div className="achievements__grid">
                        {groupAwards.map((award) => <AchievementCard award={award} onOpen={setActiveAward} key={award.id} />)}
                      </div>
                    ) : (
                      <div className="achievement-group__empty">
                        <Trophy size={27} />
                        <span>ยังไม่มีข้อมูลในหมวดนี้</span>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          </div>
        </section>
        {awardDialog}
      </>
    )
  }

  return (
    <>
      <section className="section achievements" id="achievements">
        <div className="container">
          <SectionHeading
            eyebrow="ผลงานและรางวัล"
            title="ความภาคภูมิใจของโรงเรียนบ้านน้ำพร"
            description="รวบรวมผลงานของนักเรียน ครู และสถานศึกษาที่สะท้อนความมุ่งมั่นในการพัฒนาคุณภาพการศึกษา"
            align="center"
          />
          {displayedAwards.length ? (
            <>
              <div className="achievements__grid">
                {displayedAwards.map((award) => <AchievementCard award={award} onOpen={setActiveAward} key={award.id} />)}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={setPage}
                label="เลือกหน้าผลงานและรางวัล"
              />
            </>
          ) : (
            <div className="achievements__empty">
              <span><Trophy size={38} /></span>
              <strong>พื้นที่รวบรวมผลงานและรางวัล</strong>
              <p>ข้อมูลผลงานที่เผยแพร่จากระบบบริหารจะแสดงในส่วนนี้</p>
            </div>
          )}
          <section className="achievement-group achievement-group--teacher-work">
            <header>
              <span><Sparkles size={25} /></span>
              <div>
                <h2>Best Practice/นวัตกรรม/วิจัยชั้นเรียน</h2>
                <p>พื้นที่สำหรับครูเผยแพร่ผลงาน แนวปฏิบัติที่เป็นเลิศ นวัตกรรม และงานวิจัยในชั้นเรียน</p>
              </div>
              <strong>{teacherWorks.length} รายการ</strong>
            </header>
            {teacherWorks.length ? (
              <div className="achievements__grid">
                {teacherWorks.slice(0, 3).map((award) => (
                  <AchievementCard award={award} onOpen={setActiveAward} key={award.id} />
                ))}
              </div>
            ) : (
              <div className="achievement-group__empty">
                <Sparkles size={27} />
                <span>ยังไม่มีผลงานครูเผยแพร่ในหมวดนี้</span>
              </div>
            )}
          </section>
        </div>
      </section>
      {awardDialog}
    </>
  )
}

function PageHero({ eyebrow, title, description, icon: Icon }) {
  return (
    <section className="page-hero">
      <div className="page-hero__orb page-hero__orb--one" aria-hidden="true" />
      <div className="page-hero__orb page-hero__orb--two" aria-hidden="true" />
      <div className="container page-hero__inner">
        <div>
          <nav className="breadcrumbs" aria-label="เส้นทางนำทาง">
            <a href="/">หน้าแรก</a>
            <ChevronRight size={15} />
            <span>{eyebrow}</span>
          </nav>
          <span className="page-hero__eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="page-hero__icon"><Icon size={58} strokeWidth={1.35} /></span>
      </div>
    </section>
  )
}

function BasicInfoPage() {
  const bigDataUrl = 'https://bigdata.loei1.go.th/tableSchoolID.php?id=42010113'
  const bigDataMapUrl = 'https://goo.gl/maps/jziqSBnHDS54VrASA'
  const bigDataWebsite = 'https://numporn.loei1.go.th'
  const bigDataPhone = '081-873-8723'
  const overviewStats = [
    { value: '137 คน', label: 'นักเรียนทั้งหมด', detail: 'ชาย 71 คน · หญิง 66 คน', icon: Users },
    { value: '11 ห้อง', label: 'ห้องเรียนทั้งหมด', detail: 'เฉลี่ย 12 คนต่อห้อง', icon: School },
    { value: '17 คน', label: 'ครูและบุคลากร', detail: 'ผู้บริหาร 1 · ครู 14 · ลูกจ้าง 2', icon: GraduationCap },
    { value: 'ขนาดกลาง', label: 'ขนาดโรงเรียน', detail: 'ขนาดที่ 2 ตามเกณฑ์ 7 ขนาด', icon: Building2 },
  ]
  const items = [
    { label: 'ชื่อสถานศึกษา', value: `${schoolInfo.thaiName} · ${schoolInfo.englishName}`, icon: School },
    { label: 'ระดับชั้นที่เปิดสอน', value: 'ปฐมวัย - มัธยมศึกษาตอนต้น (อนุบาล 2 - ม.3)', icon: GraduationCap },
    { label: 'ลักษณะโรงเรียน', value: `${schoolInfo.schoolType} · โรงเรียนขนาดกลาง`, icon: Building2 },
    { label: 'หน่วยงานต้นสังกัด', value: schoolInfo.affiliation, icon: BookOpenText },
    { label: 'ที่ตั้ง', value: 'เลขที่ 115 หมู่ 2 บ้านน้ำพร ถนนเลย–กกดู่ ตำบลปากตม อำเภอเชียงคาน จังหวัดเลย 42110', icon: MapPin },
    { label: 'พิกัดโรงเรียน', value: 'ละติจูด 17.7611025 · ลองจิจูด 101.5926921', icon: MapPin },
  ]
  const schoolCodes = [
    { label: 'รหัส SMIS 8 หลัก', value: '42010113' },
    { label: 'รหัส PERCODE 6 หลัก', value: '520224' },
    { label: 'รหัสกระทรวง 10 หลัก', value: '1042520224' },
  ]
  const studentRows = [
    { level: 'อนุบาล 2', male: 5, female: 8, total: 13, rooms: 1 },
    { level: 'อนุบาล 3', male: 4, female: 4, total: 8, rooms: 1 },
    { level: 'รวมระดับปฐมวัย', male: 9, female: 12, total: 21, rooms: 2, isSummary: true },
    { level: 'ประถมศึกษาปีที่ 1', male: 6, female: 4, total: 10, rooms: 1 },
    { level: 'ประถมศึกษาปีที่ 2', male: 3, female: 3, total: 6, rooms: 1 },
    { level: 'ประถมศึกษาปีที่ 3', male: 9, female: 3, total: 12, rooms: 1 },
    { level: 'ประถมศึกษาปีที่ 4', male: 5, female: 4, total: 9, rooms: 1 },
    { level: 'ประถมศึกษาปีที่ 5', male: 5, female: 4, total: 9, rooms: 1 },
    { level: 'ประถมศึกษาปีที่ 6', male: 10, female: 5, total: 15, rooms: 1 },
    { level: 'รวมระดับประถมศึกษา', male: 38, female: 23, total: 61, rooms: 6, isSummary: true },
    { level: 'มัธยมศึกษาปีที่ 1', male: 12, female: 6, total: 18, rooms: 1 },
    { level: 'มัธยมศึกษาปีที่ 2', male: 2, female: 14, total: 16, rooms: 1 },
    { level: 'มัธยมศึกษาปีที่ 3', male: 10, female: 11, total: 21, rooms: 1 },
    { level: 'รวมมัธยมศึกษาตอนต้น', male: 24, female: 31, total: 55, rooms: 3, isSummary: true },
  ]
  const staffDashboardPanels = [
    {
      title: 'ตำแหน่ง',
      eyebrow: 'Position',
      icon: School,
      tone: 'green',
      items: [
        { label: 'ผู้บริหาร', value: 1 },
        { label: 'ครูผู้สอน', value: 14 },
        { label: 'ลูกจ้างชั่วคราว', value: 2 },
      ],
    },
    {
      title: 'วิทยฐานะ',
      eyebrow: 'Academic Standing',
      icon: Trophy,
      tone: 'gold',
      items: [
        { label: 'ชำนาญการพิเศษ', value: 3 },
        { label: 'ชำนาญการ', value: 3 },
        { label: 'ไม่มีวิทยฐานะ', value: 11 },
      ],
    },
    {
      title: 'วุฒิการศึกษา',
      eyebrow: 'Education',
      icon: GraduationCap,
      tone: 'blue',
      items: [
        { label: 'ปริญญาโท', value: 4 },
        { label: 'ปริญญาตรี', value: 12 },
        { label: 'ต่ำกว่าอนุปริญญา', value: 1 },
      ],
    },
  ]

  return (
    <section className="section inner-content">
      <div className="container">
        <SectionHeading
          eyebrow="ข้อมูลจากระบบ BIG DATA"
          title="ข้อมูลพื้นฐานโรงเรียนบ้านน้ำพร"
          description="ข้อมูลประจำปีการศึกษา 2569 ภาคเรียนที่ 1 จากระบบสารสนเทศเพื่อการบริหารการศึกษา สำนักงานเขตพื้นที่การศึกษาประถมศึกษาเลย เขต 1"
        />
        <div className="basic-stats" aria-label="สถิติโรงเรียนโดยสรุป">
          {overviewStats.map(({ value, label, detail, icon: Icon }) => (
            <article className="basic-stat" key={label}>
              <span><Icon size={23} /></span>
              <div>
                <strong>{value}</strong>
                <h2>{label}</h2>
                <p>{detail}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="info-card-grid">
          {items.map(({ label, value, icon: Icon }) => (
            <article className="info-card" key={label}>
              <span><Icon size={23} /></span>
              <div><small>{label}</small><strong>{value}</strong></div>
            </article>
          ))}
        </div>

        <div className="basic-info-sections">
          <article className="basic-panel">
            <div className="basic-panel__heading">
              <span><FileText size={23} /></span>
              <div><small>School Identifiers</small><h2>รหัสประจำสถานศึกษา</h2></div>
            </div>
            <dl className="school-code-list">
              {schoolCodes.map(({ label, value }) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          </article>

          <article className="basic-panel">
            <div className="basic-panel__heading">
              <span><Phone size={23} /></span>
              <div><small>Contact in BIG DATA</small><h2>ข้อมูลติดต่อในระบบ</h2></div>
            </div>
            <div className="bigdata-contact-list">
              <a href={`tel:${bigDataPhone.replaceAll('-', '')}`}><Phone size={18} />{bigDataPhone}</a>
              <a href={contactDetails.emailHref}><Mail size={18} />{contactDetails.email}</a>
              <a href={bigDataWebsite} target="_blank" rel="noreferrer"><ExternalLink size={18} />เว็บไซต์ที่บันทึกในระบบ</a>
              <a href={bigDataMapUrl} target="_blank" rel="noreferrer"><MapPin size={18} />เปิดพิกัดจาก BIG DATA</a>
            </div>
          </article>
        </div>

        <article className="student-summary">
          <div className="student-summary__heading">
            <div>
              <span>ข้อมูลผู้เรียน</span>
              <h2>จำนวนนักเรียน ปีการศึกษา 2569 ภาคเรียนที่ 1</h2>
            </div>
            <strong>รวม 137 คน</strong>
          </div>
          <div className="student-table-wrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th>ระดับการศึกษา</th>
                  <th>ชาย</th>
                  <th>หญิง</th>
                  <th>รวม</th>
                  <th>ห้องเรียน</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map((row) => (
                <tr className={row.isSummary ? 'is-summary' : ''} key={row.level}>
                  <th>{row.level}</th>
                  <td>{row.male}</td>
                    <td>{row.female}</td>
                    <td><strong>{row.total}</strong></td>
                    <td>{row.rooms}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>รวมทั้งสิ้น</th>
                  <td>71</td>
                  <td>66</td>
                  <td>137</td>
                  <td>11</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </article>

        <section className="staff-dashboard" aria-labelledby="staff-dashboard-title">
          <div className="staff-dashboard__heading">
            <div>
              <span>ข้อมูลครูและบุคลากร</span>
              <h2 id="staff-dashboard-title">แดชบอร์ดบุคลากร ปีการศึกษา 2569</h2>
              <p>ภาพรวมบุคลากรจำแนกตามเพศ ตำแหน่ง วิทยฐานะ และวุฒิการศึกษา</p>
            </div>
            <strong>รวม 17 คน</strong>
          </div>
          <div className="staff-dashboard__grid">
            <article className="staff-dashboard-card staff-gender-card">
              <header>
                <span><Users size={21} /></span>
                <div><small>Gender</small><h3>เพศ</h3></div>
              </header>
              <div className="staff-gender-card__content">
                <div className="staff-donut" aria-label="ชาย 4 คน หญิง 13 คน">
                  <div><strong>17</strong><small>คน</small></div>
                </div>
                <div className="staff-gender-legend">
                  <div><span className="is-male" /><p>ชาย</p><strong>4 คน</strong><small>24%</small></div>
                  <div><span className="is-female" /><p>หญิง</p><strong>13 คน</strong><small>76%</small></div>
                </div>
              </div>
            </article>

            {staffDashboardPanels.map(({ title, eyebrow, icon: Icon, tone, items }) => (
              <article className={`staff-dashboard-card staff-dashboard-card--${tone}`} key={title}>
                <header>
                  <span><Icon size={21} /></span>
                  <div><small>{eyebrow}</small><h3>{title}</h3></div>
                </header>
                <div className="staff-progress-list">
                  {items.map((item) => (
                    <div className="staff-progress" key={item.label}>
                      <div><span>{item.label}</span><strong>{item.value} คน</strong></div>
                      <div className="staff-progress__track">
                        <span style={{ width: `${(item.value / 17) * 100}%` }} />
                      </div>
                      <small>{Math.round((item.value / 17) * 100)}%</small>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="basic-info-actions">
          <a className="button button--navy" href={bigDataMapUrl} target="_blank" rel="noreferrer">
            เปิดแผนที่โรงเรียน <ExternalLink size={17} />
          </a>
          <a className="button button--outline" href={bigDataUrl} target="_blank" rel="noreferrer">
            ตรวจสอบข้อมูลต้นทาง <ExternalLink size={17} />
          </a>
        </div>
        <p className="basic-info-source">ที่มา: ระบบ BIG DATA สพป.เลย เขต 1 · ข้อมูลปีการศึกษา 2569 ภาคเรียนที่ 1</p>
      </div>
    </section>
  )
}

function StaffPage() {
  const director = {
    image: '/TC01.png',
    name: 'นางศิวาลัย แก้วเขียว',
    position: 'ผู้อำนวยการโรงเรียนบ้านน้ำพร',
  }
  const teachers = [
    { image: '/TC02.png', name: 'นางรัตนา อ่ำนาเพียง', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC03.png', name: 'นางสาววันชื่น ทองอยู่', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC04.png', name: 'นางสาวพรพรรณ จันทะสี', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC06.png', name: 'นางสุจิตรา ฝั้นสีดา', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC15.png', name: 'นางรัตนาภรณ์ ผิวจันทา', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC05.png', name: 'นางพิศมัย โกมาร', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC07.png', name: 'นางสาววิไลวรรณ ชาภูธร', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC08.png', name: 'นางสาวสุวรรณา พุทธมาตย์', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC09.png', name: 'นายนิรุทธิ์ เสวะนา', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC10.png', name: 'ว่าที่ร้อยตรีหญิงเอื้องคำ ชัยภา', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC11.png', name: 'นางสาวสุภาพร พิมพุธ', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC12.png', name: 'นายอิทธิภู กองพอด', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC13.png', name: 'นางสาวยลดา จันดาหาร', position: 'ครู โรงเรียนบ้านน้ำพร' },
    { image: '/TC14.png', name: 'นางสาวรัตติกานต์ ราชศรีเมือง', position: 'ครู โรงเรียนบ้านน้ำพร' },
  ]
  const supportStaff = [
    { image: '/TC16.png', name: 'นางสาวธิวาพร คำพรม', position: 'เจ้าหน้าที่ธุรการ' },
    { image: '/TC17.png', name: 'นายประสิทธิ์ ไพฑูรย์', position: 'นักการภารโรง' },
  ]

  const StaffCard = ({ member }) => (
    <article className="staff-card">
      <div className="staff-card__image">
        <img
          src={member.image}
          alt={`${member.name} ${member.position}`}
          loading="lazy"
        />
      </div>
      <div className="staff-card__copy">
        <span>{member.position}</span>
        <h3>{member.name}</h3>
      </div>
    </article>
  )

  return (
    <section className="section inner-content">
      <div className="container">
        <SectionHeading
          eyebrow="บุคลากรของเรา"
          title="คณะผู้บริหาร ครู และบุคลากร"
          description="บุคลากรโรงเรียนบ้านน้ำพรร่วมกันดูแลผู้เรียนและสร้างพื้นที่การเรียนรู้ที่ปลอดภัย เป็นมิตร และมีคุณภาพ"
          align="center"
        />

        <div className="staff-section-heading staff-section-heading--director">
          <span><School size={19} /></span>
          <div>
            <small>School Director</small>
            <h2>ผู้บริหารสถานศึกษา</h2>
          </div>
        </div>
        <article className="staff-director">
          <div className="staff-director__image">
            <img src={director.image} alt={`${director.name} ${director.position}`} />
          </div>
          <div>
            <small>ผู้อำนวยการโรงเรียน</small>
            <h2>{director.name}</h2>
            <strong>{director.position}</strong>
            <p>บริหารสถานศึกษาโดยมุ่งเน้นคุณภาพผู้เรียน การทำงานร่วมกับครอบครัว และความเข้มแข็งของชุมชน</p>
          </div>
        </article>

        <div className="staff-section-heading">
          <span><GraduationCap size={19} /></span>
          <div>
            <small>Teachers</small>
            <h2>คณะครูผู้สอน</h2>
          </div>
          <strong>{teachers.length} คน</strong>
        </div>
        <div className="staff-grid">
          {teachers.map((member) => <StaffCard member={member} key={member.image} />)}
        </div>

        <div className="staff-section-heading">
          <span><Users size={19} /></span>
          <div>
            <small>Support Staff</small>
            <h2>บุคลากรสนับสนุนการศึกษา</h2>
          </div>
          <strong>{supportStaff.length} คน</strong>
        </div>
        <div className="staff-grid staff-grid--support">
          {supportStaff.map((member) => <StaffCard member={member} key={member.image} />)}
        </div>
      </div>
    </section>
  )
}

function HistoryPage() {
  const timeline = [
    {
      year: 'พ.ศ. 2482',
      title: 'เริ่มก่อตั้งโรงเรียนในหมู่บ้านน้ำพร',
      description: 'เดิมนักเรียนอาศัยเรียนกับโรงเรียนประชาบาล ตำบลปากตม 1 (บ้านนาจาน) ก่อนคณะกรรมการอำเภออนุมัติให้จัดตั้งโรงเรียนในหมู่บ้านน้ำพร เป็นอาคารเรียนชั่วคราวทางทิศตะวันตกของหมู่บ้าน โดยมีนายแจ้ง (ธีระ) โพธิ์ทอง เป็นครูคนแรก',
    },
    {
      year: '30 พฤศจิกายน 2493',
      title: 'ย้ายโรงเรียนและพัฒนาที่ตั้งปัจจุบัน',
      description: 'โรงเรียนและคณะกรรมการหมู่บ้านย้ายจากที่เดิมมาอาศัยศาลาวัดเป็นอาคารเรียนชั่วคราว ก่อนย้ายไปทางทิศตะวันออก ณ ที่ตั้งปัจจุบัน แบ่งการสอนเป็น 5 ชั้นเรียน มีนายอาน สอนพรหม เป็นครูใหญ่ และต่อมานายเรียน ไขมีเพชร รักษาการแทน',
    },
    {
      year: '22 พฤษภาคม 2505',
      title: 'แต่งตั้งครูใหญ่',
      description: 'ทางราชการแต่งตั้งนายนาค นาครพันธ์ มาดำรงตำแหน่งครูใหญ่ แทนนายอุทิน อารยะศิลปธร',
    },
    {
      year: 'พ.ศ. 2525',
      title: 'พัฒนาการบริหารสถานศึกษา',
      description: 'นายคมสัน คำวิเศษ ย้ายจากโรงเรียนบ้านคกงิ้วมาดำรงตำแหน่งครูใหญ่ และได้รับแต่งตั้งเป็นอาจารย์ใหญ่และผู้อำนวยการโรงเรียนตามลำดับ',
    },
    {
      year: 'พ.ศ. 2535–2536',
      title: 'เข้าร่วมโครงการโรงเรียนขยายโอกาส',
      description: 'โรงเรียนเข้าร่วมโครงการโรงเรียนขยายโอกาสทางการศึกษา เปิดสอนตั้งแต่ระดับปฐมวัยถึงมัธยมศึกษาปีที่ 1 และขยายการจัดการเรียนการสอนถึงมัธยมศึกษาปีที่ 2 และ 3 ตามลำดับ',
    },
    {
      year: '7 กรกฎาคม 2546',
      title: 'เปลี่ยนหน่วยงานต้นสังกัด',
      description: 'เปลี่ยนจากสังกัดสำนักงานคณะกรรมการการประถมศึกษาแห่งชาติ มาเป็นสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน สังกัดสำนักงานเขตพื้นที่การศึกษาเลย เขต 1',
    },
    {
      year: '26 กรกฎาคม 2549',
      title: 'เปลี่ยนผู้อำนวยการโรงเรียน',
      description: 'นายคมสัน คำวิเศษ ย้ายไปดำรงตำแหน่งผู้อำนวยการโรงเรียนบ้านสองคอน และนายถวิล มาสาซ้าย มาดำรงตำแหน่งผู้อำนวยการโรงเรียนบ้านน้ำพรแทน',
    },
    {
      year: '18 ธันวาคม 2556',
      title: 'แต่งตั้งนายทวีศักดิ์ ขันติยะ',
      description: 'นายถวิล มาสาซ้าย ย้ายไปดำรงตำแหน่งผู้อำนวยการโรงเรียนบ้านปากหมาก และนายทวีศักดิ์ ขันติยะ มาดำรงตำแหน่งผู้อำนวยการโรงเรียนบ้านน้ำพร',
    },
    {
      year: '1 มิถุนายน 2563',
      title: 'แต่งตั้งนางรัตนาภรณ์ พินิจนึก',
      description: 'นางรัตนาภรณ์ พินิจนึก มาดำรงตำแหน่งผู้อำนวยการโรงเรียนบ้านน้ำพร จนถึงวันที่ 1 ตุลาคม 2568 จึงย้ายไปโรงเรียนบ้านเชียงคาน “วิจิตรวิทยา” และนางรัตนา อ่ำนาเพียง รักษาการในตำแหน่งผู้อำนวยการ',
    },
    {
      year: '15 ธันวาคม 2568',
      title: 'แต่งตั้งผู้อำนวยการคนปัจจุบัน',
      description: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาเลย เขต 1 แต่งตั้งนางศิวาลัย แก้วเขียว มาดำรงตำแหน่งผู้อำนวยการโรงเรียนบ้านน้ำพร',
    },
  ]

  const currentFacts = [
    { value: '15 คน', label: 'ข้าราชการครู', icon: Users },
    { value: '11 ห้องเรียน', label: 'ห้องเรียนทั้งหมด', icon: School },
    { value: '8 ไร่ 2 งาน 16 ตร.ว.', label: 'พื้นที่โรงเรียน', icon: MapPin },
    { value: '2 ตำบล', label: 'เขตบริการ ปากตมและหาดทรายขาว', icon: Building2 },
  ]

  return (
    <>
      <section className="section inner-content">
        <div className="container history-layout">
          <div className="history-layout__seal"><img src="/np.png" alt="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร" /></div>
          <div>
            <SectionHeading
              eyebrow="เรื่องราวของโรงเรียน"
              title="จากโรงเรียนชั่วคราว สู่โรงเรียนขยายโอกาสของชุมชน"
              description="โรงเรียนบ้านน้ำพรเริ่มต้นจากความร่วมมือของชุมชน และพัฒนาการจัดการศึกษาอย่างต่อเนื่องตั้งแต่ พ.ศ. 2482 จนถึงปัจจุบัน"
            />
            <div className="prose-card">
              <p>โรงเรียนบ้านน้ำพรตั้งอยู่ที่บ้านน้ำพร ตำบลปากตม อำเภอเชียงคาน จังหวัดเลย รับผิดชอบการจัดการศึกษาขั้นพื้นฐานให้ประชาชนในเขตบริการตำบลปากตมและตำบลหาดทรายขาว</p>
              <p>ปัจจุบันจัดการเรียนการสอนระดับก่อนประถมศึกษาและการศึกษาภาคบังคับช่วงชั้นที่ 1–3 โดยมีนางศิวาลัย แก้วเขียว ดำรงตำแหน่งผู้อำนวยการโรงเรียน</p>
            </div>
          </div>
        </div>
        <div className="container history-facts">
          {currentFacts.map(({ value, label, icon: Icon }) => (
            <article key={label}><span><Icon size={22} /></span><strong>{value}</strong><small>{label}</small></article>
          ))}
        </div>
      </section>
      <section className="section school-history">
        <div className="container">
          <SectionHeading
            eyebrow="ลำดับเหตุการณ์"
            title="พัฒนาการสำคัญของโรงเรียน"
            description="เรียบเรียงจากเอกสารประวัติโรงเรียนบ้านน้ำพร"
          />
          <div className="school-timeline">
            {timeline.map((item) => (
              <article key={item.year}>
                <span className="school-timeline__dot" />
                <time>{item.year}</time>
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
              </article>
            ))}
          </div>
          <div className="history-staff-note">
            <Users size={25} />
            <div>
              <strong>บุคลากรสนับสนุนการศึกษา</strong>
              <p>โรงเรียนมีเจ้าหน้าที่ธุรการ 1 คน และนักการภารโรง 1 คน ร่วมสนับสนุนการจัดการศึกษาและการดำเนินงานของสถานศึกษา</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

const operationPageData = {
  nationalTests: {
    eyebrow: 'การดำเนินงาน',
    title: 'การสอบวัดผลระดับชาติ RT/NT/O-NET',
    description: 'ข้อมูลการเตรียมความพร้อมและการดำเนินการสอบวัดผลระดับชาติของโรงเรียน',
    icon: GraduationCap,
    items: [
      { title: 'RT', subtitle: 'Reading Test', description: 'การประเมินความสามารถด้านการอ่านของผู้เรียนระดับชั้นประถมศึกษาปีที่ 1' },
      { title: 'NT', subtitle: 'National Test', description: 'การประเมินคุณภาพผู้เรียนระดับชั้นประถมศึกษาปีที่ 3' },
      { title: 'O-NET', subtitle: 'Ordinary National Educational Test', description: 'การทดสอบทางการศึกษาระดับชาติขั้นพื้นฐานตามระดับชั้นที่กำหนด' },
    ],
  },
  externalQuality: {
    eyebrow: 'การดำเนินงาน',
    title: 'ประกันคุณภาพภายนอก (สมศ.)',
    description: 'การเตรียมความพร้อมและข้อมูลด้านการประเมินคุณภาพภายนอกของสถานศึกษา',
    icon: ShieldCheck,
    items: [
      { title: 'ข้อมูลสถานศึกษา', subtitle: 'School Profile', description: 'ข้อมูลพื้นฐาน บริบท และผลการดำเนินงานของโรงเรียน' },
      { title: 'หลักฐานการดำเนินงาน', subtitle: 'Evidence', description: 'เอกสารและหลักฐานที่สะท้อนคุณภาพการจัดการศึกษา' },
      { title: 'การพัฒนาคุณภาพ', subtitle: 'Improvement', description: 'แนวทางนำผลการประเมินไปใช้พัฒนาผู้เรียนและสถานศึกษา' },
    ],
  },
  ita: {
    eyebrow: 'การดำเนินงาน',
    title: 'ITA Online',
    description: 'การประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของสถานศึกษาออนไลน์',
    icon: ClipboardCheck,
    items: [
      { title: 'การเปิดเผยข้อมูล', subtitle: 'Open Data', description: 'เผยแพร่ข้อมูลการบริหารงานและการให้บริการอย่างโปร่งใส' },
      { title: 'การป้องกันการทุจริต', subtitle: 'Integrity', description: 'มาตรการและแนวทางส่งเสริมคุณธรรมในการดำเนินงาน' },
      { title: 'ช่องทางการมีส่วนร่วม', subtitle: 'Participation', description: 'เปิดพื้นที่ให้ผู้มีส่วนได้ส่วนเสียเข้าถึงข้อมูลและแสดงความคิดเห็น' },
    ],
  },
}

function OperationPage({ type }) {
  const page = operationPageData[type]
  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        icon={page.icon}
      />
      <section className="section inner-content">
        <div className="container">
          <SectionHeading
            eyebrow="ข้อมูลการดำเนินงาน"
            title={page.title}
            description="ข้อมูลและเอกสารที่เกี่ยวข้องจะได้รับการปรับปรุงให้เป็นปัจจุบันอย่างต่อเนื่อง"
            align="center"
          />
          <div className="operation-grid">
            {page.items.map((item) => (
              <article className="operation-card" key={item.title}>
                <span>{item.title}</span>
                <small>{item.subtitle}</small>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
          <div className="operation-contact">
            <FileText size={24} />
            <div>
              <strong>ต้องการข้อมูลหรือเอกสารเพิ่มเติม</strong>
              <p>สามารถติดต่อโรงเรียนเพื่อสอบถามข้อมูลฉบับล่าสุดได้โดยตรง</p>
            </div>
            <a href="/contact">ติดต่อโรงเรียน<ArrowRight size={16} /></a>
          </div>
        </div>
      </section>
    </>
  )
}

function isEvidenceImage(url, mimeType = '') {
  const type = String(mimeType || '').toLowerCase()
  if (type) return type.startsWith('image/')
  const path = String(url || '').split(/[?#]/)[0].toLowerCase()
  if (/\.(avif|bmp|gif|jpe?g|png|svg|webp)$/.test(path)) return true
  try {
    const hostname = new URL(url).hostname
    return ['drive.google.com', 'drive.usercontent.google.com', 'lh3.googleusercontent.com'].includes(hostname)
  } catch {
    return false
  }
}

function isEvidencePdf(url, mimeType = '') {
  const type = String(mimeType || '').toLowerCase()
  if (type) return type === 'application/pdf'
  return /\.pdf(?:$|[?#])/i.test(String(url || ''))
}

function fittedEvidenceImageSize(stage, image) {
  if (!stage || !image?.naturalWidth || !image?.naturalHeight) return null
  const stageWidth = stage.clientWidth
  const stageHeight = stage.clientHeight
  const availableWidth = Math.max(120, stageWidth - 32)
  const availableHeight = Math.max(120, stageHeight - 32)
  const fitScale = Math.min(
    availableWidth / image.naturalWidth,
    availableHeight / image.naturalHeight,
    1,
  )
  return {
    width: Math.round(image.naturalWidth * fitScale),
    height: Math.round(image.naturalHeight * fitScale),
    stageWidth,
    stageHeight,
  }
}

function QualityImageViewer({ viewer, zoom, setZoom, onMove, onClose }) {
  const stageRef = useRef(null)
  const imageRef = useRef(null)
  const dragRef = useRef(null)
  const [fitSize, setFitSize] = useState(null)
  const currentUrl = viewer ? viewer.images[viewer.index] : ''

  useEffect(() => {
    setFitSize(null)
    if (!currentUrl) return undefined
    const updateFit = () => {
      const nextSize = fittedEvidenceImageSize(stageRef.current, imageRef.current)
      if (nextSize) setFitSize(nextSize)
    }
    const frame = window.requestAnimationFrame(updateFit)
    window.addEventListener('resize', updateFit)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateFit)
    }
  }, [currentUrl])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !fitSize) return undefined
    const frame = window.requestAnimationFrame(() => {
      stage.scrollLeft = Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2)
      stage.scrollTop = Math.max(0, (stage.scrollHeight - stage.clientHeight) / 2)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [currentUrl, fitSize, zoom])

  if (!viewer) return null
  const imageWidth = fitSize ? Math.round(fitSize.width * zoom) : null
  const imageHeight = fitSize ? Math.round(fitSize.height * zoom) : null
  const canvasStyle = fitSize
    ? {
        width: `${Math.max(fitSize.stageWidth, imageWidth + 32)}px`,
        height: `${Math.max(fitSize.stageHeight, imageHeight + 32)}px`,
      }
    : undefined
  const imageStyle = fitSize
    ? {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        maxWidth: 'none',
        maxHeight: 'none',
      }
    : undefined
  const startPan = (event) => {
    if (zoom <= 1 || event.pointerType !== 'mouse' || event.target.closest('button')) return
    const stage = stageRef.current
    if (!stage) return
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: stage.scrollLeft,
      top: stage.scrollTop,
    }
    stage.setPointerCapture(event.pointerId)
    stage.classList.add('is-panning')
    event.preventDefault()
  }
  const movePan = (event) => {
    const drag = dragRef.current
    const stage = stageRef.current
    if (!drag || !stage || drag.pointerId !== event.pointerId) return
    stage.scrollLeft = drag.left - (event.clientX - drag.x)
    stage.scrollTop = drag.top - (event.clientY - drag.y)
  }
  const stopPan = (event) => {
    const stage = stageRef.current
    if (!dragRef.current || !stage) return
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId)
    dragRef.current = null
    stage.classList.remove('is-panning')
  }
  return (
    <div className="quality-image-viewer" role="presentation" onMouseDown={onClose}>
      <section
        className="quality-image-viewer__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`ภาพหลักฐาน ${viewer.title}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <strong>{viewer.title}</strong>
            <span>ภาพที่ {viewer.index + 1} จาก {viewer.images.length} · ซูม {Math.round(zoom * 100)}%</span>
          </div>
          <div className="quality-image-viewer__tools">
            <button type="button" onClick={() => setZoom((current) => Math.max(1, current - 0.25))} disabled={zoom <= 1} aria-label="ย่อภาพ"><ZoomOut size={19} /></button>
            <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1} aria-label="คืนขนาดภาพ"><RotateCcw size={18} /></button>
            <button type="button" onClick={() => setZoom((current) => Math.min(4, current + 0.25))} disabled={zoom >= 4} aria-label="ขยายภาพ"><ZoomIn size={19} /></button>
            <button className="is-close" type="button" onClick={onClose} aria-label="ปิดภาพขนาดเต็ม"><X size={21} /></button>
          </div>
        </header>
        <div
          ref={stageRef}
          className={`quality-image-viewer__stage ${zoom > 1 ? 'is-zoomed' : ''}`}
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={stopPan}
          onPointerCancel={stopPan}
        >
          {viewer.images.length > 1 && (
            <button className="quality-image-viewer__nav is-previous" type="button" onClick={() => onMove(-1)} aria-label="ภาพก่อนหน้า"><ChevronLeft size={27} /></button>
          )}
          <div
            className="quality-image-viewer__canvas"
            style={canvasStyle}
          >
            <img
              ref={imageRef}
              src={displayImageUrl(currentUrl)}
              alt={`${viewer.title} ภาพที่ ${viewer.index + 1}`}
              style={imageStyle}
              draggable="false"
              onLoad={(event) => {
                const nextSize = fittedEvidenceImageSize(stageRef.current, event.currentTarget)
                if (nextSize) setFitSize(nextSize)
              }}
            />
          </div>
          {viewer.images.length > 1 && (
            <button className="quality-image-viewer__nav is-next" type="button" onClick={() => onMove(1)} aria-label="ภาพถัดไป"><ChevronRight size={27} /></button>
          )}
        </div>
        {viewer.images.length > 1 && (
          <footer>
            {viewer.images.map((url, index) => (
              <button className={index === viewer.index ? 'is-active' : ''} type="button" onClick={() => onMove(index - viewer.index)} aria-label={`เปิดภาพที่ ${index + 1}`} key={`${url}-${index}`}>
                <img src={displayImageUrl(url)} alt="" />
              </button>
            ))}
          </footer>
        )}
      </section>
    </div>
  )
}

function QualityPdfViewer({ viewer, onClose }) {
  if (!viewer) return null
  return (
    <div className="quality-image-viewer quality-pdf-viewer" role="presentation" onMouseDown={onClose}>
      <section
        className="quality-image-viewer__dialog quality-pdf-viewer__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`เอกสาร PDF ${viewer.title}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <strong>{viewer.title}</strong>
            <span>เอกสารหลักฐาน PDF · ใช้เครื่องมือในตัวอ่านเพื่อซูมและเปลี่ยนหน้า</span>
          </div>
          <div className="quality-image-viewer__tools">
            <a href={viewer.url} target="_blank" rel="noreferrer">
              <ExternalLink size={18} /> เปิดต้นฉบับ
            </a>
            <button className="is-close" type="button" onClick={onClose} aria-label="ปิดเอกสาร PDF"><X size={21} /></button>
          </div>
        </header>
        <div className="quality-pdf-viewer__stage">
          <iframe
            src={displayPdfUrl(viewer.url)}
            title={`ตัวอ่านเอกสาร ${viewer.title}`}
            allow="fullscreen"
          />
        </div>
      </section>
    </div>
  )
}

function QualityAssurancePage({ evidence = [] }) {
  const [activeLevel, setActiveLevel] = useState('early')
  const [openStandards, setOpenStandards] = useState(['1'])
  const [openIndicator, setOpenIndicator] = useState('')
  const [openEvidence, setOpenEvidence] = useState('')
  const [imageViewer, setImageViewer] = useState(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [pdfViewer, setPdfViewer] = useState(null)
  const level = qualityLevels.find((item) => item.id === activeLevel) || qualityLevels[0]

  const toggleStandard = (number) => {
    setOpenStandards((current) => (current.includes(number) ? [] : [number]))
    setOpenIndicator('')
    setOpenEvidence('')
  }

  const selectLevel = (levelId) => {
    setActiveLevel(levelId)
    setOpenStandards(['1'])
    setOpenIndicator('')
    setOpenEvidence('')
  }

  const openImageViewer = (images, index, title) => {
    setImageZoom(1)
    setImageViewer({ images, index, title })
  }

  const moveImageViewer = (difference) => {
    setImageZoom(1)
    setImageViewer((current) => {
      if (!current) return current
      const index = (current.index + difference + current.images.length) % current.images.length
      return { ...current, index }
    })
  }

  useEffect(() => {
    if (!imageViewer && !pdfViewer) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setImageViewer(null)
        setPdfViewer(null)
      }
      if (imageViewer && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        const difference = event.key === 'ArrowLeft' ? -1 : 1
        setImageZoom(1)
        setImageViewer((current) => {
          if (!current) return current
          const index = (current.index + difference + current.images.length) % current.images.length
          return { ...current, index }
        })
      }
      if (imageViewer && (event.key === '+' || event.key === '=')) setImageZoom((current) => Math.min(4, current + 0.25))
      if (imageViewer && event.key === '-') setImageZoom((current) => Math.max(1, current - 0.25))
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [imageViewer, pdfViewer])

  return (
    <>
      <PageHero
        eyebrow="การดำเนินงาน"
        title="ประกันคุณภาพภายนอก (สมศ.)"
        description="เอกสารหลักฐานการประกันคุณภาพภายนอก รอบที่ 5 ระดับปฐมวัยและระดับการศึกษาขั้นพื้นฐาน"
        icon={ShieldCheck}
      />
      <section className="section quality-hub">
        <div className="container">
          <div className="quality-intro">
            <div>
              <span className="quality-intro__eyebrow"><ShieldCheck size={17} /> ONESQA รอบที่ 5</span>
              <h2>ศูนย์รวมมาตรฐาน ตัวชี้วัด และเอกสารหลักฐาน</h2>
              <p>จัดหมวดหมู่หลักฐานตามกรอบแนวทางการประกันคุณภาพภายนอก พ.ศ. 2567–2571 เพื่อให้ค้นหาและตรวจสอบข้อมูลได้สะดวก</p>
            </div>
            <div className="quality-intro__summary">
              <article><strong>2</strong><span>ระดับการศึกษา</span></article>
              <article><strong>6</strong><span>มาตรฐาน</span></article>
              <article><strong>34</strong><span>ตัวชี้วัด</span></article>
            </div>
          </div>

          <div className="quality-levels" aria-label="เลือกระดับการศึกษา">
            {qualityLevels.map((item, index) => (
              <button
                className={`quality-level-card ${activeLevel === item.id ? 'is-active' : ''}`}
                type="button"
                aria-pressed={activeLevel === item.id}
                onClick={() => selectLevel(item.id)}
                key={item.id}
              >
                <span className="quality-level-card__number">0{index + 1}</span>
                <span className="quality-level-card__icon">
                  {item.id === 'early' ? <School size={29} /> : <GraduationCap size={29} />}
                </span>
                <div>
                  <small>{item.shortLabel}</small>
                  <h3>เอกสารประกอบ{item.label}</h3>
                  <p>{item.description}</p>
                  <strong>{item.summary}</strong>
                </div>
                <ArrowRight size={20} />
              </button>
            ))}
          </div>

          <div className="quality-document-heading">
            <div>
              <span>{level.shortLabel}</span>
              <h2>เอกสารประกอบ{level.label}</h2>
              <p>{level.summary} · เปิดมาตรฐาน แล้วเลือกตัวชี้วัดและรายการหลักฐานที่ต้องการอ่าน</p>
            </div>
            <a href={level.manualUrl} target="_blank" rel="noreferrer">
              <BookOpenText size={18} /> เปิดคู่มือ สมศ. <ExternalLink size={15} />
            </a>
          </div>

          <div className="quality-standards">
            {level.standards.map((standard) => {
              const isOpen = openStandards.includes(standard.number)
              const standardEvidence = evidence.filter(
                (item) => item.education_level === level.id
                  && item.indicator_code.startsWith(`${standard.number}.`),
              )
              return (
                <article className={`quality-standard ${isOpen ? 'is-open' : ''}`} key={`${level.id}-${standard.number}`}>
                  <button
                    className="quality-standard__heading"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleStandard(standard.number)}
                  >
                    <span>{standard.number}</span>
                    <div>
                      <small>มาตรฐานที่ {standard.number}</small>
                      <h3>{standard.title}</h3>
                      <p>{standard.indicators.length} ตัวชี้วัด · {standardEvidence.length} เอกสารหลักฐาน</p>
                    </div>
                    <ChevronDown size={22} />
                  </button>
                  {isOpen && (
                    <div className="quality-indicators">
                      {standard.indicators.map((indicator) => {
                        const indicatorEvidence = evidence.filter(
                          (item) => item.education_level === level.id
                            && item.indicator_code === indicator.code,
                        )
                        const indicatorKey = `${level.id}-${indicator.code}`
                        const isIndicatorOpen = openIndicator === indicatorKey
                        return (
                          <article className={`quality-indicator ${isIndicatorOpen ? 'is-open' : ''}`} key={indicatorKey}>
                            <button
                              className="quality-indicator__heading"
                              type="button"
                              aria-expanded={isIndicatorOpen}
                              disabled={!indicatorEvidence.length}
                              onClick={() => {
                                setOpenIndicator(isIndicatorOpen ? '' : indicatorKey)
                                setOpenEvidence('')
                              }}
                            >
                              <span className="quality-indicator__code">{indicator.code}</span>
                              <span className="quality-indicator__summary">
                                <strong>{indicator.title}</strong>
                                <small>
                                  {indicatorEvidence.length
                                    ? `มีหลักฐานเผยแพร่ ${indicatorEvidence.length} รายการ`
                                    : 'ยังไม่มีเอกสารหลักฐานที่เผยแพร่'}
                                </small>
                              </span>
                              <span className={`quality-indicator__count ${indicatorEvidence.length ? 'has-evidence' : ''}`}>
                                <FileText size={15} /> {indicatorEvidence.length}
                              </span>
                              {indicatorEvidence.length > 0 && <ChevronDown size={20} />}
                            </button>
                            {isIndicatorOpen && (
                              <div className="quality-indicator__content">
                                <div className="quality-evidence-list">
                                  {indicatorEvidence.map((item) => {
                                    const documentUrls = item.document_urls?.length
                                      ? item.document_urls
                                      : [item.document_url].filter(Boolean)
                                    const documentTypes = item.document_types?.length
                                      ? item.document_types
                                      : [
                                          item.document_type,
                                          item.document_type_2,
                                          item.document_type_3,
                                          item.document_type_4,
                                          item.document_type_5,
                                        ]
                                    const imageUrls = documentUrls.filter((url, index) => (
                                      isEvidenceImage(url, documentTypes[index])
                                    ))
                                    const pdfDocuments = documentUrls
                                      .map((url, index) => ({
                                        url,
                                        documentIndex: index,
                                        mimeType: documentTypes[index],
                                      }))
                                      .filter((document) => isEvidencePdf(document.url, document.mimeType))
                                    const otherDocumentCount = Math.max(
                                      0,
                                      documentUrls.length - imageUrls.length - pdfDocuments.length,
                                    )
                                    const isEvidenceOpen = openEvidence === item.id
                                    return (
                                      <article className={`quality-evidence-entry ${isEvidenceOpen ? 'is-open' : ''}`} key={item.id}>
                                        <button
                                          className="quality-evidence-entry__heading"
                                          type="button"
                                          aria-expanded={isEvidenceOpen}
                                          onClick={() => setOpenEvidence(isEvidenceOpen ? '' : item.id)}
                                        >
                                          <span className="quality-evidence-entry__icon"><FileText size={18} /></span>
                                          <span className="quality-evidence-entry__summary">
                                            <strong>{item.title}</strong>
                                            {item.description && <small>{item.description}</small>}
                                          </span>
                                          <span className="quality-evidence-entry__types">
                                            {imageUrls.length > 0 && <small><Images size={14} /> รูป {imageUrls.length}</small>}
                                            {pdfDocuments.length > 0 && <small><FileText size={14} /> PDF {pdfDocuments.length}</small>}
                                            {otherDocumentCount > 0 && <small><Link2 size={14} /> ไฟล์ {otherDocumentCount}</small>}
                                          </span>
                                          <ChevronDown size={19} />
                                        </button>
                                        {isEvidenceOpen && (
                                          <div className="quality-evidence-entry__content">
                                            {imageUrls.length > 0 && (
                                              <div className="quality-evidence-entry__gallery">
                                                {imageUrls.map((url, index) => (
                                                  <button
                                                    type="button"
                                                    onClick={() => openImageViewer(imageUrls, index, item.title)}
                                                    aria-label={`เปิดภาพหลักฐาน ${index + 1} ขนาดเต็ม`}
                                                    key={`${url}-${index}`}
                                                  >
                                                    <img
                                                      src={displayImageUrl(url)}
                                                      alt={`${item.title} ภาพที่ ${index + 1}`}
                                                      loading="lazy"
                                                      onError={(event) => {
                                                        const previewButton = event.currentTarget.closest('button')
                                                        if (previewButton) previewButton.hidden = true
                                                      }}
                                                    />
                                                    <span><ZoomIn size={16} /> ดูภาพเต็ม</span>
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                            {pdfDocuments.length > 0 && (
                                              <div className="quality-evidence-entry__pdf-grid">
                                                {pdfDocuments.map((document) => (
                                                  <article key={`${document.url}-${document.documentIndex}`}>
                                                    <iframe
                                                      src={displayPdfUrl(document.url)}
                                                      title={`${item.title} ตัวอย่าง PDF หลักฐานที่ ${document.documentIndex + 1}`}
                                                      loading="lazy"
                                                      tabIndex="-1"
                                                      aria-hidden="true"
                                                    />
                                                    <button
                                                      type="button"
                                                      onClick={() => setPdfViewer({
                                                        url: document.url,
                                                        title: `${item.title} · หลักฐานที่ ${document.documentIndex + 1}`,
                                                      })}
                                                      aria-label={`เปิดอ่าน PDF หลักฐานที่ ${document.documentIndex + 1}`}
                                                    >
                                                      <span><FileText size={17} /> PDF หลักฐานที่ {document.documentIndex + 1}</span>
                                                      <strong><BookOpenText size={16} /> เปิดอ่านในหน้าเว็บ</strong>
                                                    </button>
                                                  </article>
                                                ))}
                                              </div>
                                            )}
                                            <div className="quality-evidence-entry__links">
                                              {documentUrls.map((url, index) => (
                                                <a href={url} target="_blank" rel="noreferrer" key={`${url}-${index}`}>
                                                  หลักฐานที่ {index + 1} <ExternalLink size={14} />
                                                </a>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </article>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </article>
                        )
                      })}
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          <div className="quality-manage-note">
            <span><ShieldCheck size={25} /></span>
            <div>
              <strong>จัดการลิงก์หลักฐานผ่านระบบบริหารจัดการ</strong>
              <p>ผู้ที่ได้รับสิทธิ์สามารถเพิ่มไฟล์ รูปภาพ หรือลิงก์หลักฐานให้ตรงกับระดับการศึกษาและตัวชี้วัดได้</p>
            </div>
            <a className="button button--navy" href="/login">เข้าสู่ระบบ <ArrowRight size={17} /></a>
          </div>

          <p className="quality-source">
            อ้างอิงกรอบแนวทางการประกันคุณภาพภายนอก พ.ศ. 2567–2571 ฉบับปรับปรุงเพิ่มเติม ลงวันที่ 1 ธันวาคม 2566
          </p>
        </div>
      </section>
      <QualityImageViewer
        viewer={imageViewer}
        zoom={imageZoom}
        setZoom={setImageZoom}
        onMove={moveImageViewer}
        onClose={() => setImageViewer(null)}
      />
      <QualityPdfViewer
        viewer={pdfViewer}
        onClose={() => setPdfViewer(null)}
      />
    </>
  )
}

function HomeOperations() {
  const operationMenu = navItems.find((item) => item.label === 'การดำเนินงาน')
  const icons = [GraduationCap, ShieldCheck, School, ClipboardCheck]
  const descriptions = [
    'ข้อมูลการสอบ RT, NT และ O-NET',
    'ข้อมูลการประเมินคุณภาพภายนอก',
    'การพัฒนาโรงเรียนขยายโอกาสคุณภาพ',
    'คุณธรรมและความโปร่งใสในการดำเนินงาน',
  ]

  return (
    <section className="section home-operations">
      <div className="container">
        <SectionHeading
          eyebrow="การดำเนินงาน"
          title="ติดตามภารกิจสำคัญของโรงเรียน"
          description="เข้าถึงข้อมูลการวัดผล การประกันคุณภาพ และการดำเนินงานที่สำคัญได้จากหน้าเฉพาะ"
          align="center"
        />
        <div className="home-operations__grid">
          {operationMenu.children.map((item, index) => {
            const Icon = icons[index]
            return (
              <a
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                key={item.label}
              >
                <span><Icon size={27} /></span>
                <div><h3>{item.label}</h3><p>{descriptions[index]}</p></div>
                <ArrowRight size={18} />
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const servicePageData = {
  results: {
    eyebrow: 'บริการสำหรับนักเรียน',
    title: 'ตรวจสอบผลการเรียน',
    description: 'แนวทางการติดต่อขอตรวจสอบข้อมูลผลการเรียนและเอกสารทางการศึกษา',
    icon: ClipboardCheck,
    heading: 'ตรวจสอบข้อมูลอย่างถูกต้องและปลอดภัย',
    text: 'เพื่อคุ้มครองข้อมูลของนักเรียน กรุณาติดต่อครูประจำชั้นหรืองานวิชาการของโรงเรียนโดยตรง พร้อมแจ้งชื่อ–สกุลและระดับชั้นของนักเรียน',
    action: 'ติดต่องานวิชาการ',
    href: '/contact',
  },
  downloads: {
    eyebrow: 'เอกสารออนไลน์',
    title: 'ดาวน์โหลดเอกสาร/คำร้อง',
    description: 'พื้นที่รวบรวมแบบฟอร์มและเอกสารที่ใช้ติดต่อราชการกับโรงเรียน',
    icon: Download,
    heading: 'เอกสารและแบบคำร้องของโรงเรียน',
    text: 'โรงเรียนกำลังจัดเตรียมไฟล์เอกสารฉบับล่าสุด หากต้องการแบบคำร้องเร่งด่วน สามารถติดต่อโรงเรียนเพื่อขอรับไฟล์ที่ถูกต้องได้ตามช่องทางด้านล่าง',
    action: 'ขอรับเอกสาร',
    href: '/contact',
  },
}

function ServiceInfoPage({ type }) {
  const page = servicePageData[type]
  const Icon = page.icon
  return (
    <>
      <PageHero {...page} />
      <section className="section inner-content">
        <div className="container service-detail">
          <span><Icon size={42} /></span>
          <h2>{page.heading}</h2>
          <p>{page.text}</p>
          <a className="button button--navy" href={page.href}>{page.action}<ArrowRight size={17} /></a>
        </div>
      </section>
    </>
  )
}

function DocumentsPage({ documents = [] }) {
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด')
  const categories = ['ทั้งหมด', ...new Set(documents.map((item) => item.category))]
  const filteredDocuments = activeCategory === 'ทั้งหมด'
    ? documents
    : documents.filter((item) => item.category === activeCategory)

  return (
    <>
      <PageHero
        eyebrow="เอกสารออนไลน์"
        title="ดาวน์โหลดเอกสาร/คำร้อง"
        description="คลังเอกสาร แบบคำร้อง คู่มือ และเอกสารวิชาการของโรงเรียนบ้านน้ำพร"
        icon={Download}
      />
      <section className="section documents-page">
        <div className="container">
          <div className="documents-intro">
            <div>
              <span><FileText size={19} /> SCHOOL DOCUMENT CENTER</span>
              <h2>เอกสารและแบบคำร้องของโรงเรียน</h2>
              <p>เลือกเปิดหรือดาวน์โหลดเอกสารฉบับล่าสุดจาก Google Drive โดยไม่ต้องจัดเก็บไฟล์ซ้ำบนเว็บไซต์</p>
            </div>
            <strong>{documents.length} รายการ</strong>
          </div>

          {documents.length ? (
            <>
              <div className="documents-filters" role="group" aria-label="กรองประเภทเอกสาร">
                {categories.map((category) => (
                  <button
                    className={activeCategory === category ? 'is-active' : ''}
                    type="button"
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                    key={category}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="documents-table-wrap">
                <table className="documents-table">
                  <thead>
                    <tr>
                      <th>เอกสาร</th>
                      <th>ประเภท</th>
                      <th>วันที่เผยแพร่</th>
                      <th><span className="sr-only">ดาวน์โหลด</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="documents-table__icon"><FileText size={20} /></span>
                          <div>
                            <strong>{item.title}</strong>
                            {item.description && <small>{item.description}</small>}
                          </div>
                        </td>
                        <td><span className="documents-table__category">{item.category}</span></td>
                        <td>
                          {new Date(`${item.publish_date}T00:00:00`).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </td>
                        <td>
                          <div className="documents-table__downloads">
                            {contentAttachmentUrls(item).map((url, index) => (
                              <a href={url} target="_blank" rel="noreferrer" key={url}>
                                <Download size={16} /> ดาวน์โหลด {index + 1}
                              </a>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="content-empty">
              <span><FileText size={34} /></span>
              <strong>ยังไม่มีเอกสารเผยแพร่</strong>
              <p>เมื่อโรงเรียนเพิ่มเอกสารจากระบบบริหาร รายการจะปรากฏในตารางนี้</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function QaPage({ publishedQuestions = [] }) {
  const commonQuestions = [
    ['โรงเรียนเปิดสอนระดับชั้นใดบ้าง?', `เปิดสอนตั้งแต่ระดับชั้น${schoolInfo.educationLevels}`],
    ['โรงเรียนตั้งอยู่ที่ไหน?', contactDetails.address],
    ['ติดต่อโรงเรียนในวันและเวลาใด?', 'วันจันทร์–ศุกร์ เวลา 08.00–16.30 น.'],
    ['ติดตามข่าวสารของโรงเรียนได้จากที่ใด?', 'ติดตามได้จากเมนูข่าวสาร จดหมายข่าว และ Facebook โรงเรียนบ้านน้ำพร'],
  ]
  const [form, setForm] = useState({ name: '', email: '', question: '', website: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch('/api/services?resource=questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'ไม่สามารถส่งคำถามได้')
      setForm({ name: '', email: '', question: '', website: '' })
      setMessage({ type: 'success', text: body.message })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="บริการ"
        title="ถาม-ตอบ (Q&A)"
        description="ส่งคำถามถึงโรงเรียนและติดตามคำตอบที่ผ่านการตรวจสอบแล้ว"
        icon={HelpCircle}
      />
      <section className="section qa-page">
        <div className="container qa-layout">
          <form className="public-form qa-form" onSubmit={submit}>
            <div className="public-form__heading">
              <span><HelpCircle size={24} /></span>
              <div><small>ASK THE SCHOOL</small><h2>ส่งคำถามถึงโรงเรียน</h2></div>
            </div>
            <div className="public-form__grid">
              <label>
                <span>ชื่อผู้ถาม</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  maxLength={80}
                  required
                />
              </label>
              <label>
                <span>อีเมลสำหรับติดต่อกลับ <small>(ไม่บังคับ)</small></span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  maxLength={120}
                />
              </label>
              <label className="public-form__wide">
                <span>คำถาม</span>
                <textarea
                  value={form.question}
                  onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))}
                  rows={6}
                  minLength={10}
                  maxLength={2000}
                  placeholder="อธิบายคำถามให้ชัดเจนเพื่อให้โรงเรียนตอบได้ตรงประเด็น"
                  required
                />
              </label>
              <label className="form-honeypot" aria-hidden="true">
                <span>Website</span>
                <input
                  tabIndex="-1"
                  autoComplete="off"
                  value={form.website}
                  onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                />
              </label>
            </div>
            {message && <p className={`public-form__message is-${message.type}`}>{message.text}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
              {submitting ? 'กำลังส่งคำถาม...' : 'ส่งคำถาม'}
            </button>
            <p className="public-form__privacy">คำถามจะผ่านการตรวจสอบและตอบโดยผู้ที่ได้รับสิทธิ์ก่อนแสดงบนเว็บไซต์</p>
          </form>

          <div className="qa-content">
            <SectionHeading
              eyebrow="คำถามที่เผยแพร่"
              title="คำถามและคำตอบจากโรงเรียน"
              description="ผู้ดูแลระบบเป็นผู้คัดเลือกคำถามที่เป็นประโยชน์ให้แสดงในส่วนนี้"
            />
            <div className="faq-list">
              {publishedQuestions.map((item) => (
                <details key={item.id}>
                  <summary>{item.question}<ChevronDown size={20} /></summary>
                  <p>{item.answer}</p>
                  <small>ถามโดย {item.name}</small>
                </details>
              ))}
              {commonQuestions.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}<ChevronDown size={20} /></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ComplaintsPage() {
  const [form, setForm] = useState({
    complainant_name: '',
    contact: '',
    subject: '',
    details: '',
    evidence_urls: [''],
    website: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const updateEvidence = (index, value) => {
    setForm((current) => ({
      ...current,
      evidence_urls: current.evidence_urls.map((url, urlIndex) => (
        index === urlIndex ? value : url
      )),
    }))
  }

  const addEvidence = () => {
    setForm((current) => (
      current.evidence_urls.length >= 5
        ? current
        : { ...current, evidence_urls: [...current.evidence_urls, ''] }
    ))
  }

  const removeEvidence = (index) => {
    setForm((current) => {
      const urls = current.evidence_urls.filter((_, urlIndex) => urlIndex !== index)
      return { ...current, evidence_urls: urls.length ? urls : [''] }
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch('/api/services?resource=complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'ไม่สามารถส่งเรื่องได้')
      setForm({
        complainant_name: '',
        contact: '',
        subject: '',
        details: '',
        evidence_urls: [''],
        website: '',
      })
      setMessage({
        type: 'success',
        text: `${body.message} เลขอ้างอิง ${body.reference}`,
      })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="บริการ"
        title="แจ้งเรื่องร้องเรียน"
        description="ช่องทางรับฟังความคิดเห็น ข้อเสนอแนะ และเรื่องร้องเรียนอย่างเหมาะสม"
        icon={MessageSquareWarning}
      />
      <section className="section complaints-page">
        <div className="container complaint-layout">
          <div>
            <SectionHeading
              eyebrow="ช่องทางติดต่อ"
              title="แจ้งข้อมูลกับโรงเรียนโดยตรง"
              description="โปรดระบุรายละเอียดที่จำเป็นและช่องทางติดต่อกลับ โรงเรียนจะดูแลข้อมูลอย่างเหมาะสมและประสานผู้รับผิดชอบ"
            />
            <p className="complaint-layout__note">ข้อมูลที่ส่งจะไม่แสดงบนเว็บไซต์และเข้าถึงได้เฉพาะผู้ที่ได้รับสิทธิ์ หากเป็นเหตุเร่งด่วนหรือเกี่ยวข้องกับความปลอดภัย กรุณาโทรติดต่อโรงเรียนโดยตรง</p>
            <div className="complaint-channels">
              <a href={contactDetails.phoneHref}><Phone size={23} /><span><small>โทรศัพท์</small><strong>{contactDetails.phone}</strong></span></a>
              <a href={contactDetails.emailHref}><Mail size={23} /><span><small>อีเมล</small><strong>{contactDetails.email}</strong></span></a>
            </div>
          </div>
          <form className="public-form complaint-form" onSubmit={submit}>
            <div className="public-form__heading">
              <span><MessageSquareWarning size={24} /></span>
              <div><small>PRIVATE COMPLAINT FORM</small><h2>แบบฟอร์มแจ้งเรื่องร้องเรียน</h2></div>
            </div>
            <div className="public-form__grid">
              <label>
                <span>ชื่อผู้แจ้ง</span>
                <input
                  value={form.complainant_name}
                  onChange={(event) => setForm((current) => ({ ...current, complainant_name: event.target.value }))}
                  maxLength={80}
                  required
                />
              </label>
              <label>
                <span>โทรศัพท์ อีเมล หรือช่องทางติดต่อกลับ</span>
                <input
                  value={form.contact}
                  onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))}
                  maxLength={150}
                  required
                />
              </label>
              <label className="public-form__wide">
                <span>หัวข้อเรื่อง</span>
                <input
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  maxLength={180}
                  required
                />
              </label>
              <label className="public-form__wide">
                <span>รายละเอียด</span>
                <textarea
                  value={form.details}
                  onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))}
                  rows={7}
                  minLength={10}
                  maxLength={5000}
                  required
                />
              </label>
              <div className="public-form__wide evidence-links">
                <div className="evidence-links__heading">
                  <span>ลิงก์รูปภาพหรือเอกสารหลักฐาน <small>(ไม่บังคับ)</small></span>
                  <button type="button" onClick={addEvidence} disabled={form.evidence_urls.length >= 5}>
                    <Plus size={15} /> เพิ่มลิงก์
                  </button>
                </div>
                {form.evidence_urls.map((url, index) => (
                  <div className="evidence-links__row" key={index}>
                    <Link2 size={17} />
                    <input
                      type="url"
                      value={url}
                      onChange={(event) => updateEvidence(index, event.target.value)}
                      placeholder={`https://... ลิงก์หลักฐานที่ ${index + 1}`}
                      aria-label={`ลิงก์หลักฐานที่ ${index + 1}`}
                    />
                    {form.evidence_urls.length > 1 && (
                      <button type="button" onClick={() => removeEvidence(index)} aria-label={`ลบลิงก์ที่ ${index + 1}`}>
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <small>รองรับลิงก์ https สูงสุด 5 รายการ ระบบจะไม่อัปโหลดไฟล์เข้า GitHub</small>
              </div>
              <label className="form-honeypot" aria-hidden="true">
                <span>Website</span>
                <input
                  tabIndex="-1"
                  autoComplete="off"
                  value={form.website}
                  onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                />
              </label>
            </div>
            {message && <p className={`public-form__message is-${message.type}`}>{message.text}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
              {submitting ? 'กำลังส่งเรื่อง...' : 'ส่งเรื่องร้องเรียน'}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

function PublicSubPage({ path, publicContent }) {
  if (path === '/operations/national-tests') return <OperationPage type="nationalTests" />
  if (path === '/operations/external-quality') {
    return <QualityAssurancePage evidence={publicContent.qualityEvidence} />
  }
  if (path === '/operations/ita') return <OperationPage type="ita" />
  if (path === '/about/basic-info') {
    return <><PageHero eyebrow="เกี่ยวกับโรงเรียน" title="ข้อมูลพื้นฐาน" description="ข้อมูลสำคัญและภาพรวมของโรงเรียนบ้านน้ำพร" icon={Building2} /><BasicInfoPage /></>
  }
  if (path === '/about/staff') {
    return <><PageHero eyebrow="เกี่ยวกับโรงเรียน" title="ข้อมูลบุคลากร" description="ทำความรู้จักผู้บริหาร ครู และบุคลากรของโรงเรียน" icon={Users} /><StaffPage /></>
  }
  if (path === '/about/history') {
    return <><PageHero eyebrow="เกี่ยวกับโรงเรียน" title="ประวัติโรงเรียน" description="เรื่องราวของสถานศึกษาที่เติบโตเคียงข้างชุมชนบ้านน้ำพร" icon={History} /><HistoryPage /></>
  }
  if (path === '/achievements') {
    return <><PageHero eyebrow="โรงเรียนบ้านน้ำพร" title="ผลงานและรางวัล" description="ความภาคภูมิใจของนักเรียน ครู และสถานศึกษา" icon={Trophy} /><Achievements awards={publicContent.awards} grouped /></>
  }
  if (path === '/news/activities') {
    return <><PageHero eyebrow="ข่าวสาร" title="กิจกรรม" description="ข่าวกิจกรรมและประสบการณ์การเรียนรู้ของนักเรียน" icon={CalendarDays} /><News liveNews={publicContent.news} fixedCategory="กิจกรรม" paginate={false} eyebrow="ข่าวกิจกรรม" title="กิจกรรมล่าสุดของโรงเรียน" description="ติดตามภาพและเรื่องราวจากกิจกรรมของโรงเรียน" /></>
  }
  if (path === '/news/public-relations') {
    return <><PageHero eyebrow="ข่าวสาร" title="ประชาสัมพันธ์" description="ข่าวประชาสัมพันธ์และเรื่องราวล่าสุดจากโรงเรียน" icon={Bell} /><News liveNews={publicContent.news} fixedCategory="ประชาสัมพันธ์" paginate={false} eyebrow="ประชาสัมพันธ์" title="ข่าวประชาสัมพันธ์ล่าสุด" /></>
  }
  if (path === '/news/announcements') {
    return <><PageHero eyebrow="ข่าวสาร" title="ประกาศ" description="ประกาศและข้อมูลสำคัญจากโรงเรียนบ้านน้ำพร" icon={Newspaper} /><News liveNews={publicContent.news} fixedCategory="ประกาศ" paginate={false} eyebrow="ประกาศโรงเรียน" title="ประกาศล่าสุด" /></>
  }
  if (path === '/news/newsletters') {
    return <><PageHero eyebrow="ข่าวสาร" title="จดหมายข่าว" description="จดหมายข่าวประชาสัมพันธ์และสรุปกิจกรรมของโรงเรียน" icon={Images} /><Newsletters newsletters={publicContent.newsletters} paginate={false} /></>
  }
  if (path === '/services/results') return <ServiceInfoPage type="results" />
  if (path === '/services/downloads') return <DocumentsPage documents={publicContent.documents} />
  if (path === '/services/qa') return <QaPage publishedQuestions={publicContent.questions} />
  if (path === '/services/complaints') return <ComplaintsPage />
  if (path === '/contact') {
    return <><PageHero eyebrow="โรงเรียนบ้านน้ำพร" title="ติดต่อเรา" description="ช่องทางติดต่อ ที่อยู่ และแผนที่โรงเรียน" icon={Phone} /><Contact /></>
  }
  return (
    <>
      <PageHero eyebrow="เว็บไซต์โรงเรียน" title="ไม่พบหน้าที่ต้องการ" description="ลิงก์นี้อาจถูกเปลี่ยนหรือไม่มีอยู่ในระบบ" icon={School} />
      <section className="section inner-content"><div className="container service-detail"><a className="button button--navy" href="/">กลับหน้าแรก</a></div></section>
    </>
  )
}

function Services() {
  return (
    <section className="section services" id="services">
      <div className="container">
        <SectionHeading
          eyebrow="เมนูเว็บไซต์"
          title="เข้าถึงทุกส่วนของเว็บไซต์ได้ง่ายขึ้น"
          description="รวมทางเข้าสู่ข้อมูลโรงเรียน ผลงาน การดำเนินงาน ข่าวสาร บริการ และช่องทางติดต่อไว้ในส่วนเดียว"
          align="center"
        />
        <div className="services__grid">
          {services.map(({ icon: Icon, title, description, href }, index) => (
            <article className="service-card reveal" key={title}>
              <span className="service-card__number">0{index + 1}</span>
              <span className="service-card__icon">
                <Icon size={27} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
              <a href={href} aria-label={`เปิดดูข้อมูล ${title}`}>
                เปิดดูข้อมูล
                <ArrowRight size={17} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function DirectorMessage() {
  return (
    <section className="director">
      <div className="container director__card reveal">
        <div className="director__mark" aria-hidden="true">
          <Quote />
        </div>
        <div className="director__logo">
          <img src="/np.png" alt="" aria-hidden="true" />
        </div>
        <div className="director__copy">
          <span className="eyebrow eyebrow--light">
            <span className="eyebrow__dot" />
            สารจากโรงเรียน
          </span>
          <blockquote>
            “เราเชื่อว่าเด็กทุกคนเรียนรู้และเติบโตได้ เมื่อได้รับโอกาส
            ความเข้าใจ และแรงสนับสนุนที่เหมาะสม”
          </blockquote>
          <p>
            โรงเรียนบ้านน้ำพรพร้อมทำงานร่วมกับครอบครัวและชุมชน
            เพื่อสร้างการศึกษาที่มีความหมายและความสุขให้กับเด็กทุกคน
          </p>
        </div>
        <div className="director__roots" aria-hidden="true">
          <Leaf />
          <Leaf />
          <Leaf />
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container contact__grid">
        <div className="contact__copy reveal">
          <SectionHeading
            eyebrow="ติดต่อโรงเรียน"
            title="พูดคุยกับเราได้เสมอ"
            description="หากต้องการสอบถามข้อมูลการเรียน กิจกรรม หรือประสานงานกับโรงเรียน สามารถติดต่อได้ตามช่องทางด้านล่าง"
          />
          <div className="contact-list">
            <a href={contactDetails.mapHref} target="_blank" rel="noreferrer">
              <span><MapPin size={22} /></span>
              <div>
                <small>ที่อยู่</small>
                <strong>{contactDetails.address}</strong>
              </div>
            </a>
            <a href={contactDetails.phoneHref}>
              <span><Phone size={22} /></span>
              <div>
                <small>โทรศัพท์</small>
                <strong>{contactDetails.phone}</strong>
              </div>
            </a>
            <a href={contactDetails.emailHref}>
              <span><Mail size={22} /></span>
              <div>
                <small>อีเมล</small>
                <strong>{contactDetails.email}</strong>
              </div>
            </a>
            <div>
              <span><Clock3 size={22} /></span>
              <div>
                <small>เวลาทำการ</small>
                <strong>วันจันทร์–ศุกร์ เวลา 08.00–16.30 น.</strong>
              </div>
            </div>
          </div>
          <div className="contact__actions">
            <a className="button button--navy" href={contactDetails.phoneHref}>
              <Phone size={18} />
              โทรหาโรงเรียน
            </a>
            <a
              className="button button--outline"
              href={contactDetails.mapHref}
              target="_blank"
              rel="noreferrer"
            >
              เปิดแผนที่
              <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <div className="map-card reveal">
          <div className="map-card__grid" aria-hidden="true" />
          <div className="map-card__road map-card__road--one" aria-hidden="true" />
          <div className="map-card__road map-card__road--two" aria-hidden="true" />
          <div className="map-card__marker">
            <span><MapPin size={28} fill="currentColor" /></span>
            <div>
              <strong>โรงเรียนบ้านน้ำพร</strong>
              <small>Bannamporn School · ต.ปากตม อ.เชียงคาน จ.เลย</small>
            </div>
          </div>
          <div className="map-card__location">
            <span>อำเภอเชียงคาน</span>
            <span>จังหวัดเลย</span>
          </div>
          <a href={contactDetails.mapHref} target="_blank" rel="noreferrer">
            ดูเส้นทางบน Google Maps
            <ArrowRight size={17} />
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const year = new Date().getFullYear() + 543
  const footerLinks = navItems.flatMap((item) => item.children || [item])

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">
          <div className="footer__brand">
            <a className="brand brand--footer" href="/">
              <span className="brand__logo">
                <img src="/np.png" alt="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร" />
              </span>
              <span className="brand__text">
                <AutoFitText as="strong">{schoolInfo.thaiName}</AutoFitText>
                <AutoFitText as="small">{schoolInfo.englishName}</AutoFitText>
              </span>
            </a>
            <p>{schoolInfo.summary}</p>
            <div className="footer__socials">
              <a href={contactDetails.phoneHref} aria-label="โทรหาโรงเรียน"><Phone size={19} /></a>
              <a href={contactDetails.emailHref} aria-label="ส่งอีเมลถึงโรงเรียน"><Mail size={19} /></a>
              <a href={contactDetails.mapHref} target="_blank" rel="noreferrer" aria-label="เปิดแผนที่โรงเรียน"><MapPin size={19} /></a>
            </div>
          </div>
          <div className="footer__nav">
            <h3>เมนูเว็บไซต์</h3>
            {footerLinks.slice(0, 5).map((item) => (
              <a
                href={item.href}
                key={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="footer__nav">
            <h3>ข้อมูลสำคัญ</h3>
            {footerLinks.slice(5, 9).map((item) => (
              <a
                href={item.href}
                key={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="footer__contact">
            <h3>ติดต่อเรา</h3>
            <p><MapPin size={17} />{contactDetails.address}</p>
            <a href={contactDetails.phoneHref}><Phone size={17} />{contactDetails.phone}</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          <p>© {year} โรงเรียนบ้านน้ำพร สงวนลิขสิทธิ์</p>
          <span>เว็บไซต์เพื่อการศึกษาและชุมชน</span>
        </div>
      </div>
    </footer>
  )
}

function MessengerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.5 5.5 3.8 7.2V22l3.5-1.9c.9.3 1.8.4 2.7.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2Zm1 12-2.5-2.7-4.8 2.7 5.3-5.6 2.5 2.7 4.8-2.7L13 14Z"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.7 22v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5H17V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H8V14h2.6v8h3.1Z"
      />
    </svg>
  )
}

function ContactFab() {
  const [isOpen, setIsOpen] = useState(false)
  const actions = [
    {
      label: 'อีเมล',
      detail: contactDetails.email,
      href: contactDetails.emailHref,
      icon: <Mail size={22} />,
      className: 'contact-fab__action--email',
    },
    {
      label: 'โทร',
      detail: contactDetails.phone,
      href: contactDetails.phoneHref,
      icon: <Phone size={22} />,
      className: 'contact-fab__action--phone',
    },
    {
      label: 'Messenger',
      detail: 'ส่งข้อความหาโรงเรียน',
      href: contactDetails.messengerHref,
      icon: <MessengerIcon />,
      className: 'contact-fab__action--messenger',
      external: true,
    },
    {
      label: 'Facebook',
      detail: 'Namporn School',
      href: contactDetails.facebookHref,
      icon: <FacebookIcon />,
      className: 'contact-fab__action--facebook',
      external: true,
    },
  ]

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <div className={`contact-fab ${isOpen ? 'contact-fab--open' : ''}`}>
      <div className="contact-fab__actions" aria-hidden={!isOpen}>
        {actions.map((action) => (
          <a
            className={`contact-fab__action ${action.className}`}
            href={action.href}
            key={action.label}
            target={action.external ? '_blank' : undefined}
            rel={action.external ? 'noreferrer' : undefined}
            aria-label={`${action.label} ${action.detail}`}
            tabIndex={isOpen ? 0 : -1}
            onClick={() => setIsOpen(false)}
          >
            <span className="contact-fab__tooltip">
              <strong>{action.label}</strong>
              <small>{action.detail}</small>
            </span>
            <span className="contact-fab__action-icon">{action.icon}</span>
          </a>
        ))}
      </div>
      <button
        className="contact-fab__main"
        type="button"
        aria-label={isOpen ? 'ปิดช่องทางติดต่อ' : 'เปิดช่องทางติดต่อ'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <img src="/ติดต่อเรา.png" alt="" aria-hidden="true" />
        <span className="contact-fab__close"><X size={22} /></span>
      </button>
    </div>
  )
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const isHome = path === '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [publicContent, setPublicContent] = useState({
    news: [],
    events: [],
    awards: [],
    newsletters: [],
    qualityEvidence: [],
    documents: [],
    questions: [],
  })

  useEffect(() => {
    const allPages = navItems.flatMap((item) => item.children || [item])
    const currentPage = allPages.find((item) => item.href === path)
    document.title = currentPage
      ? `${currentPage.label} | โรงเรียนบ้านน้ำพร`
      : 'โรงเรียนบ้านน้ำพร | Bannamporn School'
    window.scrollTo({ top: 0 })
  }, [path])

  useEffect(() => {
    let active = true
    fetch('/api/public-content')
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (active) {
          setPublicContent({
            news: data.news || [],
            events: data.events || [],
            awards: data.awards || [],
            newsletters: data.newsletters || [],
            qualityEvidence: data.qualityEvidence || [],
            documents: data.documents || [],
            questions: data.questions || [],
          })
        }
      })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {isHome && <WelcomeSlider />}
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {isHome ? (
        <>
          <Hero />
          <Billboard />
          <About />
          <Achievements awards={publicContent.awards} />
          <HomeOperations />
          <News liveNews={publicContent.news} />
          <Newsletters newsletters={publicContent.newsletters} />
          <Activities liveEvents={publicContent.events} />
          <Services />
          <DirectorMessage />
          <Contact />
        </>
      ) : (
        <main className="subpage-main">
          <PublicSubPage path={path} publicContent={publicContent} />
        </main>
      )}
      <Footer />
      <ContactFab />
      <button
        type="button"
        className={`back-to-top ${showTop ? 'back-to-top--visible' : ''}`}
        aria-label="กลับขึ้นด้านบน"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp size={20} />
      </button>
    </>
  )
}

export default App
