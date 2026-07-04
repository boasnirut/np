import {
  BookOpenText,
  ClipboardCheck,
  GraduationCap,
  Images,
  Laptop,
  MapPin,
  Megaphone,
  School,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react'

export const navItems = [
  { label: 'หน้าหลัก', href: '/' },
  {
    label: 'เกี่ยวกับโรงเรียน',
    children: [
      { label: 'ข้อมูลพื้นฐาน', href: '/about/basic-info' },
      { label: 'ข้อมูลบุคลากร', href: '/about/staff' },
      { label: 'ประวัติโรงเรียน', href: '/about/history' },
    ],
  },
  { label: 'ผลงานและรางวัล', href: '/achievements' },
  {
    label: 'การดำเนินงาน',
    children: [
      { label: 'การสอบวัดผลระดับชาติ', href: '/operations/national-tests' },
      { label: 'ประกันคุณภาพภายนอก (สมศ.)', href: '/operations/external-quality' },
      {
        label: 'โรงเรียนขยายโอกาสคุณภาพ',
        href: 'https://numporn.loei1.go.th/qoes69',
        external: true,
      },
      { label: 'ITA Online', href: '/operations/ita' },
    ],
  },
  {
    label: 'ข่าวสาร',
    children: [
      { label: 'กิจกรรม', href: '/news/activities' },
      { label: 'ประชาสัมพันธ์', href: '/news/public-relations' },
      { label: 'ประกาศ', href: '/news/announcements' },
      { label: 'จดหมายข่าว', href: '/news/newsletters' },
    ],
  },
  {
    label: 'บริการ',
    children: [
      { label: 'ตรวจสอบผลการเรียน', href: '/services/results' },
      { label: 'ดาวน์โหลดเอกสาร/คำร้อง', href: '/services/downloads' },
      { label: 'ถาม-ตอบ (Q&A)', href: '/services/qa' },
      { label: 'แจ้งเรื่องร้องเรียน', href: '/services/complaints' },
    ],
  },
  { label: 'ติดต่อเรา', href: '/contact' },
]

export const newsItems = [
  {
    category: 'ประชาสัมพันธ์',
    date: '30 มิถุนายน 2569',
    title: 'ยินดีต้อนรับสู่เว็บไซต์ใหม่ โรงเรียนบ้านน้ำพร',
    excerpt:
      'ศูนย์รวมข่าวสาร กิจกรรม เอกสาร และช่องทางติดต่อของโรงเรียนในรูปแบบที่อ่านง่ายและใช้งานได้ทุกอุปกรณ์',
    icon: School,
    accent: 'blue',
    featured: true,
  },
  {
    category: 'ประกาศ',
    date: 'ภาคเรียนที่ 1/2569',
    title: 'เตรียมความพร้อมสำหรับการเรียนรู้ในภาคเรียนใหม่',
    excerpt:
      'ผู้ปกครองและนักเรียนสามารถติดตามกำหนดการ เอกสาร และข่าวสารสำคัญได้จากเว็บไซต์ของโรงเรียน',
    icon: BookOpenText,
    accent: 'green',
  },
  {
    category: 'กิจกรรม',
    date: 'อัปเดตตลอดภาคเรียน',
    title: 'พื้นที่รวบรวมภาพกิจกรรมและความภาคภูมิใจ',
    excerpt:
      'ติดตามเรื่องราวการเรียนรู้ ผลงานนักเรียน และกิจกรรมที่เชื่อมโยงโรงเรียนกับชุมชน',
    icon: Images,
    accent: 'gold',
  },
]

export const activityItems = [
  {
    day: '01',
    month: 'ก.ค.',
    title: 'กิจกรรมส่งเสริมการอ่าน',
    meta: 'ห้องสมุดโรงเรียน · ทุกระดับชั้น',
    color: 'blue',
  },
  {
    day: '08',
    month: 'ก.ค.',
    title: 'ชั่วโมงเรียนรู้รักษ์สิ่งแวดล้อม',
    meta: 'บริเวณโรงเรียน · เรียนรู้ผ่านการลงมือทำ',
    color: 'green',
  },
  {
    day: '15',
    month: 'ก.ค.',
    title: 'ประชุมผู้ปกครองและเครือข่ายชุมชน',
    meta: 'อาคารอเนกประสงค์ · เวลาโปรดติดตามประกาศ',
    color: 'gold',
  },
]

export const services = [
  {
    title: 'เกี่ยวกับโรงเรียน',
    description: 'ข้อมูลพื้นฐาน บุคลากร และประวัติโรงเรียนบ้านน้ำพร',
    icon: School,
    href: '/about/basic-info',
  },
  {
    title: 'ผลงานและรางวัล',
    description: 'ความภาคภูมิใจของโรงเรียน บุคลากร และนักเรียน',
    icon: Trophy,
    href: '/achievements',
  },
  {
    title: 'การดำเนินงาน',
    description: 'การสอบระดับชาติ ประกันคุณภาพ และ ITA Online',
    icon: ClipboardCheck,
    href: '/operations/national-tests',
  },
  {
    title: 'ข่าวสาร',
    description: 'กิจกรรม ประชาสัมพันธ์ ประกาศ และจดหมายข่าว',
    icon: Megaphone,
    href: '/news/public-relations',
  },
  {
    title: 'บริการ',
    description: 'ตรวจผลการเรียน ดาวน์โหลดเอกสาร ถาม-ตอบ และร้องเรียน',
    icon: Laptop,
    href: '/services/results',
  },
  {
    title: 'ติดต่อเรา',
    description: 'ที่อยู่ หมายเลขโทรศัพท์ อีเมล และแผนที่โรงเรียน',
    icon: MapPin,
    href: '/contact',
  },
]

export const values = [
  {
    number: '01',
    title: 'รากฐานที่มั่นคง',
    description: 'สร้างพื้นฐานความรู้ คุณธรรม และทักษะชีวิตที่เหมาะสมกับวัย',
  },
  {
    number: '02',
    title: 'เรียนรู้อย่างงอกงาม',
    description: 'เปิดพื้นที่ให้เด็กได้คิด ลงมือทำ และค้นพบศักยภาพของตนเอง',
  },
  {
    number: '03',
    title: 'เติบโตไปกับชุมชน',
    description: 'เชื่อมการเรียนรู้กับครอบครัว ภูมิปัญญา และสิ่งแวดล้อมรอบตัว',
  },
]

export const schoolHighlights = [
  { value: 'อนุบาล 2–ม.3', label: 'ระดับชั้นที่เปิดสอน' },
  { value: 'ขยายโอกาส', label: 'เรียนรู้ต่อเนื่องในชุมชน' },
  { value: 'สพป.เลย 1', label: 'หน่วยงานต้นสังกัด' },
  { value: '100%', label: 'ใส่ใจเด็กทุกคน' },
]

export const schoolInfo = {
  thaiName: 'โรงเรียนบ้านน้ำพร',
  englishName: 'Bannamporn School',
  educationLevels: 'อนุบาล 2 - ม.3',
  schoolType: 'โรงเรียนขยายโอกาส',
  affiliation: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาเลย เขต 1',
  summary:
    'โรงเรียนบ้านน้ำพร Bannamporn School เปิดสอนตั้งแต่ชั้นอนุบาล 2 - ม.3 เป็นโรงเรียนขยายโอกาส สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาเลย เขต 1',
}

export const contactDetails = {
  address: 'เลขที่ 115 หมู่ 2 บ้านน้ำพร ตำบลปากตม อำเภอเชียงคาน จังหวัดเลย 42110',
  phone: '06-2546-1959',
  phoneHref: 'tel:0625461959',
  email: 'numporn@loei1.go.th',
  emailHref: 'mailto:numporn@loei1.go.th',
  messengerHref: 'https://m.me/471976926239771',
  facebookHref: 'https://www.facebook.com/NampornSchool/',
  mapHref: 'https://maps.app.goo.gl/ZTXbKacBqoMYUu4Q8',
}

export const trustPoints = [
  { icon: ShieldCheck, label: 'ข้อมูลจากโรงเรียน' },
  { icon: Users, label: 'เชื่อมโยงชุมชน' },
  { icon: GraduationCap, label: 'เติบโตด้วยการเรียนรู้' },
]
