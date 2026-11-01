import React, { useState } from 'react';
import { CUSTOMER_REVIEWS, FAQS } from '../data/constants';
import { ShieldCheck, Zap, Headphones, Star, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export const TrustAndReviews: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div id="reviews">
      {/* 1. 3 Golden Commitments (Trust Badges - Section 4.5) */}
      <section className="py-14 bg-indigo-900 text-white border-y border-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            {/* Badge 1 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white">Hoàn Tiền 100% Trong 30 Ngày</h4>
                <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                  Nếu bạn không hài lòng về tốc độ tải trang hoặc chất lượng dịch vụ, chúng tôi hoàn lại 100% không cần lý do.
                </p>
              </div>
            </div>

            {/* Badge 2 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60">
              <div className="w-12 h-12 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white">Cam Kết Uptime 99.9%</h4>
                <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                  Hạ tầng máy chủ Tier-3 đạt chuẩn quốc tế tại Viettel & VNPT IDC, bảo đảm website hoạt động thông suốt.
                </p>
              </div>
            </div>

            {/* Badge 3 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60">
              <div className="w-12 h-12 rounded-xl bg-sky-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Headphones className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white">Hỗ Trợ Kỹ Thuật 24/7/365</h4>
                <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                  Đội ngũ kỹ sư trực tuyến 24/7 qua Hotline 1900 6868 và hệ thống Ticket, phản hồi ngay trong 5 phút.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Customer Reviews Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Khách Hàng Đã Trải Nghiệm
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Đánh Giá Thực Tế Từ Khách Hàng
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Hơn 12.000+ cá nhân và doanh nghiệp đã tin tưởng lựa chọn hạ tầng HostingAdvisor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CUSTOMER_REVIEWS.map((review, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                    "{review.content}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                    <p className="text-xs text-slate-500">{review.role}</p>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                      {review.planUsed}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Giải Đáp Thắc Mắc
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Câu Hỏi Thường Gặp (FAQ)
            </h2>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left font-bold text-slate-900 hover:text-indigo-600 flex items-center justify-between gap-4 cursor-pointer text-sm sm:text-base bg-white hover:bg-slate-50/70"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
