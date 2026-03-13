export async function onRequest(context) {
  const url = new URL(context.request.url);
  const apiUrl = new URL('https://api.txid.uk/.well-known/nostr.json');
  apiUrl.search = url.search;

  const response = await fetch(apiUrl.toString(), {
    headers: { 'Accept': 'application/json' },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store',
    },
  });
}
