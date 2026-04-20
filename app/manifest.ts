import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Journaler",
    short_name: "Journaler",
    description: "Your personal journal",
    start_url: "/journal",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c6af7",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
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
