// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  components: {
    dirs: [
      {
        path: "~/components/global",
        global: true,
      },
      "~/components",
    ],
  },
  build: {
    transpile: ["@fortawesome/vue-fontawesome"],
  },
  plugins: [
    "~/plugins/fontawesome.ts", // Register the plugin
    "~/plugins/navigator.ts", // Register the plugin
  ],
});
