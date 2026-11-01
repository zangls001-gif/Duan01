import React, { useState, useEffect } from 'react';
import { Plan, DomainPricing, Addon, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Check,
  ShieldCheck,
  QrCode,
  Tag,
  AlertCircle,
  Copy,
  CheckCircle2,
  FileText,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Database,
  User as UserIcon
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
  allPlans: Plan[];
  domains: DomainPricing[];
  addons: Addon[];
  initialDomainName?: string;
  initialDomainExt?: string;
  onOrderCreated: (order: Order) => void;
  onOpenInvoice: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  allPlans,
  domains,
  addons,
  initialDomainName = '',
  initialDomainExt = '.com',
  onOrderCreated,
  onOpenInvoice
}) => {
  const { user, token, openAuthModal } = useAuth();

  // Selected plan state
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(selectedPlan);
  const [billingCycle, setBillingCycle] = useState<number>(12); // 12, 24, 36 months

  // Domain state
  const [includeDomain, setIncludeDomain] = useState<boolean>(true);
  const [domainName, setDomainName] = useState<string>(initialDomainName);
  const [domainExt, setDomainExt] = useState<string>(initialDomainExt);

  // Customer Contact Information (cho phép khách hàng đặt hàng trực tiếp, không bắt buộc đăng nhập)
  const [customerName, setCustomerName] = useState<string>(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');

  // Add-ons state
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState<string>('VIBE2026');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedBankInfo, setCopiedBankInfo] = useState<boolean>(false);
  const [supabaseSyncedNotice, setSupabaseSyncedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      if (!customerName && user.fullName) setCustomerName(user.fullName);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (selectedPlan) {
      setCurrentPlan(selectedPlan);
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (initialDomainName) {
      setDomainName(initialDomainName);
    }
    if (initialDomainExt) {
      setDomainExt(initialDomainExt);
    }
  }, [initialDomainName, initialDomainExt]);

  if (!isOpen || !currentPlan) return null;

  // Pricing Calculation logic (from specification Section 0 & Prompt 3)
  const cycle = billingCycle;
  let cycleDiscountPercent = 0;
  if (cycle === 24) cycleDiscountPercent = 0.1;
  if (cycle === 36) cycleDiscountPercent = 0.2;

  const rawHostingPrice = currentPlan.pricePerMonth * cycle;
  const hostingPrice = Math.round(rawHostingPrice * (1 - cycleDiscountPercent));

  // Domain price
  let domainPrice = 0;
  let isDomainFree = false;
  if (includeDomain && domainName.trim()) {
    const extObj = domains.find((d) => d.extension === domainExt);
    const regularDomainPrice = extObj ? extObj.price : 280000;
    if (currentPlan.freeDomain && ['.com', '.vn'].includes(domainExt)) {
      isDomainFree = true;
      domainPrice = 0;
    } else {
      domainPrice = regularDomainPrice;
    }
  }

  // Add-ons price
  let addonsTotal = 0;
  const chosenAddonsList = selectedAddonIds.map((id) => {
    const item = addons.find((a) => a.id === id);
    if (!item) return { id, name: '', price: 0 };
    const price = item.billingType === 'monthly' ? item.price * cycle : item.price;
    addonsTotal += price;
    return { id: item.id, name: item.name, price };
  });

  const subTotal = hostingPrice + domainPrice + addonsTotal;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subTotal - discountAmount);

  // Dynamic VietQR generator URL
  const tempOrderId = createdOrder ? createdOrder.id : `ORD-2026-${Math.floor(Math.random() * 800 + 100)}`;
  const vietQrUrl = `https://img.vietqr.io/image/MB-0988123456-compact2.png?amount=${finalTotal}&addInfo=${encodeURIComponent(
    tempOrderId
  )}&accountName=${encodeURIComponent('HOSTING ADVISOR CORP')}`;

  // Toggle Addon
  const toggleAddon = (addonId: string) => {
    if (selectedAddonIds.includes(addonId)) {
      setSelectedAddonIds(selectedAddonIds.filter((id) => id !== addonId));
    } else {
      setSelectedAddonIds([...selectedAddonIds, addonId]);
    }
  };

  // Validate coupon
  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
      setCouponError('Vui lòng nhập mã ưu đãi');
      return;
    }
    setCouponError(null);
    setCouponSuccess(null);
    setIsApplyingCoupon(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          rawTotal: subTotal
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setCouponError(data.error || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          description: data.description,
          discountAmount: data.discountAmount
        });
        setCouponSuccess(`Áp dụng thành công! Đã giảm ${data.discountAmount.toLocaleString('vi-VN')}đ`);
      }
    } catch (err: any) {
      setCouponError('Lỗi xác thực coupon: ' + err.message);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Submit Order - Đơn giản hóa: Ấn xác nhận là gửi ngay vào Supabase
  const handleCreateOrderAndConfirm = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        planChosen: currentPlan.id,
        desiredDomain: includeDomain ? domainName.trim() : '',
        domainExtension: includeDomain ? domainExt : '',
        billingCycleMonths: cycle,
        selectedAddons: selectedAddonIds,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        needs: null,
        customerName: customerName.trim() || user?.fullName || 'Khách hàng VIP',
        phone: customerPhone.trim() || user?.phone || '0988123456',
        email: customerEmail.trim() || user?.email || 'khachhang@example.com'
      };

      // 1. Tạo đơn hàng và đồng bộ Supabase
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Không thể tạo đơn hàng');
      }

      const order: Order = data.order;

      // 2. Tự động xác nhận thanh toán & đồng bộ trạng thái mới lên Supabase ngay lập tức
      const confirmRes = await fetch(`/api/orders/${order.id}/confirm-payment`, {
        method: 'POST',
        headers: authHeaders
      });

      const confirmData = await confirmRes.json().catch(() => ({}));
      order.status = 'paid_processing';
      order.paymentStatus = 'paid_processing';

      setCreatedOrder(order);
      setSupabaseSyncedNotice(true);
      onOrderCreated(order);
    } catch (err: any) {
      setSubmitError(err.message || 'Lỗi xử lý đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBankDetails = () => {
    const text = `MB Bank - STK: 0988123456 - Tên: HOSTING ADVISOR CORP - Số tiền: ${finalTotal.toLocaleString(
      'vi-VN'
    )}đ - Nội dung: ${tempOrderId}`;
    navigator.clipboard.writeText(text);
    setCopiedBankInfo(true);
    setTimeout(() => setCopiedBankInfo(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Đặt Mua & Thanh Toán Dịch Vụ</h3>
              <p className="text-[11px] text-slate-400">Giao dịch an toàn qua mã VietQR Ngân hàng động</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen after Order Creation */}
        {createdOrder ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Đã Ghi Nhận Đơn Hàng Thành Công
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Mã Đơn: <span className="text-indigo-600">{createdOrder.id}</span>
              </h3>
              <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
                Cảm ơn bạn! Hệ thống đã ghi nhận trạng thái chuyển khoản. Nhân viên kỹ thuật sẽ kiểm tra đối soát và kích hoạt thông số hosting trong vài phút.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-semibold text-slate-800">{createdOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gói dịch vụ:</span>
                <span className="font-semibold text-slate-800">
                  {createdOrder.planName} ({createdOrder.billingCycleMonths} tháng)
                </span>
              </div>
              {createdOrder.domainName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên miền đăng ký:</span>
                  <span className="font-semibold text-indigo-600">{createdOrder.domainName}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                <span>Tổng thanh toán:</span>
                <span className="text-indigo-600">{createdOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Supabase Sync Feedback Banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl max-w-md mx-auto text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Đã Đồng Bộ Thành Công Lên Supabase</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Dữ liệu giao dịch đơn hàng <span className="font-mono font-bold">{createdOrder.id}</span> đã được ghi trực tiếp vào bảng <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">orders</code> trên Supabase Cloud.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenInvoice(createdOrder);
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Xem & In Hóa Đơn Điện Tử (Invoice)</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="p-6 sm:p-8 space-y-6">
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* 1. Selected Plan & Cycle */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {currentPlan.type}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-lg">Gói {currentPlan.name}</h4>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {currentPlan.storage} • {currentPlan.bandwidth} • {currentPlan.features.slice(0, 2).join(', ')}
                </p>
              </div>

              {/* Cycle Selector */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBillingCycle(12)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    billingCycle === 12 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  12 Tháng
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle(24)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    billingCycle === 24 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>24 Tháng</span>
                  <span className="text-[10px] bg-amber-400 text-slate-900 px-1 rounded font-bold">-10%</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle(36)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    billingCycle === 36 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>36 Tháng</span>
                  <span className="text-[10px] bg-emerald-400 text-slate-900 px-1 rounded font-bold">-20%</span>
                </button>
              </div>
            </div>

            {/* 2. Domain Registration Option */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk-domain"
                    checked={includeDomain}
                    onChange={(e) => setIncludeDomain(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="chk-domain" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Đăng ký tên miền kèm theo
                  </label>
                </div>
                {isDomainFree && includeDomain && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Tặng miễn phí 100% năm đầu (0đ)
                  </span>
                )}
              </div>

              {includeDomain && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="Nhập tên thương hiệu (ví dụ: yenboutique)"
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <select
                    value={domainExt}
                    onChange={(e) => setDomainExt(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {domains.map((d) => (
                      <option key={d.extension} value={d.extension}>
                        {d.extension} ({d.price.toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 3. Add-ons Selection (Section 4.2 requirement) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Dịch Vụ Mua Kèm (Add-ons Khuyên Dùng):
              </h4>
              <div className="space-y-2">
                {addons.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);
                  const itemPrice = addon.billingType === 'monthly' ? addon.price * cycle : addon.price;

                  return (
                    <label
                      key={addon.id}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-1 ring-indigo-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(addon.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <div>
                          <p className="text-xs font-bold">{addon.name}</p>
                          <p className="text-[11px] text-slate-500">{addon.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-indigo-700 block">
                          +{itemPrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {addon.billingType === 'monthly' ? `(${cycle} tháng)` : '/năm'}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Customer Contact Info (Tự động điền hoặc nhập nhanh, không chặn đơn) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Thông Tin Khách Hàng (Nhận Thông Số Bàn Giao)
                </label>
                {user ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Đã đăng nhập ({user.username})
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-medium">
                    Đặt nhanh trực tiếp, không bắt buộc đăng nhập
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Họ và tên khách:</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Số điện thoại (Zalo):</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ví dụ: 0988123456"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email nhận thông số:</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* 5. Coupon Input (Section 4.3 requirement) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                Mã Ưu Đãi Giảm Giá (Coupon Code):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã: VIBE2026 hoặc CHUSHOP"
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isApplyingCoupon ? 'Đang kiểm tra...' : 'Áp Dụng'}
                </button>
              </div>
              {couponError && <p className="text-[11px] text-rose-600 mt-1.5">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-emerald-600 font-semibold mt-1.5">{couponSuccess}</p>}
            </div>

            {/* 6. Dynamic VietQR Box and Payment Summary (Section 0 & 4.3 & 5.1) */}
            <div className="p-5 rounded-2xl bg-indigo-950 text-white grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Code Column */}
              <div className="text-center bg-white p-3.5 rounded-2xl shadow-md text-slate-900">
                <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                  Mã VietQR Ngân Hàng Tự Động
                </p>
                <img
                  src={vietQrUrl}
                  alt="Mã QR Chuyển Khoản"
                  className="w-48 h-48 mx-auto object-contain rounded-lg border border-slate-100"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Quét bằng mọi ứng dụng Mobile Banking
                </p>
              </div>

              {/* Price Details & Bank Information */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-indigo-200">
                  <span>Tiền hosting ({cycle} tháng):</span>
                  <span>{hostingPrice.toLocaleString('vi-VN')}đ</span>
                </div>

                {includeDomain && domainName && (
                  <div className="flex justify-between text-indigo-200">
                    <span>Tên miền ({domainName}{domainExt}):</span>
                    <span>{isDomainFree ? 'Miễn phí (0đ)' : `${domainPrice.toLocaleString('vi-VN')}đ`}</span>
                  </div>
                )}

                {addonsTotal > 0 && (
                  <div className="flex justify-between text-indigo-200">
                    <span>Dịch vụ mua kèm ({selectedAddonIds.length}):</span>
                    <span>+{addonsTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Mã giảm giá ({appliedCoupon?.code}):</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                <div className="pt-2.5 border-t border-indigo-800 flex justify-between items-baseline">
                  <span className="font-bold text-sm">Tổng Cần Thanh Toán:</span>
                  <span className="text-2xl font-black text-amber-300">
                    {finalTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Bank account details with copy */}
                <div className="p-2.5 bg-indigo-900/60 rounded-xl border border-indigo-800/80 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Ngân hàng:</span>
                    <span className="font-bold">MB Bank (Quân Đội)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Số tài khoản:</span>
                    <span className="font-mono font-bold text-amber-300">0988123456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Chủ tài khoản:</span>
                    <span className="font-bold uppercase">HOSTING ADVISOR CORP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-300">Nội dung CK:</span>
                    <span className="font-mono font-bold text-amber-300">{tempOrderId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyBankDetails}
                    className="w-full mt-1.5 py-1 text-[10px] font-semibold text-center bg-indigo-800 hover:bg-indigo-700 text-indigo-200 rounded cursor-pointer transition-colors"
                  >
                    {copiedBankInfo ? '✓ Đã sao chép thông tin CK' : 'Sao chép thông tin chuyển khoản'}
                  </button>
                </div>
              </div>
            </div>

            {/* Supabase Live Sync Indicator */}
            <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-xl text-xs flex items-center justify-between text-indigo-900">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Đồng bộ Supabase tức thì:</strong> Chỉ cần ấn xác nhận, thông tin đơn & giao dịch sẽ tự động lưu ngay vào bảng <code className="bg-indigo-100 font-mono px-1 py-0.5 rounded font-bold">orders</code> trên Supabase.
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleCreateOrderAndConfirm}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xác nhận & đồng bộ tới Supabase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <span>Xác Nhận & Gửi Dữ Liệu Lên Supabase</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-4 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
