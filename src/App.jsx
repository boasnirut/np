import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUp,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Phone,
  Quote,
  Sparkles,
  X,
} from 'lucide-react'
import {
  activityItems,
  contactDetails,
  navItems,
  newsItems,
  quickLinks,
  schoolHighlights,
  services,
  trustPoints,
  values,
} from './content'

const categories = ['ทั้งหมด', 'ประชาสัมพันธ์', 'วิชาการ', 'กิจกรรม']
const welcomeSlides = [
  { src: '/P10.jpg', alt: 'สถิตกลางใจปวงประชา สมเด็จพระเจ้าลูกเธอ เจ้าฟ้าพัชรกิติยาภา' },
  { src: '/Q9.jpg', alt: 'สถิตในดวงใจตราบนิจนิรันดร์ สมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ' },
]
const getLocalDateKey = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
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
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}

function Header({ menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [openMobileSection, setOpenMobileSection] = useState(null)

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
            <span>ยินดีต้อนรับสู่เว็บไซต์โรงเรียนบ้านน้ำพร</span>
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
          <a className="brand" href="#home" onClick={closeMenu} aria-label="โรงเรียนบ้านน้ำพร หน้าแรก">
            <span className="brand__logo">
              <img src="/np.png" alt="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร" />
            </span>
            <span className="brand__text">
              <strong>โรงเรียนบ้านน้ำพร</strong>
              <small>BAN NAM PHON SCHOOL</small>
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
                    className="nav-dropdown__trigger"
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
                      <a key={`${item.label}-${child.label}`} href={child.href} onClick={closeMenu}>
                        <span>{child.label}</span>
                        <ChevronRight size={16} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a key={item.href} href={item.href} onClick={closeMenu}>
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <a className="header-contact" href="#contact" onClick={closeMenu}>
            ติดต่อโรงเรียน
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
            {navItems.map((item, index) =>
              item.children ? (
                <div
                  className={`mobile-nav__group ${openMobileSection === item.label ? 'mobile-nav__group--open' : ''}`}
                  key={item.label}
                >
                  <button
                    type="button"
                    aria-expanded={openMobileSection === item.label}
                    onClick={() =>
                      setOpenMobileSection((current) => (current === item.label ? null : item.label))
                    }
                  >
                    <span>0{index + 1}</span>
                    {item.label}
                    <ChevronDown size={18} />
                  </button>
                  <div className="mobile-nav__submenu">
                    {item.children.map((child) => (
                      <a
                        key={`${item.label}-${child.label}`}
                        href={child.href}
                        onClick={closeMenu}
                      >
                        {child.label}
                        <ChevronRight size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a key={item.href} href={item.href} onClick={closeMenu}>
                  <span>0{index + 1}</span>
                  {item.label}
                  <ChevronRight size={18} />
                </a>
              ),
            )}
            <a className="mobile-nav__phone" href={contactDetails.phoneHref}>
              <Phone size={18} />
              โทร {contactDetails.phone}
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
            <p className="hero__kicker">WELCOME TO BAN NAM PHON SCHOOL</p>
            <h1>
              เรียนรู้อย่างมีความสุข
              <span>เติบโตอย่างมีคุณภาพ</span>
            </h1>
            <p className="hero__lead">
              ปลูกฝังความรู้ สร้างรากฐานคุณธรรม และเปิดโอกาสให้เด็กทุกคน
              ได้ค้นพบศักยภาพของตนเอง
            </p>
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

      <section className="quick-links" aria-label="เมนูทางลัด">
        <div className="container quick-links__grid">
          {quickLinks.map(({ icon: Icon, title, description, href, color }) => (
            <a className="quick-link" href={href} key={title}>
              <span className={`quick-link__icon quick-link__icon--${color}`}>
                <Icon size={25} aria-hidden="true" />
              </span>
              <span className="quick-link__copy">
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <ChevronRight className="quick-link__arrow" size={20} aria-hidden="true" />
            </a>
          ))}
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
          <div className="about__image">
            <img src="/np.png" alt="" aria-hidden="true" />
            <div className="about__image-overlay">
              <span>ปรัชญาการศึกษา</span>
              <strong>“รากฐานของวันนี้<br />คือการเติบโตของวันหน้า”</strong>
            </div>
          </div>
          <div className="about__seal">
            <Leaf size={24} />
            <span>เรียนรู้<br />คู่ชุมชน</span>
          </div>
          <div className="about__dots" aria-hidden="true" />
        </div>

        <div className="about__content reveal">
          <SectionHeading
            eyebrow="รู้จักโรงเรียนของเรา"
            title="โรงเรียนเล็กที่ตั้งใจดูแลทุกการเติบโต"
            description="โรงเรียนบ้านน้ำพรมุ่งสร้างพื้นที่เรียนรู้ที่ปลอดภัย เป็นมิตร และเชื่อมโยงกับชีวิตจริง เพื่อให้เด็กเติบโตเป็นคนดี มีทักษะ และพร้อมเรียนรู้ตลอดชีวิต"
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

function Highlights() {
  return (
    <section className="highlights" aria-label="ข้อมูลเด่นของโรงเรียน">
      <div className="container highlights__grid">
        <div className="highlights__intro">
          <span>โรงเรียนของเรา</span>
          <strong>เติบโตด้วยความใส่ใจ</strong>
        </div>
        {schoolHighlights.map((item) => (
          <div className="highlight-item" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function News() {
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด')
  const [activeNews, setActiveNews] = useState(null)
  const filteredNews = useMemo(
    () =>
      activeCategory === 'ทั้งหมด'
        ? newsItems
        : newsItems.filter((item) => item.category === activeCategory),
    [activeCategory],
  )

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
              eyebrow="ข่าวสารและประกาศ"
              title="เรื่องราวล่าสุดจากโรงเรียน"
              description="ติดตามประกาศ กิจกรรม และเรื่องราวการเรียนรู้ได้จากพื้นที่นี้"
            />
            <div className="news__filters" role="group" aria-label="กรองหมวดหมู่ข่าว">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={activeCategory === category ? 'active' : ''}
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="news__grid">
            {filteredNews.map(({ icon: Icon, ...item }) => (
              <article
                className={`news-card news-card--${item.accent} ${item.featured ? 'news-card--featured' : ''}`}
                key={item.title}
              >
                <div className="news-card__visual">
                  <div className="news-card__pattern" aria-hidden="true" />
                  <Icon size={item.featured ? 64 : 48} strokeWidth={1.35} aria-hidden="true" />
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

          <div className="news__all">
            <button
              className="button button--outline"
              type="button"
              onClick={() => setActiveCategory('ทั้งหมด')}
            >
              แสดงข่าวทั้งหมด
              <ArrowRight size={18} />
            </button>
          </div>
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
            <p>{activeNews.excerpt}</p>
            <div className="modal__note">
              <Bell size={18} />
              โปรดติดตามรายละเอียดเพิ่มเติมและประกาศฉบับเต็มจากทางโรงเรียน
            </div>
            <a className="button button--navy" href="#contact" onClick={() => setActiveNews(null)}>
              สอบถามโรงเรียน
              <ArrowRight size={18} />
            </a>
          </article>
        </div>
      )}
    </>
  )
}

function Activities() {
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
              <strong>กรกฎาคม 2569</strong>
            </div>
            <CalendarDays size={30} aria-hidden="true" />
          </div>
          <div className="schedule__list">
            {activityItems.map((item) => (
              <article className="schedule-item" key={item.day}>
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
              <small>ต.ปากตม อ.เชียงคาน จ.เลย</small>
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

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">
          <div className="footer__brand">
            <a className="brand brand--footer" href="#home">
              <span className="brand__logo">
                <img src="/np.png" alt="ตราสัญลักษณ์โรงเรียนบ้านน้ำพร" />
              </span>
              <span className="brand__text">
                <strong>โรงเรียนบ้านน้ำพร</strong>
                <small>BAN NAM PHON SCHOOL</small>
              </span>
            </a>
            <p>รากฐานมั่นคง งอกงามด้วยปัญญา เติบโตไปพร้อมกับชุมชน</p>
            <div className="footer__socials">
              <a href={contactDetails.phoneHref} aria-label="โทรหาโรงเรียน"><Phone size={19} /></a>
              <a href={contactDetails.emailHref} aria-label="ส่งอีเมลถึงโรงเรียน"><Mail size={19} /></a>
              <a href={contactDetails.mapHref} target="_blank" rel="noreferrer" aria-label="เปิดแผนที่โรงเรียน"><MapPin size={19} /></a>
            </div>
          </div>
          <div className="footer__nav">
            <h3>เมนูเว็บไซต์</h3>
            {navItems.slice(0, 4).map((item) => (
              <a href={item.href} key={item.href}>{item.label}</a>
            ))}
          </div>
          <div className="footer__nav">
            <h3>ข้อมูลสำคัญ</h3>
            <a href="#services">เอกสารเผยแพร่</a>
            <a href="#activities">ปฏิทินกิจกรรม</a>
            <a href="#services">ระบบสารสนเทศ</a>
            <a href="#contact">ช่องทางติดต่อ</a>
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

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
      <WelcomeSlider />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero />
      <About />
      <Highlights />
      <News />
      <Activities />
      <Services />
      <DirectorMessage />
      <Contact />
      <Footer />
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
