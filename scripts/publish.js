import fs from "fs";
import { publishToFacebook } from "./platforms/facebook.js";
import { publishToInstagram } from "./platforms/instagram.js";
import { publishToTikTok } from "./platforms/tiktok.js";

const SCHEDULE_PATH = "docs/data/schedule.json";

const publishers = {
  facebook: publishToFacebook,
  instagram: publishToInstagram,
  tiktok: publishToTikTok,
};

async function main() {
  if (!fs.existsSync(SCHEDULE_PATH)) {
    console.log("No existe schedule.json todavía, nada que hacer.");
    return;
  }

  const schedule = JSON.parse(fs.readFileSync(SCHEDULE_PATH, "utf8") || "[]");
  const now = new Date();
  let changed = false;

  for (const entry of schedule) {
    if (entry.status !== "pending") continue;
    const due = new Date(entry.scheduledAt + "Z"); // se asume UTC
    if (due > now) continue;

    console.log(`Publicando issue #${entry.issueNumber} en ${entry.platform}...`);
    const publish = publishers[entry.platform];

    try {
      if (!publish) throw new Error(`Plataforma desconocida: ${entry.platform}`);
      const result = await publish(entry);
      entry.status = "posted";
      entry.postedAt = now.toISOString();
      entry.result = result;
      console.log(`✅ Publicado: ${entry.issueNumber}`);
    } catch (err) {
      entry.status = "failed";
      entry.error = String(err.message || err);
      console.error(`❌ Error en issue #${entry.issueNumber}: ${entry.error}`);
    }
    changed = true;

    // Comentar y cerrar el issue correspondiente
    await updateIssue(entry);
  }

  if (changed) {
    fs.writeFileSync(SCHEDULE_PATH, JSON.stringify(schedule, null, 2));
  } else {
    console.log("No hay publicaciones pendientes por ahora.");
  }
}

async function updateIssue(entry) {
  const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) return;

  const [owner, repo] = GITHUB_REPOSITORY.split("/");
  const base = `https://api.github.com/repos/${owner}/${repo}/issues/${entry.issueNumber}`;
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  const body =
    entry.status === "posted"
      ? `✅ Publicado exitosamente en **${entry.platform}**.`
      : `❌ Falló la publicación en **${entry.platform}**: ${entry.error}`;

  await fetch(`${base}/comments`, { method: "POST", headers, body: JSON.stringify({ body }) });
  await fetch(base, { method: "PATCH", headers, body: JSON.stringify({ state: "closed" }) });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
