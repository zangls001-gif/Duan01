/**
 * Customer Reviews Module for Hosting & Domain Service
 * Handles customer reviews submission & rendering
 */

function renderCustomerReviews() {
  console.log('Chuẩn bị fetch dữ liệu từ Supabase và phân trang...');
  // TODO [Nhiệm vụ 4]: Sẽ tích hợp truy vấn Supabase client để lấy danh sách đánh giá thực tế và hiển thị phân trang
}

function initCustomerReviewsForm() {
  const form = document.getElementById('customer-review-form');
  if (!form) return;

  // Prevent multiple bindings
  if (form.getAttribute('data-listener-attached') === 'true') {
    return;
  }
  form.setAttribute('data-listener-attached', 'true');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const fullNameInput = document.getElementById('full_name');
    const websiteNameInput = document.getElementById('website_name');
    const servicePackageInput = document.getElementById('service_package');
    const ratingInput = document.getElementById('rating');
    const reviewContentInput = document.getElementById('review_content');
    const submitBtn = document.getElementById('submit-review-btn');
    const feedbackBox = document.getElementById('review-form-feedback');

    const full_name = fullNameInput ? fullNameInput.value.trim() : '';
    const website_name = websiteNameInput ? websiteNameInput.value.trim() : '';
    const service_package = servicePackageInput ? servicePackageInput.value : 'Gói Business Hosting';
    const rating = ratingInput ? parseInt(ratingInput.value, 10) : 5;
    const review_content = reviewContentInput ? reviewContentInput.value.trim() : '';

    // Validation
    if (!full_name || !review_content) {
      if (feedbackBox) {
        feedbackBox.className = 'mt-4 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700 flex items-center gap-2';
        feedbackBox.innerHTML = '<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>Vui lòng điền đầy đủ <strong>Họ và tên</strong> và <strong>Nhận xét thực tế</strong>.</span>';
        feedbackBox.classList.remove('hidden');
      }
      return;
    }

    // Prepare review payload
    const reviewData = {
      full_name,
      website_name,
      service_package,
      rating,
      review_content,
      created_at: new Date().toISOString()
    };

    // UI Loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('data-original-html', submitBtn.innerHTML);
      submitBtn.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Đang gửi đánh giá...';
    }

    // Gửi đánh giá lên API backend và Supabase
    console.log('Dữ liệu đánh giá thu thập được:', reviewData);

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const publishedReview = (data && data.review) ? data.review : reviewData;

        // Báo cho giao diện React cập nhật hiển thị ngay lập tức
        if (typeof window.addCustomerReview === 'function') {
          window.addCustomerReview(publishedReview);
        }
        window.dispatchEvent(new CustomEvent('new-customer-review', { detail: publishedReview }));

        // Show success feedback
        if (feedbackBox) {
          feedbackBox.className = 'mt-4 p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 animate-fadeIn';
          feedbackBox.innerHTML = '<svg class="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><div><p class="font-bold text-emerald-900">Gửi đánh giá thành công!</p><p class="mt-0.5 text-xs text-emerald-700">Cảm ơn bạn <strong>' + escapeHtml(full_name) + '</strong> đã chia sẻ trải nghiệm dịch vụ. Đánh giá đã được xuất bản và hiển thị ngay trên danh sách phía trên.</p></div>';
          feedbackBox.classList.remove('hidden');
        }

        // Reset form fields
        form.reset();
        if (servicePackageInput) servicePackageInput.value = 'Gói Business Hosting';
        if (ratingInput) ratingInput.value = '5';
      })
      .catch(function (err) {
        console.error('Lỗi gửi đánh giá:', err);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          const originalHtml = submitBtn.getAttribute('data-original-html');
          if (originalHtml) {
            submitBtn.innerHTML = originalHtml;
          } else {
            submitBtn.innerHTML = 'Gửi Đánh Giá Lên Hệ Thống';
          }
        }
      });
  });
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.innerText = string;
  return div.innerHTML;
}

// Expose globally
window.initCustomerReviewsForm = initCustomerReviewsForm;
window.renderCustomerReviews = renderCustomerReviews;

// Auto-run on load & when elements mount
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    renderCustomerReviews();
    initCustomerReviewsForm();
  });
} else {
  renderCustomerReviews();
  initCustomerReviewsForm();
}

// Keep checking in case of React SPA re-render/hydration
const observer = new MutationObserver(function () {
  const form = document.getElementById('customer-review-form');
  if (form && !form.getAttribute('data-listener-attached')) {
    initCustomerReviewsForm();
  }
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  window.addEventListener('DOMContentLoaded', function () {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
}
