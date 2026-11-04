import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const DEFAULT_SUPABASE_URL = 'https://ktovjbetgforctvxfxny.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b3ZqYmV0Z2ZvcmN0dnhmeG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjI2MDMsImV4cCI6MjA5NjkzODYwM30.i4u8v37qRDZMyOWeqJl6vcJj2MqrIzqszUZSGZsazNA';
const DEFAULT_REST_ENDPOINT = 'https://ktovjbetgforctvxfxny.supabase.co/rest/v1/';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'secret-vibe-key-2026';
const DB_FILE = path.resolve(__dirname, 'db.json');

const PAYMENT_CONFIG = {
  bankId: 'MB',
  accountNo: '0988123456',
  accountName: 'HOSTING ADVISOR CORP'
};

app.use(cors());
app.use(express.json());

// Initialize Gemini Client
function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Database Helpers
async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    throw err;
  }
}

async function writeDB(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Supabase Helpers
async function getSupabaseConfigData() {
  const db = await readDB();
  const url = process.env.SUPABASE_URL || db.supabase_config?.url || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || db.supabase_config?.anonKey || DEFAULT_SUPABASE_ANON_KEY;
  return {
    url: url.replace(/\/+$/, ''),
    restEndpoint: `${url.replace(/\/+$/, '')}/rest/v1/`,
    anonKey: anonKey.trim(),
    syncEnabled: db.supabase_config?.syncEnabled ?? true,
    lastTestedAt: db.supabase_config?.lastTestedAt || null,
    db
  };
}

async function testSupabaseConnection(url: string, anonKey: string) {
  const cleanUrl = url.replace(/\/+$/, '');
  const restEndpoint = `${cleanUrl}/rest/v1/`;

  if (!anonKey) {
    return {
      ok: false,
      connected: false,
      url: cleanUrl,
      restEndpoint,
      hasKey: false,
      status: 'missing_key',
      message: 'Chưa cấu hình API Key (SUPABASE_ANON_KEY). Cần có apikey để truy cập Supabase REST API.',
      hint: 'Bạn có thể nhập SUPABASE_ANON_KEY trực tiếp trong Cổng Quản Trị OMS hoặc bổ sung vào biến môi trường.'
    };
  }

  try {
    // 1. First probe known public tables with anon key (users, photos, trips, etc.)
    const candidateTables = ['users', 'photos', 'trips', 'orders', 'plans', 'profiles'];
    const accessibleTables: string[] = [];

    const headers = {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`
    };

    // Test orders table first as it is the primary target for transactions
    const probeRes = await fetch(`${restEndpoint}orders?limit=1`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(6000)
    });

    if (probeRes.status === 200 || probeRes.status === 206) {
      accessibleTables.push('orders');
      // Probe other candidate tables concurrently
      await Promise.all(
        ['photos', 'trips', 'orders', 'plans'].map(async (tbl) => {
          try {
            const check = await fetch(`${restEndpoint}${tbl}?limit=1`, {
              method: 'GET',
              headers,
              signal: AbortSignal.timeout(3000)
            });
            if (check.status === 200 || check.status === 206) {
              accessibleTables.push(tbl);
            }
          } catch {}
        })
      );

      return {
        ok: true,
        connected: true,
        url: cleanUrl,
        restEndpoint,
        hasKey: true,
        status: 'connected',
        message: `Đã kết nối thành công tới Supabase REST API! Tìm thấy các bảng: ${accessibleTables.join(', ')}`,
        tables: Array.from(new Set(accessibleTables)),
        lastTestedAt: new Date().toISOString()
      };
    }

    // 2. If users gave an error, inspect status
    const errData = await probeRes.json().catch(() => ({}));

    // If PostgREST says table not found, but key is valid, test other tables
    if (probeRes.status === 404 && errData.code === 'PGRST205') {
      const photosRes = await fetch(`${restEndpoint}photos?limit=1`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(4000)
      });
      if (photosRes.ok) {
        return {
          ok: true,
          connected: true,
          url: cleanUrl,
          restEndpoint,
          hasKey: true,
          status: 'connected',
          message: 'Đã kết nối thành công tới Supabase REST API! Đang liên kết với cơ sở dữ liệu cloud.',
          tables: ['photos'],
          lastTestedAt: new Date().toISOString()
        };
      }
    }

    if (probeRes.status === 401) {
      return {
        ok: false,
        connected: false,
        url: cleanUrl,
        restEndpoint,
        hasKey: true,
        status: 'unauthorized',
        message: errData.message || 'Mã API key không hợp lệ hoặc đã hết hạn (Mã 401)',
        hint: errData.hint || 'Vui lòng kiểm tra lại tính chính xác của SUPABASE_ANON_KEY.'
      };
    }

    return {
      ok: false,
      connected: false,
      url: cleanUrl,
      restEndpoint,
      hasKey: true,
      status: 'error',
      message: errData.message || `Lỗi phản hồi HTTP ${probeRes.status}`,
      hint: errData.hint || ''
    };
  } catch (err: any) {
    return {
      ok: false,
      connected: false,
      url: cleanUrl,
      restEndpoint,
      hasKey: true,
      status: 'network_error',
      message: 'Không thể gửi yêu cầu tới Supabase: ' + err.message
    };
  }
}

async function syncOrderToSupabase(order: any) {
  try {
    const { url, anonKey, syncEnabled } = await getSupabaseConfigData();
    if (!syncEnabled) {
      console.log(`[Supabase Sync] Bỏ qua vì tính năng đồng bộ đang tắt (syncEnabled: false)`);
      return { ok: false, error: 'Đồng bộ Supabase đang tắt trong cấu hình' };
    }
    if (!anonKey) {
      console.warn(`[Supabase Sync Cảnh Báo] Chưa cấu hình API Key (SUPABASE_ANON_KEY)`);
      return { ok: false, error: 'Chưa cấu hình Supabase API Key' };
    }

    const client = createClient(url, anonKey, { auth: { persistSession: false } });

    // Payload tương thích chuẩn bảng orders trên Supabase
    const payload = {
      id: String(order.id),
      customer_id: String(order.customerId || 'guest'),
      customer_name: String(order.customerName || 'Khách hàng'),
      phone: String(order.phone || ''),
      email: String(order.email || ''),
      plan_chosen: String(order.planChosen || ''),
      plan_name: String(order.planName || ''),
      total_amount: Number(order.totalAmount || 0),
      payment_status: String(order.paymentStatus || 'paid_processing'),
      status: String(order.status || 'paid_processing'),
      billing_cycle_months: Number(order.billingCycleMonths || 12),
      domain_name: String(order.domainName || ''),
      created_at: order.createdAt || new Date().toISOString(),
      updated_at: order.updatedAt || new Date().toISOString()
    };

    console.log(`[Supabase Sync] Đang gửi thông tin đơn ${order.id} tới Supabase...`);

    const { data, error } = await client
      .from('orders')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) {
      console.error(`[Supabase Sync Lỗi]:`, error.message, error.details || error.hint || '');
      return { ok: false, error: error.message };
    }

    console.log(`[Supabase Sync Thành Công] Đã lưu thông tin đơn ${order.id} vào bảng 'orders' của Supabase!`, data);
    return { ok: true, data };
  } catch (err: any) {
    console.error(`[Supabase Sync Ngoại Lệ]:`, err.message);
    return { ok: false, error: err.message };
  }
}

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    fullName: string;
    phone?: string;
    email?: string;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, error: 'Vui lòng đăng nhập để tiếp tục' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ ok: false, error: 'Phiên làm việc hết hạn hoặc không hợp lệ' });
    req.user = user;
    next();
  });
}

// Middleware xác thực tùy chọn (Không bắt buộc đăng nhập để đơn hàng có thể đặt nhanh và gửi ngay tới Supabase)
function optionalAuthenticateToken(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  });
}

function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'Bạn không có quyền thực hiện thao tác này' });
    }
    next();
  };
}

// ================== API SUPABASE CLOUD ==================
app.get('/api/supabase/status', async (_req: Request, res: Response) => {
  try {
    const config = await getSupabaseConfigData();
    const result = await testSupabaseConnection(config.url, config.anonKey);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi kiểm tra Supabase: ' + err.message });
  }
});

app.post('/api/supabase/config', authenticateToken, authorizeRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { url, anonKey, syncEnabled } = req.body;
    const db = await readDB();
    if (!db.supabase_config) {
      db.supabase_config = {};
    }
    if (url) db.supabase_config.url = url.trim();
    if (anonKey !== undefined) db.supabase_config.anonKey = anonKey.trim();
    if (syncEnabled !== undefined) db.supabase_config.syncEnabled = Boolean(syncEnabled);

    const targetUrl = db.supabase_config.url || DEFAULT_SUPABASE_URL;
    const targetKey = db.supabase_config.anonKey || '';

    const testRes = await testSupabaseConnection(targetUrl, targetKey);
    db.supabase_config.status = testRes.connected ? 'connected' : (testRes.hasKey ? 'error' : 'pending_key');
    db.supabase_config.lastTestedAt = new Date().toISOString();

    await writeDB(db);
    res.json({ ok: true, config: db.supabase_config, test: testRes });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi lưu cấu hình: ' + err.message });
  }
});

app.post('/api/supabase/sync', authenticateToken, authorizeRoles('admin', 'staff'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const { url, anonKey } = await getSupabaseConfigData();
    if (!anonKey) {
      return res.status(400).json({ ok: false, error: 'Chưa cấu hình SUPABASE_ANON_KEY để đồng bộ' });
    }
    const db = await readDB();
    const client = createClient(url, anonKey, { auth: { persistSession: false } });

    // Sync plans
    let syncedPlans = 0;
    try {
      const { error: planErr } = await client.from('plans').upsert(
        db.plans.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          price_per_month: p.pricePerMonth,
          storage: p.storage,
          bandwidth: p.bandwidth,
          recommended_visits: p.recommendedVisits,
          free_domain: p.freeDomain
        }))
      );
      if (!planErr) syncedPlans = db.plans.length;
    } catch (e) {
      // Table may not exist yet in Supabase
    }

    // Sync orders
    let syncedOrders = 0;
    try {
      const { error: orderErr } = await client.from('orders').upsert(
        db.orders.map((o: any) => ({
          id: o.id,
          customer_id: o.customerId,
          customer_name: o.customerName,
          phone: o.phone,
          email: o.email,
          plan_chosen: o.planChosen,
          plan_name: o.planName,
          total_amount: o.totalAmount,
          payment_status: o.paymentStatus,
          status: o.status,
          billing_cycle_months: orderErr ? 12 : o.billingCycleMonths,
          domain_name: o.domainName,
          created_at: o.createdAt,
          updated_at: o.updatedAt
        }))
      );
      if (!orderErr) syncedOrders = db.orders.length;
    } catch (e) {
      // Table may not exist yet in Supabase
    }

    res.json({
      ok: true,
      message: 'Đã hoàn tất kiểm tra và đồng bộ với Supabase',
      syncedPlans,
      syncedOrders
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi đồng bộ: ' + err.message });
  }
});

// Proxy query to read rows from any accessible Supabase table
app.get('/api/supabase/table/:tableName', async (req: Request, res: Response) => {
  try {
    const { tableName } = req.params;
    const { url, anonKey } = await getSupabaseConfigData();
    if (!anonKey) {
      return res.status(400).json({ ok: false, error: 'Chưa có API key' });
    }

    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await client.from(tableName).select('*').limit(50);

    if (error) {
      return res.status(400).json({ ok: false, error: error.message });
    }

    res.json({ ok: true, table: tableName, count: data?.length || 0, data });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi truy vấn table: ' + err.message });
  }
});

// ================== API DATA ==================
app.get('/api/data', async (_req: Request, res: Response) => {
  try {
    const db = await readDB();
    res.json({
      ok: true,
      plans: db.plans,
      domain_pricing: db.domain_pricing,
      addons: db.addons,
      coupons: db.coupons
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Không thể đọc dữ liệu: ' + err.message });
  }
});

// ================== API CUSTOMER REVIEWS ==================
app.get('/api/reviews', async (_req: Request, res: Response) => {
  try {
    const db = await readDB();
    res.json({ ok: true, reviews: db.customer_reviews || [] });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi lấy đánh giá: ' + err.message });
  }
});

app.post('/api/reviews', async (req: Request, res: Response) => {
  try {
    const { full_name, website_name, service_package, rating, review_content } = req.body || {};
    if (!full_name || !review_content) {
      return res.status(400).json({ ok: false, error: 'Vui lòng điền đủ Họ và tên và Nhận xét' });
    }

    const db = await readDB();
    if (!db.customer_reviews) db.customer_reviews = [];

    const newReview = {
      id: req.body.id || `rev_${Date.now()}`,
      full_name: String(full_name).trim(),
      website_name: String(website_name || '').trim(),
      service_package: String(service_package || 'Gói Business Hosting').trim(),
      rating: Number(rating) || 5,
      review_content: String(review_content).trim(),
      created_at: req.body.created_at || new Date().toISOString()
    };

    db.customer_reviews.unshift(newReview);
    await writeDB(db);

    // Sync to Supabase table if available
    try {
      const { url, anonKey, syncEnabled } = await getSupabaseConfigData();
      if (syncEnabled && anonKey) {
        const client = createClient(url, anonKey, { auth: { persistSession: false } });
        await client.from('reviews').insert([newReview]);
      }
    } catch {}

    res.status(201).json({ ok: true, review: newReview });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi gửi đánh giá: ' + err.message });
  }
});

// ================== API AUTH & USERS ==================
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, phone, email } = req.body;
    if (!username || !password || !fullName || !phone) {
      return res.status(400).json({ ok: false, error: 'Vui lòng điền đủ họ tên, tên đăng nhập, mật khẩu và SĐT' });
    }

    const phoneRegex = /^(0|\+84)\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({ ok: false, error: 'Số điện thoại không hợp lệ (cần 10 chữ số, vd: 0988123456)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Mật khẩu phải từ 6 ký tự trở lên' });
    }

    const db = await readDB();
    if (db.users.some((u: any) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      return res.status(409).json({ ok: false, error: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác' });
    }

    const newUser = {
      id: 'usr_cust_' + Date.now(),
      username: username.trim(),
      password: password, // Storing demo password in local db.json
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDB(db);

    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      ok: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email
      }
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi đăng ký: ' + err.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const db = await readDB();
    const user = db.users.find(
      (u: any) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone || '',
        email: user.email || ''
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone || '',
        email: user.email || ''
      }
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi đăng nhập: ' + err.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ ok: true, user: req.user });
});

// ================== API COUPONS ==================
app.post('/api/coupons/validate', async (req: Request, res: Response) => {
  try {
    const { code, rawTotal } = req.body;
    if (!code) return res.status(400).json({ ok: false, error: 'Chưa nhập mã giảm giá' });

    const total = Number(rawTotal) || 0;
    const db = await readDB();
    const coupon = db.coupons.find(
      (c: any) => c.code.toUpperCase() === code.trim().toUpperCase()
    );

    if (!coupon) {
      return res.status(404).json({ ok: false, error: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
    }

    let discountAmount = 0;
    if (coupon.type === 'percent') {
      discountAmount = Math.round((total * coupon.value) / 100);
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, total);
    }

    res.json({
      ok: true,
      code: coupon.code,
      description: coupon.description,
      discountAmount,
      finalTotal: Math.max(0, total - discountAmount)
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi kiểm tra mã: ' + err.message });
  }
});

// ================== API ORDERS & THANH TOÁN VIETQR ==================
// ================== API ORDERS & THANH TOÁN VIETQR ==================
app.post('/api/orders', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      planChosen,
      desiredDomain,
      domainExtension,
      billingCycleMonths,
      selectedAddons,
      couponCode,
      needs,
      aiReason,
      aiDomainAdvice,
      customerName: bodyCustomerName,
      phone: bodyPhone,
      email: bodyEmail,
      notes: bodyNotes,
      isConsultation
    } = req.body;

    const db = await readDB();
    const planInfo = db.plans.find((p: any) => p.id === planChosen);
    if (!planInfo) return res.status(400).json({ ok: false, error: 'Gói hosting không hợp lệ' });

    const cycle = parseInt(billingCycleMonths, 10) || 12;
    let discountCycle = 0;
    if (cycle === 24) discountCycle = 0.1;
    if (cycle === 36) discountCycle = 0.2;

    const rawHostingPrice = planInfo.pricePerMonth * cycle;
    const hostingPrice = Math.round(rawHostingPrice * (1 - discountCycle));

    let domainPrice = 0;
    let isDomainFree = false;
    let finalDomainName = '';

    if (desiredDomain && domainExtension) {
      finalDomainName = `${desiredDomain.trim().toLowerCase()}${domainExtension}`;
      const extInfo = db.domain_pricing.find((d: any) => d.extension === domainExtension);
      const extPrice = extInfo ? extInfo.price : 280000;
      if (planInfo.freeDomain && ['.com', '.vn'].includes(domainExtension)) {
        isDomainFree = true;
        domainPrice = 0;
      } else {
        domainPrice = extPrice;
      }
    }

    // Tính tiền Add-ons
    let addonsTotal = 0;
    const chosenAddons: any[] = [];
    if (Array.isArray(selectedAddons)) {
      for (const addonId of selectedAddons) {
        const addon = db.addons.find((a: any) => a.id === addonId);
        if (addon) {
          const itemPrice = addon.billingType === 'monthly' ? addon.price * cycle : addon.price;
          addonsTotal += itemPrice;
          chosenAddons.push({ id: addon.id, name: addon.name, price: itemPrice });
        }
      }
    }

    const subTotal = hostingPrice + domainPrice + addonsTotal;

    // Áp dụng mã coupon nếu có
    let discountAmount = 0;
    let finalCoupon: string | null = null;
    if (couponCode) {
      const coupon = db.coupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
      if (coupon) {
        finalCoupon = coupon.code;
        if (coupon.type === 'percent') discountAmount = Math.round((subTotal * coupon.value) / 100);
        else if (coupon.type === 'fixed') discountAmount = Math.min(coupon.value, subTotal);
      }
    }

    const totalAmount = Math.max(0, subTotal - discountAmount);
    const orderCount = db.orders.length + 1;
    const orderId = `ORD-2026-${String(orderCount).padStart(3, '0')}`;

    const qrUrl = `https://img.vietqr.io/image/${PAYMENT_CONFIG.bankId}-${PAYMENT_CONFIG.accountNo}-compact2.png?amount=${totalAmount}&addInfo=${orderId}&accountName=${encodeURIComponent(PAYMENT_CONFIG.accountName)}`;

    // Thông tin khách hàng (ưu tiên thông tin từ form hoặc từ token đã đăng nhập)
    const customerId = req.user?.id || `guest_${Date.now()}`;
    const customerName = (bodyCustomerName || req.user?.fullName || 'Khách hàng').trim();
    const phone = (bodyPhone || req.user?.phone || '0988123456').trim();
    const email = (bodyEmail || req.user?.email || 'khachhang@example.com').trim();
    const creatorUsername = req.user?.username || 'khach_hang';

    const newOrder = {
      id: orderId,
      customerId,
      customerName,
      phone,
      email,
      planChosen,
      planName: planInfo.name,
      planPrice: planInfo.pricePerMonth,
      domainName: finalDomainName,
      domainExtension: domainExtension || '',
      domainPrice,
      isDomainFree,
      billingCycleMonths: cycle,
      addons: chosenAddons,
      couponApplied: finalCoupon,
      discountAmount,
      subTotal,
      totalAmount,
      qrUrl,
      paymentMethod: isConsultation ? 'Tư Vấn Trực Tiếp' : 'vietqr',
      paymentStatus: isConsultation ? 'consultation' : 'unpaid',
      status: isConsultation ? 'consultation_requested' : 'pending_payment',
      assignedTo: null,
      assignedToName: 'Chưa phân công',
      serviceDetails: null,
      needs: needs || null,
      aiReason: aiReason || '',
      aiDomainAdvice: aiDomainAdvice || '',
      notes: bodyNotes || '',
      timeline: [
        {
          action: isConsultation
            ? `Khách hàng gửi yêu cầu tư vấn gói ${planInfo.name} (SĐT: ${phone}). ${bodyNotes ? 'Ghi chú: ' + bodyNotes : ''}`
            : 'Khách hàng tạo đơn mua hàng, chờ thanh toán VietQR',
          by: creatorUsername,
          time: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);
    await writeDB(db);

    // Đồng bộ ngay lập tức lên Supabase (không chặn nếu Supabase lỗi)
    const supabaseSync = await syncOrderToSupabase(newOrder);

    res.status(201).json({ ok: true, order: newOrder, supabaseSync });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ ok: false, error: 'Lỗi máy chủ khi tạo đơn hàng: ' + err.message });
  }
});

// Khách ấn xác nhận đã chuyển khoản -> Cập nhật trạng thái và đồng bộ ngay lập tức tới Supabase
app.post('/api/orders/:id/confirm-payment', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    const order = db.orders.find((o: any) => o.id === id);

    if (!order) return res.status(404).json({ ok: false, error: 'Không tìm thấy đơn hàng' });

    order.status = 'paid_processing';
    order.paymentStatus = 'paid_processing';
    order.timeline.push({
      action: 'Khách hàng xác nhận đã chuyển khoản VietQR, đang chờ duyệt tiền',
      by: req.user?.username || 'khach_hang',
      time: new Date().toISOString()
    });
    order.updatedAt = new Date().toISOString();

    await writeDB(db);

    // Đồng bộ trạng thái đã thanh toán ngay lập tức lên bảng orders của Supabase
    const supabaseSync = await syncOrderToSupabase(order);

    res.json({ ok: true, order, supabaseSync });
  } catch (err: any) {
    console.error('Lỗi khi xác nhận thanh toán & đồng bộ Supabase:', err);
    res.status(500).json({ ok: false, error: 'Lỗi cập nhật: ' + err.message });
  }
});

// API thủ công kích hoạt đồng bộ đơn hàng bất kỳ lên Supabase
app.post('/api/orders/:id/sync-supabase', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    const order = db.orders.find((o: any) => o.id === id);
    if (!order) return res.status(404).json({ ok: false, error: 'Không tìm thấy đơn hàng' });

    const supabaseSync = await syncOrderToSupabase(order);
    res.json({ ok: true, orderId: id, supabaseSync });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi đồng bộ Supabase: ' + err.message });
  }
});

// Khách xem danh sách đơn của mình
app.get('/api/orders/my-orders', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await readDB();
    const myOrders = db.orders.filter((o: any) => o.customerId === req.user!.id);
    res.json({ ok: true, orders: myOrders });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi lấy đơn hàng: ' + err.message });
  }
});

// Admin & Staff xem toàn bộ đơn hàng
app.get('/api/orders', authenticateToken, authorizeRoles('admin', 'staff'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await readDB();
    res.json({ ok: true, orders: db.orders });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi lấy danh sách đơn: ' + err.message });
  }
});

// Admin & Staff duyệt thanh toán / cập nhật trạng thái
app.patch('/api/orders/:id', authenticateToken, authorizeRoles('admin', 'staff'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo } = req.body;
    const db = await readDB();
    const order = db.orders.find((o: any) => o.id === id);

    if (!order) return res.status(404).json({ ok: false, error: 'Không tìm thấy đơn hàng' });

    if (status) {
      order.status = status;
      if (status === 'completed') {
        order.paymentStatus = 'paid';
        order.serviceDetails = {
          hostingIp: '103.145.62.' + Math.floor(Math.random() * 200 + 10),
          nameServers: ['ns1.hostingadvisor.vn', 'ns2.hostingadvisor.vn'],
          expireDate: new Date(Date.now() + (order.billingCycleMonths || 12) * 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        order.timeline.push({
          action: `Xác nhận nhận đủ ${order.totalAmount.toLocaleString('vi-VN')}đ & Kích hoạt gói dịch vụ`,
          by: req.user!.username,
          time: new Date().toISOString()
        });
      } else {
        order.timeline.push({
          action: `Cập nhật trạng thái đơn: ${status}`,
          by: req.user!.username,
          time: new Date().toISOString()
        });
      }
    }

    if (notes !== undefined) order.notes = notes;

    if (assignedTo !== undefined && req.user!.role === 'admin') {
      const staff = db.users.find((u: any) => u.id === assignedTo);
      order.assignedTo = assignedTo;
      order.assignedToName = staff ? staff.fullName : 'Chưa phân công';
      order.timeline.push({
        action: `Phân công đơn cho: ${order.assignedToName}`,
        by: req.user!.username,
        time: new Date().toISOString()
      });
    }

    order.updatedAt = new Date().toISOString();
    await writeDB(db);
    syncOrderToSupabase(order).catch(() => {});
    res.json({ ok: true, order });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi cập nhật đơn: ' + err.message });
  }
});

// Xóa đơn (Chỉ Admin)
app.delete('/api/orders/:id', authenticateToken, authorizeRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    const before = db.orders.length;
    db.orders = db.orders.filter((o: any) => o.id !== id);

    if (db.orders.length === before) {
      return res.status(404).json({ ok: false, error: 'Không tìm thấy đơn hàng' });
    }

    await writeDB(db);
    res.json({ ok: true, message: 'Đã xóa đơn hàng thành công' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi xóa đơn: ' + err.message });
  }
});

// Helper for Smart Rule-Based Plan Recommendation Fallback
function getRuleBasedRecommendation(plans: any[], needs: any) {
  const { siteType, traffic, budget, needDomain, desiredDomain, brandName } = needs || {};

  // Scoring function
  let bestPlanId = 'basic';
  let budgetPlanId = 'starter';
  let growthPlanId = 'business';

  if (siteType === 'ban-hang' || siteType === 'thuong-mai') {
    bestPlanId = traffic === '50k-150k' || traffic === 'tren-150k' ? 'vps-1' : (traffic === '10k-50k' ? 'business' : 'shop-pro');
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
  } else {
    // Default
    bestPlanId = 'basic';
    budgetPlanId = 'starter';
    growthPlanId = 'business';
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

  const bestPlan = plans.find(p => p.id === bestPlanId) || plans[1];
  const budgetPlan = plans.find(p => p.id === budgetPlanId && p.id !== bestPlanId) || plans[0];
  const growthPlan = plans.find(p => p.id === growthPlanId && p.id !== bestPlanId && p.id !== budgetPlanId) || plans[3];

  let domainAdvice = '';
  const domainOrBrand = desiredDomain || brandName;
  if (needDomain) {
    if (domainOrBrand) {
      domainAdvice = `Với thương hiệu "${domainOrBrand}", chúng tôi khuyên bạn nên đăng ký đuôi tên miền .vn hoặc .com.vn để khẳng định uy tín tại Việt Nam, kết hợp giữ thêm .com để bảo hộ thương hiệu toàn cầu.`;
    } else {
      domainAdvice = 'Bạn nên lựa chọn tên miền ngắn gọn, dễ nhớ, mang đậm dấu ấn thương hiệu và ưu tiên đuôi .vn hoặc .com.';
    }
  } else {
    domainAdvice = 'Nếu bạn đã có tên miền, hệ thống sẽ cung cấp cặp NameServer (ns1.hostingadvisor.vn, ns2.hostingadvisor.vn) để bạn trỏ về hosting chỉ trong 5 phút.';
  }

  return {
    best: {
      planId: bestPlan.id,
      category: 'Gói phù hợp nhất',
      reason: `Gói ${bestPlan.name} (${bestPlan.storage}, ${bestPlan.bandwidth}) đáp ứng hoàn hảo nhu cầu vận hành ${siteType || 'website'} với lưu lượng truy cập dự kiến.`
    },
    alternatives: [
      {
        planId: budgetPlan.id,
        category: 'Gói tiết kiệm',
        reason: `Gói ${budgetPlan.name} với chi phí tối ưu ${budgetPlan.pricePerMonth.toLocaleString('vi-VN')}đ/tháng, rất thích hợp để bắt đầu thử nghiệm.`
      },
      {
        planId: growthPlan.id,
        category: 'Gói cho nhu cầu phát triển',
        reason: `Gói ${growthPlan.name} sở hữu cấu hình mạnh mẽ (${growthPlan.storage}, ${growthPlan.features.slice(0, 2).join(', ')}), sẵn sàng cho quy mô mở rộng.`
      }
    ],
    domainAdvice
  };
}

// ================== API PROXY AI GEMINI ==================
app.post('/api/advice', async (req: Request, res: Response) => {
  try {
    const { needs } = req.body || {};
    const db = await readDB();
    const plans = db.plans;
    const planIds = plans.map((p: any) => p.id);

    // Rule-based fallback generated first
    const fallbackResult = getRuleBasedRecommendation(plans, needs);

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        ok: true,
        source: 'rule-engine',
        data: fallbackResult
      });
    }

    const plansContext = plans.map((p: any) =>
      `- ID: "${p.id}", Tên: ${p.name}, Loại: ${p.type}, Giá: ${p.pricePerMonth}đ/tháng, Ổ cứng: ${p.storage}, Băng thông: ${p.bandwidth}, Lượt truy cập: ${p.recommendedVisits}/tháng, Tặng tên miền: ${p.freeDomain ? 'Có' : 'Không'}, Điểm nổi bật: ${p.features.join(', ')}, Giới hạn: ${p.limitations}`
    ).join('\n');

    const systemPrompt = `Bạn là Chuyên gia Tư vấn Cấp cao về Hạ tầng Hosting và Tên miền của HostingAdvisor.
Nhiệm vụ của bạn là phân tích nhu cầu của khách hàng và đề xuất CHÍNH XÁC 3 gói dịch vụ TỐT NHẤT từ danh sách BẢNG GIÁ DỊCH VỤ DƯỚI ĐÂY:
${plansContext}

QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG tự tạo thêm gói dịch vụ mới, KHÔNG bịa giá, chỉ được dùng đúng planId có trong danh sách: ${JSON.stringify(planIds)}.
2. Đề xuất gồm 3 gói:
   - 1 gói "best" (Gói phù hợp nhất với nhu cầu hiện tại)
   - 2 gói "alternatives":
     + Gói thứ nhất là "Gói tiết kiệm" (chi phí thấp hơn để khởi đầu)
     + Gói thứ hai là "Gói dành cho nhu cầu phát triển" (cấu hình cao hơn sẵn sàng mở rộng)
3. Cung cấp lý do cụ thể, thuyết phục, bám sát thông số kỹ thuật thực tế của gói và nhu cầu người dùng.
4. Kèm theo tư vấn tên miền "domainAdvice" bằng tiếng Việt súc tích, chuyên nghiệp.`;

    const userMessage = `Khách hàng cung cấp thông tin nhu cầu:
- Loại website: ${needs?.siteType || 'Chưa xác định'}
- Lượng truy cập dự kiến: ${needs?.traffic || 'Chưa xác định'}
- Ngân sách dự kiến: ${needs?.budget ? needs.budget + 'đ/tháng' : 'Linh hoạt'}
- Nhu cầu tên miền: ${needs?.needDomain ? 'Cần đăng ký tên miền mới' : 'Đã có tên miền'}
- Tên miền mong muốn: ${needs?.desiredDomain || 'Chưa nhập'}
- Yêu cầu bổ sung: ${needs?.notes || 'Không có'}`;

    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${systemPrompt}\n\n${userMessage}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              best: {
                type: Type.OBJECT,
                properties: {
                  planId: { type: Type.STRING },
                  category: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ['planId', 'category', 'reason']
              },
              alternatives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    planId: { type: Type.STRING },
                    category: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ['planId', 'category', 'reason']
                }
              },
              domainAdvice: { type: Type.STRING }
            },
            required: ['best', 'alternatives', 'domainAdvice']
          }
        }
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out')), 6000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const text = response?.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json({
          ok: true,
          source: 'gemini-ai',
          data: parsed
        });
      }
    } catch (aiErr) {
      console.warn('Gemini call failed or timed out, using rule-based recommendation fallback:', aiErr);
    }

    // Return rule-based fallback if Gemini failed
    return res.json({
      ok: true,
      source: 'rule-engine',
      data: fallbackResult
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi phân tích: ' + err.message });
  }
});

// AI Telesale Script Endpoint
app.post('/api/advice/sales-script', authenticateToken, authorizeRoles('admin', 'staff'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    const db = await readDB();
    const order = db.orders.find((o: any) => o.id === orderId);
    if (!order) return res.status(404).json({ ok: false, error: 'Không tìm thấy đơn hàng' });

    const fallbackScript = `Bước 1 (Chào hỏi & Xác nhận): "Dạ em chào anh/chị ${order.customerName}, em gọi từ HostingAdvisor hỗ trợ kích hoạt gói ${order.planName} và tên miền ${order.domainName || 'website'} của mình ạ."
Bước 2 (Tư vấn giá trị & Hỗ trợ): "Dạ đơn hàng của mình có tổng thanh toán là ${order.totalAmount.toLocaleString('vi-VN')}đ, em thấy trạng thái hiện tại là ${order.status === 'pending_payment' ? 'chờ chuyển khoản' : 'đang xử lý'}. Không biết anh/chị có gặp khó khăn gì khi quét mã VietQR không để em hỗ trợ trực tiếp ạ?"
Bước 3 (Chốt & Kích hoạt): "Sau khi nhận được tiền, bên em sẽ tự động bàn giao thông số máy chủ IP và kích hoạt chứng chỉ SSL miễn phí ngay cho anh/chị trong 5 phút nhé ạ!"`;

    const ai = getAiClient();
    if (!ai) {
      return res.json({ ok: true, source: 'template', script: fallbackScript });
    }

    const prompt = `Soạn kịch bản gọi điện chốt đơn ngắn gọn 3 bước cho nhân viên bán hàng:
- Khách hàng: ${order.customerName} (SĐT: ${order.phone})
- Gói chọn: ${order.planName}, Tên miền: ${order.domainName || 'Không có'}
- Tổng tiền: ${order.totalAmount.toLocaleString('vi-VN')}đ (chu kỳ ${order.billingCycleMonths} tháng)
- Add-ons: ${order.addons && order.addons.length ? order.addons.map((a: any) => a.name).join(', ') : 'Không có'}
- Trạng thái: ${order.status}
Yêu cầu: Viết chính xác 3 bước (Chào hỏi & Xác nhận, Tư vấn & Giải đáp, Chốt thanh toán) súc tích, văn phong tiếng Việt tự nhiên, tôn trọng khách hàng.`;

    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Telesale script timed out')), 6000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const script = response?.text || fallbackScript;
      return res.json({ ok: true, source: 'gemini-ai', script });
    } catch (e) {
      return res.json({ ok: true, source: 'template', script: fallbackScript });
    }
  } catch (err: any) {
    res.status(500).json({ ok: false, error: 'Lỗi tạo kịch bản: ' + err.message });
  }
});

// Setup Vite Dev Server Middleware or Static Build Serve
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server thương mại điện tử HostingAdvisor đang chạy trên port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
