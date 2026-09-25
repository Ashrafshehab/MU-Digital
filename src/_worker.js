export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. رابط بدء تسجيل الدخول
    if (url.pathname === "/api/auth") {
      const clientId = env.GITHUB_CLIENT_ID;
      const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`;
      return Response.redirect(redirectUrl, 302);
    }

    // 2. رابط استقبال الرمز من GitHub
    if (url.pathname === "/api/callback") {
      const code = url.searchParams.get("code");
      const clientId = env.GITHUB_CLIENT_ID;
      const clientSecret = env.GITHUB_CLIENT_SECRET;

      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      });

      const result = await response.json();
      const token = result.access_token;

      if (!token) {
        return new Response("فشل استلام رمز الدخول من GitHub", { status: 400 });
      }

      const content = `
        <script>
          const token = "${token}";
          const provider = "github";
          if (window.opener) {
            window.opener.postMessage(
              "authorization:github:success:" + JSON.stringify({ token, provider }),
              window.location.origin
            );
            window.close();
          }
        </script>
      `;

      return new Response(content, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    // 3. عرض بقية ملفات الموقع بشكل طبيعي
    return env.ASSETS.fetch(request);
  }
};
