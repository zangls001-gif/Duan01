import React from 'react';
import { Plan, AIAdviceData, Needs } from '../types';
import {
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Zap,
  Award,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

interface AIResultsProps {
  adviceData: AIAdviceData | null;
  needs: Needs | null;
  source: string;
  allPlans: Plan[];
  onSelectPlan: (plan: Plan) => void;
  onReset: () => void;
}

export const AIResults: React.FC<AIResultsProps> = ({
  adviceData,
  needs,
  source,
  allPlans,
  onSelectPlan,
  onReset
}) => {
  if (!adviceData) return null;

  // Find plan details from allPlans by planId
  const getPlanDetails = (planId: string): Plan | undefined => {
    return allPlans.find((p) => p.id === planId);
  };

  const bestPlan = getPlanDetails(adviceData.best.planId);
  const alternatives = adviceData.alternatives
    .map((alt) => ({
      ...alt,
      plan: getPlanDetails(alt.planId)
    }))
    .filter((alt) => alt.plan !== undefined);

  return (
    <section id="ai-results" className="py-14 bg-slate-900 text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Kết Quả Đối Chiếu Bảng Giá Dịch Vụ</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-indigo-500/30 text-indigo-200 rounded">
                {source === 'gemini-ai' ? 'Mô hình Gemini AI' : 'Hệ Chuyên Gia HostingAdvisor'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Top 3 Gói Dịch Vụ Phù Hợp Nhất
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Được phân tích dựa trên loại website ({needs?.siteType}), lưu lượng ({needs?.traffic}) và ngân sách thực tế.
            </p>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer w-fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Phân tích lại nhu cầu khác</span>
          </button>
        </div>

        {/* 3 Recommended Packages Grid (Section 5.3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* 1. Best Match Plan (Highlight Card) */}
          {bestPlan && (
            <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-950 flex flex-col justify-between order-1 lg:order-2 lg:-translate-y-2">
              {/* Highlight Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Gói Phù Hợp Nhất (Khuyên Dùng)</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    {bestPlan.type}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                    100% NVMe
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-2">{bestPlan.name}</h3>

                <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-indigo-900/60">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {bestPlan.pricePerMonth.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs text-indigo-300 font-medium">/ tháng</span>
                </div>

                {/* AI Rationale */}
                <div className="p-3.5 rounded-2xl bg-indigo-900/40 border border-indigo-700/50 mb-5">
                  <p className="text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Lý do lựa chọn:
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {adviceData.best.reason}
                  </p>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-2 mb-5 text-xs text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">Dung lượng</span>
                    <span className="font-bold text-white text-sm">{bestPlan.storage}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">Băng thông</span>
                    <span className="font-bold text-white text-sm">{bestPlan.bandwidth}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 text-xs text-slate-300 mb-5">
                  {bestPlan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                  {bestPlan.freeDomain && (
                    <li className="flex items-center gap-2 text-amber-300 font-semibold">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>Tặng miễn phí tên miền 1 năm</span>
                    </li>
                  )}
                </ul>

                {/* Limitations */}
                {bestPlan.limitations && (
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40 text-[11px] text-slate-400 flex items-start gap-2 mb-6">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>Lưu ý: {bestPlan.limitations}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectPlan(bestPlan)}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Chọn Gói Này & Đặt Mua</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2 & 3: Alternatives (Budget & Growth) */}
          {alternatives.map((item, index) => {
            const plan = item.plan!;
            const isGrowth = item.category.toLowerCase().includes('phát triển') || item.category.toLowerCase().includes('mở rộng');

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between ${
                  index === 0 ? 'order-2 lg:order-1' : 'order-3 lg:order-3'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {plan.type}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold flex items-center gap-1">
                      {isGrowth ? <TrendingUp className="w-3 h-3 text-sky-400" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                  <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-slate-700">
                    <span className="text-3xl font-extrabold text-white">
                      {plan.pricePerMonth.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-xs text-slate-400">/ tháng</span>
                  </div>

                  {/* AI Rationale */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/70 mb-5">
                    <p className="text-xs font-semibold text-slate-300 mb-1">
                      Đánh giá:
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>

                  {/* Key Specs */}
                  <div className="grid grid-cols-2 gap-2 mb-5 text-xs text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block">Dung lượng</span>
                      <span className="font-bold text-white text-sm">{plan.storage}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                      <span className="text-[10px] text-slate-400 block">Băng thông</span>
                      <span className="font-bold text-white text-sm">{plan.bandwidth}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 text-xs text-slate-300 mb-5">
                    {plan.features.slice(0, 4).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limitations */}
                  {plan.limitations && (
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/40 text-[11px] text-slate-400 flex items-start gap-2 mb-6">
                      <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span>{plan.limitations}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelectPlan(plan)}
                  className="w-full py-3 bg-slate-700 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Chọn Gói Này</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* AI Domain Advice Card */}
        {adviceData.domainAdvice && (
          <div className="p-5 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-200">Lời Khuyên Tư Vấn Tên Miền Từ AI:</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                  {adviceData.domainAdvice}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
