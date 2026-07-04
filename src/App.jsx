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
  LogIn,
  Mail,
  MapPin,
  Menu,
  MessageSquareWarning,
  Newspaper,
  Phone,
  Quote,
  School,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
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

const categories = ['ทั้งหมด', 'ประชาสัมพันธ์', 'วิชาการ', 'กิจกรรม', 'ประกาศ']
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
            date: new Date(item.created_at).toLocaleDateString('th-TH', {
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
                    <img src={item.image_url} alt="" />
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
            {activeNews.image_url && <img className="modal__image" src={activeNews.image_url} alt="" />}
            <p className="modal__content">{activeNews.content || activeNews.excerpt}</p>
            {(activeNews.document_url || activeNews.photo_url) && (
              <div className="content-links">
                {activeNews.document_url && (
                  <a href={activeNews.document_url} target="_blank" rel="noreferrer">
                    <FileText size={18} /> เปิดเอกสาร PDF
                  </a>
                )}
                {activeNews.photo_url && (
                  <a href={activeNews.photo_url} target="_blank" rel="noreferrer">
                    <Images size={18} /> ดูภาพใน Google Photos
                  </a>
                )}
              </div>
            )}
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
                  <a href={item.image_url} target="_blank" rel="noreferrer" aria-label={`เปิดจดหมายข่าว ${item.issue_number}`}>
                    <img src={item.image_url} alt={`จดหมายข่าวประชาสัมพันธ์ ${item.issue_number}`} />
                    <span><ExternalLink size={17} /> เปิดดูฉบับเต็ม</span>
                  </a>
                  <div>
                    <Newspaper size={20} />
                    <strong>{item.issue_number}</strong>
                  </div>
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

function Achievements({ awards = [] }) {
  const [page, setPage] = useState(1)
  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(awards.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const displayedAwards = awards.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
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
              {displayedAwards.map((award) => (
              <article className="achievement-card" key={award.id}>
                <div className="achievement-card__visual">
                  {award.image_url ? <img src={award.image_url} alt="" /> : <Trophy size={48} />}
                  <span>{award.level || 'ผลงานโรงเรียน'}</span>
                </div>
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
                  {(award.document_url || award.photo_url) && (
                    <div className="content-links content-links--compact">
                      {award.document_url && (
                        <a href={award.document_url} target="_blank" rel="noreferrer">
                          <FileText size={16} /> เอกสาร PDF
                        </a>
                      )}
                      {award.photo_url && (
                        <a href={award.photo_url} target="_blank" rel="noreferrer">
                          <Images size={16} /> Google Photos
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
              ))}
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
      </div>
    </section>
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
  const items = [
    { label: 'ชื่อสถานศึกษา', value: `${schoolInfo.thaiName} · ${schoolInfo.englishName}`, icon: School },
    { label: 'ระดับชั้นที่เปิดสอน', value: schoolInfo.educationLevels, icon: GraduationCap },
    { label: 'ประเภทโรงเรียน', value: schoolInfo.schoolType, icon: Building2 },
    { label: 'หน่วยงานต้นสังกัด', value: schoolInfo.affiliation, icon: BookOpenText },
    { label: 'ที่ตั้ง', value: contactDetails.address, icon: MapPin },
    { label: 'ช่องทางติดต่อ', value: `${contactDetails.phone} · ${contactDetails.email}`, icon: Phone },
  ]
  return (
    <section className="section inner-content">
      <div className="container">
        <SectionHeading
          eyebrow="ข้อมูลสถานศึกษา"
          title="ข้อมูลพื้นฐานโรงเรียนบ้านน้ำพร"
          description={schoolInfo.summary}
        />
        <div className="info-card-grid">
          {items.map(({ label, value, icon: Icon }) => (
            <article className="info-card" key={label}>
              <span><Icon size={23} /></span>
              <div><small>{label}</small><strong>{value}</strong></div>
            </article>
          ))}
        </div>
        <a className="button button--navy inner-content__action" href={contactDetails.mapHref} target="_blank" rel="noreferrer">
          เปิดแผนที่โรงเรียน <ExternalLink size={17} />
        </a>
      </div>
    </section>
  )
}

function StaffPage() {
  return (
    <section className="section inner-content">
      <div className="container">
        <SectionHeading
          eyebrow="บุคลากรของเรา"
          title="คณะผู้บริหาร ครู และบุคลากร"
          description="บุคลากรโรงเรียนบ้านน้ำพรร่วมกันดูแลผู้เรียนและสร้างพื้นที่การเรียนรู้ที่ปลอดภัย เป็นมิตร และมีคุณภาพ"
          align="center"
        />
        <article className="director-profile">
          <div className="director-profile__image">
            <img src="/PO.png" alt="นางศิวาลัย แก้วเขียว ผู้อำนวยการโรงเรียนบ้านน้ำพร" />
          </div>
          <div>
            <span>ผู้อำนวยการโรงเรียน</span>
            <h2>นางศิวาลัย แก้วเขียว</h2>
            <p>บริหารสถานศึกษาโดยมุ่งเน้นคุณภาพผู้เรียน การทำงานร่วมกับครอบครัว และความเข้มแข็งของชุมชน</p>
          </div>
        </article>
        <div className="personnel-groups">
          <article><Users size={27} /><strong>คณะครูผู้สอน</strong><p>ร่วมออกแบบการเรียนรู้และดูแลนักเรียนทุกช่วงวัย</p></article>
          <article><School size={27} /><strong>บุคลากรทางการศึกษา</strong><p>สนับสนุนงานโรงเรียนและบริการนักเรียน ผู้ปกครอง และชุมชน</p></article>
        </div>
      </div>
    </section>
  )
}

function HistoryPage() {
  return (
    <section className="section inner-content">
      <div className="container history-layout">
        <div className="history-layout__seal"><img src="/np.png" alt="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร" /></div>
        <div>
          <SectionHeading
            eyebrow="เรื่องราวของโรงเรียน"
            title="ประวัติโรงเรียนบ้านน้ำพร"
            description="โรงเรียนของชุมชนที่พัฒนาโอกาสทางการศึกษาอย่างต่อเนื่อง"
          />
          <div className="prose-card">
            <p>โรงเรียนบ้านน้ำพรตั้งอยู่ที่บ้านน้ำพร ตำบลปากตม อำเภอเชียงคาน จังหวัดเลย เป็นสถานศึกษาที่ทำงานเชื่อมโยงกับครอบครัวและชุมชนในพื้นที่</p>
            <p>ปัจจุบันเปิดสอนตั้งแต่ระดับชั้นอนุบาล 2 ถึงมัธยมศึกษาปีที่ 3 ในฐานะโรงเรียนขยายโอกาส สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาเลย เขต 1</p>
            <p>โรงเรียนมุ่งพัฒนาพื้นฐานความรู้ คุณธรรม ทักษะชีวิต และเปิดโอกาสให้ผู้เรียนได้ค้นพบศักยภาพของตนเองผ่านการลงมือทำและการเรียนรู้จากบริบทจริง</p>
          </div>
        </div>
      </div>
    </section>
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

function QaPage() {
  const questions = [
    ['โรงเรียนเปิดสอนระดับชั้นใดบ้าง?', `เปิดสอนตั้งแต่ระดับชั้น${schoolInfo.educationLevels}`],
    ['โรงเรียนตั้งอยู่ที่ไหน?', contactDetails.address],
    ['ติดต่อโรงเรียนในวันและเวลาใด?', 'วันจันทร์–ศุกร์ เวลา 08.00–16.30 น.'],
    ['ติดตามข่าวสารของโรงเรียนได้จากที่ใด?', 'ติดตามได้จากเมนูข่าวสาร จดหมายข่าว และ Facebook โรงเรียนบ้านน้ำพร'],
  ]
  return (
    <>
      <PageHero
        eyebrow="บริการ"
        title="ถาม-ตอบ (Q&A)"
        description="คำตอบสำหรับคำถามที่พบบ่อยเกี่ยวกับโรงเรียนและการติดต่อรับบริการ"
        icon={HelpCircle}
      />
      <section className="section inner-content">
        <div className="container faq-list">
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}<ChevronDown size={20} /></summary>
              <p>{answer}</p>
            </details>
          ))}
          <a className="button button--navy" href="/contact">สอบถามเพิ่มเติม<ArrowRight size={17} /></a>
        </div>
      </section>
    </>
  )
}

function ComplaintsPage() {
  return (
    <>
      <PageHero
        eyebrow="บริการ"
        title="แจ้งเรื่องร้องเรียน"
        description="ช่องทางรับฟังความคิดเห็น ข้อเสนอแนะ และเรื่องร้องเรียนอย่างเหมาะสม"
        icon={MessageSquareWarning}
      />
      <section className="section inner-content">
        <div className="container complaint-layout">
          <div>
            <SectionHeading
              eyebrow="ช่องทางติดต่อ"
              title="แจ้งข้อมูลกับโรงเรียนโดยตรง"
              description="โปรดระบุรายละเอียดที่จำเป็นและช่องทางติดต่อกลับ โรงเรียนจะดูแลข้อมูลอย่างเหมาะสมและประสานผู้รับผิดชอบ"
            />
            <p className="complaint-layout__note">หากเป็นเหตุเร่งด่วนหรือเกี่ยวข้องกับความปลอดภัย กรุณาโทรติดต่อโรงเรียนโดยตรง</p>
          </div>
          <div className="complaint-channels">
            <a href={contactDetails.phoneHref}><Phone size={23} /><span><small>โทรศัพท์</small><strong>{contactDetails.phone}</strong></span></a>
            <a href={contactDetails.emailHref}><Mail size={23} /><span><small>อีเมล</small><strong>{contactDetails.email}</strong></span></a>
            <a href={contactDetails.messengerHref} target="_blank" rel="noreferrer"><MessageSquareWarning size={23} /><span><small>Messenger</small><strong>ติดต่อโรงเรียนผ่านข้อความ</strong></span></a>
          </div>
        </div>
      </section>
    </>
  )
}

function PublicSubPage({ path, publicContent }) {
  if (path === '/operations/national-tests') return <OperationPage type="nationalTests" />
  if (path === '/operations/external-quality') return <OperationPage type="externalQuality" />
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
    return <><PageHero eyebrow="โรงเรียนบ้านน้ำพร" title="ผลงานและรางวัล" description="ความภาคภูมิใจของนักเรียน ครู และสถานศึกษา" icon={Trophy} /><Achievements awards={publicContent.awards} /></>
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
  if (path === '/services/downloads') return <ServiceInfoPage type="downloads" />
  if (path === '/services/qa') return <QaPage />
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
          eyebrow="บริการออนไลน์"
          title="เข้าถึงข้อมูลที่ต้องการได้ง่ายขึ้น"
          description="รวมข้อมูลและบริการสำคัญสำหรับนักเรียน ผู้ปกครอง ครู และชุมชนไว้ในที่เดียว"
          align="center"
        />
        <div className="services__grid">
          {services.map(({ icon: Icon, title, description }, index) => (
            <article className="service-card reveal" key={title}>
              <span className="service-card__number">0{index + 1}</span>
              <span className="service-card__icon">
                <Icon size={27} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
              <a href="#contact" aria-label={`สอบถามข้อมูล ${title}`}>
                สอบถามข้อมูล
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
          <News liveNews={publicContent.news} />
          <Newsletters newsletters={publicContent.newsletters} />
          <Activities liveEvents={publicContent.events} />
          <Achievements awards={publicContent.awards} />
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
