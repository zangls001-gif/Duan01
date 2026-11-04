import React, { useState, useRef, useEffect } from 'react';
import {
  SITE_TYPE_OPTIONS,
  TRAFFIC_OPTIONS,
  BUDGET_OPTIONS,
  INITIAL_DOMAINS,
  INITIAL_PLANS
} from '../data/constants';
import { Needs, AIAdviceData } from '../types';
import { getClientRuleBasedRecommendation } from '../utils/aiAdvisorEngine';
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
  Globe,
  ChevronDown,
  Check
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
  // Needs State (Section 1 & 2 requirements)
  const [selectedSiteType, setSelectedSiteType] = useState<string>('ban-hang');
  const [selectedTraffic, setSelectedTraffic] = useState<string>('10k-50k');
  const [selectedBudget, setSelectedBudget] = useState<number>(150000);
  const [brandName, setBrandName] = useState<string>('');
  const [desiredDomain, setDesiredDomain] = useState<string>('');
  const [selectedDomainExt, setSelectedDomainExt] = useState<string>('.com');
  const [selectedDomainOption, setSelectedDomainOption] = useState<string>('.com');
  const [customDomainInput, setCustomDomainInput] = useState<string>('');
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState<boolean>(false);
  const domainDropdownRef = useRef<HTMLDivElement>(null);
  const [needDomain, setNeedDomain] = useState<boolean>(true);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (domainDropdownRef.current && !domainDropdownRef.current.contains(event.target as Node)) {
        setIsDomainDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const previewDomainPrefix = (brandName || customDomainInput || desiredDomain)
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9.]+$/i, '')
    .replace(/[^a-z0-9-]/g, '');

  const getDomainPriceText = (option: string) => {
    if (option === 'none') return '0đ (Tùy chọn)';
    if (option === 'custom') return customDomainInput ? 'Tùy chỉnh' : 'Tự nhập';
    const found = INITIAL_DOMAINS.find((d) => d.extension === option);
    return found ? `${found.price.toLocaleString('vi-VN')}đ/năm` : '280.000đ/năm';
  };

  const getDomainBadge = (option: string) => {
    const found = INITIAL_DOMAINS.find((d) => d.extension === option);
    return found?.badge || 'Tên miền';
  };

  const getIcon = (name: string, className = "w-8 h-8 sm:w-9 sm:h-9") => {
    switch (name) {
      case 'Building2': return <Building2 className={className} />;
      case 'ShoppingCart': return <ShoppingCart className={className} />;
      case 'Newspaper': return <Newspaper className={className} />;
      case 'Rocket': return <Rocket className={className} />;
      case 'UserCheck': return <UserCheck className={className} />;
      case 'Server': return <Server className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const handleAnalyze = async () => {
    setErrorMessage(null);

    // Validation (Section 1 requirement)
    if (!selectedSiteType) {
      setErrorMessage('Vui lòng chọn loại website bạn dự định thực hiện!');
      return;
    }

    setIsLoading(true);

    const cleanPrefix = (brandName || customDomainInput || desiredDomain)
      .trim()
      .toLowerCase()
      .replace(/\.[a-z0-9.]+$/i, '')
      .replace(/[^a-z0-9-]/g, '');

    let resolvedDomain = '';
    if (selectedDomainOption === 'none') {
      resolvedDomain = '';
    } else if (selectedDomainOption === 'custom') {
      resolvedDomain = (customDomainInput || desiredDomain).trim();
    } else {
      resolvedDomain = cleanPrefix ? `${cleanPrefix}${selectedDomainOption}` : `${selectedDomainOption}`;
    }

    const needsPayload: Needs = {
      siteType: selectedSiteType,
      traffic: selectedTraffic,
      budget: selectedBudget,
      needDomain: selectedDomainOption !== 'none' && needDomain,
      desiredDomain: resolvedDomain || (selectedDomainOption !== 'none' ? selectedDomainOption : ''),
      brandName: brandName.trim(),
      notes: additionalNotes.trim()
    };

    try {
      let adviceResult: any = null;
      let source = 'ai';

      try {
        const response = await fetch('/api/advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ needs: needsPayload })
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          if (data && data.ok && data.data) {
            adviceResult = data.data;
            source = data.source || 'ai';
          }
        }
      } catch (networkErr) {
        // Backend not available (e.g. running as static deployment on Vercel)
        console.warn('API advice route not available, using smart local advisor:', networkErr);
      }

      // If backend returned 404/HTML (e.g. Vercel static hosting) or failed, use smart client-side engine!
      if (!adviceResult) {
        adviceResult = getClientRuleBasedRecommendation(INITIAL_PLANS, needsPayload);
        source = 'smart-advisor';
      }

      onAnalyzeSuccess(adviceResult, needsPayload, source);
    } catch (err: any) {
      // Guaranteed safety: even in catastrophic case, generate recommendation
      const fallbackResult = getClientRuleBasedRecommendation(INITIAL_PLANS, needsPayload);
      onAnalyzeSuccess(fallbackResult, needsPayload, 'smart-advisor');
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
                Nhấn chọn 1 trong 3 gói website bên dưới. Viền sẽ đổi màu để thể hiện trạng thái được chọn.
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

          {/* Section 1: Exactly 3 Interactive Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {SITE_TYPE_OPTIONS.map((item) => {
              const isSelected = selectedSiteType === item.id;
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedSiteType(item.id);
                    setErrorMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedSiteType(item.id);
                      setErrorMessage(null);
                    }
                  }}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center relative flex flex-col justify-between h-full select-none ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-lg shadow-indigo-100 ring-2 ring-indigo-500/25'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                  }`}
                >
                  <div>
                    {/* Centered & Enlarged Icon without Gói 1,2,3 tag */}
                    <div className="flex justify-center mb-4">
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-4 ring-indigo-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {getIcon(item.iconName, "w-8 h-8 sm:w-10 sm:h-10")}
                      </div>
                    </div>

                    <h3 className={`font-black text-lg sm:text-xl mb-2 transition-colors ${
                      isSelected ? 'text-indigo-950 font-black' : 'text-slate-900'
                    }`}>
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[40px]">
                      {item.description}
                    </p>
                  </div>

                  {/* Selection Check Indicator (Centered) */}
                  <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'border-2 border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-700 font-bold' : 'text-slate-400'}`}>
                      {isSelected ? '✓ Đang lựa chọn' : 'Nhấn để chọn'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section Preferences Grid */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            {/* Row 1: Traffic & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            </div>

            {/* Row 2 (Phần 4 Yêu cầu): Tên thương hiệu và Tên miền */}
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90">
              <div className="mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    4
                  </span>
                  Tên thương hiệu và tên miền
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập tên thương hiệu (trường chính). Tên miền là trường tùy chọn, bạn có thể nhập hoặc bỏ trống mà không ảnh hưởng đến việc tiếp tục.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field 1: Tên thương hiệu (Trường chính) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Tên thương hiệu <span className="text-indigo-600">*</span></span>
                    <span className="text-[11px] text-indigo-600 font-semibold normal-case">Trường chính</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Nhập tên thương hiệu (ví dụ: An Nhiên Shop, Minh Vũ Tech...)"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tên nhãn hiệu, cửa hàng hoặc doanh nghiệp của bạn
                  </p>
                </div>

                {/* Field 2: Tên miền mong muốn (tùy chọn) - Dropdown Menu có các tên miền và bảng giá trên các dòng */}
                <div className="relative" ref={domainDropdownRef}>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Tên miền mong muốn (tùy chọn)</span>
                    <span className="text-[11px] text-slate-400 font-normal normal-case">Không bắt buộc</span>
                  </label>

                  {/* Trigger Dropdown Button */}
                  <button
                    type="button"
                    onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 flex items-center justify-between gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer text-left relative ${
                      isDomainDropdownOpen ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-indigo-600 absolute left-3 top-3.5" />
                    
                    <div className="truncate flex-1">
                      {selectedDomainOption === 'none' && (
                        <span className="text-slate-500">Không chọn / Bỏ trống (tùy chọn)</span>
                      )}
                      {selectedDomainOption === 'custom' && (
                        <span className="text-slate-800 font-medium">
                          {customDomainInput ? customDomainInput : 'Tự nhập tên miền riêng...'}
                        </span>
                      )}
                      {selectedDomainOption !== 'none' && selectedDomainOption !== 'custom' && (
                        <span className="text-slate-900 font-semibold flex items-center gap-1.5 truncate">
                          <span>{previewDomainPrefix ? `${previewDomainPrefix}${selectedDomainOption}` : selectedDomainOption}</span>
                          <span className="text-[10px] font-normal px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {getDomainBadge(selectedDomainOption)}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {getDomainPriceText(selectedDomainOption)}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isDomainDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </div>
                  </button>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Nhấn để chọn tên miền và xem bảng giá niêm yết trên từng dòng
                  </p>

                  {/* Dropdown Menu Panel */}
                  {isDomainDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-100">
                      <div className="px-3.5 py-2 bg-slate-50/90 flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <span>Tên miền</span>
                        <span>Bảng giá niêm yết</span>
                      </div>

                      <div className="max-h-60 overflow-y-auto py-1">
                        {/* Dòng 1: Không chọn (Bỏ trống) */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDomainOption('none');
                            setDesiredDomain('');
                            setIsDomainDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                            selectedDomainOption === 'none' ? 'bg-indigo-50/80 text-indigo-950 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            <div>
                              <div className="font-semibold text-slate-800">Không chọn (Bỏ trống - Tùy chọn)</div>
                              <div className="text-[10px] text-slate-400">Chưa cần đăng ký tên miền lúc này</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-600">0đ</span>
                          </div>
                        </button>

                        {/* Các dòng tên miền và giá tham khảo từ Bảng Giá Đăng Ký Tên Miền Thương Hiệu */}
                        {INITIAL_DOMAINS.map((domain) => {
                          const isSelected = selectedDomainOption === domain.extension;
                          return (
                            <button
                              key={domain.extension}
                              type="button"
                              onClick={() => {
                                setSelectedDomainOption(domain.extension);
                                setSelectedDomainExt(domain.extension);
                                const prefix = previewDomainPrefix;
                                setDesiredDomain(prefix ? `${prefix}${domain.extension}` : domain.extension);
                                setNeedDomain(true);
                                setIsDomainDropdownOpen(false);
                              }}
                              className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-indigo-50/50 transition-colors cursor-pointer text-xs ${
                                isSelected ? 'bg-indigo-50/90 text-indigo-950 font-semibold' : 'text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <CheckCircle2
                                  className={`w-4 h-4 shrink-0 ${
                                    isSelected ? 'text-indigo-600' : 'text-slate-200'
                                  }`}
                                />
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-slate-900 text-sm">
                                      {domain.extension}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                                      {domain.badge}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    {previewDomainPrefix ? `${previewDomainPrefix}${domain.extension}` : domain.description}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0 ml-3">
                                <div className="font-extrabold text-indigo-700 text-xs">
                                  {domain.price.toLocaleString('vi-VN')}đ<span className="text-[10px] font-normal text-slate-500">/năm</span>
                                </div>
                                <div className="text-[10px] text-emerald-600 font-medium">
                                  Tặng 0đ với gói từ 69k
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        {/* Dòng tùy chọn tự nhập tên miền riêng */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDomainOption('custom');
                            setIsDomainDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                            selectedDomainOption === 'custom' ? 'bg-indigo-50/80 text-indigo-950 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            <div>
                              <div className="font-semibold text-slate-800">Tự nhập tên miền riêng...</div>
                              <div className="text-[10px] text-slate-400">Nếu bạn đã có sẵn tên miền hoặc muốn đuôi khác</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-semibold text-indigo-600">Tùy chỉnh</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Input nhập tên miền nếu chọn 'Tự nhập tên miền riêng' */}
                  {selectedDomainOption === 'custom' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customDomainInput}
                        onChange={(e) => {
                          setCustomDomainInput(e.target.value);
                          setDesiredDomain(e.target.value);
                        }}
                        placeholder="Nhập tên miền của bạn (ví dụ: mywebsite.vn)"
                        className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-need-domain"
                  checked={needDomain}
                  onChange={(e) => setNeedDomain(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="chk-need-domain" className="text-xs text-slate-600 cursor-pointer select-none">
                  Đăng ký tên miền mới cùng Hosting (được tặng miễn phí 1 năm với gói từ 69k)
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
