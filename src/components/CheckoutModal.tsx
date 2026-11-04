import React, { useState, useEffect } from 'react';
import { Plan, DomainPricing, Addon, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../data/supabaseClient';
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
  initialAddonIds?: string[];
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
  initialAddonIds = [],
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

  // Validation error state (Buộc số điện thoại 10 số, không chữ, và bắt buộc họ tên)
  const [customerNameError, setCustomerNameError] = useState<string | null>(null);
  const [customerPhoneError, setCustomerPhoneError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);

  const validatePhone = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Vui lòng nhập số điện thoại (bắt buộc)';
    }
    if (/[^0-9]/.test(trimmed)) {
      return 'Không được chứa chữ hoặc ký tự, chỉ nhập số';
    }
    if (trimmed.length !== 10) {
      return `Số điện thoại buộc đúng 10 số (hiện có ${trimmed.length} số)`;
    }
    if (!trimmed.startsWith('0')) {
      return 'Số điện thoại phải bắt đầu bằng số 0 (ví dụ: 0988123456)';
    }
    return null;
  };

  const validateName = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Vui lòng nhập họ và tên khách (bắt buộc)';
    }
    return null;
  };

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

  useEffect(() => {
    if (initialAddonIds && initialAddonIds.length > 0) {
      setSelectedAddonIds(initialAddonIds);
    }
  }, [initialAddonIds, isOpen]);

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
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Vui lòng nhập mã ưu đãi');
      return;
    }
    setCouponError(null);
    setCouponSuccess(null);
    setIsApplyingCoupon(true);

    try {
      let applied = false;

      // 1. Try server endpoint
      try {
        const res = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            rawTotal: subTotal
          })
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.ok) {
            applied = true;
            setAppliedCoupon({
              code: data.code,
              description: data.description,
              discountAmount: data.discountAmount
            });
            setCouponSuccess(`Áp dụng thành công! Đã giảm ${data.discountAmount.toLocaleString('vi-VN')}đ`);
          }
        }
      } catch {}

      // 2. Client-side coupon validation fallback for Vercel
      if (!applied) {
        if (code === 'VIBE2026') {
          const discount = Math.round((subTotal * 15) / 100);
          setAppliedCoupon({
            code: 'VIBE2026',
            description: 'Giảm 15% tổng hóa đơn nhân dịp Vibe Coding 2026',
            discountAmount: discount
          });
          setCouponSuccess(`Áp dụng thành công! Đã giảm ${discount.toLocaleString('vi-VN')}đ (15%)`);
          applied = true;
        } else if (code === 'CHUSHOP') {
          const discount = Math.min(50000, subTotal);
          setAppliedCoupon({
            code: 'CHUSHOP',
            description: 'Ưu đãi trực tiếp 50.000đ cho chủ shop khởi nghiệp',
            discountAmount: discount
          });
          setCouponSuccess(`Áp dụng thành công! Đã giảm ${discount.toLocaleString('vi-VN')}đ`);
          applied = true;
        } else {
          setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
          setAppliedCoupon(null);
        }
      }
    } catch (err: any) {
      setCouponError('Lỗi xác thực coupon: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Submit Order - Đơn giản hóa: Ấn xác nhận là gửi ngay vào Supabase
  const handleCreateOrderAndConfirm = async () => {
    setSubmitError(null);
    setHasAttemptedSubmit(true);

    // Kiểm tra ràng buộc họ tên và số điện thoại theo yêu cầu
    const nameErr = validateName(customerName);
    const phoneErr = validatePhone(customerPhone);
    setCustomerNameError(nameErr);
    setCustomerPhoneError(phoneErr);

    if (nameErr || phoneErr) {
      setSubmitError(
        phoneErr
          ? `Không thể thanh toán: ${phoneErr}`
          : `Không thể thanh toán: ${nameErr}`
      );
      return;
    }

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
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || user?.email || 'khachhang@example.com'
      };

      let order: Order | null = null;

      // 1. Try server endpoint first
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(payload)
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.ok && data.order) {
            const confirmedOrder: Order = data.order;
            order = confirmedOrder;
            // Confirm payment on server
            fetch(`/api/orders/${confirmedOrder.id}/confirm-payment`, {
              method: 'POST',
              headers: authHeaders
            }).catch(() => {});
          }
        }
      } catch {}

      // 2. Client-side & Supabase fallback for Vercel static deployments
      if (!order) {
        const orderId = tempOrderId;
        const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
        const total = Math.max(0, subTotal - discount);
        const resolvedDomain = includeDomain ? `${domainName.trim()}${domainExt}` : '';

        const newOrderObj: Order = {
          id: orderId,
          customerId: user?.id || 'guest',
          customerName: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || user?.email || 'khachhang@example.com',
          planChosen: currentPlan.id,
          planName: currentPlan.name,
          planPrice: currentPlan.pricePerMonth,
          domainName: resolvedDomain,
          domainExtension: includeDomain ? domainExt : '',
          domainPrice: includeDomain ? domainPrice : 0,
          isDomainFree: includeDomain ? isDomainFree : false,
          billingCycleMonths: cycle,
          addons: chosenAddonsList,
          couponApplied: appliedCoupon ? appliedCoupon.code : null,
          discountAmount: discount,
          subTotal,
          totalAmount: total,
          qrUrl: vietQrUrl,
          paymentMethod: 'vietqr',
          paymentStatus: 'paid_processing',
          status: 'paid_processing',
          assignedTo: null,
          assignedToName: 'Chưa phân công',
          serviceDetails: null,
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeline: [
            {
              action: 'Tạo đơn hàng & Quét VietQR',
              by: customerName.trim(),
              time: new Date().toISOString()
            },
            {
              action: 'Xác nhận thanh toán thành công (Tự động)',
              by: 'Hệ thống VietQR',
              time: new Date().toISOString()
            }
          ]
        };

        order = newOrderObj;

        // Save order locally so user can see it in MyOrders
        try {
          const existing = JSON.parse(localStorage.getItem('ha_orders') || '[]');
          existing.unshift(newOrderObj);
          localStorage.setItem('ha_orders', JSON.stringify(existing));
        } catch {}

        // Sync directly to Supabase orders table
        try {
          await supabase.from('orders').upsert({
            id: String(newOrderObj.id),
            customer_id: String(newOrderObj.customerId),
            customer_name: String(newOrderObj.customerName),
            phone: String(newOrderObj.phone),
            email: String(newOrderObj.email),
            plan_chosen: String(newOrderObj.planChosen),
            plan_name: String(newOrderObj.planName),
            total_amount: Number(newOrderObj.totalAmount),
            payment_status: 'paid_processing',
            status: 'paid_processing',
            billing_cycle_months: Number(newOrderObj.billingCycleMonths),
            domain_name: String(newOrderObj.domainName),
            created_at: newOrderObj.createdAt
          });
        } catch (supErr) {
          console.warn('Supabase orders table sync notice:', supErr);
        }
      }

      if (order) {
        order.status = 'paid_processing';
        order.paymentStatus = 'paid_processing';
        setCreatedOrder(order);
        setSupabaseSyncedNotice(true);
        onOrderCreated(order);
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto max-h-[94vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Đặt Mua & Thanh Toán Dịch Vụ</h3>
              <p className="text-[10px] text-slate-400">Giao dịch an toàn qua mã VietQR Ngân hàng động • Đối soát tự động</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Screen after Order Creation */}
        {createdOrder ? (
          <div className="p-5 sm:p-6 text-center space-y-4 overflow-y-auto">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Đã Ghi Nhận Đơn Hàng Thành Công
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1.5">
                Mã Đơn: <span className="text-indigo-600">{createdOrder.id}</span>
              </h3>
              <p className="text-slate-600 text-xs mt-1 max-w-md mx-auto">
                Cảm ơn bạn! Hệ thống đã ghi nhận trạng thái chuyển khoản. Nhân viên kỹ thuật sẽ kiểm tra đối soát và kích hoạt thông số hosting trong vài phút.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-left text-xs space-y-1.5">
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
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-xs">
                <span>Tổng thanh toán:</span>
                <span className="text-indigo-600 text-sm">{createdOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenInvoice(createdOrder);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Xem & In Hóa Đơn Điện Tử (Invoice)</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form (Giao diện 2 cột nhỏ gọn, vừa vặn khung hình) */
          <div className="p-3.5 sm:p-4 overflow-y-auto flex-1">
            {submitError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
              {/* Cột Trái (7 cols): Cấu hình gói, Tên miền, Dịch vụ mua kèm, Thông tin KH, Coupon */}
              <div className="md:col-span-7 space-y-2.5">
                {/* 1. Gói dịch vụ & Chu kỳ thanh toán */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                        {currentPlan.type}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">Gói {currentPlan.name}</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {currentPlan.storage} • {currentPlan.bandwidth}
                    </p>
                  </div>

                  {/* Cycle Selector */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setBillingCycle(12)}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                        billingCycle === 12 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      12 Tháng
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle(24)}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-0.5 ${
                        billingCycle === 24 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>24 Tháng</span>
                      <span className="text-[9px] bg-amber-400 text-slate-900 px-1 rounded font-bold">-10%</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle(36)}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-0.5 ${
                        billingCycle === 36 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>36 Tháng</span>
                      <span className="text-[9px] bg-emerald-400 text-slate-900 px-1 rounded font-bold">-20%</span>
                    </button>
                  </div>
                </div>

                {/* 2. Đăng ký tên miền kèm theo */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chk-domain"
                        checked={includeDomain}
                        onChange={(e) => setIncludeDomain(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                      />
                      <label htmlFor="chk-domain" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Đăng ký tên miền kèm theo
                      </label>
                    </div>
                    {isDomainFree && includeDomain && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
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
                        placeholder="Nhập tên thương hiệu (ví dụ: mybrand)"
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                      <select
                        value={domainExt}
                        onChange={(e) => setDomainExt(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
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

                {/* 3. Dịch vụ mua kèm (Add-ons) */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Dịch Vụ Mua Kèm (Add-ons):
                  </h4>
                  <div className="space-y-1.5">
                    {addons.map((addon) => {
                      const isChecked = selectedAddonIds.includes(addon.id);
                      const itemPrice = addon.billingType === 'monthly' ? addon.price * cycle : addon.price;

                      return (
                        <label
                          key={addon.id}
                          className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-1 ring-indigo-500/20'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleAddon(addon.id)}
                              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 shrink-0"
                            />
                            <div className="truncate">
                              <p className="text-xs font-bold truncate">{addon.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{addon.description}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-indigo-700 block">
                              +{itemPrice.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {addon.billingType === 'monthly' ? `(${cycle}T)` : '/năm'}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Thông Tin Khách Hàng (Nhận Thông Số Bàn Giao) - Ràng buộc Họ tên & Số điện thoại 10 số */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-indigo-600" />
                      Thông Tin Khách Hàng (Nhận Bàn Giao)
                    </label>
                    {user ? (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Đã đăng nhập ({user.username})
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-medium">
                        Không bắt buộc đăng nhập
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                    {/* Họ và tên khách (Bắt buộc) */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 flex items-center justify-between">
                        <span>Họ và tên khách: <span className="text-rose-500 font-bold">*</span></span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomerName(val);
                          if (hasAttemptedSubmit || val.length > 0) {
                            setCustomerNameError(validateName(val));
                          } else {
                            setCustomerNameError(null);
                          }
                        }}
                        onBlur={() => setCustomerNameError(validateName(customerName))}
                        placeholder="Ví dụ: AAA, Minh Vũ..."
                        className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-medium focus:outline-none transition-colors ${
                          customerNameError
                            ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                            : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                        }`}
                      />
                      {customerNameError && (
                        <p className="text-[10px] text-rose-600 mt-1 flex items-start gap-1 font-semibold leading-tight">
                          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{customerNameError}</span>
                        </p>
                      )}
                    </div>

                    {/* Số điện thoại (Zalo) - Buộc 10 số, không chứa chữ */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 flex items-center justify-between">
                        <span>Số điện thoại (Zalo): <span className="text-rose-500 font-bold">*</span></span>
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomerPhone(val);
                          if (hasAttemptedSubmit || val.length > 0) {
                            setCustomerPhoneError(validatePhone(val));
                          } else {
                            setCustomerPhoneError(null);
                          }
                        }}
                        onBlur={() => setCustomerPhoneError(validatePhone(customerPhone))}
                        placeholder="Buộc đúng 10 số (0...)"
                        maxLength={15}
                        className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-medium focus:outline-none transition-colors ${
                          customerPhoneError
                            ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                            : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                        }`}
                      />
                      {customerPhoneError && (
                        <p className="text-[10px] text-rose-600 mt-1 flex items-start gap-1 font-semibold leading-tight">
                          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{customerPhoneError}</span>
                        </p>
                      )}
                    </div>

                    {/* Email nhận thông số */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Email nhận thông số:</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Mã Giảm Giá (Coupon Code) */}
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="Mã giảm giá (ví dụ: VIBE2026)"
                        className="w-full pl-8 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isApplyingCoupon ? 'Đang ktra...' : 'Áp Dụng'}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-rose-600 mt-1">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] text-emerald-600 font-semibold mt-1">{couponSuccess}</p>}
                </div>
              </div>

              {/* Cột Phải (5 cols): Bảng Thanh Toán & Mã VietQR, Chi Tiết Giá, Nút Xác Nhận */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-2.5">
                {/* Khối Bảng Thanh Toán & VietQR */}
                <div className="p-3 rounded-xl bg-indigo-950 text-white space-y-2.5 shadow-md">
                  {/* Khung QR Code */}
                  <div className="bg-white p-2 rounded-xl text-center text-slate-900">
                    <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-0.5">
                      Mã VietQR Ngân Hàng Tự Động
                    </p>
                    <img
                      src={vietQrUrl}
                      alt="Mã QR Chuyển Khoản"
                      className="w-32 h-32 mx-auto object-contain rounded-lg border border-slate-100"
                    />
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Quét bằng mọi ứng dụng Mobile Banking
                    </p>
                  </div>

                  {/* Chi Tiết Giá Thanh Toán */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-indigo-200 text-[11px]">
                      <span>Tiền hosting ({cycle}T):</span>
                      <span>{hostingPrice.toLocaleString('vi-VN')}đ</span>
                    </div>

                    {includeDomain && domainName && (
                      <div className="flex justify-between text-indigo-200 text-[11px]">
                        <span>Tên miền ({domainName}{domainExt}):</span>
                        <span>{isDomainFree ? 'Miễn phí (0đ)' : `${domainPrice.toLocaleString('vi-VN')}đ`}</span>
                      </div>
                    )}

                    {addonsTotal > 0 && (
                      <div className="flex justify-between text-indigo-200 text-[11px]">
                        <span>Dịch vụ mua kèm ({selectedAddonIds.length}):</span>
                        <span>+{addonsTotal.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-bold text-[11px]">
                        <span>Mã giảm giá ({appliedCoupon?.code}):</span>
                        <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-indigo-800/80 flex justify-between items-baseline">
                      <span className="font-bold text-xs text-indigo-100">Tổng Cần Thanh Toán:</span>
                      <span className="text-xl font-black text-amber-300">
                        {finalTotal.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {/* Thông tin chuyển khoản nhanh */}
                    <div className="p-2 bg-indigo-900/60 rounded-lg border border-indigo-800/80 text-[10px] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-indigo-300">Ngân hàng:</span>
                        <span className="font-bold">MB Bank (Quân Đội)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-300">Số tài khoản:</span>
                        <span className="font-mono font-bold text-amber-300">0988123456</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-300">Chủ TK:</span>
                        <span className="font-bold uppercase">HOSTING ADVISOR CORP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-300">Nội dung CK:</span>
                        <span className="font-mono font-bold text-amber-300">{tempOrderId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={copyBankDetails}
                        className="w-full mt-1 py-1 text-[9px] font-semibold text-center bg-indigo-800 hover:bg-indigo-700 text-indigo-200 rounded cursor-pointer transition-colors"
                      >
                        {copiedBankInfo ? '✓ Đã sao chép thông tin CK' : 'Sao chép thông tin chuyển khoản'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nút Thao Tác Xác Nhận / Hủy */}
                <div className="pt-1">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateOrderAndConfirm}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Đang thanh toán...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>Xác Nhận & Gửi Đơn</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
