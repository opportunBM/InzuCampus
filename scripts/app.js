const MON_NUMERO_WHATSAPP = "243995840288"; 

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
        kichen: "Cuisine:",
        yes: "Oui",
        no: "Non",
        visitBtn: "Visite Virtuelle sur WhatsApp",
        morePhotosBtn: "Voir plus de photos",
        waMessage: "Bonjour InzuCampus ! Je suis intéressé(e) par le logement",
        footerDesc: "Facilite la recherche de logement pour les étudiants internationaux et locaux à Kigali (ULK Gisozi)."
    },
    en: {
        subtitle: "Houses & rooms near ULK",
        sectionTitle: "Available listings near ULK",
        contactBtn: "Contact",
        prec: "location:",
        distance: "Distance to ULK:",
        furnished: "Furnished:",
        bathroom: "Bathroom:",
        kichen: "Kichen:",
        yes: "Yes",
        no: "No",
        visitBtn: "Virtual Tour on WhatsApp",
        morePhotosBtn: "See more photos",
        waMessage: "Hello InzuCampus! I am interested in the listing",
        footerDesc: "Simplifying housing search for international and local students in Kigali (ULK Gisozi)."
    }
};

let currentLang = 'fr';
let maisonsData = [];
let imageIntervals = []; // netoyage des timers de 10s

document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById('language-select');
    const closeModalBtn = document.getElementById('close-modal');
    const modal = document.getElementById('photo-modal');

    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        renderApp();
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    //si on clique a l'exterieur le modal se ferme
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    fetch('scripts/maisons.json')
        .then(response => response.json())
        .then(data => {
            maisonsData = data;
            renderApp();
        })
        .catch(err => console.error("Erreur JSON:", err));
});

function renderApp() {
    const t = uiTranslations[currentLang];

    // Réinitialiser les timers d'images précédents
    imageIntervals.forEach(clearInterval);
    imageIntervals = [];

    // Éléments statiques
    document.getElementById('header-subtitle').innerText = t.subtitle;
    document.getElementById('section-title').innerText = t.sectionTitle;
    document.getElementById('btn-contact-text').innerText = t.contactBtn;
    document.getElementById('footer-desc').innerText = t.footerDesc;
    
    document.getElementById('general-whatsapp').href = 
        `https://wa.me/${MON_NUMERO_WHATSAPP}?text=${encodeURIComponent(t.waMessage)}`;

    const container = document.getElementById('housing-list');
    container.innerHTML = "";

    maisonsData.forEach((maison, idx) => {
        if (!maison.disponible) return;

        const titre = maison[`titre_${currentLang}`];
        const type = maison[`type_${currentLang}`];
        const location = maison[`prec_${currentLang}`];
        const proximite = maison[`proximite_ulk_${currentLang}`];
        const description = maison[`description_${currentLang}`];
        const salleBain = maison[`salle_de_bain_${currentLang}`];
        const kichen = maison[`cuisine_${currentLang}`];
        const equipements = maison[`equipements_${currentLang}`];

        const messageWA = encodeURIComponent(`${t.waMessage} "${titre}" (Ref: ${maison.id}).`);

        //injection de la carte complete d'une maison
        const card = `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden 
            house-card flex flex-col justify-between" style="border:solid .5px rgb(43, 201, 103)">
                <div>
                    <!-- Image principale avec carrousel -->
                    <div class="relative bg-gray-900 h-52">
                        <img id="img-house-${idx}" <img id="img-house-${idx}" class="w-full h-full object-cover img-fade" src="${maison.photos[0]}" alt="${titre}">
                        <span class="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                            ${type}
                        </span>
                    </div>
                    
                    <div class="p-4">
                        <h4 class="font-bold text-base text-gray-900 leading-snug mb-1">${titre}</h4>
                        <p class="text-blue-600 font-black text-lg mb-3">
                            ${maison.prix_rwf.toLocaleString()} RWF <span class="text-xs font-normal text-gray-500">/ month (~$${maison.prix_usd})</span>
                        </p>

                        <!-- Détails techniques (Lieu, ULK, Meublé, Toilette) -->
                        <div class="text-xs text-gray-600 space-y-1.5 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <p>📍 <strong>Quartier:</strong> ${maison.quartier}</p>
                            <p>📌 <strong>${t.prec}</strong> ${location}</p>
                            <p>🎓 <strong>${t.distance}</strong> ${proximite}</p>
                            <p>🛋️ <strong>${t.furnished}</strong> ${maison.meuble ? t.yes : t.no}</p>
                            <p>🚽 <strong>${t.bathroom}</strong> ${salleBain}</p>
                            <p>🍳 <strong>${t.kichen}</strong> ${kichen}</p>
                        </div>

                        <p class="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">${description}</p>

                        <div class="flex flex-wrap gap-1 mb-4">
                            ${equipements.map(eq => `<span class="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-medium">${eq}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="p-4 pt-0 space-y-2">
                    <!-- Bouton Voir plus de photos -->
                    ${maison.photos.length > 1 ? `
                        <button onclick="openGallery('${maison.id}')" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1">
                            <i class="fas fa-images"></i> ${t.morePhotosBtn} (${maison.photos.length})
                        </button>
                    ` : ''}

                    <!-- Bouton WhatsApp -->
                    <a href="https://wa.me/${MON_NUMERO_WHATSAPP}?text=${messageWA}" target="_blank" class="w-full bg-green-500 hover:bg-green-600 text-white text-center font-bold text-xs py-3 rounded-xl block flex items-center justify-center gap-2 shadow-sm transition">
                        <i class="fab fa-whatsapp text-base"></i> ${t.visitBtn}
                    </a>
                </div>
            </div>
        `;
        container.innerHTML += card;

// changement automatique des images toutes les 10 secondes
if (maison.photos.length > 1) {
    let photoIndex = 0;
    const timer = setInterval(() => {
        const imgEl = document.getElementById(`img-house-${idx}`);
        if (imgEl) {

            imgEl.classList.add('img-fade-out');

            setTimeout(() => {
                photoIndex = (photoIndex + 1) % maison.photos.length;
                imgEl.src = maison.photos[photoIndex];
                
                imgEl.classList.remove('img-fade-out');
            }, 800);
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

    const modal = document.getElementById('photo-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalGallery = document.getElementById('modal-gallery');

    modalTitle.innerText = maison[`titre_${currentLang}`];
    modalGallery.innerHTML = maison.photos.map(photo => `
        <img src="${photo}" class="w-full h-56 object-cover rounded-lg shadow" alt="Photo logement">
    `).join('');

    modal.classList.remove('hidden');
}