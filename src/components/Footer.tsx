import React from 'react';
import { Server, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-md">
                <Server className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">HostingAdvisor</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Nền tảng thương mại điện tử cung cấp Hosting NVMe, Tên miền thương hiệu và Quản trị đơn hàng (OMS) tốc độ cao hàng đầu Việt Nam.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Chứng chỉ ISO 27001 & Tier-3 Data Center</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Dịch Vụ Hosting</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#catalog-plans" className="hover:text-white transition-colors">Shared Hosting Doanh Nghiệp</a></li>
              <li><a href="#catalog-plans" className="hover:text-white transition-colors">Cloud Hosting E-Commerce</a></li>
              <li><a href="#catalog-plans" className="hover:text-white transition-colors">VPS Chuyên Dụng Tốc Độ Cao</a></li>
              <li><a href="#ai-assistant" className="hover:text-white transition-colors">AI Tư Vấn Gói Trực Tuyến</a></li>
            </ul>
          </div>

          {/* Domain Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Tên Miền & Dịch Vụ Kèm</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#domain-pricing" className="hover:text-white transition-colors">Đăng Ký Tên Miền .VN</a></li>
              <li><a href="#domain-pricing" className="hover:text-white transition-colors">Tên Miền Quốc Tế .COM</a></li>
              <li><a href="#domain-pricing" className="hover:text-white transition-colors">Bảo Vệ Ẩn Danh Whois Privacy</a></li>
              <li><a href="#domain-pricing" className="hover:text-white transition-colors">Dịch Vụ IP Riêng Dedicated IP</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Thông Tin Liên Hệ</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Tòa nhà TechTower, Cầu Giấy, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Hotline 24/7: <strong>1900 6868</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>support@hostingadvisor.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 HostingAdvisor Corp. Bản quyền thuộc về Nền Tảng Thương Mại Điện Tử Quản Trị Đơn Hàng (OMS).</p>
          <div className="flex items-center gap-4">
            <span>Bảo mật chuẩn PCI-DSS</span>
            <span>•</span>
            <span>Thanh toán VietQR Ngân hàng</span>
            <span>•</span>
            <span>Hóa đơn VAT điện tử</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
