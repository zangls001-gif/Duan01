/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroAssistant } from './components/HeroAssistant';
import { AIResults } from './components/AIResults';
import { PlansCatalog } from './components/PlansCatalog';
import { DomainPricingSection } from './components/DomainPricingSection';
import { TrustAndReviews } from './components/TrustAndReviews';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { InvoiceModal } from './components/InvoiceModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { AdminOMSModal } from './components/AdminOMSModal';
import { Plan, DomainPricing, Addon, AIAdviceData, Needs, Order } from './types';
import { INITIAL_PLANS, INITIAL_DOMAINS, INITIAL_ADDONS } from './data/constants';

function AppContent() {
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [domains, setDomains] = useState<DomainPricing[]>(INITIAL_DOMAINS);
  const [addons, setAddons] = useState<Addon[]>(INITIAL_ADDONS);

  // AI Advice state
  const [adviceData, setAdviceData] = useState<AIAdviceData | null>(null);
  const [aiNeeds, setAiNeeds] = useState<Needs | null>(null);
  const [aiSource, setAiSource] = useState<string>('ai');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Checkout Modal State
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [checkoutDomainName, setCheckoutDomainName] = useState<string>('');
  const [checkoutDomainExt, setCheckoutDomainExt] = useState<string>('.com');
  const [checkoutInitialAddonIds, setCheckoutInitialAddonIds] = useState<string[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Invoice Modal State
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<Order | null>(null);

  // User & Admin Modals
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState<boolean>(false);
  const [isAdminOMSOpen, setIsAdminOMSOpen] = useState<boolean>(false);

  // Fetch official data from backend on load
  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          if (data.plans && data.plans.length > 0) setPlans(data.plans);
          if (data.domain_pricing && data.domain_pricing.length > 0) setDomains(data.domain_pricing);
          if (data.addons && data.addons.length > 0) setAddons(data.addons);
        }
      })
      .catch((err) => {
        console.warn('Using local fallback data:', err);
      });
  }, []);

  // Smooth scroll helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // AI analyze finished
  const handleAnalyzeSuccess = (data: AIAdviceData, needs: Needs, source: string) => {
    setAdviceData(data);
    setAiNeeds(needs);
    setAiSource(source);
    setTimeout(() => {
      scrollTo('ai-results');
    }, 100);
  };

  // Reset AI recommendation
  const handleResetAI = () => {
    setAdviceData(null);
    setAiNeeds(null);
    scrollTo('ai-assistant');
  };

  // Triggered when user selects a plan from AI results or from Catalog
  const handleOpenCheckoutWithPlan = (
    plan: Plan,
    domName: string = '',
    domExt: string = '.com',
    initialAddons: string[] = []
  ) => {
    setCheckoutPlan(plan);
    setCheckoutDomainName(domName);
    setCheckoutDomainExt(domExt);
    setCheckoutInitialAddonIds(initialAddons);
    setIsCheckoutOpen(true);
  };

  // Triggered when user picks a domain from Domain Section
  const handleSelectDomainForCheckout = (
    domainName: string,
    ext: string,
    initialAddons: string[] = []
  ) => {
    // If the domain is eligible for free domain with Basic (69k), let's default to Basic
    const recommendedPlan = plans.find((p) => p.id === 'basic') || plans[0];
    setCheckoutPlan(recommendedPlan);
    setCheckoutDomainName(domainName);
    setCheckoutDomainExt(ext);
    setCheckoutInitialAddonIds(initialAddons);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Global Header */}
      <Header
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        onOpenAdmin={() => setIsAdminOMSOpen(true)}
        onScrollTo={scrollTo}
      />

      <main className="flex-1">
        {/* 2. Hero & Interactive AI Assistant (Section 4 & 5) */}
        <HeroAssistant
          onAnalyzeSuccess={handleAnalyzeSuccess}
          isLoading={isAiLoading}
          setIsLoading={setIsAiLoading}
        />

        {/* 3. AI Results Section (Section 5.3 & 5.4) */}
        {adviceData && (
          <AIResults
            adviceData={adviceData}
            needs={aiNeeds}
            source={aiSource}
            allPlans={plans}
            onSelectPlan={(plan) => handleOpenCheckoutWithPlan(plan, aiNeeds?.desiredDomain || '')}
            onReset={handleResetAI}
          />
        )}

        {/* 4. Official Product Catalog (6 Plans - Section 4.1 & Section 0) */}
        <PlansCatalog
          plans={plans}
          addons={addons}
          onBuyPlan={(plan, selectedAddons) => handleOpenCheckoutWithPlan(plan, '', '.com', selectedAddons)}
        />

        {/* 5. Brand Domain Pricing & Interactive Search (Section 6) */}
        <DomainPricingSection
          domains={domains}
          plans={plans}
          onSelectDomainForCheckout={handleSelectDomainForCheckout}
        />

        {/* 6. Trust Badges & Reviews */}
        <TrustAndReviews />

        {/* 7. Đánh Giá Thực Tế Từ Khách Hàng & Form Gửi Đánh Giá */}
        <CustomerReviewsSection />

        {/* 8. Giải Đáp Thắc Mắc - Câu Hỏi Thường Gặp (FAQ) - Đặt gần cuối trang dưới phần gửi đánh giá */}
        <FaqSection />
      </main>

      {/* 9. Footer */}
      <Footer />

      {/* 8. Global Modals */}
      {/* Auth Modal (Login / Register) */}
      <AuthModal />

      {/* E-Commerce Checkout & VietQR Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={checkoutPlan}
        allPlans={plans}
        domains={domains}
        addons={addons}
        initialDomainName={checkoutDomainName}
        initialDomainExt={checkoutDomainExt}
        initialAddonIds={checkoutInitialAddonIds}
        onOrderCreated={(newOrder) => {
          // Keep modal open on success screen or view invoice
        }}
        onOpenInvoice={(order) => {
          setIsCheckoutOpen(false);
          setViewingInvoiceOrder(order);
        }}
      />

      {/* Electronic Invoice Modal */}
      <InvoiceModal
        order={viewingInvoiceOrder}
        onClose={() => setViewingInvoiceOrder(null)}
      />

      {/* Customer Orders Portal Modal */}
      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        onViewInvoice={(order) => {
          setViewingInvoiceOrder(order);
        }}
      />

      {/* Admin / Staff OMS Portal Modal */}
      <AdminOMSModal
        isOpen={isAdminOMSOpen}
        onClose={() => setIsAdminOMSOpen(false)}
        onViewInvoice={(order) => {
          setViewingInvoiceOrder(order);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
