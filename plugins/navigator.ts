export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client) {
    const locale = navigator.language;
    nuxtApp.provide("locale", locale);
  }
});
