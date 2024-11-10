// Import necessary FontAwesome libraries
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { defineNuxtPlugin } from "#app";

// Add icons to the library
library.add(faCopy);

// Register the FontAwesomeIcon component globally in Nuxt
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("FontAwesomeIcon", FontAwesomeIcon);
});
