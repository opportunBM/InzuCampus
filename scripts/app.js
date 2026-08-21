const MON_NUMERO_WHATSAPP = "250726294387";

//termes utilises pour differentes langues
const uiTranslations = {
    fr: {
        subtitle: "Maisons & chambres proches de l'ULK",
        sectionTitle: "Offres disponibles près de l'ULK",
        contactBtn: "Contact",
        prec: "localisation:",
        distance: "Distance ULK:",
        furnished: "Meublé:",
        bathroom: "Toilette / Douche:",
        kitchen: "Cuisine:",
        yes: "Oui",
        no: "Non",
        visitBtn: "Visite Virtuelle sur WhatsApp",
        morePhotosBtn: "Voir plus de photos",
        waMessage: "Hello InzuCampus! I am interested in the listing",
        footerDesc: "Facilite la recherche de logement pour les étudiants internationaux et locaux à Kigali (ULK Gisozi).",
        closeModal: "Fermer",
        loadError: "Impossible de charger les logements. Veuillez réessayer.",
        virtualTours: "Visites virtuelles",
        locationLabel: "Gisozi, Kigali",
        month: "mois"
    },
    en: {
        subtitle: "Houses & rooms near ULK",
        sectionTitle: "Available listings near ULK",
        contactBtn: "Contact",
        prec: "location:",
        distance: "Distance to ULK:",
        furnished: "Furnished:",
        bathroom: "Bathroom:",
        kitchen: "Kitchen:",
        yes: "Yes",
        no: "No",
        visitBtn: "Virtual Tour on WhatsApp",
        morePhotosBtn: "See more photos",
        waMessage: "Hello InzuCampus! I am interested in the listing",
        footerDesc: "Simplifying housing search for international and local students in Kigali (ULK Gisozi).",
        closeModal: "Close",
        loadError: "Unable to load listings. Please try again.",
        virtualTours: "Virtual tours",
        locationLabel: "Gisozi, Kigali",
        month: "month"
    },
    rw: {
        subtitle: "Amazu n'ibyumba hafi ya ULK",
        sectionTitle: "Amazu ahari hafi ya ULK",
        contactBtn: "Twandikire",
        prec: "Ahantu:",
        distance: "Intera kugera kuri ULK:",
        furnished: "Ifite ibikoresho:",
        bathroom: "Ubwiherero:",
        kitchen: "Igikoni:",
        neighborhood: "Agace:",
        yes: "Yego",
        no: "Oya",
        visitBtn: "Sura inzu ukoresheje WhatsApp",
        morePhotosBtn: "Reba andi mafoto",
        waMessage: "Hello InzuCampus! I am interested in the listing",
        footerDesc: "Dufasha abanyeshuri mpuzamahanga n'abo mu Rwanda kubona amacumbi i Kigali (ULK Gisozi).",
        closeModal: "Funga",
        loadError: "Ntibishoboka gufungura amazu. Ongera ugerageze.",
        virtualTours: "Gusura amazu hifashishijwe ikoranabuhanga",
        locationLabel: "Gisozi, Kigali",
        month: "ukwezi"
    },
    ar: {
        subtitle: "منازل وغرف بالقرب من جامعة ULK",
        sectionTitle: "العروض المتاحة بالقرب من جامعة ULK",
        contactBtn: "اتصل بنا",
        prec: "الموقع:",
        distance: "المسافة إلى ULK:",
        furnished: "مفروش:",
        bathroom: "الحمام:",
        kitchen: "المطبخ:",
        neighborhood: "الحي:",
        yes: "نعم",
        no: "لا",
        visitBtn: "جولة افتراضية عبر واتساب",
        morePhotosBtn: "عرض المزيد من الصور",
        waMessage: "Hello InzuCampus! I am interested in the listing",
        footerDesc: "نسهّل البحث عن السكن للطلاب الدوليين والمحليين في كيغالي (ULK غيسوزي).",
        closeModal: "إغلاق",
        loadError: "تعذر تحميل أماكن السكن. يرجى المحاولة مرة أخرى.",
        virtualTours: "جولات افتراضية",
        locationLabel: "غيسوزي، كيغالي",
        month: "شهر"
    }
};

let currentLang = 'fr';
let maisonsData = [];
let imageIntervals = [];
let imageTimeouts = [];
let lastFocusedElement = null;

document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById('language-select');
    const closeModalBtn = document.getElementById('close-modal');
    const modal = document.getElementById('photo-modal');
    const housingList = document.getElementById('housing-list');

    langSelect.addEventListener('change', (e) => {
        if (!uiTranslations[e.target.value]) return;
        closeGallery();
        currentLang = e.target.value;
        renderApp();
    });

    closeModalBtn.addEventListener('click', closeGallery);

    //si on clique a l'exterieur le modal se ferme
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeGallery();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeGallery();
        if (e.key === 'Tab' && !modal.classList.contains('hidden')) trapModalFocus(e, modal);
    });

    housingList.addEventListener('click', (e) => {
        const galleryButton = e.target.closest('[data-gallery-id]');
        if (galleryButton) openGallery(galleryButton.dataset.galleryId);
    });

    fetch('scripts/maisons.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) throw new Error("Format JSON invalide");
            maisonsData = data;
            renderApp();
        })
        .catch(err => {
            console.error("Erreur JSON:", err);
            housingList.setAttribute('aria-busy', 'false');
            housingList.setAttribute('role', 'alert');
            housingList.textContent = uiTranslations[currentLang].loadError;
        });
});

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    })[character]);
}

function safeImageUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
        const url = new URL(value, window.location.href);
        if (['http:', 'https:'].includes(url.protocol)) return url.href;
        if (url.protocol === 'file:' && window.location.protocol === 'file:' && !value.trim().startsWith('file:')) {
            return url.href;
        }
        return '';
    } catch {
        return '';
    }
}

function getLocalizedValue(maison, field) {
    return maison[`${field}_${currentLang}`] ?? maison[`${field}_fr`] ?? '';
}

function getPhotos(maison) {
    return Array.isArray(maison.photos) ? maison.photos.filter(photo => safeImageUrl(photo)) : [];
}

function renderApp() {
    const t = uiTranslations[currentLang];

    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    // Réinitialiser les timers d'images précédents
    imageIntervals.forEach(clearInterval);
    imageTimeouts.forEach(clearTimeout);
    imageIntervals = [];
    imageTimeouts = [];

    // Éléments statiques
    document.getElementById('header-subtitle').innerText = t.subtitle;
    document.getElementById('section-title').innerText = t.sectionTitle;
    document.getElementById('btn-contact-text').innerText = t.contactBtn;
    document.getElementById('footer-desc').innerText = t.footerDesc;
    document.getElementById('close-modal').setAttribute('aria-label', t.closeModal);
    document.getElementById('virtual-visits-label').innerText = t.virtualTours;
    document.getElementById('location-label').innerText = t.locationLabel;
    
    document.getElementById('general-whatsapp').href = 
        `https://wa.me/${MON_NUMERO_WHATSAPP}?text=${encodeURIComponent(t.waMessage)}`;

    const container = document.getElementById('housing-list');
    container.innerHTML = "";
    container.setAttribute('aria-busy', 'false');

    maisonsData.forEach((maison, idx) => {
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
        const equipements = (Array.isArray(maison[`equipements_${currentLang}`])
            ? maison[`equipements_${currentLang}`]
            : Array.isArray(maison.equipements_fr) ? maison.equipements_fr : []).map(escapeHtml);
        const imageUrl = escapeHtml(safeImageUrl(photos[0]));
        const priceRwf = Number(maison.prix_rwf).toLocaleString();
        const priceUsd = escapeHtml(maison.prix_usd ?? '');
        const month = t.month;

        const messageWA = encodeURIComponent(`${t.waMessage} "${titreValue}" (Ref: ${maison.id}).`);

        //injection de la carte complete d'une maison
        const card = `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden 
            house-card flex flex-col justify-between" style="border:solid .5px rgb(43, 201, 103)">
                <div>
                    <!-- Image principale avec carrousel -->
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

                        <!-- Détails techniques (Lieu, ULK, Meublé, Toilette) -->
                        <div class="text-xs text-gray-600 space-y-1.5 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <p>📍 <strong>${t.neighborhood || (currentLang === 'fr' ? 'Quartier:' : 'Neighborhood:')}</strong> ${escapeHtml(maison.quartier)}</p>
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
                    <!-- Bouton Voir plus de photos -->
                    ${photos.length > 1 ? `
                        <button type="button" data-gallery-id="${escapeHtml(maison.id)}" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1">
                            <i class="fas fa-images"></i> ${t.morePhotosBtn} (${photos.length})
                        </button>
                    ` : ''}

                    <!-- Bouton WhatsApp -->
                    <a href="https://wa.me/${MON_NUMERO_WHATSAPP}?text=${messageWA}" target="_blank" rel="noopener noreferrer" class="w-full bg-green-500 hover:bg-green-600 text-white text-center font-bold text-xs py-3 rounded-xl block flex items-center justify-center gap-2 shadow-sm transition">
                        <i class="fab fa-whatsapp text-base"></i> ${t.visitBtn}
                    </a>
                </div>
            </div>
        `;
        container.innerHTML += card;

// changement automatique des images toutes les 10 secondes
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
            imageTimeouts.push(timeout);
        }
    }, 10000);
    imageIntervals.push(timer);
}
    });
}

// Fonction pour ouvrir la liste complete d'images
function openGallery(maisonId) {
    const maison = maisonsData.find(m => m.id === maisonId);
    if (!maison) return;

    const photos = getPhotos(maison);
    if (!photos.length) return;

    const modal = document.getElementById('photo-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalGallery = document.getElementById('modal-gallery');

    lastFocusedElement = document.activeElement;
    modalTitle.innerText = getLocalizedValue(maison, 'titre');
    modalGallery.innerHTML = photos.map(photo => `
        <img src="${escapeHtml(safeImageUrl(photo))}" class="w-full h-56 object-cover rounded-lg shadow" alt="Photo logement">
    `).join('');

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('close-modal').focus();
}

function closeGallery() {
    const modal = document.getElementById('photo-modal');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

function trapModalFocus(event, modal) {
    const focusable = [...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}