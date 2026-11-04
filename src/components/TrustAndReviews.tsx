import React from 'react';
import { ShieldCheck, Zap, Headphones } from 'lucide-react';

export const TrustAndReviews: React.FC = () => {
  return (
    <div id="trust-commitments">
      {/* 3 Golden Commitments (Trust Badges - Section 4.5) */}
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
    </div>
  );
};

