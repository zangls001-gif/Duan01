import React, { useState } from 'react';
import { DomainPricing, Plan } from '../types';
import { Globe, Search, Check, ShieldCheck, ArrowRight, Zap, Info, Gift } from 'lucide-react';

interface DomainPricingSectionProps {
  domains: DomainPricing[];
  plans: Plan[];
  onSelectDomainForCheckout: (domainName: string, ext: string) => void;
}

export const DomainPricingSection: React.FC<DomainPricingSectionProps> = ({
  domains,
  plans,
  onSelectDomainForCheckout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtDetail, setSelectedExtDetail] = useState<DomainPricing | null>(null);

  const cleanDomain = searchQuery.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

  return (
    <section id="domain-pricing" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tra cứu & Đăng ký Tên miền</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bảng Giá Đăng Ký Tên Miền Thương Hiệu
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Bảo vệ thương hiệu số của bạn với các đuôi tên miền uy tín nhất Việt Nam và quốc tế. Đặc biệt: <strong>Tặng miễn phí 1 năm</strong> khi mua cùng Hosting từ 69k!
          </p>
        </div>

        {/* Live Domain Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 transition-all shadow-sm">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 pl-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên thương hiệu bạn muốn kiểm tra (ví dụ: congtyviet, shophoa)..."
                className="w-full py-2 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
              {cleanDomain && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Không cần nhập đuôi .com hay .vn, hệ thống sẽ tự động ghép với các đuôi bên dưới
          </p>
        </div>

        {/* Domain Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {domains.map((item) => {
            const domainCandidate = cleanDomain ? `${cleanDomain}${item.extension}` : `thuonghieu${item.extension}`;
            const isNational = item.extension.includes('.vn');

            return (
              <div
                key={item.extension}
                className={`rounded-3xl p-6 border-2 transition-all duration-200 flex flex-col justify-between relative bg-white ${
                  isNational
                    ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                {/* Badge */}
                {item.badge && (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                    {item.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-black text-indigo-600 tracking-tight">
                      {item.extension}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 min-h-[36px] mb-4">
                    {item.description}
                  </p>

                  {/* Pricing */}
                  <div className="pb-4 mb-4 border-b border-slate-100">
                    <span className="text-xs text-slate-400 block">Phí đăng ký năm đầu:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">
                        {item.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ năm</span>
                    </div>
                  </div>

                  {/* Live Search Result Preview */}
                  {cleanDomain ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-xs">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Sẵn sàng đăng ký:</span>
                      <span className="font-bold text-emerald-900 text-sm break-all">{domainCandidate}</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl mb-4 text-xs text-slate-500">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Ví dụ minh họa:</span>
                      <span className="font-medium text-slate-700">{domainCandidate}</span>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 text-xs text-slate-600 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Miễn phí quản lý DNS nâng cao</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Khóa tên miền an toàn (Registrar Lock)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-semibold text-indigo-700">Tặng 0đ khi mua Hosting</span>
                    </li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const domainToUse = cleanDomain || 'thuonghieu';
                      onSelectDomainForCheckout(domainToUse, item.extension);
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{cleanDomain ? `Đăng Ký ${domainCandidate}` : `Chọn Đuôi ${item.extension}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSelectedExtDetail(item)}
                    className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    <span>Xem chi tiết quyền lợi</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Domain Promotion Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Chính Sách Tặng Miễn Phí Tên Miền</h3>
              <p className="text-sm text-indigo-200 mt-1 max-w-xl">
                Đăng ký gói hosting <strong>Basic, Business hoặc Shop Pro</strong> từ 1 năm trở lên, bạn được miễn phí 100% phí đăng ký tên miền .com hoặc .vn năm đầu tiên (tiết kiệm đến 550.000đ).
              </p>
            </div>
          </div>
          <a
            href="#catalog-plans"
            className="px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-sm rounded-xl shrink-0 transition-colors shadow-md"
          >
            Xem Các Gói Hosting Được Tặng Tên Miền
          </a>
        </div>
      </div>

      {/* Domain Detail Modal */}
      {selectedExtDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                Chi tiết tên miền {selectedExtDetail.extension}
              </h3>
              <button
                onClick={() => setSelectedExtDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {selectedExtDetail.description}
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Bảng giá niêm yết:</span>
                <span className="text-2xl font-black text-indigo-600">
                  {selectedExtDetail.price.toLocaleString('vi-VN')}đ / năm
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Đã bao gồm thuế và lệ phí khởi tạo.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">Quyền lợi độc quyền:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Toàn quyền sở hữu và quản lý bản ghi A, CNAME, MX, TXT ngay trong hệ thống</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hỗ trợ trỏ NameServers tức thì về hosting HostingAdvisor trong 60 giây</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hỗ trợ tích hợp dịch vụ Add-on "Bảo vệ ẩn danh Whois" để bảo mật số điện thoại</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedExtDetail(null);
                  onSelectDomainForCheckout(cleanDomain || 'mybrand', selectedExtDetail.extension);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Đăng Ký Đuôi Này
              </button>
              <button
                onClick={() => setSelectedExtDetail(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 font-medium text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
