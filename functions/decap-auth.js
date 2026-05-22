function wantsPrivateRepo(env) {
  var value = env.GITHUB_REPO_PRIVATE;
  return value != null && String(value) !== "" && String(value) !== "0";
}

function oauthStateCookie(state) {
  return [
    "decap_oauth_state=" + encodeURIComponent(state),
    "Path=/decap-callback",
    "Max-Age=600",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!env.GITHUB_OAUTH_ID || !env.GITHUB_OAUTH_SECRET) {
    return new Response("Brak GITHUB_OAUTH_ID / GITHUB_OAUTH_SECRET dla Cyber Plus CMS.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const redirectUri = `${url.origin}/decap-callback`;
  const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(function (byte) {
      return byte.toString(16).padStart(2, "0");
    })
    .join("");

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_OAUTH_ID);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", wantsPrivateRepo(env) ? "repo user" : "public_repo user");
  authorize.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      "Set-Cookie": oauthStateCookie(state),
      "Cache-Control": "no-store",
    },
  });
}
