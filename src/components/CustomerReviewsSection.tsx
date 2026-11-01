import React, { useEffect } from 'react';
import { Send, Star, MessageSquareQuote, CheckCircle2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    initCustomerReviewsForm?: () => void;
    renderCustomerReviews?: () => void;
  }
}

export const CustomerReviewsSection: React.FC = () => {
  useEffect(() => {
    // Initialize customer reviews form listener and render handler when mounted
    if (typeof window.initCustomerReviewsForm === 'function') {
      window.initCustomerReviewsForm();
    }
    if (typeof window.renderCustomerReviews === 'function') {
      window.renderCustomerReviews();
    }
  }, []);

  return (
    <section id="customer-reviews" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            PHẦN 1: TIÊU ĐỀ TRANG
            ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
            <span>Phản Hồi & Đánh Giá</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Đánh Giá Thực Tế Từ Khách Hàng Sử Dụng Dịch Vụ
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Mọi nhận xét dưới đây được gửi trực tiếp bởi khách hàng và lưu trữ trên cơ sở dữ liệu đám mây Supabase.
          </p>
        </div>

        {/* =========================================================================
            PHẦN 2: KHU VỰC HIỂN THỊ ĐÁNH GIÁ KHÁCH HÀNG (TODO BOX)
            ========================================================================= */}
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 sm:p-10 text-center mb-12 shadow-xs transition-all hover:border-slate-400">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <MessageSquareQuote className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mb-2">
            [TODO - Nhiệm vụ 4]: Hiển thị Đánh giá Khách hàng có Phân trang
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Hoàn thiện hàm <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-700">renderCustomerReviews()</code> và{' '}
            <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-700">initCustomerReviewsForm()</code> trong{' '}
            <span className="font-semibold text-slate-700">public/js/app.js</span> (Hiện có 0 đánh giá trên Supabase).
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Khu vực chờ kết nối Supabase Client ở giai đoạn tiếp theo</span>
          </div>
        </div>

        {/* =========================================================================
            PHẦN 3: FORM GỬI ĐÁNH GIÁ KHÁCH HÀNG
            ========================================================================= */}
        <div className="bg-white rounded-[12px] shadow-lg border border-slate-100 p-6 sm:p-10 max-w-3xl mx-auto">
          {/* Header Form */}
          <div className="mb-8">
            <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1">
              CHIA SẺ TRẢI NGHIỆM CỦA BẠN
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Gửi Đánh Giá Dịch Vụ Hosting & Tên Miền
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Đóng góp ý kiến của bạn giúp chúng tôi không ngừng tối ưu tốc độ máy chủ và chất lượng chăm sóc khách hàng.
            </p>
          </div>

          {/* Form Element */}
          <form id="customer-review-form" className="space-y-6" noValidate={false}>
            {/* Grid 2 cột trên Desktop, 1 cột trên Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Trường 1: Họ và tên (*) */}
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2"
                >
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800 bg-white"
                />
              </div>

              {/* Trường 2: Tên Shop / Website */}
              <div>
                <label
                  htmlFor="website_name"
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2"
                >
                  Tên Shop / Website
                </label>
                <input
                  type="text"
                  id="website_name"
                  name="website_name"
                  placeholder="Ví dụ: shopquanao.com"
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
                    defaultValue="Gói Business Hosting"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="Gói Khởi Nghiệp (Start-up Hosting)">
                      Gói Khởi Nghiệp (Start-up Hosting)
                    </option>
                    <option value="Gói Tiêu Chuẩn (Standard Hosting)">
                      Gói Tiêu Chuẩn (Standard Hosting)
                    </option>
                    <option value="Gói Business Hosting">
                      Gói Business Hosting
                    </option>
                    <option value="Gói Enterprise Hosting">
                      Gói Enterprise Hosting
                    </option>
                    <option value="Dịch Vụ Đăng Ký Tên Miền">
                      Dịch Vụ Đăng Ký Tên Miền
                    </option>
                    <option value="Combo Hosting + Tên Miền">
                      Combo Hosting + Tên Miền
                    </option>
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
                    defaultValue="5"
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

              {/* Trường 5: Nhận xét thực tế của bạn (*) - Chiếm toàn bộ chiều rộng */}
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
                  required
                  placeholder="Chia sẻ cảm nhận chi tiết về tốc độ website, thời gian tải trang, hỗ trợ kỹ thuật..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800 bg-white resize-y"
                />
              </div>
            </div>

            {/* Thông báo phản hồi UI (Dynamic Notification Banner) */}
            <div id="review-form-feedback" className="hidden"></div>

            {/* Nút Submit */}
            <div className="pt-2">
              <button
                type="submit"
                id="submit-review-btn"
                className="w-full bg-[#2563eb] hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Gửi Đánh Giá Lên Hệ Thống</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
