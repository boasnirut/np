import {
  BookOpenText,
  CalendarDays,
  FileText,
  GraduationCap,
  Images,
  Laptop,
  MapPin,
  Megaphone,
  MessageCircleQuestion,
  School,
  ShieldCheck,
  Users,
} from 'lucide-react'

export const navItems = [
  { label: 'หน้าหลัก', href: '/' },
  {
    label: 'การดำเนินงาน',
    children: [
      { label: 'การสอบวัดผลระดับชาติ RT/NT/O-NET', href: '/operations/national-tests' },
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
    label: 'เกี่ยวกับโรงเรียน',
    children: [
      { label: 'ข้อมูลพื้นฐาน', href: '/about/basic-info' },
      { label: 'ข้อมูลบุคลากร', href: '/about/staff' },
      { label: 'ประวัติโรงเรียน', href: '/about/history' },
    ],
  },
  { label: 'ผลงานและรางวัล', href: '/achievements' },
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

export const quickLinks = [
  {
    title: 'ข่าวประชาสัมพันธ์',
    description: 'ติดตามข่าวและประกาศล่าสุด',
    href: '/news/public-relations',
    icon: Megaphone,
    color: 'blue',
  },
  {
    title: 'ปฏิทินโรงเรียน',
    description: 'ดูกิจกรรมและวันสำคัญ',
    href: '/news/activities',
    icon: CalendarDays,
    color: 'gold',
  },
  {
    title: 'เอกสารเผยแพร่',
    description: 'ดาวน์โหลดเอกสารที่เกี่ยวข้อง',
    href: '/services/downloads',
    icon: FileText,
    color: 'green',
  },
  {
    title: 'ติดต่อโรงเรียน',
    description: 'ที่อยู่ โทรศัพท์ และแผนที่',
    href: '/contact',
    icon: MapPin,
    color: 'sky',
  },
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
    category: 'วิชาการ',
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
    title: 'ข้อมูลพื้นฐาน',
    description: 'ประวัติ วิสัยทัศน์ และข้อมูลทั่วไปของสถานศึกษา',
    icon: School,
  },
  {
    title: 'งานวิชาการ',
    description: 'หลักสูตร แหล่งเรียนรู้ และข้อมูลสำหรับนักเรียน',
    icon: GraduationCap,
  },
  {
    title: 'เอกสารออนไลน์',
    description: 'แบบฟอร์ม ประกาศ และเอกสารเผยแพร่ของโรงเรียน',
    icon: FileText,
  },
  {
    title: 'ระบบสารสนเทศ',
    description: 'ทางลัดสู่ระบบงานและบริการดิจิทัลที่เกี่ยวข้อง',
    icon: Laptop,
  },
  {
    title: 'ข้อมูลบุคลากร',
    description: 'ทำความรู้จักคณะครูและบุคลากรทางการศึกษา',
    icon: Users,
  },
  {
    title: 'ถาม–ตอบ',
    description: 'คำถามที่พบบ่อยและช่องทางขอความช่วยเหลือ',
    icon: MessageCircleQuestion,
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
