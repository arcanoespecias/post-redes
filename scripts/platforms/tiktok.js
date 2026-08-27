// Publica video en TikTok usando la Content Posting API.
// Requiere: TIKTOK_ACCESS_TOKEN
// NOTA IMPORTANTE: mientras tu app de TikTok esté en modo "sandbox"/sin auditar,
// solo podrás publicar como borrador privado, no público. La publicación pública
// real requiere que TikTok apruebe tu app (proceso de revisión manual).
export async function publishToTikTok(entry) {
  const { TIKTOK_ACCESS_TOKEN } = process.env;
  if (!TIKTOK_ACCESS_TOKEN) {
    throw new Error("Falta TIKTOK_ACCESS_TOKEN en los Secrets.");
  }

  // Paso 1: iniciar el envío indicando que TikTok debe descargar el video desde una URL
  const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TIKTOK_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_info: {
        title: entry.caption,
        privacy_level: "SELF_ONLY", // cambia a PUBLIC_TO_EVERYONE cuando tu app esté aprobada
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: entry.mediaUrl,
      },
    }),
  });

  const initData = await initRes.json();
  if (!initRes.ok || initData.error?.code !== "ok") {
    throw new Error(`TikTok API error: ${JSON.stringify(initData)}`);
  }
  return initData;
}
