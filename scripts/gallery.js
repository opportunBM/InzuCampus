import { appState } from './state.js';
import { escapeHtml, getLocalizedValue, getPhotos, safeImageUrl } from './utils.js';

export function openGallery(maisonId) {
    const maison = appState.maisonsData.find(m => m.id === maisonId);
    if (!maison) return;

    const photos = getPhotos(maison);
    if (!photos.length) return;

    const modal = document.getElementById('photo-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalGallery = document.getElementById('modal-gallery');

    appState.lastFocusedElement = document.activeElement;
    modalTitle.innerText = getLocalizedValue(maison, 'titre');
    appState.lightboxPhotos = photos;
    modalGallery.innerHTML = photos.map((photo, index) => `
        <button type="button" data-lightbox-index="${index}" class="gallery-photo-button" aria-label="Voir la photo ${index + 1} en plein écran">
            <img src="${escapeHtml(safeImageUrl(photo))}" class="w-full h-56 object-cover rounded-lg shadow" alt="Photo logement ${index + 1}">
        </button>
    `).join('');

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('close-modal').focus();
}

export function openLightbox(index) {
    if (!appState.lightboxPhotos.length || !Number.isInteger(index)) return;
    appState.lightboxIndex = Math.max(0, Math.min(index, appState.lightboxPhotos.length - 1));
    const lightbox = document.getElementById('photo-lightbox');
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    updateLightboxPhoto();
    document.getElementById('close-lightbox').focus();
}

function updateLightboxPhoto() {
    const image = document.getElementById('lightbox-image');
    const counter = document.getElementById('lightbox-counter');
    image.src = safeImageUrl(appState.lightboxPhotos[appState.lightboxIndex]);
    image.alt = `Photo ${appState.lightboxIndex + 1} sur ${appState.lightboxPhotos.length}`;
    counter.innerText = `${appState.lightboxIndex + 1} / ${appState.lightboxPhotos.length}`;
}

export function changeLightboxPhoto(direction) {
    if (!appState.lightboxPhotos.length) return;
    appState.lightboxIndex = (appState.lightboxIndex + direction + appState.lightboxPhotos.length) % appState.lightboxPhotos.length;
    updateLightboxPhoto();
}

export function closeLightbox() {
    const lightbox = document.getElementById('photo-lightbox');
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    if (appState.lastGalleryTrigger instanceof HTMLElement) appState.lastGalleryTrigger.focus();
}

export function closeGallery() {
    closeLightbox();
    const modal = document.getElementById('photo-modal');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (appState.lastFocusedElement instanceof HTMLElement) appState.lastFocusedElement.focus();
}

export function trapModalFocus(event, modal) {
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
