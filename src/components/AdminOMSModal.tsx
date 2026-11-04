import React, { useState, useEffect } from 'react';
import { Order, User, SupabaseStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../data/supabaseClient';
import {
  X,
  ShieldCheck,
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Download,
  Trash2,
  UserCheck,
  RefreshCw,
  AlertCircle,
  FileText,
  Send,
  Database,
  Link2,
  Key,
  ExternalLink,
  Check
} from 'lucide-react';

interface AdminOMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const AdminOMSModal: React.FC<AdminOMSModalProps> = ({
  isOpen,
  onClose,
  onViewInvoice
}) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'supabase'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Supabase State
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus | null>(null);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>('');
  const [isCheckingSupabase, setIsCheckingSupabase] = useState<boolean>(false);
  const [supabaseMsg, setSupabaseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);

  // AI Telesale Script State
  const [activeTelesaleOrderId, setActiveTelesaleOrderId] = useState<string | null>(null);
  const [telesaleScript, setTelesaleScript] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);

  // Supabase Table Viewer State
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableRows, setTableRows] = useState<any[] | null>(null);
  const [isLoadingTableRows, setIsLoadingTableRows] = useState<boolean>(false);
  const [tableError, setTableError] = useState<string | null>(null);

  // Order Details Modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      let fetched: Order[] | null = null;
      try {
        const res = await fetch('/api/orders', {
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

      // Fallback to Supabase orders table directly
      if (!fetched) {
        try {
          const { data: supaOrders, error: sErr } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (!sErr && Array.isArray(supaOrders) && supaOrders.length > 0) {
            fetched = supaOrders.map((o) => ({
              id: o.id,
              customerId: o.customer_id || 'guest',
              customerName: o.customer_name || 'Khách hàng',
              phone: o.phone || '',
              email: o.email || '',
              planChosen: o.plan_chosen || '',
              planName: o.plan_name || 'Gói dịch vụ',
              planPrice: 0,
              domainName: o.domain_name || '',
              domainExtension: '',
              domainPrice: 0,
              isDomainFree: false,
              billingCycleMonths: o.billing_cycle_months || 12,
              addons: [],
              couponApplied: null,
              discountAmount: 0,
              subTotal: o.total_amount || 0,
              totalAmount: o.total_amount || 0,
              qrUrl: '',
              paymentMethod: 'vietqr',
              paymentStatus: o.payment_status || 'paid_processing',
              status: o.status || 'paid_processing',
              assignedTo: null,
              assignedToName: 'Chưa phân công',
              serviceDetails: null,
              notes: o.notes || null,
              timeline: Array.isArray(o.timeline) ? o.timeline : [],
              createdAt: o.created_at || new Date().toISOString(),
              updatedAt: o.updated_at || new Date().toISOString()
            }));
          }
        } catch {}
      }

      // Final fallback to localStorage
      if (!fetched) {
        try {
          const stored = localStorage.getItem('ha_orders');
          fetched = stored ? JSON.parse(stored) : [];
        } catch {
          fetched = [];
        }
      }

      setOrders(fetched || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupabaseStatus = async () => {
    setIsCheckingSupabase(true);
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setSupabaseStatus(data);
    } catch (err: any) {
      console.warn('Error fetching Supabase status:', err);
    } finally {
      setIsCheckingSupabase(false);
    }
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSupabaseMsg(null);
    setIsCheckingSupabase(true);
    try {
      const res = await fetch('/api/supabase/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          url: 'https://ktovjbetgforctvxfxny.supabase.co',
          anonKey: supabaseKeyInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSupabaseStatus(data.test);
        if (data.test?.connected) {
          setSupabaseMsg({ type: 'success', text: 'Kết nối thành công tới Supabase REST API!' });
        } else {
          setSupabaseMsg({
            type: 'error',
            text: data.test?.message || 'Không thể xác thực với API key vừa nhập.'
          });
        }
      } else {
        setSupabaseMsg({ type: 'error', text: data.error || 'Lỗi lưu cấu hình' });
      }
    } catch (err: any) {
      setSupabaseMsg({ type: 'error', text: 'Lỗi gửi yêu cầu: ' + err.message });
    } finally {
      setIsCheckingSupabase(false);
    }
  };

  const handleSyncSupabase = async () => {
    if (!token) return;
    setIsSyncingSupabase(true);
    setSupabaseMsg(null);
    try {
      const res = await fetch('/api/supabase/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSupabaseMsg({
          type: 'success',
          text: `Đồng bộ hoàn tất: ${data.syncedPlans} gói dịch vụ, ${data.syncedOrders} đơn hàng lên Supabase.`
        });
        fetchSupabaseStatus();
      } else {
        setSupabaseMsg({ type: 'error', text: data.error || 'Lỗi đồng bộ Supabase' });
      }
    } catch (err: any) {
      setSupabaseMsg({ type: 'error', text: 'Lỗi đồng bộ: ' + err.message });
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const fetchTableData = async (tableName: string) => {
    setSelectedTable(tableName);
    setIsLoadingTableRows(true);
    setTableError(null);
    setTableRows(null);
    try {
      const res = await fetch(`/api/supabase/table/${tableName}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Không thể truy vấn bảng ${tableName}`);
      }
      setTableRows(data.data || []);
    } catch (err: any) {
      setTableError(err.message || 'Lỗi kết nối Supabase');
    } finally {
      setIsLoadingTableRows(false);
    }
  };

  useEffect(() => {
    if (isOpen && token && (user?.role === 'admin' || user?.role === 'staff')) {
      fetchOrders();
      fetchSupabaseStatus();
    }
  }, [isOpen, token, user]);

  if (!isOpen || (user?.role !== 'admin' && user?.role !== 'staff')) return null;

  // KPIs
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const revenueReceived = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending_payment' || o.status === 'paid_processing');
  const revenuePending = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const needsReviewCount = orders.filter((o) => o.status === 'paid_processing').length;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm) ||
      (o.domainName && o.domainName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Action: Approve payment & activate service
  const handleApprovePayment = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        // Update local state
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (viewingOrder?.id === orderId) {
          setViewingOrder(data.order);
        }
      }
    } catch (err: any) {
      alert('Lỗi duyệt tiền: ' + err.message);
    }
  };

  // Action: Generate AI Telesale Script
  const handleGenerateTelesale = async (orderId: string) => {
    setActiveTelesaleOrderId(orderId);
    setTelesaleScript(null);
    setIsGeneratingScript(true);

    try {
      const res = await fetch('/api/advice/sales-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTelesaleScript(data.script);
      } else {
        setTelesaleScript('Không thể tạo kịch bản: ' + (data.error || 'Lỗi'));
      }
    } catch (err: any) {
      setTelesaleScript('Lỗi kết nối AI: ' + err.message);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Action: Delete Order (Admin only)
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn ${orderId}? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (viewingOrder?.id === orderId) setViewingOrder(null);
      }
    } catch (err: any) {
      alert('Lỗi xóa đơn: ' + err.message);
    }
  };

  // Action: Export CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'Mã Đơn',
      'Khách Hàng',
      'SĐT',
      'Email',
      'Gói Hosting',
      'Chu Kỳ (Tháng)',
      'Tên Miền',
      'Add-ons',
      'Mã Giảm Giá',
      'Tiền Giảm',
      'Tổng Tiền (VNĐ)',
      'Trạng Thái',
      'Người Phụ Trách',
      'Ngày Tạo'
    ];

    const rows = orders.map((o) => [
      o.id,
      `"${o.customerName}"`,
      `"${o.phone}"`,
      `"${o.email}"`,
      `"${o.planName}"`,
      o.billingCycleMonths,
      `"${o.domainName || 'Không'}"`,
      `"${o.addons.map((a) => a.name).join('; ')}"`,
      `"${o.couponApplied || ''}"`,
      o.discountAmount,
      o.totalAmount,
      o.status,
      `"${o.assignedToName}"`,
      `"${new Date(o.createdAt).toLocaleString('vi-VN')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Don_Hang_HostingAdvisor_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-4 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">Cổng Quản Trị Đơn Hàng (OMS)</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Nhân sự: <strong>{user?.fullName}</strong> • Duyệt tiền VietQR & Trợ lý Telesale AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'orders' && (
              <button
                onClick={handleExportCSV}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Xuất CSV</span>
              </button>
            )}
            <button
              onClick={() => {
                fetchOrders();
                fetchSupabaseStatus();
              }}
              disabled={isLoading || isCheckingSupabase}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading || isCheckingSupabase ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between text-xs font-semibold shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-amber-400 text-amber-300 bg-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Quản Lý Đơn Hàng & Doanh Thu</span>
              <span className="px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded-full text-[10px]">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('supabase')}
              className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'supabase'
                  ? 'border-indigo-400 text-indigo-300 bg-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Kết Nối Supabase Cloud</span>
              {supabaseStatus?.connected ? (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px]">
                  Online
                </span>
              ) : (
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px]">
                  Cần Key
                </span>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>REST: https://ktovjbetgforctvxfxny.supabase.co/rest/v1/</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'orders' ? (
            <>

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Doanh Thu Thực Nhận
              </span>
              <span className="text-2xl font-black text-emerald-700">
                {revenueReceived.toLocaleString('vi-VN')}đ
              </span>
              <p className="text-[11px] text-emerald-600 mt-1">
                Từ {completedOrders.length} đơn đã kích hoạt
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Doanh Thu Chờ Duyệt
              </span>
              <span className="text-2xl font-black text-amber-700">
                {revenuePending.toLocaleString('vi-VN')}đ
              </span>
              <p className="text-[11px] text-amber-600 mt-1">
                Từ {pendingOrders.length} đơn đang chờ
              </p>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1">
                Đơn Cần Duyệt Tiền
              </span>
              <span className="text-2xl font-black text-blue-700">{needsReviewCount}</span>
              <p className="text-[11px] text-blue-600 mt-1">Khách đã bấm "Đã chuyển khoản"</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Tổng Số Đơn Hàng
              </span>
              <span className="text-2xl font-black text-slate-800">{orders.length}</span>
              <p className="text-[11px] text-slate-500 mt-1">Toàn bộ trên hệ thống</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã đơn, tên, SĐT, tên miền..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({orders.length})
              </button>
              <button
                onClick={() => setStatusFilter('paid_processing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  statusFilter === 'paid_processing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Chờ duyệt tiền ({needsReviewCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Đã hoàn tất ({completedOrders.length})
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Mã Đơn & Thời Gian</th>
                    <th className="py-3 px-4">Khách Hàng</th>
                    <th className="py-3 px-4">Dịch Vụ & Chu Kỳ</th>
                    <th className="py-3 px-4 text-right">Tổng Tiền</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    <th className="py-3 px-4 text-center">Thao Tác Quản Trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Không có đơn hàng nào khớp với tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isCompleted = order.status === 'completed';
                      const isPaidProcessing = order.status === 'paid_processing';

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-slate-900 block">{order.id}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800 block">{order.customerName}</span>
                            <span className="text-[11px] text-slate-500 block">{order.phone}</span>
                            {order.email && <span className="text-[10px] text-slate-400 block">{order.email}</span>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 block">
                              Hosting {order.planName} ({order.billingCycleMonths}T)
                            </span>
                            {order.domainName && (
                              <span className="text-[11px] text-indigo-600 font-mono block">
                                {order.domainName}
                              </span>
                            )}
                            {order.addons && order.addons.length > 0 && (
                              <span className="text-[10px] text-slate-400 block">
                                +{order.addons.length} Add-on ({order.addons.map((a) => a.name.split(' ')[0]).join(', ')})
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-black text-slate-900 text-sm block">
                              {order.totalAmount.toLocaleString('vi-VN')}đ
                            </span>
                            {order.discountAmount > 0 && (
                              <span className="text-[10px] text-emerald-600 block">
                                -{order.discountAmount.toLocaleString('vi-VN')}đ ({order.couponApplied})
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isCompleted ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Đã Kích Hoạt
                              </span>
                            ) : isPaidProcessing ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                                Chờ Duyệt Tiền
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Chờ Quét QR
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* Confirm Payment button */}
                              {!isCompleted && (
                                <button
                                  onClick={() => handleApprovePayment(order.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  title="Xác nhận nhận tiền & Cấp IP hosting tự động"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Duyệt Tiền</span>
                                </button>
                              )}

                              {/* AI Telesale Script button */}
                              <button
                                onClick={() => handleGenerateTelesale(order.id)}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-indigo-200"
                                title="AI soạn kịch bản gọi điện chốt đơn 3 bước"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                <span>AI Telesale</span>
                              </button>

                              {/* Invoice */}
                              <button
                                onClick={() => onViewInvoice(order)}
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer"
                                title="Xem hóa đơn"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete (Admin only) */}
                              {user?.role === 'admin' && (
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                                  title="Xóa đơn hàng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Telesale Script Popup/Section */}
          {activeTelesaleOrderId && (
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl shadow-xl relative animate-in fade-in">
              <button
                onClick={() => setActiveTelesaleOrderId(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-amber-300">
                  AI Trợ Lý Telesale: Kịch Bản Gọi Điện Cho Đơn {activeTelesaleOrderId}
                </h4>
              </div>

              {isGeneratingScript ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-indigo-200">
                  <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                  <span>Gemini đang soạn kịch bản cá nhân hóa theo thông tin đơn hàng...</span>
                </div>
              ) : (
                <div className="p-4 bg-slate-800/80 rounded-xl border border-indigo-700/60 text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {telesaleScript}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
            /* Supabase Cloud Connection Panel */
            <div className="space-y-6 animate-in fade-in">
              {/* Status Banner */}
              <div
                className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  supabaseStatus?.connected
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      supabaseStatus?.connected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base">Hạ Tầng Supabase REST API</h4>
                      {supabaseStatus?.connected ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đang Hoạt Động (200 OK)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Cần Khóa Xác Thực (401 Missing Key)
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-slate-600 mt-1 break-all">
                      Endpoint: <strong>https://ktovjbetgforctvxfxny.supabase.co/rest/v1/</strong>
                    </p>
                    <p className="text-xs mt-1 text-slate-700">
                      {supabaseStatus?.message || 'Đang kiểm tra trạng thái máy chủ...'}
                    </p>
                    {supabaseStatus?.hint && (
                      <p className="text-[11px] text-amber-800 font-medium mt-1">
                        Gợi ý: {supabaseStatus.hint}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={fetchSupabaseStatus}
                    disabled={isCheckingSupabase}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSupabase ? 'animate-spin' : ''}`} />
                    <span>Kiểm Tra Lại (Ping)</span>
                  </button>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Bảng Điều Khiển Supabase</span>
                  </a>
                </div>
              </div>

              {/* Alert message if action performed */}
              {supabaseMsg && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
                    supabaseMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {supabaseMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-medium">{supabaseMsg.text}</span>
                </div>
              )}

              {/* API Key Configuration Form */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Cấu Hình Xác Thực Supabase (SUPABASE_ANON_KEY / APIKEY)
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Theo chuẩn PostgREST của Supabase, mỗi yêu cầu tới <code>https://ktovjbetgforctvxfxny.supabase.co/rest/v1/</code> cần kèm header <code>apikey</code> và <code>Authorization: Bearer &lt;token&gt;</code>. Khi bạn nhập key dưới đây, server sẽ lưu vào <code>db.json</code> (hoặc <code>.env</code>) và tự động gắn header bảo mật ở phía server.
                </p>

                <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Supabase Anon Key (Public) hoặc Service Role Key:
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={supabaseKeyInput}
                        onChange={(e) => setSupabaseKeyInput(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b3ZqYmV0Z2ZvcmN0dnhmeG55Iiwicm9sZSI6ImFub24i..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Tìm trong Supabase Dashboard → <strong>Project Settings → API → Project API Keys</strong> (anon public hoặc service_role).
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={isCheckingSupabase}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isCheckingSupabase ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Đang kiểm tra kết nối...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Lưu & Kiểm Tra Kết Nối Ngay</span>
                        </>
                      )}
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={handleSyncSupabase}
                        disabled={isSyncingSupabase}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                        <span>Đồng Bộ Dữ Liệu Lên Supabase</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Discovered Tables & Schemas */}
              {supabaseStatus?.tables && supabaseStatus.tables.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-600" />
                        <span>Các Bảng Dữ Liệu Đang Online Trên Supabase:</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Bấm vào bảng bất kỳ để truy vấn và xem dữ liệu trực tiếp từ Supabase REST API
                      </p>
                    </div>
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                      {supabaseStatus.tables.length} bảng khả dụng
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {supabaseStatus.tables.map((tbl) => {
                      const isSelected = selectedTable === tbl;
                      return (
                        <button
                          key={tbl}
                          type="button"
                          onClick={() => fetchTableData(tbl)}
                          disabled={isLoadingTableRows}
                          className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-500/30'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Database className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`} />
                          <span>{tbl}</span>
                          {isSelected && isLoadingTableRows && (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Table Viewer Panel */}
                  {selectedTable && (
                    <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                            Dữ liệu bảng: <code className="font-mono text-indigo-600 normal-case bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">/{selectedTable}</code>
                          </span>
                          {tableRows && (
                            <span className="text-[11px] font-semibold text-slate-500">
                              ({tableRows.length} bản ghi)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fetchTableData(selectedTable)}
                            disabled={isLoadingTableRows}
                            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTableRows ? 'animate-spin' : ''}`} />
                            <span>Tải lại</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSelectedTable(null); setTableRows(null); }}
                            className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                            title="Đóng xem bảng"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {tableError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{tableError}</span>
                        </div>
                      )}

                      {isLoadingTableRows && !tableRows && (
                        <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span>Đang truy vấn bảng từ Supabase REST API...</span>
                        </div>
                      )}

                      {tableRows && tableRows.length === 0 && (
                        <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          Bảng <strong>{selectedTable}</strong> hiện chưa có bản ghi nào.
                        </div>
                      )}

                      {tableRows && tableRows.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-72">
                          <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 border-b border-slate-200">
                              <tr>
                                {Object.keys(tableRows[0]).map((col) => (
                                  <th key={col} className="px-3 py-2.5 font-mono text-[11px] whitespace-nowrap">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                              {tableRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                  {Object.keys(tableRows[0]).map((col) => {
                                    const val = row[col];
                                    let displayVal = String(val ?? '');
                                    const isImg = typeof val === 'string' && (val.startsWith('http') && (val.includes('.jpg') || val.includes('.png') || val.includes('.jpeg') || val.includes('.webp')));

                                    return (
                                      <td key={col} className="px-3 py-2 whitespace-nowrap max-w-xs truncate text-slate-800">
                                        {isImg ? (
                                          <div className="flex items-center gap-2">
                                            <img src={val} alt="thumb" className="w-6 h-6 object-cover rounded border border-slate-200 shrink-0" />
                                            <a href={val} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-[10px] truncate max-w-[140px] inline-block">
                                              Xem ảnh
                                            </a>
                                          </div>
                                        ) : typeof val === 'object' && val !== null ? (
                                          JSON.stringify(val)
                                        ) : (
                                          displayVal || <span className="text-slate-400 italic">null</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Developer Integration Code Box */}
              <div className="bg-slate-950 text-slate-300 rounded-2xl p-6 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 font-sans">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-indigo-400" />
                    Mẫu Gọi REST API Chuẩn PostgREST:
                  </span>
                  <span className="text-[11px]">curl / fetch</span>
                </div>
                <pre className="overflow-x-auto text-emerald-400 leading-relaxed text-[11px] p-2 bg-slate-900 rounded-lg">
{`# 1. Tra cứu danh mục gói hosting:
curl -X GET "https://ktovjbetgforctvxfxny.supabase.co/rest/v1/plans" \\
  -H "apikey: <SUPABASE_ANON_KEY>" \\
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>"

# 2. Xem toàn bộ đơn hàng (orders):
curl -X GET "https://ktovjbetgforctvxfxny.supabase.co/rest/v1/orders" \\
  -H "apikey: <SUPABASE_ANON_KEY>" \\
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>"`}
                </pre>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Hệ thống backend Node.js HostingAdvisor đã tích hợp thư viện chính thức <code>@supabase/supabase-js</code> và tự động đồng bộ đơn hàng khi có giao dịch mới.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
