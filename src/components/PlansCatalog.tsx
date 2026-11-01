import React, { useState } from 'react';
import { Plan } from '../types';
import { Check, ShoppingCart, Zap, Star, Shield, HardDrive, Cpu, Network, Info } from 'lucide-react';

interface PlansCatalogProps {
  plans: Plan[];
  onBuyPlan: (plan: Plan) => void;
}

export const PlansCatalog: React.FC<PlansCatalogProps> = ({ plans, onBuyPlan }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [detailModalPlan, setDetailModalPlan] = useState<Plan | null>(null);

  const filteredPlans = plans.filter((p) => {
    if (filterType === 'all') return true;
    if (filterType === 'shared') return p.type.toLowerCase().includes('shared');
    if (filterType === 'cloud') return p.type.toLowerCase().includes('cloud');
    if (filterType === 'vps') return p.type.toLowerCase().includes('vps');
    return true;
  });

  return (
    <section id="catalog-plans" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Danh mục sản phẩm chính thức • Mua trực tiếp</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bảng Giá Dịch Vụ Hosting Tốc Độ Cao
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Toàn bộ 6 gói dịch vụ với giá niêm yết chính hãng. Bạn có thể nhấn <strong>"Mua Ngay"</strong> trực tiếp không cần qua khảo sát.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất Cả 6 Gói
            </button>
            <button
              onClick={() => setFilterType('shared')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'shared'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Shared Hosting (Starter, Basic, Business)
            </button>
            <button
              onClick={() => setFilterType('cloud')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'cloud'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Cloud Hosting (Shop Pro)
            </button>
            <button
              onClick={() => setFilterType('vps')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'vps'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              VPS Máy Chủ Ảo (Growth, Power)
            </button>
          </div>
        </div>

        {/* 6 Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredPlans.map((plan) => {
            const isPopular = plan.id === 'business' || plan.id === 'shop-pro';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all duration-200 flex flex-col justify-between relative shadow-xs hover:shadow-xl ${
                  isPopular
                    ? 'border-indigo-600 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Popular Tag */}
                {isPopular && (
                  <div className="absolute -top-3.5 right-6 px-3.5 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Bán Chạy Nhất
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {plan.type}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ~ {plan.recommendedVisits.toLocaleString('vi-VN')} khách/tháng
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mb-5 min-h-[32px]">{plan.bestFor}</p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {plan.pricePerMonth.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ tháng</span>
                  </div>

                  {/* Quick specs */}
                  <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold mb-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        Ổ Cứng SSD/NVMe
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{plan.storage}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold mb-1">
                        <Network className="w-3.5 h-3.5" />
                        Băng Thông
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{plan.bandwidth}</span>
                    </div>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-3 text-xs text-slate-600 mb-6">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.freeDomain ? (
                      <li className="flex items-start gap-2.5 text-indigo-700 font-semibold bg-indigo-50/70 p-2 rounded-lg">
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>Tặng miễn phí tên miền .com/.vn năm đầu</span>
                      </li>
                    ) : (
                      <li className="flex items-start gap-2.5 text-slate-400">
                        <span className="w-4 text-center">-</span>
                        <span>Không kèm tên miền miễn phí</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Actions: Mua Ngay & Xem Chi Tiết */}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => onBuyPlan(plan)}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Mua Ngay</span>
                  </button>
                  <button
                    onClick={() => setDetailModalPlan(plan)}
                    className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Xem thông số chi tiết</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Details Modal */}
      {detailModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {detailModalPlan.type}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Gói {detailModalPlan.name}</h3>
              </div>
              <button
                onClick={() => setDetailModalPlan(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-400 block">Giá niêm yết:</span>
                  <span className="text-xl font-bold text-slate-900">
                    {detailModalPlan.pricePerMonth.toLocaleString('vi-VN')}đ / tháng
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Lượt truy cập tối ưu:</span>
                  <span className="font-semibold text-slate-800">
                    ~ {detailModalPlan.recommendedVisits.toLocaleString('vi-VN')} lượt
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Thông số kỹ thuật:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">Dung lượng ổ cứng:</span>
                    <span className="font-bold text-slate-800">{detailModalPlan.storage}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">Băng thông hàng tháng:</span>
                    <span className="font-bold text-slate-800">{detailModalPlan.bandwidth}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Quyền lợi kèm theo:</h4>
                <ul className="space-y-1.5 text-xs">
                  {detailModalPlan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {detailModalPlan.freeDomain && (
                    <li className="flex items-center gap-2 text-indigo-700 font-semibold">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Tặng miễn phí tên miền năm đầu (.com hoặc .vn)</span>
                    </li>
                  )}
                </ul>
              </div>

              {detailModalPlan.limitations && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  <p className="font-semibold mb-0.5">Lưu ý kỹ thuật:</p>
                  <p>{detailModalPlan.limitations}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setDetailModalPlan(null);
                  onBuyPlan(detailModalPlan);
                }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Đặt Mua Gói Này
              </button>
              <button
                onClick={() => setDetailModalPlan(null)}
                className="px-5 py-3 border border-slate-200 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
