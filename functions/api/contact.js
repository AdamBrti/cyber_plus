/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Zmienne środowiskowe (Pages → Settings → Environment variables):
 * - RESEND_API_KEY (secret)
 * - MAIL_TO — docelowy adres (np. Outlook)
 * - MAIL_FROM (opcjonalnie) — np. "Cyber Plus <kontakt@cyber-plus.pl>" po weryfikacji domeny w Resend
 * - ALLOWED_ORIGINS (opcjonalnie) — np. "https://cyber-plus.pl,https://www.cyber-plus.pl" (dokładny Origin)
 */

var RESEND_URL = "https://api.resend.com/emails";
var MAX_NAME = 120;
var MAX_EMAIL = 200;
var MAX_MSG = 5000;

function jsonBody(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function basicEmailOk(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function safeSubjectName(name) {
  return String(name).replace(/[\r\n\u0000]+/g, " ").trim().slice(0, MAX_NAME);
}

export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  if (!env.RESEND_API_KEY || !env.MAIL_TO) {
    return jsonBody({ ok: false, error: "server_misconfigured" }, 503);
  }

  var data;
  try {
    data = await request.json();
  } catch (e) {
    return jsonBody({ ok: false, error: "invalid_json" }, 400);
  }

  /* Honeypot — wypełniony = bot; udajemy sukces */
  if (data._company && String(data._company).trim() !== "") {
    return jsonBody({ ok: true }, 200);
  }

  var name = String(data.name || "").trim();
  var email = String(data.email || "").trim();
  var message = String(data.message || "").trim();

  if (!name || name.length > MAX_NAME) return jsonBody({ ok: false, error: "validation" }, 400);
  if (!email || email.length > MAX_EMAIL || !basicEmailOk(email)) {
    return jsonBody({ ok: false, error: "validation" }, 400);
  }
  if (!message || message.length > MAX_MSG) return jsonBody({ ok: false, error: "validation" }, 400);

  if (env.ALLOWED_ORIGINS) {
    var origin = request.headers.get("Origin") || "";
    var list = String(env.ALLOWED_ORIGINS)
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    if (list.length && list.indexOf(origin) === -1) {
      return jsonBody({ ok: false, error: "forbidden" }, 403);
    }
  }

  var mailFrom = env.MAIL_FROM || "Cyber Plus <onboarding@resend.dev>";
  var subName = safeSubjectName(name);

  var payload = {
    from: mailFrom,
    to: [env.MAIL_TO],
    reply_to: email,
    subject: "Cyber Plus — wiadomość od " + subName,
    text: "Imię / firma: " + name + "\nE-mail zwrotny: " + email + "\n\n" + message,
    html:
      "<p><strong>Imię / firma:</strong> " +
      escapeHtml(name) +
      "</p><p><strong>E-mail:</strong> " +
      escapeHtml(email) +
      '</p><pre style="font-family:system-ui;white-space:pre-wrap">' +
      escapeHtml(message) +
      "</pre>",
  };

  var res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.RESEND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    var errText = await res.text();
    console.error("resend_http", res.status, errText);
    return jsonBody({ ok: false, error: "send_failed" }, 502);
  }

  return jsonBody({ ok: true }, 200);
}
