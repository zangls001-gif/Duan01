import { Plan, DomainPricing, Addon } from '../types';

export interface SiteTypeOption {
  id: string;
  title: string;
  description: string;
  iconName: string;
  recommendedTag: string;
}

export const SITE_TYPE_OPTIONS: SiteTypeOption[] = [
  {
    id: 'doanh-nghiep',
    title: 'Website Doanh Nghiệp',
    description: 'Giới thiệu công ty, hồ sơ năng lực, dịch vụ chuyên nghiệp',
    iconName: 'Building2',
    recommendedTag: 'Phổ biến'
  },
  {
    id: 'ban-hang',
    title: 'Bán Hàng & E-Commerce',
    description: 'Cửa hàng trực tuyến, giỏ hàng, thanh toán và nhiều sản phẩm',
    iconName: 'ShoppingCart',
    recommendedTag: 'Khuyên dùng'
  },
  {
    id: 'tin-tuc',
    title: 'Blog & Tin Tức',
    description: 'Chia sẻ kiến thức, bài viết, tạp chí, lượng đọc lớn',
    iconName: 'Newspaper',
    recommendedTag: 'Nội dung'
  },
  {
    id: 'landing-page',
    title: 'Landing Page Sự Kiện / SP',
    description: 'Trang đơn tập trung chuyển đổi, chạy quảng cáo Facebook/Google',
    iconName: 'Rocket',
    recommendedTag: 'Tối ưu ads'
  },
  {
    id: 'portfolio',
    title: 'Cá Nhân & Portfolio',
    description: 'Trang cá nhân, CV trực tuyến, giới thiệu tác phẩm sáng tạo',
    iconName: 'UserCheck',
    recommendedTag: 'Cá nhân'
  },
  {
    id: 'web-app',
    title: 'Ứng Dụng Web / Hệ Thống',
    description: 'SaaS, CRM, ERP, API backend, xử lý dữ liệu liên tục',
    iconName: 'Server',
    recommendedTag: 'Hiệu năng cao'
  },
  {
    id: 'giao-duc',
    title: 'Giáo Dục & Khóa Học',
    description: 'E-learning, bán khóa học video, diễn đàn học viên',
    iconName: 'GraduationCap',
    recommendedTag: 'Đào tạo'
  },
  {
    id: 'khac',
    title: 'Nhu Cầu Khác',
    description: 'Dự án đặc thù, diễn đàn cộng đồng hoặc công cụ riêng',
    iconName: 'Sparkles',
    recommendedTag: 'Tùy biến'
  }
];

export const TRAFFIC_OPTIONS = [
  { id: 'duoi-3k', label: '< 3.000 lượt / tháng', desc: 'Mới mở hoặc blog cá nhân' },
  { id: '3k-10k', label: '3.000 - 10.000 lượt / tháng', desc: 'Doanh nghiệp nhỏ, shop mới' },
  { id: '10k-50k', label: '10.000 - 50.000 lượt / tháng', desc: 'Lưu lượng vừa, có bán hàng' },
  { id: '50k-150k', label: '50.000 - 150.000 lượt / tháng', desc: 'Shop chạy ads, traffic cao' },
  { id: 'tren-150k', label: '> 150.000 lượt / tháng', desc: 'Sàn, báo điện tử, app lớn' }
];

export const BUDGET_OPTIONS = [
  { value: 50000, label: 'Dưới 100.000đ / tháng (Khởi đầu)' },
  { value: 150000, label: '100.000đ - 250.000đ / tháng (Tiêu chuẩn)' },
  { value: 400000, label: '250.000đ - 500.000đ / tháng (Hiệu năng cao)' },
  { value: 800000, label: 'Trên 500.000đ / tháng (Doanh nghiệp lớn / VPS)' }
];

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    type: 'Shared Hosting',
    pricePerMonth: 39000,
    storage: '5 GB SSD',
    bandwidth: '50 GB/tháng',
    recommendedVisits: 3000,
    freeDomain: false,
    features: ['1 website', 'SSL miễn phí', '1 email doanh nghiệp', 'Bảng điều khiển cPanel', 'Hỗ trợ 24/7'],
    limitations: 'Không tặng kèm tên miền, dung lượng cho trang nhỏ',
    bestFor: 'Blog cá nhân, trang giới thiệu nhỏ'
  },
  {
    id: 'basic',
    name: 'Basic',
    type: 'Shared Hosting',
    pricePerMonth: 69000,
    storage: '20 GB SSD',
    bandwidth: '200 GB/tháng',
    recommendedVisits: 10000,
    freeDomain: true,
    features: ['3 website', 'SSL miễn phí', 'Tặng tên miền .com/.vn năm đầu', '5 email doanh nghiệp', 'Sao lưu hàng tuần'],
    limitations: 'Phù hợp dưới 10.000 truy cập/tháng',
    bestFor: 'Trang giới thiệu doanh nghiệp, shop nhỏ mới bắt đầu'
  },
  {
    id: 'business',
    name: 'Business',
    type: 'Shared Hosting',
    pricePerMonth: 129000,
    storage: '50 GB NVMe',
    bandwidth: 'Không giới hạn',
    recommendedVisits: 30000,
    freeDomain: true,
    features: ['10 website', 'SSL miễn phí', 'Tặng tên miền năm đầu', 'Sao lưu hằng tuần', 'Tăng tốc LiteSpeed Enterprise', 'Không giới hạn băng thông'],
    limitations: 'Chia sẻ tài nguyên CPU/RAM với server chung',
    bestFor: 'Shop online vừa, nhiều ảnh sản phẩm'
  },
  {
    id: 'shop-pro',
    name: 'Shop Pro',
    type: 'Cloud Hosting',
    pricePerMonth: 249000,
    storage: '100 GB NVMe',
    bandwidth: 'Không giới hạn',
    recommendedVisits: 80000,
    freeDomain: true,
    features: ['Tối ưu WooCommerce', 'Sao lưu hằng ngày', 'CDN Cloudflare Enterprise', 'Tặng tên miền năm đầu', 'Hỗ trợ kỹ thuật VIP ưu tiên'],
    limitations: 'Chi phí cao hơn shared thông thường',
    bestFor: 'Shop bán hàng đông khách, có chạy quảng cáo'
  },
  {
    id: 'vps-1',
    name: 'VPS Growth',
    type: 'VPS',
    pricePerMonth: 399000,
    storage: '80 GB NVMe',
    bandwidth: '1 TB/tháng',
    recommendedVisits: 150000,
    freeDomain: false,
    features: ['2 CPU, 4 GB RAM', 'Toàn quyền quản trị Root', 'Sao lưu hằng ngày', 'Tự cài phần mềm theo ý', 'Tốc độ mạng 1 Gbps'],
    limitations: 'Cần kiến thức quản trị máy chủ cơ bản',
    bestFor: 'Website lượng truy cập cao, cần tuỳ biến sâu'
  },
  {
    id: 'vps-2',
    name: 'VPS Power',
    type: 'VPS',
    pricePerMonth: 799000,
    storage: '160 GB NVMe',
    bandwidth: '3 TB/tháng',
    recommendedVisits: 500000,
    freeDomain: false,
    features: ['4 CPU, 8 GB RAM', 'Toàn quyền quản trị Root', 'Sao lưu hằng ngày', 'IP riêng độc lập', 'Cam kết Uptime 99.99%'],
    limitations: 'Cần nhân sự kỹ thuật quản trị hệ điều hành',
    bestFor: 'Báo điện tử, sàn thương mại, lượng truy cập lớn'
  }
];

export const INITIAL_DOMAINS: DomainPricing[] = [
  { extension: '.com', price: 280000, description: 'Tên miền quốc tế phổ biến nhất thế giới', badge: 'Quốc tế' },
  { extension: '.vn', price: 550000, description: 'Tên miền quốc gia Việt Nam bảo vệ uy tín cao nhất', badge: 'Việt Nam' },
  { extension: '.com.vn', price: 450000, description: 'Dành riêng cho doanh nghiệp thương mại Việt Nam', badge: 'Doanh nghiệp' },
  { extension: '.shop', price: 190000, description: 'Đuôi tên miền chuyên biệt cho bán lẻ online', badge: 'E-Commerce' }
];

export const INITIAL_ADDONS: Addon[] = [
  {
    id: 'addon_whois',
    name: 'Bảo Vệ Ẩn Danh Tên Miền (Whois Privacy)',
    price: 50000,
    billingType: 'yearly',
    description: 'Ẩn thông tin cá nhân và SĐT của bạn trên dữ liệu công khai Whois'
  },
  {
    id: 'addon_backup',
    name: 'Sao Lưu Dữ Liệu Tự Động Hằng Ngày (Daily Backup)',
    price: 30000,
    billingType: 'monthly',
    description: 'Tự động sao lưu website vào 0h mỗi đêm, khôi phục với 1 click'
  },
  {
    id: 'addon_ip',
    name: 'Địa Chỉ IP Riêng Chuyên Dụng (Dedicated IP)',
    price: 80000,
    billingType: 'monthly',
    description: 'IP độc lập giúp uy tín email và tối ưu SEO vượt trội'
  }
];

export const FAQS = [
  {
    q: 'Tôi chưa có kinh nghiệm, công cụ AI hoạt động như thế nào?',
    a: 'Bạn chỉ cần chọn loại website dự định làm, lượng truy cập và ngân sách ước lượng. Hệ thống AI đối chiếu trực tiếp với 6 gói cấu hình thực tế của HostingAdvisor để phân loại ra 3 phương án: gói phù hợp nhất, gói tiết kiệm nhất và gói cho nhu cầu mở rộng.'
  },
  {
    q: 'Gói nào được tặng tên miền miễn phí?',
    a: 'Các gói Basic (69k), Business (129k) và Shop Pro (249k) khi thanh toán từ chu kỳ 1 năm trở lên đều được tặng miễn phí 1 năm đăng ký tên miền quốc tế .com hoặc quốc gia .vn!'
  },
  {
    q: 'Thanh toán VietQR hoạt động ra sao? Bao lâu thì kích hoạt?',
    a: 'Mỗi đơn hàng tạo ra một mã VietQR động chứa chính xác số tiền đã trừ khuyến mãi và nội dung mã đơn (vd: ORD-2026-001). Sau khi bạn quét mã thanh toán bằng app ngân hàng, hệ thống tự động ghi nhận và nhân viên duyệt kích hoạt bàn giao IP hosting trong vòng vài phút.'
  },
  {
    q: 'Nếu website của tôi phát triển vượt quá gói hiện tại thì sao?',
    a: 'Bạn có thể nâng cấp cấu hình bất kỳ lúc nào chỉ bằng 1 cú nhấp chuột. Hệ thống tự động di chuyển toàn bộ dữ liệu mã nguồn, cơ sở dữ liệu mà không làm gián đoạn website (zero downtime).'
  },
  {
    q: 'Chính sách hoàn tiền trong 30 ngày áp dụng thế nào?',
    a: 'HostingAdvisor cam kết hoàn lại 100% chi phí hosting trong vòng 30 ngày đầu tiên nếu bạn không hài lòng về tốc độ hoặc dịch vụ chăm sóc khách hàng mà không cần lý do phức tạp.'
  }
];

export const CUSTOMER_REVIEWS = [
  {
    name: 'Lê Hoàng Yến',
    role: 'Chủ tiệm hoa tươi Yen Boutique',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    content: 'Trước đây web hay bị sập giờ cao điểm ngày lễ, đổi sang gói Business web chạy cực mượt, khách đặt hàng ầm ầm! Cực kỳ thích tính năng quét VietQR và xuất hóa đơn VAT điện tử ngay lập tức.',
    rating: 5,
    planUsed: 'Gói Business + Tên miền .vn'
  },
  {
    name: 'Trần Minh Tuấn',
    role: 'Giám đốc Xưởng gốm Bát Tràng Art',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    content: 'AI tư vấn chọn đúng tên miền .vn giúp bên mình tạo niềm tin cho đối tác xuất khẩu. Ổ cứng NVMe siêu nhanh, load hình ảnh sản phẩm gốm nét căng mà chưa đến 1 giây. Rất đáng đồng tiền bát gạo!',
    rating: 5,
    planUsed: 'Gói Shop Pro + Dedicated IP'
  },
  {
    name: 'Nguyễn Phương Nam',
    role: 'Blogger tại Cafe & Lifestyle Saigon',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    content: 'Giao diện đặt mua rất trực quan, chọn loại blog là AI gợi ý ngay gói Starter tiết kiệm. Áp mã VIBE2026 giảm thêm 15%, quét VietQR 3 giây là có ngay hosting để viết bài.',
    rating: 5,
    planUsed: 'Gói Starter + Daily Backup'
  }
];
