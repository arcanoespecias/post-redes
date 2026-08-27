// Publica en una Página de Facebook usando la Graph API.
// Requiere: FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN (token de página, no de usuario)
export async function publishToFacebook(entry) {
  const { FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN } = process.env;
  if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
    throw new Error("Faltan FB_PAGE_ID o FB_PAGE_ACCESS_TOKEN en los Secrets.");
  }

  const isVideo = /\.(mp4|mov)$/i.test(entry.mediaUrl);
  const endpoint = isVideo
    ? `https://graph-video.facebook.com/v20.0/${FB_PAGE_ID}/videos`
    : `https://graph.facebook.com/v20.0/${FB_PAGE_ID}/photos`;

  const params = new URLSearchParams({
    access_token: FB_PAGE_ACCESS_TOKEN,
    caption: entry.caption,
    [isVideo ? "file_url" : "url"]: entry.mediaUrl,
  });

  const res = await fetch(endpoint, { method: "POST", body: params });
  const data = await res.json();
  if (!res.ok) throw new Error(`Facebook API error: ${JSON.stringify(data)}`);
  return data;
}
