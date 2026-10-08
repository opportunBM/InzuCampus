import { ServiceInzu, uiTranslations } from './config.js';
import { appState } from './state.js';
import { escapeHtml, getLocalizedValue, getPhotos, safeImageUrl } from './utils.js';

export function renderApp() {
    const t = uiTranslations[appState.currentLang];

    document.documentElement.lang = appState.currentLang;
    document.documentElement.dir = appState.currentLang === 'ar' ? 'rtl' : 'ltr';

    appState.imageIntervals.forEach(clearInterval);
    appState.imageTimeouts.forEach(clearTimeout);
    appState.imageIntervals = [];
    appState.imageTimeouts = [];

    document.getElementById('header-subtitle').innerText = t.subtitle;
    document.getElementById('section-title').innerText = t.sectionTitle;
    document.getElementById('btn-contact-text').innerText = t.contactBtn;
    document.getElementById('footer-desc').innerText = t.footerDesc;
    document.getElementById('close-modal').setAttribute('aria-label', t.closeModal);
    document.getElementById('virtual-visits-label').innerText = t.virtualTours;
    document.getElementById('location-label').innerText = t.locationLabel;

    document.getElementById('general-whatsapp').href =
        `https://wa.me/${ServiceInzu}?text=${encodeURIComponent(t.waMessage)}`;

    const container = document.getElementById('housing-list');
    container.innerHTML = "";
    container.setAttribute('aria-busy', 'false');

    appState.maisonsData.forEach((maison, idx) => {
        if (!maison.disponible) return;

        const photos = getPhotos(maison);
        if (!maison.id || !photos.length || !Number.isFinite(Number(maison.prix_rwf))) return;

        const titreValue = getLocalizedValue(maison, 'titre');
        const titre = escapeHtml(titreValue);
        const type = escapeHtml(getLocalizedValue(maison, 'type'));
        const location = escapeHtml(getLocalizedValue(maison, 'prec'));
        const proximite = escapeHtml(getLocalizedValue(maison, 'proximite_ulk'));
        const description = escapeHtml(getLocalizedValue(maison, 'description'));
        const salleBain = escapeHtml(getLocalizedValue(maison, 'salle_de_bain'));
        const kitchen = escapeHtml(getLocalizedValue(maison, 'cuisine'));
        const equipements = (Array.isArray(maison[`equipements_${appState.currentLang}`])
            ? maison[`equipements_${appState.currentLang}`]
            : Array.isArray(maison.equipements_fr) ? maison.equipements_fr : []).map(escapeHtml);
        const imageUrl = escapeHtml(safeImageUrl(photos[0]));
        const priceRwf = Number(maison.prix_rwf).toLocaleString();
        const priceUsd = escapeHtml(maison.prix_usd ?? '');
        const month = t.month;

        const messageWA = encodeURIComponent(`${t.waMessage} "${titreValue}" (Ref: ${maison.id}).`);

        const card = `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden 
            house-card flex flex-col justify-between" style="border:solid .5px rgb(43, 201, 103)">
                <div>
                    <div class="relative bg-gray-900 h-52">
                        <img id="img-house-${idx}" class="w-full h-full object-cover img-fade" src="${imageUrl}" alt="${titre}">
                        <span class="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                            ${type}
                        </span>
                    </div>

                    <div class="p-4">
                        <h4 class="font-bold text-base text-gray-900 leading-snug mb-1">${titre}</h4>
                        <p class="text-blue-600 font-black text-lg mb-3">
                            ${priceRwf} RWF <span class="text-xs font-normal text-gray-500">/ ${month} (~$${priceUsd})</span>
                        </p>

                        <div class="text-xs text-gray-600 space-y-1.5 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <p>📍 <strong>${t.neighborhood || (appState.currentLang === 'fr' ? 'Quartier:' : 'Neighborhood:')}</strong> ${escapeHtml(maison.quartier)}</p>
                            <p>📌 <strong>${t.prec}</strong> ${location}</p>
                            <p>🎓 <strong>${t.distance}</strong> ${proximite}</p>
                            <p>🛋️ <strong>${t.furnished}</strong> ${maison.meuble ? t.yes : t.no}</p>
                            <p>🚽 <strong>${t.bathroom}</strong> ${salleBain}</p>
                            <p>🍳 <strong>${t.kitchen}</strong> ${kitchen}</p>
                        </div>

                        <p class="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">${description}</p>

                        <div class="flex flex-wrap gap-1 mb-4">
                            ${equipements.map(eq => `<span class="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-medium">${eq}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="p-4 pt-0 space-y-2">
                    ${photos.length > 1 ? `
                        <button type="button" data-gallery-id="${escapeHtml(maison.id)}" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1">
                            <i class="fas fa-images"></i> ${t.morePhotosBtn} (${photos.length})
                        </button>
                    ` : ''}

                    <a href="https://wa.me/${ServiceInzu}?text=${messageWA}" target="_blank" rel="noopener noreferrer" class="w-full bg-green-500 hover:bg-green-600 text-white text-center font-bold text-xs py-3 rounded-xl block flex items-center justify-center gap-2 shadow-sm transition">
                        <i class="fab fa-whatsapp text-base"></i> ${t.visitBtn}
                    </a>
                </div>
            </div>
        `;
        container.innerHTML += card;

        if (photos.length > 1) {
            let photoIndex = 0;
            const timer = setInterval(() => {
                const imgEl = document.getElementById(`img-house-${idx}`);
                if (imgEl) {
                    imgEl.classList.add('img-fade-out');

                    const timeout = setTimeout(() => {
                        photoIndex = (photoIndex + 1) % photos.length;
                        imgEl.src = safeImageUrl(photos[photoIndex]);
                        imgEl.classList.remove('img-fade-out');
                    }, 800);
                    appState.imageTimeouts.push(timeout);
                }
            }, 10000);
            appState.imageIntervals.push(timer);
        }
    });
}
