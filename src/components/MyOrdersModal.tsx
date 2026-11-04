import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  FileText,
  Clock,
  CheckCircle2,
  RefreshCw,
  Server,
  Globe,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  onViewInvoice
}) => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyOrders = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      let fetched: Order[] | null = null;
      try {
        const res = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.ok) {
            fetched = data.orders || [];
          }
        }
      } catch {}

      if (!fetched) {
        // Fallback to locally stored orders for Vercel / offline
        try {
          const stored = localStorage.getItem('ha_orders');
          fetched = stored ? JSON.parse(stored) : [];
        } catch {
          fetched = [];
        }
      }

      setOrders(fetched || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchMyOrders();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã Kích Hoạt Dịch Vụ
          </span>
        );
      case 'paid_processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            Đang Kiểm Tra Chuyển Khoản
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Chờ Quét Mã VietQR
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base leading-tight">Đơn Hàng & Dịch Vụ Của Tôi</h3>
              <p className="text-[11px] text-slate-400">Tài khoản: {user?.fullName} ({user?.username})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMyOrders}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tải lại đơn hàng"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-700">Chưa có đơn hàng nào</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hãy tham khảo bảng giá dịch vụ hosting hoặc sử dụng AI Shopping Assistant để đặt mua gói phù hợp.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{order.id}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base mt-0.5">
                        Gói Hosting {order.planName} ({order.billingCycleMonths} tháng)
                      </h4>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    {order.domainName && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Tên miền: <strong>{order.domainName}</strong></span>
                      </div>
                    )}
                    <div>
                      <span>Thanh toán: </span>
                      <strong className="text-indigo-600 text-sm">{order.totalAmount.toLocaleString('vi-VN')}đ</strong>
                    </div>
                    <div>
                      <span>Phương thức: </span>
                      <strong className="capitalize">{order.paymentMethod}</strong>
                    </div>
                  </div>

                  {/* Provisioned Service details */}
                  {order.serviceDetails && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <Server className="w-3.5 h-3.5" />
                        Thông số kỹ thuật Hosting đã cấp:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
                        <p>IP máy chủ: <strong className="font-mono text-slate-900">{order.serviceDetails.hostingIp}</strong></p>
                        <p>Ngày hết hạn: <strong>{new Date(order.serviceDetails.expireDate).toLocaleDateString('vi-VN')}</strong></p>
                        <p className="sm:col-span-2">
                          DNS: <span className="font-mono text-indigo-700">{order.serviceDetails.nameServers.join(' • ')}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => onViewInvoice(order)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Xem Hóa Đơn Điện Tử (Invoice)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
