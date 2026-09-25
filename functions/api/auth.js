export async function onRequest(context) {
  const clientId = context.env.GITHUB_CLIENT_ID;
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`;
  return Response.redirect(redirectUrl, 302);
}
