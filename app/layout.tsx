import type { Metadata, Viewport } from "next";
import { AppSplashScreen } from "@/components/shell/AppSplashScreen";
import { ViewportHeightSync } from "@/components/shell/ViewportHeightSync";
import { SnackbarProvider } from "@/components/providers/snackbar-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { APP_THEME_COLORS, THEME_STORAGE_KEY } from "@/lib/stores/theme";
import { locales } from "@/lib/i18n";
import "./globals.css";

const INITIAL_PREFERENCES_SCRIPT = `
  (() => {
    const root = document.documentElement;
    const themeColors = ${JSON.stringify(APP_THEME_COLORS)};
    const homeLocales = ${JSON.stringify(locales)};
    const path = location.pathname.replace(/\\\/+$/, "") || "/";
    root.classList.toggle("home-surface", path === "/" || homeLocales.some((locale) => path === "/" + locale));
    let theme = "system";
    try {
      const stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
      if (stored === "light" || stored === "dark" || stored === "system") theme = stored;
    } catch {}
    root.dataset.themeMode = theme;
    const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const dark = theme === "dark" || (theme === "system" && systemDark);
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    const activeThemeColor = dark ? themeColors.dark : themeColors.light;
    root.style.setProperty("--app-safe-top-color", activeThemeColor);
    document.getElementById("app-theme-color")?.setAttribute("content", activeThemeColor);
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
    const appPath = path === "/app" || path.startsWith("/app/");
    root.classList.toggle("app-standalone", standalone);
    root.classList.toggle("app-shell-active", appPath);
    const mobileStandalone = window.matchMedia?.("(max-width: 767px)").matches && standalone;
    if (mobileStandalone && Number.isFinite(window.innerHeight) && window.innerHeight > 0) {
      root.style.setProperty("--app-viewport-height", window.innerHeight + "px");
    }
    const mobileWeb = window.matchMedia?.("(max-width: 767px)").matches && !standalone;
    if (mobileWeb) root.style.backgroundColor = activeThemeColor;
    const appHomePath = path === "/app" || homeLocales.some((locale) => path === "/app/" + locale);
    const showSplash = mobileStandalone && appHomePath;
    root.dataset.showAppSplash = showSplash ? "true" : "false";
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LifeStep - Practice Real-Life English",
    template: "%s | LifeStep",
  },
  description: "Practice the English conversations you need for real life in Canada.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "LifeStep",
    title: "LifeStep - Practice Real-Life English",
    description: "Step into real life with guided English conversations for newcomers to Canada.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "LifeStep - Step into real life" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeStep - Practice Real-Life English",
    description: "Step into real life with guided English conversations for newcomers to Canada.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/favicon.ico",
    apple: [
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta id="app-theme-color" name="theme-color" content={APP_THEME_COLORS.light} />
        <script
          id="initial-app-preferences"
          dangerouslySetInnerHTML={{ __html: INITIAL_PREFERENCES_SCRIPT }}
        />
      </head>
      <body>
        <ViewportHeightSync />
        <AppSplashScreen />
        <SnackbarProvider><ThemeProvider>{children}</ThemeProvider></SnackbarProvider>
      </body>
    </html>
  );
}
