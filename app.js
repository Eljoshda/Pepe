const giveawaysEl = document.getElementById('giveaways');
const f2pEl = document.getElementById('f2p');
const searchInput = document.getElementById('searchInput');
const platformFilter = document.getElementById('platformFilter');
const refreshBtn = document.getElementById('refreshBtn');
const cardTemplate = document.getElementById('cardTemplate');

let giveawaysData = [];
let f2pData = [];

// Proxy CORS alternativo para GitHub Pages
const viaProxy = (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`;

async function fetchJson(url) {
const res = await fetch(url);
if (!res.ok) throw new Error(`Error ${res.status}`);
return res.json();
}

function normalizePlatform(p = '') {
return p.toLowerCase();
}

function renderCards(container, list, type) {
container.innerHTML = '';
if (!list.length) {
container.innerHTML = '<p>No hay resultados con ese filtro.</p>';
return;
}

const frag = document.createDocumentFragment();

for (const item of list) {
const node = cardTemplate.content.cloneNode(true);
const img = node.querySelector('.thumb');
const title = node.querySelector('.title');
const meta = node.querySelector('.meta');
const desc = node.querySelector('.desc');
const link = node.querySelector('.link');

if (type === 'giveaway') {
img.src = item.thumbnail;
img.alt = item.title;
title.textContent = item.title;
meta.textContent = `${item.platforms} • Termina: ${item.end_date || 'N/A'}`;
desc.textContent = item.description;
link.href = item.open_giveaway_url;
link.textContent = 'Reclamar';
} else {
img.src = item.thumbnail;
img.alt = item.title;
title.textContent = item.title;
meta.textContent = `${item.genre} • ${item.platform}`;
desc.textContent = item.short_description;
link.href = item.game_url;
link.textContent = 'Jugar';
}

frag.appendChild(node);
}

container.appendChild(frag);
}

function filterData() {
const q = searchInput.value.trim().toLowerCase();
const platform = platformFilter.value;

const filteredGiveaways = giveawaysData.filter((g) => {
const t = `${g.title} ${g.description}`.toLowerCase();
const platformMatch =
platform === 'all' || normalizePlatform(g.platforms).includes(platform);
return t.includes(q) && platformMatch;
});

const filteredF2p = f2pData.filter((g) => {
const t = `${g.title} ${g.short_description}`.toLowerCase();
const platformText = normalizePlatform(g.platform);
const platformMatch =
platform === 'all' ||
platformText.includes(platform) ||
(platform === 'pc' && platformText.includes('windows'));
return t.includes(q) && platformMatch;
});

renderCards(giveawaysEl, filteredGiveaways, 'giveaway');
renderCards(f2pEl, filteredF2p, 'f2p');
}

async function loadData() {
giveawaysEl.innerHTML = '<p>Cargando giveaways…</p>';
f2pEl.innerHTML = '<p>Cargando juegos free-to-play…</p>';

try {
const [giveaways, f2p] = await Promise.all([
fetchJson(viaProxy('https://www.gamerpower.com/api/giveaways')),
fetchJson(viaProxy('https://www.freetogame.com/api/games')),
]);

giveawaysData = giveaways;
f2pData = f2p;
filterData();
} catch (err) {
console.error(err);
giveawaysEl.innerHTML = '<p>No se pudo cargar. Revisa conexión o CORS.</p>';
f2pEl.innerHTML = '<p>No se pudo cargar. Revisa conexión o CORS.</p>';
}
}

searchInput.addEventListener('input', filterData);
platformFilter.addEventListener('change', filterData);
refreshBtn.addEventListener('click', loadData);

if ('serviceWorker' in navigator) {
window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

loadData();
