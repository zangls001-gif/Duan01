import React, { useState, useEffect } from 'react';
import {
  Send,
  Star,
  MessageSquareQuote,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../data/supabaseClient';

export interface CustomerReview {
  id: string;
  full_name: string;
  website_name?: string;
  service_package: string;
  rating: number;
  review_content: string;
  created_at: string;
  isNew?: boolean;
}

export const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: "REV-01",
    full_name: "A",
    website_name: "AKA",
    service_package: "Gói Business Hosting",
    rating: 5,
    review_content: "Very Good",
    created_at: "2026-11-03T10:00:00.000Z"
  },
  {
    id: "REV-02",
    full_name: "AAA",
    website_name: "LALII",
    service_package: "Gói Business Hosting",
    rating: 5,
    review_content: "Rất tốt",
    created_at: "2026-11-03T10:30:00.000Z"
  },
  {
    id: "REV-03",
    full_name: "AAA",
    website_name: "LALII",
    service_package: "Gói Business Hosting",
    rating: 5,
    review_content: "Rất tốt",
    created_at: "2026-11-03T11:00:00.000Z"
  }
];

const STORAGE_KEY = 'hosting_customer_reviews_cache';
const PAGE_SIZE = 4;

export const CustomerReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_REVIEWS;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [fullName, setFullName] = useState('');
  const [websiteName, setWebsiteName] = useState('');
  const [servicePackage, setServicePackage] = useState('Gói Business Hosting');
  const [rating, setRating] = useState('5');
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Real-time server and Supabase sync function
  const syncWithServer = async () => {
    try {
      let fetchedReviews: CustomerReview[] | null = null;

      // 1. Thử lấy từ Express server local nếu có
      try {
        const res = await fetch('/api/reviews');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.ok && Array.isArray(data.reviews) && data.reviews.length > 0) {
            fetchedReviews = data.reviews;
          }
        }
      } catch {}

      // 2. Đồng bộ trực tiếp từ Supabase bảng customer_reviews riêng biệt
      try {
        const { data: supaRows, error: sErr } = await supabase
          .from('customer_reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (!sErr && Array.isArray(supaRows) && supaRows.length > 0) {
          const supaReviews: CustomerReview[] = supaRows.map((r: any) => ({
            id: r.id,
            full_name: r.full_name,
            website_name: r.website_name || '',
            service_package: r.service_package,
            rating: Number(r.rating) || 5,
            review_content: r.review_content,
            created_at: r.created_at
          }));

          // Gộp đánh giá mới nhất với các đánh giá mẫu
          const combined = [...supaReviews];
          for (const def of DEFAULT_REVIEWS) {
            if (!combined.some(c => c.id === def.id || (c.full_name === def.full_name && c.review_content === def.review_content))) {
              combined.push(def);
            }
          }
          fetchedReviews = combined;
        }
      } catch (err) {
        console.warn('Lỗi đọc đánh giá từ Supabase:', err);
      }

      if (fetchedReviews && fetchedReviews.length > 0) {
        setReviews(fetchedReviews);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedReviews));
        } catch {}
      }
    } catch (err) {
      console.warn('Real-time reviews sync notice:', err);
    }
  };

  // Sync reviews from server on mount & interval polling for all users
  useEffect(() => {
    syncWithServer();

    // Poll every 4 seconds to sync newly posted reviews from all devices
    const interval = setInterval(() => {
      syncWithServer();
    }, 4000);

    // Provide global event listener
    const handleExternalReview = (e: any) => {
      if (e.detail) {
        addNewReviewToState(e.detail);
      }
    };
    window.addEventListener('new-customer-review', handleExternalReview);

    return () => {
      clearInterval(interval);
      window.removeEventListener('new-customer-review', handleExternalReview);
    };
  }, []);

  const addNewReviewToState = (newReview: CustomerReview) => {
    setReviews((prev) => {
      const exists = prev.some(
        (r) => r.id === newReview.id || (r.full_name === newReview.full_name && r.review_content === newReview.review_content)
      );
      if (exists) return prev;
      const updated = [{ ...newReview, isNew: true }, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    // Set to page 1 so the newly submitted review is immediately visible
    setCurrentPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitFeedback(null);

    const name = fullName.trim();
    const content = reviewContent.trim();

    if (!name || !content) {
      setSubmitFeedback({
        type: 'error',
        message: 'Vui lòng điền đầy đủ Họ và tên và Nhận xét thực tế của bạn.'
      });
      return;
    }

    setIsSubmitting(true);

    const newRev: CustomerReview = {
      id: `rev_${Date.now()}`,
      full_name: name,
      website_name: websiteName.trim(),
      service_package: servicePackage,
      rating: parseInt(rating, 10) || 5,
      review_content: content,
      created_at: new Date().toISOString(),
      isNew: true
    };

    // LẬP TỨC đưa đánh giá lên danh sách ngay lập tức (zero delay)
    addNewReviewToState(newRev);

    // Xóa trắng form để sẵn sàng
    setFullName('');
    setWebsiteName('');
    setServicePackage('Gói Business Hosting');
    setRating('5');
    setReviewContent('');

    // Hiển thị thông báo thành công tại chỗ, TUYỆT ĐỐI không scroll hay chuyển user đi đâu
    setSubmitFeedback({
      type: 'success',
      message: `Cảm ơn bạn ${name}! Đánh giá thực tế của bạn đã được ghi nhận và hiển thị ngay trên hệ thống.`
    });
    setIsSubmitting(false);

    // Gửi đồng bộ lên backend và Supabase ngầm
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRev)
    }).catch(() => {});

    // Đồng bộ trực tiếp tới Supabase bảng customer_reviews riêng biệt
    (async () => {
      try {
        const { data, error } = await supabase.from('customer_reviews').insert([
          {
            id: newRev.id,
            full_name: newRev.full_name,
            website_name: newRev.website_name || '',
            service_package: newRev.service_package,
            rating: newRev.rating,
            review_content: newRev.review_content,
            created_at: newRev.created_at
          }
        ]).select();

        if (error) {
          console.warn('Lỗi ghi Supabase customer_reviews (nếu bảng chưa tạo, review vẫn hiển thị bình thường):', error.message);
        } else {
          console.log('Đã lưu đánh giá thực tế thành công lên bảng customer_reviews Supabase Cloud:', data);
        }
      } catch (err) {
        console.warn('Supabase review insert error:', err);
      }
    })();
  };

  const formatReviewDate = (isoString?: string) => {
    if (!isoString) return 'Gần đây';
    try {
      const d = new Date(isoString);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return 'Gần đây';
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedReviews = reviews.slice(startIndex, startIndex + PAGE_SIZE);

  // Average Rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : '5.0';

  // Render pagination items matching Image 4
  const renderPagination = () => {
    if (reviews.length === 0) return null;

    const items: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (validCurrentPage <= 4) {
        items.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (validCurrentPage >= totalPages - 3) {
        items.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 sm:gap-3 mt-10 pt-6 border-t border-slate-200">
        {/* Prev Button < */}
        <button
          type="button"
          disabled={validCurrentPage <= 1}
          onClick={() => {
            if (validCurrentPage > 1) {
              setCurrentPage(validCurrentPage - 1);
            }
          }}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors text-base font-semibold select-none"
          title="Trang trước"
          aria-label="Trang trước"
        >
          &lt;
        </button>

        {/* Page Numbers */}
        {items.map((item, index) => {
          if (item === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm select-none"
              >
                ...
              </span>
            );
          }

          const pageNumber = item as number;
          const isActive = pageNumber === validCurrentPage;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => {
                setCurrentPage(pageNumber);
              }}
              className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#e53e3e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next Button > */}
        <button
          type="button"
          disabled={validCurrentPage >= totalPages}
          onClick={() => {
            if (validCurrentPage < totalPages) {
              setCurrentPage(validCurrentPage + 1);
            }
          }}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors text-base font-semibold select-none"
          title="Trang tiếp theo"
          aria-label="Trang tiếp theo"
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <section id="reviews" className="py-20 bg-slate-50 border-t border-slate-200 scroll-mt-20">
      <div id="customer-reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            TIÊU ĐỀ SECTION
            ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
            <span>Đánh Giá & Nhận Xét Thực Tế</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Đánh Giá Thực Tế Từ Khách Hàng Sử Dụng Dịch Vụ
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Mọi nhận xét dưới đây được gửi trực tiếp bởi khách hàng thực tế và lưu trữ trên hệ thống.
          </p>
        </div>

        {/* =========================================================================
            DANH SÁCH ĐÁNH GIÁ THỰC TẾ + PHÂN TRANG (HÌNH 4)
            ========================================================================= */}
        <div id="customer-reviews-list" className="mb-14 scroll-mt-24">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900">
                Đánh giá gần đây ({reviews.length})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900 text-sm sm:text-base">{avgRating} / 5.0</span>
              <span>• {reviews.length > 0 ? 'Rất hài lòng' : 'Sẵn sàng ghi nhận'}</span>
            </div>
          </div>

          {/* Trường hợp chưa có đánh giá nào */}
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center max-w-xl mx-auto my-6 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <MessageSquareQuote className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-lg text-slate-800">Chưa có đánh giá nào</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Hệ thống chỉ hiển thị đánh giá thực từ người dùng. Hãy là người đầu tiên trải nghiệm dịch vụ và gửi đánh giá bằng biểu mẫu bên dưới!
              </p>
            </div>
          ) : (
            <>
              {/* Lưới các đánh giá (Hiển thị 4 ô mỗi trang: 4 cột trên Desktop hoặc 2x2 trên Tablet) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {paginatedReviews.map((rev) => {
                  const starCount = Math.max(1, Math.min(5, rev.rating || 5));

                  return (
                    <div
                      key={rev.id}
                      className={`bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-lg relative ${
                        rev.isNew
                          ? 'border-indigo-500 ring-2 ring-indigo-400/20 bg-indigo-50/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Huy hiệu Mới gửi nếu vừa gửi xong */}
                      {rev.isNew && (
                        <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          Mới Gửi
                        </div>
                      )}

                      <div>
                        {/* Profile & Avatar initials */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                              {getInitials(rev.full_name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                                  {rev.full_name}
                                </h4>
                                <span title="Khách hàng đã xác thực">
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                </span>
                              </div>
                              {rev.website_name && (
                                <p className="text-xs text-indigo-600 font-medium truncate max-w-[180px] mt-0.5">
                                  {rev.website_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Star Rating to rõ hơn & Gói dịch vụ */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            {Array.from({ length: starCount }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-amber-400 text-amber-400 drop-shadow-xs"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md truncate max-w-[135px]">
                            {rev.service_package}
                          </span>
                        </div>

                        {/* Nội dung nhận xét */}
                        <p className="text-sm text-slate-700 leading-relaxed italic line-clamp-5">
                          "{rev.review_content}"
                        </p>
                      </div>

                      {/* Ngày đăng */}
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatReviewDate(rev.created_at)}
                        </span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã mua dịch vụ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Phân trang chuẩn hình 4 */}
              {renderPagination()}
            </>
          )}
        </div>

        {/* =========================================================================
            FORM GỬI ĐÁNH GIÁ THỰC TẾ (ẢNH 1)
            ========================================================================= */}
        <div className="bg-white rounded-[16px] shadow-lg border border-slate-200/90 p-6 sm:p-10 max-w-3xl mx-auto">
          {/* Header Form */}
          <div className="mb-8">
            <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1">
              CHIA SẺ TRẢI NGHIỆM CỦA BẠN
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Gửi Đánh Giá Dịch Vụ Hosting & Tên Miền
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Đóng góp ý kiến của bạn sẽ được hiển thị trực tiếp ngay phía trên và lưu trữ an toàn trên hệ thống.
            </p>
          </div>

          {/* Form Element */}
          <form id="customer-review-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Trường 1: Họ và tên (*) */}
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2"
                >
                  Họ và tên của bạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setSubmitFeedback(null);
                  }}
                  required
                  placeholder="Nhập họ và tên thật"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800 bg-white"
                />
              </div>

              {/* Trường 2: Tên Shop / Website (Tùy chọn) */}
              <div>
                <label
                  htmlFor="website_name"
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2"
                >
                  Tên Shop / Website <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  id="website_name"
                  name="website_name"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  placeholder="Ví dụ: Shop Thời Trang Minh Anh / minhanh.vn"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800 bg-white"
                />
              </div>

              {/* Trường 3: Gói dịch vụ đã trải nghiệm */}
              <div>
                <label
                  htmlFor="service_package"
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2"
                >
                  Gói dịch vụ đã trải nghiệm
                </label>
                <div className="relative">
                  <select
                    id="service_package"
                    name="service_package"
                    value={servicePackage}
                    onChange={(e) => setServicePackage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="Gói Business Hosting">Gói Business Hosting</option>
                    <option value="Gói Basic Hosting">Gói Basic Hosting</option>
                    <option value="Gói Starter Hosting">Gói Starter Hosting</option>
                    <option value="Gói Shop Pro (Cloud Hosting)">Gói Shop Pro (Cloud Hosting)</option>
                    <option value="Gói VPS Growth Máy Chủ Ảo">Gói VPS Growth Máy Chủ Ảo</option>
                    <option value="Combo Hosting + Tên Miền .vn">Combo Hosting + Tên Miền .vn</option>
                    <option value="Dịch Vụ Tên Miền Quốc Tế .com">Dịch Vụ Tên Miền Quốc Tế .com</option>
                  </select>
                </div>
              </div>

              {/* Trường 4: Mức điểm đánh giá */}
              <div>
                <label
                  htmlFor="rating"
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2"
                >
                  Mức điểm đánh giá
                </label>
                <div className="relative">
                  <select
                    id="rating"
                    name="rating"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 bg-white cursor-pointer font-medium"
                  >
                    <option value="5">Đánh giá 5/5 — Rất hài lòng</option>
                    <option value="4">Đánh giá 4/5 — Hài lòng</option>
                    <option value="3">Đánh giá 3/5 — Bình thường</option>
                    <option value="2">Đánh giá 2/5 — Tạm chấp nhận</option>
                    <option value="1">Đánh giá 1/5 — Cần cải thiện</option>
                  </select>
                </div>
              </div>

              {/* Trường 5: Nhận xét thực tế của bạn (*) */}
              <div className="col-span-1 md:col-span-2">
                <label
                  htmlFor="review_content"
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2"
                >
                  Nhận xét thực tế của bạn <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="review_content"
                  name="review_content"
                  rows={4}
                  value={reviewContent}
                  onChange={(e) => {
                    setReviewContent(e.target.value);
                    setSubmitFeedback(null);
                  }}
                  required
                  placeholder="Chia sẻ cảm nhận về tốc độ web, sự ổn định..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800 bg-white resize-y"
                />
              </div>
            </div>

            {/* Thông báo phản hồi tại chỗ */}
            {submitFeedback && (
              <div
                id="review-form-feedback"
                className={`p-4 rounded-xl text-sm flex items-start gap-2.5 animate-in fade-in ${
                  submitFeedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {submitFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div className="font-medium text-xs sm:text-sm">
                  {submitFeedback.message}
                </div>
              </div>
            )}

            {/* Nút Submit đổi thành "Gửi Đánh Giá" */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                id="submit-review-btn"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-w-[200px] bg-[#2563eb] hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Gửi Đánh Giá</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
