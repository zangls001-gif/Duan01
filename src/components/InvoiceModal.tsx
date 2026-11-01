import React from 'react';
import { Order } from '../types';
import { X, Printer, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const isPaid = order.paymentStatus === 'paid' || order.status === 'completed';
  const invoiceId = order.id.replace('ORD', 'INV');
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        {/* Modal Top Actions (Hidden on print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm">Hóa Đơn Dịch Vụ Điện Tử (E-Invoice)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Hóa Đơn / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 sm:p-10 text-slate-800 printable-invoice relative">
          {/* Stamp Watermark (Con dấu điện tử tròn) */}
          <div className="absolute right-10 top-36 pointer-events-none select-none">
            {isPaid ? (
              <div className="w-32 h-32 rounded-full border-4 border-rose-600/80 text-rose-600 flex flex-col items-center justify-center -rotate-12 uppercase tracking-widest font-black shadow-xs">
                <span className="text-[10px] tracking-normal">ĐÃ THANH TOÁN</span>
                <span className="text-xl font-extrabold my-0.5">PAID</span>
                <span className="text-[9px] font-semibold text-rose-500">HOSTING ADVISOR</span>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-amber-500/80 text-amber-600 flex flex-col items-center justify-center -rotate-12 uppercase tracking-widest font-black shadow-xs">
                <span className="text-[10px] tracking-normal">CHỜ THANH TOÁN</span>
                <span className="text-lg font-extrabold my-0.5">UNPAID</span>
                <span className="text-[9px] font-semibold text-amber-500">PENDING QR</span>
              </div>
            )}
          </div>

          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-8 mb-8 border-b-2 border-slate-900 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-2xl text-slate-900 tracking-tight">HostingAdvisor</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">CORP</span>
              </div>
              <p className="text-xs text-slate-500">CÔNG TY CỔ PHẦN CÔNG NGHỆ HOSTING ADVISOR</p>
              <p className="text-xs text-slate-500">Mã số thuế: <strong>0109999999</strong></p>
              <p className="text-xs text-slate-500">Hotline: 1900 6868 • Email: billing@hostingadvisor.vn</p>
              <p className="text-xs text-slate-500">Địa chỉ: Tòa nhà TechTower, Cầu Giấy, Hà Nội</p>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto">
              <h2 className="text-xl sm:text-2xl font-black text-indigo-700 uppercase tracking-tight">
                Hóa Đơn Dịch Vụ
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-wider">ELECTRONIC INVOICE</p>
              <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                <p>Số HĐ: <span className="font-mono font-bold text-slate-900">{invoiceId}</span></p>
                <p>Mã đơn: <span className="font-mono text-slate-700">{order.id}</span></p>
                <p>Ngày lập: <span className="font-semibold text-slate-900">{invoiceDate}</span></p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl mb-8 text-xs border border-slate-100">
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Thông tin khách hàng:</span>
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              <p className="text-slate-600 mt-0.5">Điện thoại: {order.phone || 'Chưa cập nhật'}</p>
              <p className="text-slate-600">Email: {order.email || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Phương thức thanh toán:</span>
              <p className="font-semibold text-slate-900">Chuyển khoản Ngân hàng (VietQR)</p>
              <p className="text-slate-600 mt-0.5">
                Trạng thái:{' '}
                <span className={`font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isPaid ? 'Đã thanh toán đủ' : 'Chờ kiểm tra đối soát'}
                </span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs mb-8">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-2.5">Nội Dung Dịch Vụ</th>
                <th className="py-2.5 text-center">Chu Kỳ</th>
                <th className="py-2.5 text-right">Đơn Giá</th>
                <th className="py-2.5 text-right">Thành Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Hosting */}
              <tr>
                <td className="py-3">
                  <p className="font-bold text-slate-900">Gói Hosting {order.planName}</p>
                  <p className="text-[11px] text-slate-500">Ổ cứng SSD/NVMe tốc độ cao, chứng chỉ SSL miễn phí</p>
                </td>
                <td className="py-3 text-center">{order.billingCycleMonths} tháng</td>
                <td className="py-3 text-right">{order.planPrice.toLocaleString('vi-VN')}đ/tháng</td>
                <td className="py-3 text-right font-semibold">
                  {(order.planPrice * order.billingCycleMonths).toLocaleString('vi-VN')}đ
                </td>
              </tr>

              {/* Domain */}
              {order.domainName && (
                <tr>
                  <td className="py-3">
                    <p className="font-bold text-slate-900">Tên Miền: {order.domainName}</p>
                    <p className="text-[11px] text-slate-500">Đăng ký mới 1 năm, toàn quyền quản trị DNS</p>
                  </td>
                  <td className="py-3 text-center">1 năm</td>
                  <td className="py-3 text-right">
                    {order.isDomainFree ? '0đ (Tặng kèm)' : `${order.domainPrice.toLocaleString('vi-VN')}đ`}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {order.isDomainFree ? '0đ' : `${order.domainPrice.toLocaleString('vi-VN')}đ`}
                  </td>
                </tr>
              )}

              {/* Addons */}
              {order.addons &&
                order.addons.map((ad, idx) => (
                  <tr key={idx}>
                    <td className="py-3">
                      <p className="font-bold text-slate-900">{ad.name}</p>
                      <p className="text-[11px] text-slate-500">Dịch vụ gia tăng bảo vệ & sao lưu</p>
                    </td>
                    <td className="py-3 text-center">{order.billingCycleMonths} tháng</td>
                    <td className="py-3 text-right">-</td>
                    <td className="py-3 text-right font-semibold">{ad.price.toLocaleString('vi-VN')}đ</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="w-full sm:w-72 ml-auto space-y-2 text-xs pt-4 border-t-2 border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính (Subtotal):</span>
              <span>{order.subTotal.toLocaleString('vi-VN')}đ</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Khuyến mãi ({order.couponApplied || 'Coupon'}):</span>
                <span>-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}

            <div className="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-slate-200">
              <span>Tổng Cộng:</span>
              <span className="text-indigo-600">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Service Details Provisioned (if completed) */}
          {order.serviceDetails && (
            <div className="mt-8 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
              <p className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Thông Số Kỹ Thuật Đã Kích Hoạt
              </p>
              <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                <p>Địa chỉ IP máy chủ: <strong className="font-mono text-slate-900">{order.serviceDetails.hostingIp}</strong></p>
                <p>Hạn sử dụng: <strong>{new Date(order.serviceDetails.expireDate).toLocaleDateString('vi-VN')}</strong></p>
                <p className="col-span-2">
                  NameServers: <span className="font-mono text-indigo-700 font-semibold">{order.serviceDetails.nameServers.join(' • ')}</span>
                </p>
              </div>
            </div>
          )}

          {/* Footer Signature */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Người Mua Hàng</p>
              <p className="text-[11px] text-slate-400 mt-8">(Ký và ghi rõ họ tên)</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-700">Đại Diện HostingAdvisor Corp</p>
              <p className="text-indigo-600 font-bold text-sm mt-6">Ký Số Điện Tử (e-Sign Verified)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
