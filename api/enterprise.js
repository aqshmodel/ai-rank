// Express Route Handler
// POST /api/enterprise — 法人お問い合わせを PostgreSQL に保存
//
// 設計は api/signup.js と同じセキュリティモデル:
//   - Origin / Referer allowlist
//   - Honeypot (hp)
//   - Per-IP rate limit (in-memory, per-instance)
//   - Strict field validation with max lengths
//   - PII-masked logging only

import { pool, dbEnabled } from "./_db.js";

const ALLOWED_ORIGINS = new Set([
  "https://ai-rank.aqsh.co.jp",
  "https://www.ai-rank.aqsh.co.jp",
  "http://localhost:4173",
  "http://localhost:3000",
  "http://localhost:5173",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_COMPANY = 200;
const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 2000;
const MAX_UA = 500;

const EMPLOYEE_COUNTS = new Set(["under_50", "50_300", "300_1000", "over_1000", "unspecified"]);
const BUDGET_RANGES   = new Set(["under_1m", "1_5m", "5_10m", "over_10m", "unspecified"]);
const TIMELINES       = new Set(["within_3m", "3_6m", "6_12m", "over_12m", "unspecified"]);
const INTERESTS       = new Set(["diagnosis_tool", "training", "consulting", "development", "other"]);
const CONSULT_PREFS   = new Set(["immediate", "later", "info_only"]);
const MAX_JOB_TITLE   = 100;

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 3;          // stricter than signup (enterprise inquiries should be rarer)
const ipHits = new Map();

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0].trim();
  if (typeof req.headers["x-real-ip"] === "string") return req.headers["x-real-ip"];
  return "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) { ipHits.set(ip, hits); return true; }
  hits.push(now); ipHits.set(ip, hits);
  if (ipHits.size > 500) {
    for (const [k, arr] of ipHits) {
      const fresh = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (fresh.length === 0) ipHits.delete(k); else ipHits.set(k, fresh);
    }
  }
  return false;
}

function clampStr(v, max) {
  if (typeof v !== "string") return "";
  const trimmed = v.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function pickEnum(v, set) {
  if (typeof v !== "string") return null;
  return set.has(v) ? v : null;
}

export default async function handler(req, res) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const referer = typeof req.headers.referer === "string" ? req.headers.referer : "";

  if (origin && ALLOWED_ORIGINS.has(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    console.warn("[AIRANK:enterprise:blocked_origin]", origin);
    return res.status(403).json({ error: "Origin not allowed" });
  }
  if (referer) {
    try {
      const url = new URL(referer);
      const refOrigin = `${url.protocol}//${url.host}`;
      if (!ALLOWED_ORIGINS.has(refOrigin)) {
        console.warn("[AIRANK:enterprise:blocked_referer]", refOrigin);
        return res.status(403).json({ error: "Referer not allowed" });
      }
    } catch (e) { /* malformed — ignore */ }
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    console.warn("[AIRANK:enterprise:rate_limited]", ip);
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const body = req.body || {};

    const hp = typeof body.hp === "string" ? body.hp.trim() : "";
    if (hp.length > 0) {
      console.warn("[AIRANK:enterprise:honeypot]", ip);
      return res.status(200).json({ ok: true });
    }

    const company = clampStr(body.company, MAX_COMPANY);
    const contact_name = clampStr(body.contact_name, MAX_NAME);
    const job_title = clampStr(body.job_title, MAX_JOB_TITLE);
    const email = clampStr(body.email, MAX_EMAIL);
    const message = clampStr(body.message, MAX_MESSAGE);
    const ua = clampStr(body.ua, MAX_UA);

    // interests: allow up to 5 enum values, drop anything else
    const rawInterests = Array.isArray(body.interests) ? body.interests : [];
    const interests = rawInterests
      .filter((v) => typeof v === "string" && INTERESTS.has(v))
      .slice(0, 5);

    if (!company) return res.status(400).json({ error: "company is required" });
    if (!contact_name) return res.status(400).json({ error: "contact_name is required" });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "valid email is required" });

    // Reject disposable domains for enterprise inquiries (even stricter than signup)
    const lowerEmail = email.toLowerCase();
    const domainPart = lowerEmail.split("@")[1] || "";
    const disposableDomains = new Set([
      "mailinator.com", "mailinator.net", "10minutemail.com", "20minutemail.com",
      "tempmail.com", "tempmail.org", "temp-mail.org", "temp-mail.io",
      "guerrillamail.com", "guerrillamail.net", "grr.la", "sharklasers.com",
      "yopmail.com", "throwaway.email", "trashmail.com", "fakeinbox.com",
      "getnada.com", "dropmail.me", "maildrop.cc", "moakt.com",
      "mailcatch.com", "harakirimail.com", "mohmal.com", "emailfake.com",
      "burnermail.io", "mail.tm",
    ]);
    if (disposableDomains.has(domainPart)) {
      console.warn("[AIRANK:enterprise:temp_mail]", domainPart);
      return res.status(400).json({ error: "ビジネス用のメールアドレスを入力してください" });
    }

    const record = {
      company,
      contact_name,
      job_title: job_title || null,
      email,
      employee_count: pickEnum(body.employee_count, EMPLOYEE_COUNTS),
      budget_range:   pickEnum(body.budget_range, BUDGET_RANGES),
      timeline:       pickEnum(body.timeline, TIMELINES),
      interests,
      consultation_pref: pickEnum(body.consultation_pref, CONSULT_PREFS),
      message: message || null,
      client_at: Number.isFinite(body.at) ? new Date(body.at).toISOString() : null,
      url: clampStr(body.url, 500),
      referrer: clampStr(body.referrer, 500),
      user_agent: ua,
      ip,
    };

    // PII-masked log line only
    const emailDomain = email.split("@")[1] || "";
    console.log("[AIRANK:enterprise]", JSON.stringify({
      at: new Date().toISOString(),
      email_domain: emailDomain,
      employee_count: record.employee_count,
      consultation_pref: record.consultation_pref,
      interests_n: record.interests.length,
      has_job_title: Boolean(record.job_title),
      has_message: Boolean(record.message),
      ip_present: Boolean(ip && ip !== "unknown"),
    }));

    if (dbEnabled) {
      // Let exceptions propagate to the outer catch so we return 5xx and the
      // client can retry. Swallowing here would ACK leads we failed to store.
      const query = `
        INSERT INTO enterprise_inquiries
        (company, contact_name, job_title, email, employee_count, budget_range, timeline, interests, consultation_pref, message, client_at, url, referrer, user_agent, ip)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `;
      const values = [
        record.company, record.contact_name, record.job_title, record.email, record.employee_count,
        record.budget_range, record.timeline, JSON.stringify(record.interests), record.consultation_pref,
        record.message, record.client_at, record.url, record.referrer, record.user_agent, record.ip
      ];
      try {
        await pool.query(query, values);
      } catch (error) {
        console.error("[AIRANK:enterprise:insert_failed]", error.message || error);
        return res.status(502).json({ error: "storage error" });
      }
    } else {
      console.warn("[AIRANK:enterprise:db_not_configured]");
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[AIRANK:enterprise:error]", err?.message || err);
    return res.status(500).json({ error: "internal error" });
  }
}
