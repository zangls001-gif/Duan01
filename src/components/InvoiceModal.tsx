import React from 'react';
import { Order } from '../types';
import { X, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        {/* Nút X đóng trực tiếp ở đầu góc của bảng hóa đơn */}
        <button
          onClick={onClose}
          aria-label="Đóng hóa đơn"
          className="absolute top-2.5 right-2.5 z-40 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-xs print:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Thanh tiêu đề nhỏ gọn phía trên (Ẩn khi in ấn) */}
        <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden pr-12">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-xs sm:text-sm">Hóa Đơn Dịch Vụ Điện Tử (E-Invoice)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / Lưu PDF</span>
            </button>
          </div>
        </div>

        {/* Khung nội dung hóa đơn nhỏ gọn, vừa vặn khung màn hình */}
        <div className="p-4 sm:p-6 text-slate-800 printable-invoice relative overflow-y-auto flex-1">
          {/* Con dấu điện tử (Stamp Watermark) nhỏ gọn */}
          <div className="absolute right-12 top-14 pointer-events-none select-none opacity-85">
            {isPaid ? (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 sm:border-3 border-rose-600 text-rose-600 flex flex-col items-center justify-center -rotate-12 uppercase tracking-wider font-black shadow-xs">
                <span className="text-[8px] tracking-normal font-semibold">ĐÃ THANH TOÁN</span>
                <span className="text-base sm:text-lg font-extrabold my-0.5">PAID</span>
                <span className="text-[7px] font-semibold text-rose-500">HOSTING ADVISOR</span>
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 sm:border-3 border-amber-500 text-amber-600 flex flex-col items-center justify-center -rotate-12 uppercase tracking-wider font-black shadow-xs">
                <span className="text-[8px] tracking-normal font-semibold">CHỜ THANH TOÁN</span>
                <span className="text-sm sm:text-base font-extrabold my-0.5">UNPAID</span>
                <span className="text-[7px] font-semibold text-amber-500">PENDING QR</span>
              </div>
            )}
          </div>

          {/* Đầu trang hóa đơn (Invoice Header) */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-3 mb-3 border-b border-slate-300 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-black text-lg text-slate-900 tracking-tight">HostingAdvisor</span>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1 py-0.2 rounded">CORP</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">CÔNG TY CỔ PHẦN CÔNG NGHỆ HOSTING ADVISOR</p>
              <p className="text-[10px] text-slate-500 leading-tight">Mã số thuế: <strong>0109999999</strong></p>
              <p className="text-[10px] text-slate-500 leading-tight">Hotline: 1900 6868 • Email: billing@hostingadvisor.vn</p>
              <p className="text-[10px] text-slate-500 leading-tight">Địa chỉ: Tòa nhà TechTower, Cầu Giấy, Hà Nội</p>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto">
              <h2 className="text-base sm:text-lg font-black text-indigo-700 uppercase tracking-tight">
                Hóa Đơn Dịch Vụ
              </h2>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">ELECTRONIC INVOICE</p>
              <div className="mt-1 text-[10px] text-slate-600 space-y-0.5">
                <p>Số HĐ: <span className="font-mono font-bold text-slate-900">{invoiceId}</span></p>
                <p>Mã đơn: <span className="font-mono text-slate-700">{order.id}</span></p>
                <p>Ngày lập: <span className="font-semibold text-slate-900">{invoiceDate}</span></p>
              </div>
            </div>
          </div>

          {/* Thông tin khách hàng & Phương thức thanh toán */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 bg-slate-50 rounded-xl mb-3 text-[11px] border border-slate-100">
            <div>
              <span className="text-slate-400 uppercase text-[9px] font-bold block mb-0.5">Thông tin khách hàng:</span>
              <p className="font-bold text-slate-900 text-xs">{order.customerName}</p>
              <p className="text-slate-600 text-[10px]">Điện thoại: {order.phone || 'Chưa cập nhật'}</p>
              <p className="text-slate-600 text-[10px]">Email: {order.email || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[9px] font-bold block mb-0.5">Phương thức thanh toán:</span>
              <p className="font-semibold text-slate-900">Chuyển khoản Ngân hàng (VietQR)</p>
              <p className="text-slate-600 text-[10px] mt-0.5">
                Trạng thái:{' '}
                <span className={`font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isPaid ? 'Đã thanh toán đủ' : 'Chờ kiểm tra đối soát'}
                </span>
              </p>
            </div>
          </div>

          {/* Bảng chi tiết dịch vụ */}
          <table className="w-full text-left text-[11px] mb-3">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[9px]">
                <th className="py-1.5">Nội Dung Dịch Vụ</th>
                <th className="py-1.5 text-center">Chu Kỳ</th>
                <th className="py-1.5 text-right">Đơn Giá</th>
                <th className="py-1.5 text-right">Thành Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Gói Hosting */}
              <tr>
                <td className="py-2">
                  <p className="font-bold text-slate-900">Gói Hosting {order.planName}</p>
                  <p className="text-[10px] text-slate-400">Ổ cứng SSD/NVMe tốc độ cao, chứng chỉ SSL miễn phí</p>
                </td>
                <td className="py-2 text-center text-[10px]">{order.billingCycleMonths} tháng</td>
                <td className="py-2 text-right text-[10px]">{order.planPrice.toLocaleString('vi-VN')}đ/tháng</td>
                <td className="py-2 text-right font-bold text-slate-900">
                  {(order.planPrice * order.billingCycleMonths).toLocaleString('vi-VN')}đ
                </td>
              </tr>

              {/* Tên Miền */}
              {order.domainName && (
                <tr>
                  <td className="py-2">
                    <p className="font-bold text-slate-900">Tên Miền: {order.domainName}</p>
                    <p className="text-[10px] text-slate-400">Đăng ký mới 1 năm, toàn quyền quản trị DNS</p>
                  </td>
                  <td className="py-2 text-center text-[10px]">1 năm</td>
                  <td className="py-2 text-right text-[10px]">
                    {order.isDomainFree ? '0đ (Tặng kèm)' : `${order.domainPrice.toLocaleString('vi-VN')}đ`}
                  </td>
                  <td className="py-2 text-right font-bold text-slate-900">
                    {order.isDomainFree ? '0đ' : `${order.domainPrice.toLocaleString('vi-VN')}đ`}
                  </td>
                </tr>
              )}

              {/* Dịch vụ mua kèm Add-ons */}
              {order.addons &&
                order.addons.map((ad, idx) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <p className="font-bold text-slate-900">{ad.name}</p>
                      <p className="text-[10px] text-slate-400">Dịch vụ gia tăng bảo vệ & sao lưu</p>
                    </td>
                    <td className="py-2 text-center text-[10px]">{order.billingCycleMonths} tháng</td>
                    <td className="py-2 text-right text-[10px]">-</td>
                    <td className="py-2 text-right font-bold text-slate-900">{ad.price.toLocaleString('vi-VN')}đ</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Tổng tiền thanh toán */}
          <div className="w-full sm:w-64 ml-auto space-y-1 text-[11px] pt-2 border-t border-slate-200">
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

            <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
              <span>Tổng Cộng:</span>
              <span className="text-indigo-600">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Thông số kỹ thuật (Nếu đơn đã kích hoạt) */}
          {order.serviceDetails && (
            <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[10px] space-y-1">
              <p className="font-bold text-emerald-900 flex items-center gap-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Thông Số Kỹ Thuật Đã Kích Hoạt
              </p>
              <div className="grid grid-cols-2 gap-2 text-slate-700 pt-0.5">
                <p>IP máy chủ: <strong className="font-mono text-slate-900">{order.serviceDetails.hostingIp}</strong></p>
                <p>Hạn sử dụng: <strong>{new Date(order.serviceDetails.expireDate).toLocaleDateString('vi-VN')}</strong></p>
                <p className="col-span-2">
                  NameServers: <span className="font-mono text-indigo-700 font-semibold">{order.serviceDetails.nameServers.join(' • ')}</span>
                </p>
              </div>
            </div>
          )}

          {/* Chữ ký điện tử ở chân trang */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Người Mua Hàng</p>
              <p className="text-[9px] text-slate-400 mt-4">(Ký và ghi rõ họ tên)</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-700">Đại Diện HostingAdvisor Corp</p>
              <p className="text-indigo-600 font-bold text-xs mt-3">Ký Số Điện Tử (e-Sign Verified)</p>
            </div>
          </div>
        </div>

        {/* Thanh công cụ chân modal (Ẩn khi in ấn) */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs print:hidden shrink-0">
          <span className="text-[11px] text-slate-500">
            Hóa đơn điện tử hợp lệ theo quy chuẩn nghị định về thương mại điện tử
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Hóa Đơn / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
