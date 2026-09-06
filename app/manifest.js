export default function manifest() {
  return {
    name: "BaristaConnect Mobile",
    short_name: "BaristaMobile",
    description: "Kontrol BaristaConnect & AI assistant dari HP - tanpa laptop",
    start_url: "/m",
    display: "standalone",
    background_color: "#f2f0eb",
    theme_color: "#1e3932",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
