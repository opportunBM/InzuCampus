import { uiTranslations } from './config.js';
import { appState } from './state.js';
import { renderApp } from './listings.js';
import {
    changeLightboxPhoto,
    closeGallery,
    closeLightbox,
    openGallery,
    openLightbox,
    trapModalFocus
} from './gallery.js';

document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById('language-select');
    const closeModalBtn = document.getElementById('close-modal');
    const modal = document.getElementById('photo-modal');
    const housingList = document.getElementById('housing-list');
    const modalGallery = document.getElementById('modal-gallery');
    const lightbox = document.getElementById('photo-lightbox');
    const lightboxStage = document.getElementById('lightbox-stage');

    langSelect.addEventListener('change', (e) => {
        if (!uiTranslations[e.target.value]) return;
        closeGallery();
        appState.currentLang = e.target.value;
        renderApp();
    });

    closeModalBtn.addEventListener('click', closeGallery);
    document.getElementById('close-lightbox').addEventListener('click', closeLightbox);
    document.getElementById('previous-photo').addEventListener('click', () => changeLightboxPhoto(-1));
    document.getElementById('next-photo').addEventListener('click', () => changeLightboxPhoto(1));

    modalGallery.addEventListener('click', (e) => {
        const photoButton = e.target.closest('[data-lightbox-index]');
        if (!photoButton) return;
        appState.lastGalleryTrigger = photoButton;
        openLightbox(Number(photoButton.dataset.lightboxIndex));
    });

    lightboxStage.addEventListener('touchstart', (e) => {
        appState.touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightboxStage.addEventListener('touchend', (e) => {
        const swipeDistance = e.changedTouches[0].clientX - appState.touchStartX;
        if (Math.abs(swipeDistance) < 40) return;
        changeLightboxPhoto(swipeDistance < 0 ? 1 : -1);
    }, { passive: true });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeGallery();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            closeLightbox();
            return;
        }
        if (e.key === 'ArrowLeft' && !lightbox.classList.contains('hidden')) changeLightboxPhoto(-1);
        if (e.key === 'ArrowRight' && !lightbox.classList.contains('hidden')) changeLightboxPhoto(1);
        if (e.key === 'Tab' && !lightbox.classList.contains('hidden')) {
            trapModalFocus(e, lightbox);
            return;
        }
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
            appState.maisonsData = data;
            renderApp();
        })
        .catch(err => {
            console.error("Erreur JSON:", err);
            housingList.setAttribute('aria-busy', 'false');
            housingList.setAttribute('role', 'alert');
            housingList.textContent = uiTranslations[appState.currentLang].loadError;
        });
});
