function cookieValue(cookieHeader, name) {
  var parts = String(cookieHeader || "").split(";");
  for (var i = 0; i < parts.length; i += 1) {
    var pair = parts[i].trim();
    if (pair.indexOf(name + "=") === 0) {
      return decodeURIComponent(pair.slice(name.length + 1));
    }
  }
  return "";
}

function clearStateCookie() {
  return "decap_oauth_state=; Path=/decap-callback; Max-Age=0; HttpOnly; Secure; SameSite=Lax";
}

function callbackPage(accessToken, origin) {
  var token = JSON.stringify(accessToken);
  var targetOrigin = JSON.stringify(origin);
  var html =
    '<!doctype html><html lang="pl"><head><meta charset="utf-8" />' +
    "<title>Cyber Plus CMS - GitHub</title></head><body>" +
    "<p>Autoryzacja zakończona. Możesz zamknąć to okno.</p>" +
    "<script>(function(){" +
    "if(!window.opener){document.body.innerHTML='<p>Otwórz panel z /admin/.</p>';return;}" +
    "var token=" +
    token +
    ";" +
    "var targetOrigin=" +
    targetOrigin +
    ";" +
    "var receiveMessage=function(){" +
    "window.opener.postMessage('authorization:github:success:'+JSON.stringify({token:token}),targetOrigin);" +
    "window.removeEventListener('message',receiveMessage,false);" +
    "};" +
    "window.addEventListener('message',receiveMessage,false);" +
    "window.opener.postMessage('authorizing:github',targetOrigin);" +
    "})();</script></body></html>";

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": clearStateCookie(),
    },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = cookieValue(request.headers.get("Cookie"), "decap_oauth_state");

  if (!code) {
    return new Response("Brak parametru code.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (!env.GITHUB_OAUTH_ID || !env.GITHUB_OAUTH_SECRET) {
    return new Response("Brak zmiennych OAuth.", { status: 503 });
  }

  if (!state || !expectedState || state !== expectedState) {
    return new Response("Nieprawidłowy stan autoryzacji OAuth.", {
      status: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Set-Cookie": clearStateCookie(),
      },
    });
  }

  const redirectUri = `${url.origin}/decap-callback`;
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.GITHUB_OAUTH_ID,
      client_secret: env.GITHUB_OAUTH_SECRET,
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await tokenResponse.json().catch(function () {
    return {};
  });

  if (!data.access_token) {
    return new Response(JSON.stringify(data), {
      status: 401,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  return callbackPage(data.access_token, url.origin);
}
