import React, { useState } from 'react';
import { Plan, Addon } from '../types';
import { INITIAL_ADDONS } from '../data/constants';
import { supabase } from '../data/supabaseClient';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  ShoppingCart,
  Zap,
  Star,
  HardDrive,
  Network,
  Info,
  CheckCircle2,
  Plus,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Phone,
  User,
  AlertCircle,
  Headphones,
  MessageSquare
} from 'lucide-react';

interface PlansCatalogProps {
  plans: Plan[];
  addons?: Addon[];
  onBuyPlan: (plan: Plan, selectedAddonIds?: string[]) => void;
}

export const PlansCatalog: React.FC<PlansCatalogProps> = ({
  plans,
  addons = INITIAL_ADDONS,
  onBuyPlan
}) => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('basic');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [detailModalPlan, setDetailModalPlan] = useState<Plan | null>(null);

  // Quick Service Registration / Consultation Modal State
  const [registerModalPlan, setRegisterModalPlan] = useState<Plan | null>(null);
  const [regFullName, setRegFullName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [consultQuestion, setConsultQuestion] = useState<string>('');
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState<boolean>(false);
  const [createdRegOrder, setCreatedRegOrder] = useState<any | null>(null);

  const validateName = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'Vui lòng nhập họ và tên của bạn (không được bỏ trống).';
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    const trimmed = phone.trim();
    if (!trimmed) {
      return 'Vui lòng nhập số điện thoại liên hệ.';
    }
    const clean = trimmed.replace(/\s+/g, '');
    const phoneRegex = /^(0|\+84)\d{9}$/;
    if (!phoneRegex.test(clean)) {
      return 'Số điện thoại buộc phải gồm đúng 10 số (bắt đầu bằng 0, ví dụ: 0988123456).';
    }
    return null;
  };

  const filteredPlans = plans.filter((p) => {
    if (filterType === 'all') return true;
    if (filterType === 'shared') return p.type.toLowerCase().includes('shared');
    if (filterType === 'cloud') return p.type.toLowerCase().includes('cloud');
    if (filterType === 'vps') return p.type.toLowerCase().includes('vps');
    return true;
  });

  // Toggle Addon
  const toggleAddon = (addonId: string) => {
    if (selectedAddonIds.includes(addonId)) {
      setSelectedAddonIds(selectedAddonIds.filter((id) => id !== addonId));
    } else {
      setSelectedAddonIds([...selectedAddonIds, addonId]);
    }
  };

  // Find currently selected plan
  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  // Calculate pricing
  const planMonthlyPrice = activePlan ? activePlan.pricePerMonth : 0;
  const addonsMonthlyTotal = selectedAddonIds.reduce((sum, id) => {
    const item = addons.find((a) => a.id === id);
    if (!item) return sum;
    // Normalized to monthly cost for instant preview
    const monthlyEquivalent = item.billingType === 'yearly' ? Math.round(item.price / 12) : item.price;
    return sum + monthlyEquivalent;
  }, 0);

  const estimatedTotalMonthly = planMonthlyPrice + addonsMonthlyTotal;

  const handleCheckoutCurrentSelection = () => {
    if (activePlan) {
      onBuyPlan(activePlan, selectedAddonIds);
    }
  };

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setRegError(null);

    const nameErr = validateName(regFullName);
    const phoneErr = validatePhone(regPhone);

    setFullNameError(nameErr);
    setPhoneError(phoneErr);

    if (nameErr || phoneErr) {
      return;
    }

    if (!registerModalPlan) return;

    setIsSubmittingReg(true);

    try {
      const payload = {
        planChosen: registerModalPlan.id,
        desiredDomain: '',
        domainExtension: registerModalPlan.freeDomain ? '.com' : '',
        billingCycleMonths: 12,
        selectedAddons: selectedAddonIds,
        couponCode: null,
        needs: null,
        customerName: regFullName.trim(),
        phone: regPhone.trim(),
        email: 'khachhang@example.com',
        isConsultation: true,
        notes: consultQuestion.trim()
          ? `[YÊU CẦU TƯ VẤN] Gói ${registerModalPlan.name}: ${consultQuestion.trim()}`
          : `[YÊU CẦU TƯ VẤN] Chuyên viên liên hệ tư vấn chi tiết về gói ${registerModalPlan.name}`
      };

      let orderCreated: any = null;

      // 1. Try server endpoint
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.ok && data.order) {
            orderCreated = data.order;
          }
        }
      } catch {}

      // 2. Client-side & Supabase fallback for Vercel static deployments
      if (!orderCreated) {
        const customerId = user?.id || 'guest_' + Date.now();
        orderCreated = {
          id: 'ORD-TV-' + Math.floor(100000 + Math.random() * 900000),
          customerId: customerId,
          customerName: regFullName.trim(),
          phone: regPhone.trim(),
          email: user?.email || 'khachhang@example.com',
          planChosen: registerModalPlan.id,
          planName: registerModalPlan.name,
          planPrice: registerModalPlan.pricePerMonth,
          totalAmount: registerModalPlan.pricePerMonth * 12,
          billingCycleMonths: 12,
          isConsultation: true,
          status: 'pending_payment',
          paymentStatus: 'unpaid',
          notes: payload.notes,
          createdAt: new Date().toISOString()
        };

        // Cache into local orders
        try {
          const existing = JSON.parse(localStorage.getItem('ha_orders') || '[]');
          existing.unshift(orderCreated);
          localStorage.setItem('ha_orders', JSON.stringify(existing));
        } catch {}

        // Sync to Supabase directly so staff and admin receive consultation request
        try {
          const { data, error } = await supabase.from('orders').upsert({
            id: String(orderCreated.id),
            customer_id: String(customerId),
            customer_name: orderCreated.customerName,
            phone: orderCreated.phone,
            email: orderCreated.email,
            plan_chosen: orderCreated.planChosen,
            plan_name: orderCreated.planName,
            total_amount: orderCreated.totalAmount,
            status: orderCreated.status,
            payment_status: orderCreated.paymentStatus,
            billing_cycle_months: orderCreated.billingCycleMonths,
            domain_name: `[TƯ VẤN] ${consultQuestion.trim() || 'Gói ' + registerModalPlan.name}`,
            created_at: orderCreated.createdAt,
            updated_at: new Date().toISOString()
          }).select();

          if (error) {
            console.error('Lỗi lưu đăng ký tư vấn vào Supabase:', error);
          } else {
            console.log('Đã lưu đăng ký tư vấn thành công vào Supabase:', data);
          }
        } catch (supErr) {
          console.warn('Supabase consultation sync notice:', supErr);
        }
      }

      setCreatedRegOrder(orderCreated);
      setRegSuccess(true);
    } catch (err: any) {
      setRegError('Lỗi gửi yêu cầu tư vấn: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setIsSubmittingReg(false);
    }
  };

  return (
    <section id="catalog-plans" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Danh mục sản phẩm chính thức • Lựa chọn trực tiếp</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bảng Giá Dịch Vụ Hosting Tốc Độ Cao
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Nhấn trực tiếp vào bất kỳ gói hosting nào để lựa chọn. Viền sẽ đổi màu để thể hiện trạng thái được chọn và tự động cập nhật tổng chi phí.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất Cả 6 Gói
            </button>
            <button
              onClick={() => setFilterType('shared')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'shared'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Shared Hosting (Starter, Basic, Business)
            </button>
            <button
              onClick={() => setFilterType('cloud')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'cloud'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Cloud Hosting (Shop Pro)
            </button>
            <button
              onClick={() => setFilterType('vps')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'vps'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              VPS Máy Chủ Ảo (Growth, Power)
            </button>
          </div>
        </div>

        {/* 6 Plans Grid: Clickable whole cards with clear border change */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredPlans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isPopular = plan.id === 'business' || plan.id === 'shop-pro';

            return (
              <div
                key={plan.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => setSelectedPlanId(plan.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPlanId(plan.id);
                  }
                }}
                className={`rounded-3xl p-6 sm:p-8 border-2 transition-all duration-200 flex flex-col justify-between relative cursor-pointer select-none ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/25 shadow-xl ring-4 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg bg-white'
                }`}
              >
                {/* Popular or Selected Tag */}
                {isSelected ? (
                  <div className="absolute -top-3.5 right-6 px-3.5 py-1 bg-indigo-600 text-white text-[11px] font-extrabold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã Chọn Gói Này
                  </div>
                ) : isPopular ? (
                  <div className="absolute -top-3.5 right-6 px-3.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    Bán Chạy Nhất
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors ${
                      isSelected ? 'text-indigo-900 bg-indigo-100' : 'text-indigo-600 bg-indigo-50'
                    }`}>
                      {plan.type}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ~ {plan.recommendedVisits.toLocaleString('vi-VN')} khách/tháng
                    </span>
                  </div>

                  <h3 className={`text-2xl font-black mb-1 transition-colors ${
                    isSelected ? 'text-indigo-950' : 'text-slate-900'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-5 min-h-[32px]">{plan.bestFor}</p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {plan.pricePerMonth.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ tháng</span>
                  </div>

                  {/* Quick specs */}
                  <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold mb-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        Ổ Cứng SSD/NVMe
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{plan.storage}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold mb-1">
                        <Network className="w-3.5 h-3.5" />
                        Băng Thông
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{plan.bandwidth}</span>
                    </div>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-3 text-xs text-slate-600 mb-6">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.freeDomain ? (
                      <li className="flex items-start gap-2.5 text-indigo-700 font-semibold bg-indigo-50/70 p-2 rounded-lg">
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>Tặng miễn phí tên miền .com/.vn năm đầu</span>
                      </li>
                    ) : (
                      <li className="flex items-start gap-2.5 text-slate-400">
                        <span className="w-4 text-center">-</span>
                        <span>Không kèm tên miền miễn phí</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Actions: Mua gói & Đăng ký dịch vụ */}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                  {/* Nút 1: Mua gói */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlanId(plan.id);
                      onBuyPlan(plan, selectedAddonIds);
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Mua gói</span>
                  </button>

                  {/* Nút 2: Đăng ký tư vấn (ở dưới chữ Mua gói) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlanId(plan.id);
                      setRegisterModalPlan(plan);
                      setRegFullName('');
                      setRegPhone('');
                      setConsultQuestion('');
                      setFullNameError(null);
                      setPhoneError(null);
                      setHasAttemptedSubmit(false);
                      setRegError(null);
                      setRegSuccess(false);
                      setCreatedRegOrder(null);
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>Đăng ký tư vấn</span>
                  </button>

                  {/* Nút 3: Xem thông số chi tiết */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailModalPlan(plan);
                    }}
                    className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Xem thông số chi tiết</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 3 Requirement: Dịch vụ mua thêm (Add-ons) */}
        <div className="mt-14 pt-12 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-2">
                <Plus className="w-3 h-3" />
                <span>Mua Thêm • Dịch Vụ Bổ Sung</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Dịch Vụ Bổ Sung Cho Hosting (Mua Thêm)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Nhấn trực tiếp vào từng ô để bật hoặc tắt. Bạn có thể chọn nhiều dịch vụ bổ sung cùng lúc.
              </p>
            </div>
            <div className="text-xs font-medium text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs w-fit">
              Đã kích hoạt: <span className="font-bold text-indigo-600">{selectedAddonIds.length} dịch vụ mua thêm</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {addons.map((addon) => {
              const isAddonActive = selectedAddonIds.includes(addon.id);

              return (
                <div
                  key={addon.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isAddonActive}
                  onClick={() => toggleAddon(addon.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleAddon(addon.id);
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
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                          {addon.billingType === 'monthly' ? 'Theo tháng' : 'Theo năm'}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-black tracking-tight px-2.5 py-1 rounded-lg ${
                          isAddonActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        +{addon.price.toLocaleString('vi-VN')}đ{addon.billingType === 'monthly' ? '/tháng' : '/năm'}
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
                      {isAddonActive ? '✓ Đang chọn mua thêm' : 'Nhấn để thêm'}
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

          {/* Interactive Dynamic Price Summary Bar */}
          <div className="mt-8 p-6 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
            <div>
              <span className="text-xs text-indigo-300 uppercase tracking-wider font-bold block mb-1">
                Tóm tắt cấu hình đang chọn
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-white">
                  Gói {activePlan?.name || 'Basic'}
                </span>
                <span className="text-indigo-200 text-sm">
                  ({planMonthlyPrice.toLocaleString('vi-VN')}đ/tháng)
                </span>
                {selectedAddonIds.length > 0 && (
                  <span className="text-xs bg-indigo-500/40 text-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                    + {selectedAddonIds.length} dịch vụ mua thêm (~+{addonsMonthlyTotal.toLocaleString('vi-VN')}đ/tháng)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {activePlan?.freeDomain ? '✓ Đã bao gồm tên miền miễn phí 1 năm' : 'Chưa bao gồm tên miền riêng'}
              </p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 self-end md:self-center">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Tổng ước tính:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300">
                    {estimatedTotalMonthly.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs text-slate-300">/ tháng</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckoutCurrentSelection}
                className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>Tiến Hành Đăng Ký</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Details Modal */}
      {detailModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {detailModalPlan.type}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Gói {detailModalPlan.name}</h3>
              </div>
              <button
                onClick={() => setDetailModalPlan(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-400 block">Giá niêm yết:</span>
                  <span className="text-xl font-bold text-slate-900">
                    {detailModalPlan.pricePerMonth.toLocaleString('vi-VN')}đ / tháng
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Lượt truy cập tối ưu:</span>
                  <span className="font-semibold text-slate-800">
                    ~ {detailModalPlan.recommendedVisits.toLocaleString('vi-VN')} lượt
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Thông số kỹ thuật:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">Dung lượng ổ cứng:</span>
                    <span className="font-bold text-slate-800">{detailModalPlan.storage}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">Băng thông hàng tháng:</span>
                    <span className="font-bold text-slate-800">{detailModalPlan.bandwidth}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Quyền lợi kèm theo:</h4>
                <ul className="space-y-1.5 text-xs">
                  {detailModalPlan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {detailModalPlan.freeDomain && (
                    <li className="flex items-center gap-2 text-indigo-700 font-semibold">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Tặng miễn phí tên miền năm đầu (.com hoặc .vn)</span>
                    </li>
                  )}
                </ul>
              </div>

              {detailModalPlan.limitations && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  <p className="font-semibold mb-0.5">Lưu ý kỹ thuật:</p>
                  <p>{detailModalPlan.limitations}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedPlanId(detailModalPlan.id);
                  setDetailModalPlan(null);
                  onBuyPlan(detailModalPlan, selectedAddonIds);
                }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Đặt Mua Gói Này
              </button>
              <button
                onClick={() => setDetailModalPlan(null)}
                className="px-5 py-3 border border-slate-200 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Consultation Registration Modal (Điền Họ và tên, Số điện thoại, Nội dung tư vấn, Hủy / Gửi) */}
      {registerModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Đăng Ký Tư Vấn</h3>
                  <p className="text-xs text-slate-500">
                    Gói {registerModalPlan.name} • {registerModalPlan.pricePerMonth.toLocaleString('vi-VN')}đ / tháng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRegisterModalPlan(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {regSuccess ? (
              <div className="py-2 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-1.5">Gửi Yêu Cầu Tư Vấn Thành Công!</h4>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                  Cảm ơn bạn <strong>{regFullName}</strong>. Thông tin đăng ký tư vấn cho <strong>Gói {registerModalPlan.name}</strong> đã được ghi nhận lên hệ thống.
                </p>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 mb-5 text-left space-y-1.5">
                  <p>• Mã tiếp nhận: <strong className="text-indigo-600 font-mono">{createdRegOrder?.id || 'ORD-2026-CONSULT'}</strong></p>
                  <p>• Số điện thoại nhận tư vấn: <strong>{regPhone}</strong></p>
                  <p>• Gói quan tâm: <strong>{registerModalPlan.name} ({registerModalPlan.pricePerMonth.toLocaleString('vi-VN')}đ/tháng)</strong></p>
                  {consultQuestion.trim() && (
                    <p>• Câu hỏi cần giải đáp: <em>"{consultQuestion.trim()}"</em></p>
                  )}
                  <p>• Trạng thái: <span className="text-emerald-600 font-bold">Chuyên viên kỹ thuật sẽ gọi lại trong 5 phút</span></p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterModalPlan(null);
                      onBuyPlan(registerModalPlan, selectedAddonIds);
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Xem Chi Tiết & Mua Gói Này Luôn
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterModalPlan(null)}
                    className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickRegister} className="space-y-4">
                <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    Chuyên viên kỹ thuật sẽ liên hệ trực tiếp qua Số điện thoại để tư vấn chi tiết về cấu hình gói <strong>{registerModalPlan.name}</strong>, khả năng chịu tải, gợi ý tên miền phù hợp và báo giá ưu đãi tốt nhất cho bạn.
                  </span>
                </div>

                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-medium">{regError}</span>
                  </div>
                )}

                {/* Điền Họ và tên (Bắt buộc không được bỏ trống) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      Họ và tên của bạn <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegFullName(val);
                        if (hasAttemptedSubmit || val.length > 0) {
                          setFullNameError(validateName(val));
                        } else {
                          setFullNameError(null);
                        }
                      }}
                      onBlur={() => setFullNameError(validateName(regFullName))}
                      placeholder="Nhập họ và tên thật..."
                      autoFocus
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800 focus:outline-none transition-colors ${
                        fullNameError
                          ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                          : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                  {fullNameError && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fullNameError}</span>
                    </p>
                  )}
                </div>

                {/* Nhập Số điện thoại (Bắt buộc đúng 10 số) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      Số điện thoại nhận tư vấn <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Buộc 10 số</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegPhone(val);
                        if (hasAttemptedSubmit || val.length > 0) {
                          setPhoneError(validatePhone(val));
                        } else {
                          setPhoneError(null);
                        }
                      }}
                      onBlur={() => setPhoneError(validatePhone(regPhone))}
                      placeholder="Nhập số điện thoại liên hệ (ví dụ: 0988123456)..."
                      maxLength={10}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800 focus:outline-none transition-colors ${
                        phoneError
                          ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                          : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{phoneError}</span>
                    </p>
                  )}
                </div>

                {/* Nội dung cần tư vấn về gói */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      Nội dung cần tư vấn về gói:
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Tùy chọn</span>
                  </label>
                  <textarea
                    rows={2}
                    value={consultQuestion}
                    onChange={(e) => setConsultQuestion(e.target.value)}
                    placeholder={`Ví dụ: Tôi muốn tư vấn gói ${registerModalPlan.name} có phù hợp với website của tôi không, khả năng chịu tải thế nào...`}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Nút Hủy hay Gửi ở dưới */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterModalPlan(null)}
                    disabled={isSubmittingReg}
                    className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReg}
                    className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-300 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReg ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <span>Gửi Yêu Cầu Tư Vấn</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
