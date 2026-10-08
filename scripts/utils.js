import { appState } from './state.js';

export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    })[character]);
}

export function safeImageUrl(value) {
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

export function getLocalizedValue(maison, field) {
    return maison[`${field}_${appState.currentLang}`] ?? maison[`${field}_fr`] ?? '';
}

export function getPhotos(maison) {
    return Array.isArray(maison.photos) ? maison.photos.filter(photo => safeImageUrl(photo)) : [];
}
