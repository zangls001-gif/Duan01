import React, { useState } from 'react';
import {
  SITE_TYPE_OPTIONS,
  TRAFFIC_OPTIONS,
  BUDGET_OPTIONS
} from '../data/constants';
import { Needs, AIAdviceData } from '../types';
import {
  Sparkles,
  Building2,
  ShoppingCart,
  Newspaper,
  Rocket,
  UserCheck,
  Server,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Globe
} from 'lucide-react';

interface HeroAssistantProps {
  onAnalyzeSuccess: (data: AIAdviceData, needs: Needs, source: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const HeroAssistant: React.FC<HeroAssistantProps> = ({
  onAnalyzeSuccess,
  isLoading,
  setIsLoading
}) => {
  // Needs State (Section 4 & 5 requirements)
  const [selectedSiteType, setSelectedSiteType] = useState<string>('ban-hang');
  const [customSiteType, setCustomSiteType] = useState<string>('');
  const [selectedTraffic, setSelectedTraffic] = useState<string>('10k-50k');
  const [selectedBudget, setSelectedBudget] = useState<number>(150000);
  const [needDomain, setNeedDomain] = useState<boolean>(true);
  const [desiredDomain, setDesiredDomain] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'ShoppingCart': return <ShoppingCart className="w-5 h-5" />;
      case 'Newspaper': return <Newspaper className="w-5 h-5" />;
      case 'Rocket': return <Rocket className="w-5 h-5" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5" />;
      case 'Server': return <Server className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleAnalyze = async () => {
    setErrorMessage(null);

    // Validation (Section 5.1 requirement 1 & 2)
    if (!selectedSiteType) {
      setErrorMessage('Vui lòng chọn loại website bạn dự định thực hiện!');
      return;
    }

    if (selectedSiteType === 'khac' && !customSiteType.trim()) {
      setErrorMessage('Vui lòng nhập mô tả loại website của bạn.');
      return;
    }

    setIsLoading(true);

    const needsPayload: Needs = {
      siteType: selectedSiteType === 'khac' ? `khac: ${customSiteType}` : selectedSiteType,
      traffic: selectedTraffic,
      budget: selectedBudget,
      needDomain,
      desiredDomain: desiredDomain.trim(),
      notes: additionalNotes.trim()
    };

    try {
      const response = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needs: needsPayload })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Không thể lấy kết quả phân tích');
      }

      onAnalyzeSuccess(data.data, needsPayload, data.source || 'ai');
    } catch (err: any) {
      setErrorMessage('Lỗi khi phân tích nhu cầu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-assistant" className="relative pt-8 pb-16 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-tr from-indigo-100/40 via-blue-50/40 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Banner Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>AI Shopping Assistant • Tư vấn gói chuẩn 100% theo nhu cầu thực tế</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Nền Tảng Đăng Ký Hosting & Tên Miền{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
              Tốc Độ Cao
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Hạ tầng ổ cứng 100% NVMe, LiteSpeed Enterprise, tặng kèm tên miền .com/.vn, tích hợp thanh toán VietQR động và xuất hóa đơn điện tử tức thì.
          </p>
        </div>

        {/* Interactive Assistant Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  1
                </span>
                Bạn dự định làm loại website nào?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-10.5">
                Nhấn chọn một loại website phù hợp nhất. AI sẽ dựa vào mục đích này để đề xuất cấu hình chính xác.
              </p>
            </div>
            <div className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 w-fit">
              Đã chọn: <span className="font-bold">{SITE_TYPE_OPTIONS.find(o => o.id === selectedSiteType)?.title || 'Chưa chọn'}</span>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Section 4: 8 Interactive Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
            {SITE_TYPE_OPTIONS.map((item) => {
              const isSelected = selectedSiteType === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedSiteType(item.id);
                    setErrorMessage(null);
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-left relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                  }`}
                >
                  {/* Top Bar with Icon & Tag */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {getIcon(item.iconName)}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-indigo-200 text-indigo-900'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.recommendedTag}
                      </span>
                    </div>

                    <h3 className={`font-bold text-sm mb-1.5 ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Selection Check Indicator */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {isSelected ? 'Đang chọn' : 'Nhấn để chọn'}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* If "Loại khác" selected: provide text input */}
          {selectedSiteType === 'khac' && (
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mô tả cụ thể mục đích website của bạn:
              </label>
              <input
                type="text"
                value={customSiteType}
                onChange={(e) => setCustomSiteType(e.target.value)}
                placeholder="ví dụ: Mạng nội bộ công ty kết hợp chatbot tra cứu tài liệu..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          )}

          {/* Section 5 Additional Preferences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            {/* Preference 1: Traffic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
                  2
                </span>
                Lượng truy cập dự kiến
              </label>
              <select
                value={selectedTraffic}
                onChange={(e) => setSelectedTraffic(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
              >
                {TRAFFIC_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} ({t.desc})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Quyết định dung lượng RAM, CPU và băng thông hosting
              </p>
            </div>

            {/* Preference 2: Budget */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
                  3
                </span>
                Ngân sách dự kiến / tháng
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
              >
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                AI sẽ tìm gói có giá tốt nhất trong khoảng ngân sách này
              </p>
            </div>

            {/* Preference 3: Domain Name Preference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
                  4
                </span>
                Tên miền mong muốn (nếu có)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={desiredDomain}
                  onChange={(e) => setDesiredDomain(e.target.value)}
                  placeholder="ví dụ: brandname"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-need-domain"
                  checked={needDomain}
                  onChange={(e) => setNeedDomain(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="chk-need-domain" className="text-xs text-slate-600 cursor-pointer">
                  Cần đăng ký tên miền mới (được tặng free với gói từ 69k)
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button Section (Section 5 requirement) */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Đối chiếu tức thì với 6 gói cấu hình thực tế trong hệ thống</span>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-indigo-300 hover:shadow-indigo-400 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI Đang Phân Tích & Đối Chiếu Bảng Giá...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>Phân Tích Nhu Cầu & Gợi Ý Bằng AI</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
