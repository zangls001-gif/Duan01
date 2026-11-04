import { Plan, Needs, AIAdviceData } from '../types';
import { INITIAL_PLANS } from '../data/constants';

/**
 * Intelligent rule-based hosting recommendation engine.
 * Matches user requirements with the 6 hosting/VPS packages and domain advice.
 * Guaranteed 100% uptime with zero network dependency on static deployments (Vercel, Netlify).
 */
export function getClientRuleBasedRecommendation(
  plans: Plan[] = INITIAL_PLANS,
  needs: Needs
): AIAdviceData {
  const { siteType, traffic, needDomain, desiredDomain, brandName } = needs || {};

  let bestPlanId = 'basic';
  let budgetPlanId = 'starter';
  let growthPlanId = 'business';

  if (siteType === 'ban-hang' || siteType === 'thuong-mai') {
    bestPlanId =
      traffic === '50k-150k' || traffic === 'tren-150k'
        ? 'vps-1'
        : traffic === '10k-50k'
        ? 'business'
        : 'shop-pro';
    budgetPlanId = 'basic';
    growthPlanId = bestPlanId === 'vps-1' ? 'vps-2' : 'shop-pro';
  } else if (siteType === 'gioi-thieu' || siteType === 'tin-tuc' || siteType === 'giao-duc') {
    bestPlanId = 'business';
    budgetPlanId = 'basic';
    growthPlanId = 'shop-pro';
  } else if (siteType === 'landing-page' || siteType === 'portfolio' || siteType === 'ca-nhan') {
    bestPlanId = 'basic';
    budgetPlanId = 'starter';
    growthPlanId = 'business';
  } else if (siteType === 'web-app' || siteType === 'he-thong') {
    bestPlanId = 'vps-1';
    budgetPlanId = 'business';
    growthPlanId = 'vps-2';
  }

  // Adjust by traffic
  if (traffic === 'tren-150k') {
    bestPlanId = 'vps-2';
    budgetPlanId = 'vps-1';
    growthPlanId = 'vps-2';
  } else if (traffic === '50k-150k') {
    bestPlanId = 'vps-1';
    budgetPlanId = 'shop-pro';
    growthPlanId = 'vps-2';
  }

  const bestPlan = plans.find((p) => p.id === bestPlanId) || plans[1] || INITIAL_PLANS[1];
  const budgetPlan =
    plans.find((p) => p.id === budgetPlanId && p.id !== bestPlanId) || plans[0] || INITIAL_PLANS[0];
  const growthPlan =
    plans.find((p) => p.id === growthPlanId && p.id !== bestPlanId && p.id !== budgetPlanId) ||
    plans[3] ||
    INITIAL_PLANS[3];

  let domainAdvice = '';
  const domainOrBrand = desiredDomain || brandName;
  if (needDomain) {
    if (domainOrBrand) {
      domainAdvice = `Với thương hiệu "${domainOrBrand}", bạn nên đăng ký đuôi tên miền .vn hoặc .com.vn để khẳng định uy tín tại Việt Nam, kết hợp bảo hộ tên miền .com toàn cầu.`;
    } else {
      domainAdvice =
        'Bạn nên lựa chọn tên miền ngắn gọn, dễ nhớ, mang đậm dấu ấn thương hiệu và ưu tiên đuôi .vn hoặc .com.';
    }
  } else {
    domainAdvice =
      'Nếu bạn đã sở hữu tên miền, hệ thống sẽ cung cấp cặp NameServer (ns1.hostingadvisor.vn, ns2.hostingadvisor.vn) để kết nối về hosting chỉ trong 5 phút.';
  }

  return {
    best: {
      planId: bestPlan.id,
      category: 'Gói phù hợp nhất',
      reason: `Gói ${bestPlan.name} (${bestPlan.storage}, ${bestPlan.bandwidth}) đáp ứng hoàn hảo nhu cầu vận hành ${
        siteType === 'ban-hang' ? 'website bán hàng' : siteType === 'gioi-thieu' ? 'website giới thiệu' : 'landing page'
      } với lưu lượng truy cập dự kiến.`
    },
    alternatives: [
      {
        planId: budgetPlan.id,
        category: 'Gói tiết kiệm',
        reason: `Gói ${budgetPlan.name} với chi phí tối ưu ${budgetPlan.pricePerMonth.toLocaleString(
          'vi-VN'
        )}đ/tháng, rất thích hợp để bắt đầu triển khai thử nghiệm.`
      },
      {
        planId: growthPlan.id,
        category: 'Gói cho nhu cầu phát triển',
        reason: `Gói ${growthPlan.name} sở hữu cấu hình mạnh mẽ (${growthPlan.storage}, ${growthPlan.features
          .slice(0, 2)
          .join(', ')}), sẵn sàng cho quy mô mở rộng.`
      }
    ],
    domainAdvice
  };
}
