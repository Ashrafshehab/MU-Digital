export async function onRequest(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  const clientId = context.env.GITHUB_CLIENT_ID;
  const clientSecret = context.env.GITHUB_CLIENT_SECRET;

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
    return new Response("فشل في استلام رمز الدخول من GitHub", { status: 400 });
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
