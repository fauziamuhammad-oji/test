"use strict";

const CONFIG = {
    githubUsername: "fauziamuhammad-oji",
    sensorEndpoint: "",
    sensorPollMs: 5000,
    heartbeatTimeoutMs: 60000,
    maxSamples: 24
};

const galleryCategories = [
    { id: "iot", label: "IoT", title: "Internet of Things", accent: "#cba3ff", glow: "rgba(175, 114, 239, .27)", items: ["Suhu dalam ruang", "Kebun terhubung", "Jaringan sensor", "Data mengalir", "Ruang pintar", "Pemantauan udara", "Koneksi perangkat", "Ekosistem digital"] },
    { id: "embedded", label: "Embedded", title: "Embedded Systems", accent: "#ff9bd5", glow: "rgba(239, 113, 185, .25)", items: ["Papan kendali", "Mikrokontroler", "Sinyal digital", "Firmware lab", "Pin dan jalur", "Sistem tertanam", "Prototipe kecil", "Logika perangkat"] },
    { id: "hardware", label: "Hardware", title: "Hardware Lab", accent: "#f2c18e", glow: "rgba(227, 159, 100, .22)", items: ["Komponen inti", "Jalur tembaga", "Rangkaian sensor", "Power module", "Solder dan koneksi", "Tampilan TFT", "Papan eksperimen", "Ruang perakitan"] },
    { id: "networking", label: "Networking", title: "Network Studies", accent: "#9ed9ff", glow: "rgba(105, 183, 235, .23)", items: ["Topologi jaringan", "Node terhubung", "Jalur komunikasi", "Paket data", "Router dan switch", "Koneksi lokal", "Arsitektur jaringan", "Rute informasi"] },
    { id: "robotics", label: "Robotics", title: "Robotics Journal", accent: "#b5edc1", glow: "rgba(113, 204, 143, .2)", items: ["Robot penjelajah", "Sistem gerak", "Sensor jarak", "Roda dan rangka", "Kendali otomatis", "Robot pertanian", "Mesin terhubung", "Prototipe robot"] },
    { id: "community", label: "Komunitas", title: "Community Notes", accent: "#ffd3a8", glow: "rgba(235, 167, 108, .2)", items: ["Belajar bersama", "Ruang kolaborasi", "Cerita kegiatan", "Teman seperjalanan", "Momen kampus", "Berbagi gagasan", "Gerak komunitas", "Tumbuh bersama"] }
];

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const sensorSamples = [];
let sensorChart = null;
let sensorMode = "simulation";
let sensorRequest = null;
let sensorTimer = 0;
let activeArtwork = null;

function escapeXml(value) {
    return String(value).replace(/[<>&'"]/g, character => ({
        "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;"
    })[character]);
}

function categoryFor(id) {
    return galleryCategories.find(category => category.id === id);
}

function makeMotif(index, accent) {
    const stroke = `stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    if (index % 4 === 0) {
        return `<rect x="205" y="115" width="190" height="170" rx="25" ${stroke}/><rect x="248" y="157" width="104" height="86" rx="14" ${stroke}/><path d="M230 85v30m45-30v30m45-30v30m45-30v30m45-30v30M230 285v30m45-30v30m45-30v30m45-30v30m45-30v30M175 150h30m-30 48h30m-30 48h30m190-96h30m-30 48h30m-30 48h30" ${stroke}/><circle cx="300" cy="200" r="14" fill="${accent}"/>`;
    }
    if (index % 4 === 1) {
        return `<circle cx="300" cy="200" r="37" ${stroke}/><circle cx="165" cy="130" r="23" ${stroke}/><circle cx="435" cy="130" r="23" ${stroke}/><circle cx="165" cy="270" r="23" ${stroke}/><circle cx="435" cy="270" r="23" ${stroke}/><path d="m185 142 83 43m47 0 83-43m-213 112 83-43m47 0 83 43" ${stroke}/><circle cx="300" cy="200" r="10" fill="${accent}"/>`;
    }
    if (index % 4 === 2) {
        return `<rect x="228" y="88" width="144" height="224" rx="70" ${stroke}/><path d="M264 141h72m-72 36h72m-36 35v47m-66-71h-35m190 0h-35" ${stroke}/><circle cx="300" cy="141" r="12" fill="${accent}"/><path d="M300 216v34" ${stroke}/><circle cx="300" cy="266" r="11" fill="${accent}"/>`;
    }
    return `<path d="M225 165q0-62 75-62t75 62v78q0 44-75 44t-75-44z" ${stroke}/><circle cx="274" cy="185" r="10" fill="${accent}"/><circle cx="326" cy="185" r="10" fill="${accent}"/><path d="M276 225h48M300 102V72m-99 111h24m150 0h24M242 270l-29 29m145-29 29 29" ${stroke}/><path d="M278 247h44" ${stroke}/>`;
}

function artworkSvg(category, title, note, index, vintage = false) {
    const accent = category.accent;
    const background = vintage ? "#ead8bc" : "#171020";
    const ink = vintage ? "#453144" : "#f4eafa";
    const frame = vintage ? "#8b665d" : accent;
    const glow = vintage ? "#d4ae91" : category.glow;
    const motif = makeMotif(index, accent);
    const stamp = `${category.label.toUpperCase()} · VISUAL JOURNAL`;
    const paper = vintage
        ? `<rect width="1200" height="800" fill="#ead8bc"/><rect x="30" y="30" width="1140" height="740" rx="3" fill="none" stroke="#8b665d" stroke-width="3"/><rect x="45" y="45" width="1110" height="710" rx="2" fill="none" stroke="#a68472" stroke-width="1"/>`
        : `<rect width="1200" height="800" fill="${background}"/><circle cx="600" cy="330" r="290" fill="${glow}" opacity=".38"/><path d="M0 240h1200M0 420h1200M0 600h1200" stroke="${accent}" opacity=".07"/>`;
    const centralScale = vintage ? 1.2 : 1.65;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1600" viewBox="0 0 1200 800" role="img" aria-label="${escapeXml(title)} — ilustrasi portfolio">` +
        `<defs><radialGradient id="halo"><stop stop-color="${accent}" stop-opacity=".35"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs>${paper}` +
        `<text x="78" y="94" fill="${frame}" font-family="monospace" font-size="19" letter-spacing="4">${escapeXml(stamp)}</text>` +
        `<circle cx="600" cy="350" r="245" fill="url(#halo)"/>` +
        `<g transform="translate(600 350) scale(${centralScale}) translate(-300 -200)">${motif}</g>` +
        `<path d="M78 652h1044" stroke="${frame}" opacity=".45"/>` +
        `<text x="78" y="704" fill="${ink}" font-family="Georgia,serif" font-size="38">${escapeXml(title)}</text>` +
        `<text x="80" y="744" fill="${frame}" font-family="monospace" font-size="15" letter-spacing="1.5">${escapeXml(note)}</text>` +
        `<text x="1122" y="704" text-anchor="end" fill="${frame}" font-family="monospace" font-size="15">FAUZIA.IOT / ${String(index + 1).padStart(2, "0")}</text>` +
        `</svg>`;
}

function createCard(category, title, index) {
    const note = `Ilustrasi konsep ${title.toLowerCase()} — bukan dokumentasi foto asli.`;
    const card = document.createElement("article");
    card.className = "photo-card";
    card.style.setProperty("--art-glow", category.glow);
    card.style.setProperty("--art-line", category.accent);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "photo-open";
    button.setAttribute("aria-label", `Buka ilustrasi ${title}`);
    const preview = artworkSvg(category, title, note, index);
    const visual = document.createElement("div");
    visual.className = "photo-art";
    visual.innerHTML = preview.replace("<svg ", '<svg aria-hidden="true" ');
    visual.append(Object.assign(document.createElement("span"), { className: "photo-art-label", textContent: "ILUSTRASI · BUKAN FOTO ASLI" }));
    button.append(visual);

    const metadata = document.createElement("div");
    metadata.className = "photo-meta";
    const label = document.createElement("span");
    label.textContent = `${category.label} / ${String(index + 1).padStart(2, "0")}`;
    const heading = document.createElement("h3");
    heading.textContent = title;
    const description = document.createElement("p");
    description.textContent = note;
    metadata.append(label, heading, description);
    card.append(button, metadata);
    button.addEventListener("click", () => openArtwork(category, title, note, index));
    return card;
}

function renderGallery(categoryId = galleryCategories[0].id) {
    const category = categoryFor(categoryId);
    if (!category) throw new Error(`Kategori galeri tidak dikenal: ${categoryId}`);
    const gallery = $("#photoGallery");
    gallery.replaceChildren(...category.items.map((title, index) => createCard(category, title, index)));
    $$(".gallery-category").forEach(button => {
        const selected = button.dataset.category === categoryId;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
}

function setupGallery() {
    const categories = $("#galleryCategories");
    galleryCategories.forEach(category => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "gallery-category";
        button.dataset.category = category.id;
        button.textContent = category.label;
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => renderGallery(category.id));
        categories.append(button);
    });
    renderGallery();

    const dialog = $("#galleryDialog");
    $(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
        activeArtwork = null;
        $("#vintagePrint").replaceChildren();
    });
}

function openArtwork(category, title, note, index) {
    activeArtwork = { category, title, note, index };
    $("#galleryDialogCategory").textContent = `VISUAL JOURNAL · ${category.title.toUpperCase()}`;
    $("#galleryDialogTitle").textContent = title;
    $("#galleryDialogNote").textContent = note;
    $("#vintagePrint").innerHTML = artworkSvg(category, title, note, index, true);
    const download = $("#downloadArtwork");
    download.download = `fauzia-iot-${category.id}-${String(index + 1).padStart(2, "0")}.svg`;
    download.onclick = event => {
        event.preventDefault();
        if (!activeArtwork) return;
        const { category: selectedCategory, title: selectedTitle, note: selectedNote, index: selectedIndex } = activeArtwork;
        const image = artworkSvg(selectedCategory, selectedTitle, selectedNote, selectedIndex, true);
        const url = URL.createObjectURL(new Blob([image], { type: "image/svg+xml;charset=utf-8" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `fauzia-iot-${selectedCategory.id}-${String(selectedIndex + 1).padStart(2, "0")}.svg`;
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    $("#galleryDialog").showModal();
}

function updateClock() {
    const now = new Date();
    const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
    const date = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
    ["#liveClock", "#dashboardClock"].forEach(selector => {
        const element = $(selector);
        if (element) element.textContent = time;
    });
    ["#liveDate", "#dashboardDate"].forEach(selector => {
        const element = $(selector);
        if (element) element.textContent = date;
    });
}

function setupNavigation() {
    const header = $(".site-header");
    const menu = $("#menuToggle");
    const links = $("#navLinks");
    const progress = $("#pageProgress");
    const backTop = $("#backTopFloat");
    menu.addEventListener("click", () => {
        const opened = links.classList.toggle("is-open");
        menu.setAttribute("aria-expanded", String(opened));
        menu.setAttribute("aria-label", opened ? "Tutup navigasi" : "Buka navigasi");
    });
    links.addEventListener("click", event => {
        if (event.target.closest("a")) {
            links.classList.remove("is-open");
            menu.setAttribute("aria-expanded", "false");
            menu.setAttribute("aria-label", "Buka navigasi");
        }
    });
    let scheduled = false;
    const update = () => {
        scheduled = false;
        const available = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = `${available > 0 ? Math.min(100, window.scrollY / available * 100) : 0}%`;
        header.classList.toggle("is-scrolled", window.scrollY > 12);
        backTop.classList.toggle("is-visible", window.scrollY > 500);
    };
    window.addEventListener("scroll", () => {
        if (!scheduled) {
            scheduled = true;
            window.requestAnimationFrame(update);
        }
    }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" }));
}

function setupTheme() {
    const button = $("#themeToggle");
    const updateButton = () => {
        const isLight = document.body.classList.contains("light");
        button.setAttribute("aria-label", isLight ? "Aktifkan tema gelap" : "Aktifkan tema terang");
        button.innerHTML = `<span aria-hidden="true">${isLight ? "◐" : "☼"}</span>`;
    };
    try {
        if (localStorage.getItem("fauzia-theme") === "light") document.body.classList.add("light");
    } catch (error) {
        console.warn("Preferensi tema tidak dapat dibaca dari penyimpanan browser.", error);
    }
    updateButton();
    button.addEventListener("click", () => {
        document.body.classList.toggle("light");
        try {
            localStorage.setItem("fauzia-theme", document.body.classList.contains("light") ? "light" : "dark");
        } catch (error) {
            console.warn("Preferensi tema tidak dapat disimpan.", error);
        }
        updateButton();
        if (sensorChart) updateChartTheme();
    });
}

function setupTypewriter() {
    if (reducedMotion.matches) return;
    const target = $("#typewriter");
    const roles = ["IoT Engineering", "Embedded Systems", "Hardware Design", "Networking"];
    let roleIndex = 0;
    let characterIndex = roles[0].length;
    let deleting = true;
    const tick = () => {
        const role = roles[roleIndex];
        target.textContent = role.slice(0, characterIndex);
        let delay = deleting ? 45 : 85;
        if (deleting && characterIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 280;
        } else if (!deleting && characterIndex === roles[roleIndex].length) {
            deleting = true;
            delay = 1400;
        } else {
            characterIndex += deleting ? -1 : 1;
        }
        window.setTimeout(tick, delay);
    };
    window.setTimeout(tick, 1400);
}

function setupReveal() {
    const elements = $$(".reveal");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
        elements.forEach(element => element.classList.add("is-visible"));
        return;
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: .12 });
    elements.forEach(element => observer.observe(element));
}

function setupAmbientCanvas() {
    const canvas = $("#ambientCanvas");
    const context = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let points = [];
    let animationFrame = 0;
    let previousFrame = 0;
    const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const count = Math.min(42, Math.max(14, Math.round(width / 32)));
        points = Array.from({ length: count }, () => ({
            x: Math.random() * width, y: Math.random() * height,
            speed: .08 + Math.random() * .18, radius: .5 + Math.random() * 1.1
        }));
        draw(0);
    };
    const draw = delta => {
        context.clearRect(0, 0, width, height);
        points.forEach((point, index) => {
            point.y -= point.speed * Math.min(delta, 35);
            if (point.y < -5) point.y = height + 5;
            context.beginPath();
            context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
            context.fillStyle = "rgba(203,163,255,.58)";
            context.fill();
            for (let next = index + 1; next < points.length; next += 1) {
                const other = points[next];
                const distance = Math.hypot(point.x - other.x, point.y - other.y);
                if (distance > 105) continue;
                context.beginPath();
                context.moveTo(point.x, point.y);
                context.lineTo(other.x, other.y);
                context.strokeStyle = `rgba(255,155,213,${(1 - distance / 105) * .1})`;
                context.lineWidth = .6;
                context.stroke();
            }
        });
    };
    const animate = time => {
        if (time - previousFrame > 32) {
            draw(previousFrame ? time - previousFrame : 32);
            previousFrame = time;
        }
        animationFrame = window.requestAnimationFrame(animate);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
        window.cancelAnimationFrame(animationFrame);
        if (!document.hidden && !reducedMotion.matches) {
            previousFrame = 0;
            animationFrame = window.requestAnimationFrame(animate);
        }
    });
    if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate);
}

function formatReading(value, digits = 1) {
    return Number(value).toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function updateSensorCards(temperature, humidity) {
    $("#sensorTemperature").innerHTML = `${formatReading(temperature)}<small>°C</small>`;
    $("#sensorHumidity").innerHTML = `${formatReading(humidity, 0)}<small>%</small>`;
}

function addSample(temperature, humidity, timestamp = new Date()) {
    sensorSamples.push({ temperature, humidity, timestamp });
    if (sensorSamples.length > CONFIG.maxSamples) sensorSamples.shift();
    updateSensorCards(temperature, humidity);
    $("#sensorUpdated").textContent = `Pembaruan ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(timestamp)}`;
    $("#sampleCount").textContent = `${sensorSamples.length} sampel`;
    $("#sensorStats").textContent = `Suhu ${formatReading(temperature)} °C · Kelembapan ${formatReading(humidity, 0)}%`;
    if (sensorChart) {
        sensorChart.data.labels = sensorSamples.map(sample => new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(sample.timestamp));
        sensorChart.data.datasets[0].data = sensorSamples.map(sample => sample.temperature);
        sensorChart.data.datasets[1].data = sensorSamples.map(sample => sample.humidity);
        sensorChart.update("none");
    }
}

function updateChartTheme() {
    if (!sensorChart) return;
    const color = document.body.classList.contains("light") ? "#5e5265" : "#b0a3b9";
    sensorChart.options.scales.x.ticks.color = color;
    sensorChart.options.scales.y.ticks.color = color;
    sensorChart.options.scales.y1.ticks.color = color;
    sensorChart.options.scales.x.grid.color = document.body.classList.contains("light") ? "rgba(70,50,80,.09)" : "rgba(220,190,240,.08)";
    sensorChart.update();
}

function setupChart() {
    if (!window.Chart) {
        $("#chartFallback").hidden = false;
        $("#sensorChart").hidden = true;
        return;
    }
    const context = $("#sensorChart").getContext("2d");
    sensorChart = new Chart(context, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                { label: "Suhu (°C)", data: [], borderColor: "#ff9bd5", backgroundColor: "rgba(255,155,213,.1)", yAxisID: "y", tension: .38, pointRadius: 2, fill: true },
                { label: "Kelembapan (%)", data: [], borderColor: "#cba3ff", backgroundColor: "rgba(203,163,255,.06)", yAxisID: "y1", tension: .38, pointRadius: 2, fill: false }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: "#b0a3b9", maxTicksLimit: 6 }, grid: { color: "rgba(220,190,240,.08)" } },
                y: { position: "left", ticks: { color: "#b0a3b9" }, grid: { color: "rgba(220,190,240,.08)" } },
                y1: { position: "right", min: 0, max: 100, ticks: { color: "#b0a3b9" }, grid: { drawOnChartArea: false } }
            }
        }
    });
    updateChartTheme();
}

function showUnavailable(message) {
    $("#dataModeLabel").textContent = "PERANGKAT NYATA · TIDAK TERHUBUNG";
    $("#sensorTemperature").innerHTML = "--<small>°C</small>";
    $("#sensorHumidity").innerHTML = "--<small>%</small>";
    $("#sensorUpdated").textContent = "Data sensor belum tersedia";
    $("#sampleCount").textContent = "0 sampel";
    $("#sensorStats").textContent = "Tidak ada pembacaan nyata";
    $("#deviceMessage").textContent = message;
    sensorSamples.length = 0;
    if (sensorChart) {
        sensorChart.data.labels = [];
        sensorChart.data.datasets.forEach(dataset => { dataset.data = []; });
        sensorChart.update();
    }
}

async function pollRealSensor() {
    if (!CONFIG.sensorEndpoint) {
        showUnavailable("Endpoint sensor nyata belum dikonfigurasi. Tidak ada data simulasi yang ditampilkan pada mode ini.");
        return;
    }
    sensorRequest?.abort();
    sensorRequest = new AbortController();
    try {
        const response = await fetch(CONFIG.sensorEndpoint, { cache: "no-store", signal: sensorRequest.signal });
        if (!response.ok) throw new Error(`Endpoint sensor merespons ${response.status}.`);
        const payload = await response.json();
        const temperature = Number(payload.temperature);
        const humidity = Number(payload.humidity);
        const timestamp = new Date(payload.timestamp || payload.heartbeat || "");
        const age = Date.now() - timestamp.getTime();
        if (!Number.isFinite(temperature) || !Number.isFinite(humidity) ||
            temperature < -80 || temperature > 100 || humidity < 0 || humidity > 100 ||
            !Number.isFinite(age) || age > CONFIG.heartbeatTimeoutMs || age < -5000) {
            throw new Error("Data sensor tidak valid atau heartbeat sudah kedaluwarsa.");
        }
        $("#dataModeLabel").textContent = "PERANGKAT NYATA · TERHUBUNG";
        $("#deviceMessage").textContent = "Menampilkan pembacaan suhu dan kelembapan dari endpoint sensor yang dikonfigurasi.";
        addSample(temperature, humidity, timestamp);
    } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Gagal membaca endpoint sensor.", error);
        showUnavailable("Pembacaan sensor nyata gagal divalidasi. Periksa koneksi, format JSON, CORS, dan timestamp endpoint.");
    }
}

function setSensorMode(mode) {
    sensorMode = mode;
    $$("[data-mode]").forEach(button => {
        const selected = button.dataset.mode === mode;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
    window.clearInterval(sensorTimer);
    sensorRequest?.abort();
    sensorSamples.length = 0;
    if (sensorChart) {
        sensorChart.data.labels = [];
        sensorChart.data.datasets.forEach(dataset => { dataset.data = []; });
        sensorChart.update();
    }
    if (mode === "real") {
        pollRealSensor();
        sensorTimer = window.setInterval(pollRealSensor, CONFIG.sensorPollMs);
        return;
    }
    $("#dataModeLabel").textContent = "SIMULASI · BUKAN SENSOR NYATA";
    $("#deviceMessage").textContent = "Demo menghasilkan nilai contoh di browser. Mode perangkat nyata tetap kosong sampai endpoint milik Anda dikonfigurasi di script.js.";
    const tick = () => {
        if (sensorMode !== "simulation") return;
        const last = sensorSamples.at(-1);
        const temperature = last ? Math.min(29.8, Math.max(25, last.temperature + (Math.random() - .5) * 1.2)) : 27.4 + Math.random() * 1.2;
        const humidity = last ? Math.min(75, Math.max(45, last.humidity + (Math.random() - .5) * 5)) : 58 + Math.random() * 8;
        addSample(temperature, humidity);
    };
    tick();
    sensorTimer = window.setInterval(tick, CONFIG.sensorPollMs);
}

function setupSensor() {
    setupChart();
    $$("[data-mode]").forEach(button => button.addEventListener("click", () => setSensorMode(button.dataset.mode)));
    setSensorMode("simulation");
}

async function loadRepositories() {
    const grid = $("#githubGrid");
    try {
        const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=6`, {
            headers: { Accept: "application/vnd.github+json" }
        });
        if (!response.ok) throw new Error(`GitHub API merespons ${response.status}.`);
        const repositories = await response.json();
        const visible = repositories.filter(repository => !repository.fork).slice(0, 6);
        if (!visible.length) {
            grid.innerHTML = '<p class="empty-state">Belum ada repository publik yang ditampilkan.</p>';
            return;
        }
        grid.replaceChildren(...visible.map(repository => {
            const card = document.createElement("article");
            card.className = "github-card";
            const name = document.createElement("h3");
            const link = document.createElement("a");
            link.href = repository.html_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = repository.name;
            name.append(link);
            const description = document.createElement("p");
            description.textContent = repository.description || "Repository publik Muhammad Fauzia.";
            const meta = document.createElement("div");
            meta.className = "github-meta";
            const language = document.createElement("span");
            language.textContent = repository.language || "Eksperimen";
            const stars = document.createElement("span");
            stars.textContent = `★ ${repository.stargazers_count}`;
            meta.append(language, stars);
            card.append(name, description, meta);
            return card;
        }));
    } catch (error) {
        console.error("Repository GitHub tidak dapat dimuat.", error);
        grid.innerHTML = '<p class="empty-state">Repository publik belum dapat dimuat. Kunjungi profil GitHub untuk melihat pembaruan.</p>';
    }
}

function setupContactForm() {
    $("#contactForm").addEventListener("submit", event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const subject = encodeURIComponent(`Pesan portofolio dari ${form.get("name")}`);
        const body = encodeURIComponent(`Nama: ${form.get("name")}\nEmail: ${form.get("email")}\n\n${form.get("message")}`);
        window.location.href = `mailto:muhammadfauzia0704@gmail.com?subject=${subject}&body=${body}`;
    });
}

function initialize() {
    updateClock();
    window.setInterval(updateClock, 1000);
    setupNavigation();
    setupTheme();
    setupTypewriter();
    setupReveal();
    setupGallery();
    setupAmbientCanvas();
    setupSensor();
    setupContactForm();
    loadRepositories();
}

initialize();
