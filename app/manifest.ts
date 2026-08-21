import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LifeStep - Practice Real-Life English",
    short_name: "LifeStep",
    description: "LifeStep - Practice Real-Life English for life in Canada.",
    id: "/app",
    start_url: "/app",
    scope: "/app",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
