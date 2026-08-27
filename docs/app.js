// ⚙️ CONFIGURA ESTO con tu usuario y nombre de repo de GitHub:
const GITHUB_OWNER = "TU_USUARIO";
const GITHUB_REPO = "TU_REPO";

document.getElementById("repo-sub").textContent = `${GITHUB_OWNER}/${GITHUB_REPO}`;
document.getElementById("new-post-link").href =
  `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new?template=schedule-post.yml`;

async function loadSchedule() {
  try {
    const res = await fetch(`data/schedule.json?t=${Date.now()}`);
    const data = await res.json();
    render(data);
  } catch (err) {
    console.error("No se pudo cargar schedule.json", err);
    render([]);
  }
}

function render(entries) {
  const queue = document.getElementById("queue");
  const emptyState = document.getElementById("empty-state");
  queue.innerHTML = "";

  if (!entries.length) {
    emptyState.hidden = false;
    updateCounts(entries);
    return;
  }
  emptyState.hidden = true;

  // más próximas primero
  const sorted = [...entries].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  for (const entry of sorted) {
    queue.appendChild(buildCard(entry));
  }
  updateCounts(entries);
}

function buildCard(entry) {
  const li = document.createElement("li");
  li.className = "post-card";

  const badge = document.createElement("span");
  badge.className = `platform-badge ${entry.platform}`;
  badge.textContent = entry.platform;

  const body = document.createElement("div");
  body.className = "post-body";
  const caption = document.createElement("p");
  caption.className = "caption";
  caption.textContent = entry.caption || "(sin texto)";
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `#${entry.issueNumber} · ${formatDate(entry.scheduledAt)}`;
  body.append(caption, meta);

  const status = document.createElement("span");
  status.className = `status-tag ${entry.status}`;
  status.textContent = labelFor(entry.status);

  li.append(badge, body, status);
  return li;
}

function labelFor(status) {
  return { pending: "Pendiente", posted: "Publicado", failed: "Error" }[status] || status;
}

function formatDate(iso) {
  if (!iso) return "sin fecha";
  const d = new Date(iso + "Z");
  return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function updateCounts(entries) {
  const count = (s) => entries.filter((e) => e.status === s).length;
  document.getElementById("count-pending").textContent = count("pending");
  document.getElementById("count-posted").textContent = count("posted");
  document.getElementById("count-failed").textContent = count("failed");
}

loadSchedule();
