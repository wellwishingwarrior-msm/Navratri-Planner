const state = {
  events: [],
  filtered: [],
  map: null,
  markers: [],
  userLocation: null
};

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await loadEvents();
});

async function loadEvents() {
  try {
    const response = await fetch("data/navratri-events.json");
    state.events = await response.json();
    populateCities();
    render();
    initMap();
    updateHeroStats();
  } catch (error) {
    console.error(error);
    showToast("Could not load event data.");
  }
}

function bindEvents() {
  ["searchInput","dateFilter","budgetFilter","vibeFilter","citySelect"].forEach(id => {
    $(id).addEventListener("input", render);
    $(id).addEventListener("change", render);
  });

  $("resetBtn").addEventListener("click", resetFilters);
  $("emptyReset").addEventListener("click", resetFilters);
  $("planBtn").addEventListener("click", () => {
    document.querySelector(".section").scrollIntoView({ behavior: "smooth" });
    render();
  });
  $("generatePlan").addEventListener("click", generatePlan);
  $("useLocationBtn").addEventListener("click", useLocation);
  $("modalClose").addEventListener("click", closeModal);
  $("detailsModal").addEventListener("click", (e) => {
    if (e.target.id === "detailsModal") closeModal();
  });

  document.querySelectorAll(".quick-pills button").forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      if (filter === "free") $("budgetFilter").value = "Free";
      if (filter === "family") $("vibeFilter").value = "Family";
      if (filter === "traditional") $("vibeFilter").value = "Traditional";
      if (filter === "parking") window.__quickParking = true;
      if (filter === "food") window.__quickFood = true;
      render();
    });
  });
}

function populateCities() {
  const cities = [...new Set(state.events.map(e => e.city))].sort();
  $("citySelect").innerHTML = `<option value="All">All cities</option>` +
    cities.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function matchesFilters(event) {
  const q = $("searchInput").value.trim().toLowerCase();
  const city = $("citySelect").value;
  const date = $("dateFilter").value;
  const budget = $("budgetFilter").value;
  const vibe = $("vibeFilter").value;

  const haystack = [event.name, event.city, event.area, event.venue, event.description, ...(event.tags || [])].join(" ").toLowerCase();
  if (q && !haystack.includes(q)) return false;
  if (city !== "All" && event.city !== city) return false;
  if (date !== "All" && event.date !== date) return false;
  if (vibe !== "All" && !(event.vibes || []).includes(vibe)) return false;
  if (budget === "Free" && event.price !== 0) return false;
  if (budget === "Under 500" && event.price >= 500) return false;
  if (budget === "500-1000" && (event.price < 500 || event.price > 1000)) return false;
  if (window.__quickParking && !event.parking) return false;
  if (window.__quickFood && !event.foodNearby) return false;
  return true;
}

function render() {
  state.filtered = state.events.filter(matchesFilters);
  $("resultCount").textContent = `${state.filtered.length} event${state.filtered.length === 1 ? "" : "s"}`;
  $("eventGrid").innerHTML = state.filtered.map(eventCard).join("");
  $("emptyState").classList.toggle("hidden", state.filtered.length !== 0);

  document.querySelectorAll("[data-details]").forEach(btn => {
    btn.addEventListener("click", () => openDetails(btn.dataset.details));
  });
  document.querySelectorAll("[data-share]").forEach(btn => {
    btn.addEventListener("click", () => shareEvent(btn.dataset.share));
  });
  updateMap();
}

function eventCard(event) {
  const dateLabel = formatDate(event.date);
  const price = event.price === 0 ? "Free" : `₹${event.price.toLocaleString("en-IN")}`;
  return `
    <article class="event-card">
      <div class="event-banner">
        <span class="date-chip">${dateLabel} • ${event.startTime}</span>
      </div>
      <div class="event-body">
        <h3>${escapeHtml(event.name)}</h3>
        <div class="location">📍 ${escapeHtml(event.area)}, ${escapeHtml(event.city)}</div>
        <div class="tags">
          ${(event.vibes || []).slice(0,3).map(v => `<span class="tag">${escapeHtml(v)}</span>`).join("")}
          ${event.parking ? `<span class="tag">Parking</span>` : ""}
          ${event.foodNearby ? `<span class="tag">Food nearby</span>` : ""}
        </div>
        <div class="card-bottom">
          <div class="price">${price}</div>
          <div class="card-actions">
            <button class="small-btn" data-details="${event.id}">Details</button>
            <button class="small-btn primary" data-share="${event.id}">Share</button>
          </div>
        </div>
      </div>
    </article>`;
}

function initMap() {
  state.map = L.map("map", { scrollWheelZoom: false }).setView([21.17, 72.83], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(state.map);
  updateMap();
}

function updateMap() {
  if (!state.map) return;
  state.markers.forEach(m => m.remove());
  state.markers = [];
  const bounds = [];

  state.filtered.forEach(event => {
    const marker = L.marker([event.lat, event.lng]).addTo(state.map);
    marker.bindPopup(`<strong>${escapeHtml(event.name)}</strong><br>${escapeHtml(event.area)}<br>${escapeHtml(formatDate(event.date))} • ${escapeHtml(event.startTime)}`);
    state.markers.push(marker);
    bounds.push([event.lat, event.lng]);
  });

  if (bounds.length) state.map.fitBounds(bounds, { padding: [30,30], maxZoom: 13 });
}

function updateHeroStats() {
  $("heroEvents").textContent = state.events.length;
  $("heroCities").textContent = new Set(state.events.map(e => e.city)).size;
}

function generatePlan() {
  const group = $("groupFilter").value;
  const budgetValue = $("planBudget").value;
  const vibe = $("planVibe").value;
  const parking = $("needParking").checked;

  let candidates = state.events.filter(e => {
    const budgetOk = budgetValue === "Free" ? e.price === 0 : e.price <= Number(budgetValue);
    const vibeOk = (e.vibes || []).includes(vibe) || (group === "Family" && (e.vibes || []).includes("Family"));
    const parkingOk = !parking || e.parking;
    return budgetOk && vibeOk && parkingOk;
  });

  if (!candidates.length) {
    candidates = state.events.filter(e => {
      const budgetOk = budgetValue === "Free" ? e.price === 0 : e.price <= Number(budgetValue);
      return budgetOk;
    });
  }

  if (!candidates.length) {
    $("planResult").innerHTML = `<div class="plan-placeholder"><div class="big-icon">🪔</div><h3>No demo event matches</h3><p>Try a higher budget or a different vibe.</p></div>`;
    return;
  }

  const event = candidates[0];
  const price = event.price === 0 ? "Free entry" : `₹${event.price.toLocaleString("en-IN")} entry`;
  const plan = `
    <div class="plan-output">
      <span class="match-label">YOUR MATCH</span>
      <h3>${escapeHtml(event.name)}</h3>
      <p class="location">📍 ${escapeHtml(event.area)}, ${escapeHtml(event.city)} • ${formatDate(event.date)}</p>
      <div class="plan-card">
        <div class="big-price">${price}</div>
        <div class="plan-timeline">
          <div class="timeline-item"><span class="timeline-dot"></span><div><strong>${event.startTime}</strong><span>Arrive at ${escapeHtml(event.venue)}</span></div></div>
          <div class="timeline-item"><span class="timeline-dot"></span><div><strong>Before Garba</strong><span>${event.parking ? "Parking available" : "Check parking before leaving"} • ${event.foodNearby ? "Food nearby" : "Plan food separately"}</span></div></div>
          <div class="timeline-item"><span class="timeline-dot"></span><div><strong>After the event</strong><span>Share your plan with your group and head home safely.</span></div></div>
        </div>
        <div class="plan-actions">
          <button class="small-btn primary" onclick="openDetails('${event.id}')">View details</button>
          <button class="small-btn" onclick="shareEvent('${event.id}')">Share plan</button>
        </div>
      </div>
      <p class="demo-note" style="margin-top:12px;">Demo recommendation — verify event timing, ticketing and parking before attending.</p>
    </div>`;
  $("planResult").innerHTML = plan;
}

function openDetails(id) {
  const e = state.events.find(x => x.id === id);
  if (!e) return;
  const price = e.price === 0 ? "Free" : `₹${e.price.toLocaleString("en-IN")}`;
  $("modalContent").innerHTML = `
    <div class="modal-content-title">
      <span class="eyebrow">${formatDate(e.date)} • ${escapeHtml(e.startTime)}–${escapeHtml(e.endTime)}</span>
      <h2>${escapeHtml(e.name)}</h2>
      <p class="location">📍 ${escapeHtml(e.venue)}, ${escapeHtml(e.area)}, ${escapeHtml(e.city)}</p>
    </div>
    <p>${escapeHtml(e.description)}</p>
    <div class="detail-list">
      <div class="detail-item"><span>Entry</span><strong>${price}</strong></div>
      <div class="detail-item"><span>Vibe</span><strong>${escapeHtml((e.vibes || []).join(", "))}</strong></div>
      <div class="detail-item"><span>Parking</span><strong>${e.parking ? "Available" : "Not confirmed"}</strong></div>
      <div class="detail-item"><span>Food nearby</span><strong>${e.foodNearby ? "Yes" : "Not confirmed"}</strong></div>
      <div class="detail-item"><span>Organizer</span><strong>${escapeHtml(e.organizer)}</strong></div>
    </div>
    <div class="plan-actions">
      <a class="primary-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}">Get directions</a>
      <button class="small-btn" onclick="shareEvent('${e.id}')">Share</button>
    </div>`;
  $("detailsModal").classList.remove("hidden");
}

function closeModal() {
  $("detailsModal").classList.add("hidden");
}

async function shareEvent(id) {
  const e = state.events.find(x => x.id === id);
  if (!e) return;
  const text = `Navratri plan: ${e.name} — ${formatDate(e.date)} at ${e.startTime}, ${e.city}.`;
  if (navigator.share) {
    try { await navigator.share({ title: e.name, text, url: location.href }); }
    catch (_) {}
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(`${text} ${location.href}`);
    showToast("Plan copied to clipboard.");
  } else {
    showToast("Share this page using your browser menu.");
  }
}

function useLocation() {
  if (!navigator.geolocation) {
    showToast("Location is not supported by this browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      state.userLocation = [pos.coords.latitude, pos.coords.longitude];
      if (state.map) {
        state.map.setView(state.userLocation, 14);
        L.circleMarker(state.userLocation, { radius: 8 }).addTo(state.map).bindPopup("You are here").openPopup();
      }
      showToast("Map centered near your location.");
    },
    () => showToast("Location permission was not granted.")
  );
}

function resetFilters() {
  $("searchInput").value = "";
  $("dateFilter").value = "All";
  $("budgetFilter").value = "All";
  $("vibeFilter").value = "All";
  $("citySelect").value = "All";
  window.__quickParking = false;
  window.__quickFood = false;
  render();
}

function formatDate(dateString) {
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

window.openDetails = openDetails;
window.shareEvent = shareEvent;
