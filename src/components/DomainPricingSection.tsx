import React, { useState } from 'react';
import { DomainPricing, Plan } from '../types';
import {
  Globe,
  Search,
  Check,
  ShieldCheck,
  ArrowRight,
  Info,
  Gift,
  CheckCircle2,
  Lock,
  Zap,
  Server
} from 'lucide-react';

interface DomainPricingSectionProps {
  domains: DomainPricing[];
  plans: Plan[];
  onSelectDomainForCheckout: (domainName: string, ext: string, addonIds?: string[]) => void;
}

interface DomainAddonItem {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: 'shield' | 'lock' | 'zap';
}

const DOMAIN_ADDON_OPTIONS: DomainAddonItem[] = [
  {
    id: 'addon_whois',
    name: 'Bảo Vệ Ẩn Danh Whois Privacy',
    price: 50000,
    description: 'Ẩn họ tên, SĐT, địa chỉ khỏi cơ sở dữ liệu tra cứu Whois công khai.',
    icon: 'shield'
  },
  {
    id: 'addon_reglock',
    name: 'Khóa Tên Miền Cấp Cao (Registry Lock)',
    price: 60000,
    description: 'Bảo vệ an toàn tuyệt đối, chống chuyển đổi tên miền trái phép.',
    icon: 'lock'
  },
  {
    id: 'addon_anycast',
    name: 'Quản Lý DNS Anycast Premium',
    price: 40000,
    description: 'Hệ thống DNS phân tán toàn cầu, phản hồi dưới 10ms, chống DDoS.',
    icon: 'zap'
  }
];

export const DomainPricingSection: React.FC<DomainPricingSectionProps> = ({
  domains,
  plans,
  onSelectDomainForCheckout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtension, setSelectedExtension] = useState<string>('.com');
  const [selectedDomainAddonIds, setSelectedDomainAddonIds] = useState<string[]>([]);
  const [selectedExtDetail, setSelectedExtDetail] = useState<DomainPricing | null>(null);

  const cleanDomain = searchQuery.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

  // Toggle domain addon
  const toggleDomainAddon = (id: string) => {
    if (selectedDomainAddonIds.includes(id)) {
      setSelectedDomainAddonIds(selectedDomainAddonIds.filter((item) => item !== id));
    } else {
      setSelectedDomainAddonIds([...selectedDomainAddonIds, id]);
    }
  };

  // Pricing calculations
  const activeExtObj = domains.find((d) => d.extension === selectedExtension) || domains[0] || {
    extension: '.com',
    price: 280000,
    description: 'Tên miền quốc tế phổ biến'
  };

  const domainBasePrice = activeExtObj.price;
  const domainAddonsTotal = selectedDomainAddonIds.reduce((sum, id) => {
    const item = DOMAIN_ADDON_OPTIONS.find((a) => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);

  const totalDomainRegistrationPrice = domainBasePrice + domainAddonsTotal;

  // Selected candidate domain
  const candidateDomain = cleanDomain
    ? `${cleanDomain}${selectedExtension}`
    : `thuonghieu${selectedExtension}`;

  const handleCheckoutSelection = () => {
    const domainToRegister = cleanDomain || 'thuonghieu';
    onSelectDomainForCheckout(domainToRegister, selectedExtension, selectedDomainAddonIds);
  };

  const getAddonIcon = (type: string) => {
    switch (type) {
      case 'lock': return <Lock className="w-4 h-4" />;
      case 'zap': return <Zap className="w-4 h-4" />;
      default: return <ShieldCheck className="w-4 h-4" />;
    }
  };

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
            Nhấn trực tiếp vào bất kỳ đuôi tên miền nào dưới đây để lựa chọn. Viền sẽ đổi màu để thể hiện trạng thái được chọn và tự động cập nhật tổng chi phí đăng ký.
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
                placeholder="Nhập tên thương hiệu muốn đăng ký (ví dụ: congtyviet, shophoa)..."
                className="w-full py-2 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
              {cleanDomain && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Không cần gõ đuôi .com hay .vn, hệ thống sẽ tự động ghép với đuôi tên miền bạn đang chọn
          </p>
        </div>

        {/* Domain Cards Grid: Clickable whole cards with clear border change */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {domains.map((item) => {
            const isSelected = selectedExtension === item.extension;
            const itemPreviewDomain = cleanDomain ? `${cleanDomain}${item.extension}` : `thuonghieu${item.extension}`;

            return (
              <div
                key={item.extension}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => setSelectedExtension(item.extension)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedExtension(item.extension);
                  }
                }}
                className={`rounded-3xl p-6 border-2 transition-all duration-200 flex flex-col justify-between relative cursor-pointer select-none ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-xl ring-4 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg bg-white'
                }`}
              >
                {/* Badge or Selected Status */}
                {isSelected ? (
                  <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã Chọn Đuôi Này
                  </div>
                ) : item.badge ? (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                    {item.badge}
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-3xl font-black tracking-tight transition-colors ${
                      isSelected ? 'text-indigo-700' : 'text-indigo-600'
                    }`}>
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
                  <div className={`p-3 rounded-xl mb-4 text-xs transition-colors ${
                    isSelected ? 'bg-indigo-50 border border-indigo-200 text-indigo-900' : 'bg-slate-50 text-slate-600'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {cleanDomain ? 'Tên miền đầy đủ:' : 'Ví dụ minh họa:'}
                    </span>
                    <span className="font-bold text-sm break-all">
                      {itemPreviewDomain}
                    </span>
                  </div>

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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExtension(item.extension);
                      const domainToUse = cleanDomain || 'thuonghieu';
                      onSelectDomainForCheckout(domainToUse, item.extension, selectedDomainAddonIds);
                    }}
                    className={`w-full py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-slate-900 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    <span>{isSelected ? `Đăng Ký ${itemPreviewDomain}` : `Chọn Đuôi ${item.extension}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExtDetail(item);
                    }}
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

        {/* Section 4 Requirement: Dịch vụ bổ sung cho tên miền (Mua thêm) */}
        <div className="mt-14 pt-12 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bổ Sung • Gia Tăng Bảo Mật Tên Miền</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Dịch Vụ Bổ Sung Tên Miền (Tùy Chọn Mua Thêm)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Nhấn trực tiếp vào từng ô để kích hoạt hoặc bỏ chọn. Cho phép chọn nhiều dịch vụ độc lập cùng lúc.
              </p>
            </div>
            <div className="text-xs font-medium text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs w-fit">
              Đã kích hoạt: <span className="font-bold text-indigo-600">{selectedDomainAddonIds.length} dịch vụ bổ sung</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DOMAIN_ADDON_OPTIONS.map((addon) => {
              const isAddonActive = selectedDomainAddonIds.includes(addon.id);

              return (
                <div
                  key={addon.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isAddonActive}
                  onClick={() => toggleDomainAddon(addon.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDomainAddon(addon.id);
                    }
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between text-left select-none ${
                    isAddonActive
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                            isAddonActive ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {getAddonIcon(addon.icon)}
                        </div>
                        <span className="text-xs font-semibold text-slate-500">Phí theo năm</span>
                      </div>
                      <span
                        className={`text-xs font-black tracking-tight px-2.5 py-1 rounded-lg ${
                          isAddonActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        +{addon.price.toLocaleString('vi-VN')}đ/năm
                      </span>
                    </div>

                    <h4 className={`font-bold text-sm mb-1.5 transition-colors ${
                      isAddonActive ? 'text-indigo-950 font-extrabold' : 'text-slate-800'
                    }`}>
                      {addon.name}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                      {addon.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isAddonActive ? 'text-indigo-700 font-bold' : 'text-slate-400'}`}>
                      {isAddonActive ? '✓ Đang chọn dịch vụ' : 'Nhấn để thêm'}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isAddonActive ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isAddonActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Dynamic Price Summary Bar for Domain */}
          <div className="mt-8 p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-900/50">
            <div>
              <span className="text-xs text-emerald-400 uppercase tracking-wider font-bold block mb-1">
                Tóm tắt đăng ký tên miền đang chọn
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-white">
                  {candidateDomain}
                </span>
                <span className="text-emerald-300 text-sm font-semibold">
                  ({domainBasePrice.toLocaleString('vi-VN')}đ/năm)
                </span>
                {selectedDomainAddonIds.length > 0 && (
                  <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    + {selectedDomainAddonIds.length} dịch vụ bổ sung (+{domainAddonsTotal.toLocaleString('vi-VN')}đ/năm)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Quản lý DNS tự động • Hỗ trợ chứng chỉ SSL miễn phí trọn đời
              </p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 self-end md:self-center">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Tổng chi phí đăng ký:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {totalDomainRegistrationPrice.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs text-slate-300">/ năm</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckoutSelection}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-700/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>Đăng Ký Tên Miền Đã Chọn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Extension detail modal */}
      {selectedExtDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-indigo-600">{selectedExtDetail.extension}</span>
                {selectedExtDetail.badge && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                    {selectedExtDetail.badge}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedExtDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <p className="text-sm font-medium text-slate-800">{selectedExtDetail.description}</p>

              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Giá đăng ký năm đầu:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedExtDetail.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ưu đãi kèm Hosting:</span>
                  <span className="font-bold text-emerald-600">Miễn phí 0đ (Gói từ 69k)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Thời gian kích hoạt:</span>
                  <span className="font-bold text-indigo-600">Tức thì (1 - 5 phút)</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider block">Tiện ích đi kèm:</span>
                <p>• Bảng điều khiển quản lý DNS đa tầng, hỗ trợ bản ghi A, CNAME, MX, TXT, SRV...</p>
                <p>• Tích hợp sẵn cặp NameServer độc quyền HostingAdvisor tốc độ cao.</p>
                <p>• Bảo vệ chống cướp tên miền và thông báo tự động trước khi hết hạn 30 ngày.</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedExtension(selectedExtDetail.extension);
                  setSelectedExtDetail(null);
                  const domainToUse = cleanDomain || 'thuonghieu';
                  onSelectDomainForCheckout(domainToUse, selectedExtDetail.extension, selectedDomainAddonIds);
                }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Chọn Đăng Ký Đuôi Này
              </button>
              <button
                type="button"
                onClick={() => setSelectedExtDetail(null)}
                className="px-4 py-3 border border-slate-200 text-slate-600 font-medium text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
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
