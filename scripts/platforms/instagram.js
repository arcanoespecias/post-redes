// Publica en una cuenta de Instagram Business/Creator vinculada a una Página de FB.
// Requiere: IG_BUSINESS_ACCOUNT_ID, IG_ACCESS_TOKEN
// Proceso de dos pasos: 1) crear contenedor de media, 2) publicarlo.
export async function publishToInstagram(entry) {
  const { IG_BUSINESS_ACCOUNT_ID, IG_ACCESS_TOKEN } = process.env;
  if (!IG_BUSINESS_ACCOUNT_ID || !IG_ACCESS_TOKEN) {
    throw new Error("Faltan IG_BUSINESS_ACCOUNT_ID o IG_ACCESS_TOKEN en los Secrets.");
  }

  const isVideo = /\.(mp4|mov)$/i.test(entry.mediaUrl);
  const base = `https://graph.facebook.com/v20.0/${IG_BUSINESS_ACCOUNT_ID}`;

  // Paso 1: crear el contenedor
  const containerParams = new URLSearchParams({
    access_token: IG_ACCESS_TOKEN,
    caption: entry.caption,
    [isVideo ? "video_url" : "image_url"]: entry.mediaUrl,
    ...(isVideo ? { media_type: "REELS" } : {}),
  });

  const containerRes = await fetch(`${base}/media`, { method: "POST", body: containerParams });
  const containerData = await containerRes.json();
  if (!containerRes.ok) throw new Error(`Instagram (crear media) error: ${JSON.stringify(containerData)}`);

  // Los videos tardan en procesarse; esperamos antes de publicar.
  if (isVideo) await waitUntilReady(containerData.id, IG_ACCESS_TOKEN);

  // Paso 2: publicar
  const publishParams = new URLSearchParams({
    access_token: IG_ACCESS_TOKEN,
    creation_id: containerData.id,
  });
  const publishRes = await fetch(`${base}/media_publish`, { method: "POST", body: publishParams });
  const publishData = await publishRes.json();
  if (!publishRes.ok) throw new Error(`Instagram (publicar) error: ${JSON.stringify(publishData)}`);
  return publishData;
}

async function waitUntilReady(containerId, token, attempts = 10) {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${containerId}?fields=status_code&access_token=${token}`
    );
    const data = await res.json();
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") throw new Error("Instagram: el procesamiento del video falló.");
    await new Promise((r) => setTimeout(r, 10000));
  }
  throw new Error("Instagram: tiempo de espera agotado procesando el video.");
}
