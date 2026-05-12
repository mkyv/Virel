import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "Virel",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Boilerplate base para SaaS sobre Next.js 15, Supabase y LemonSqueezy.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "virel.app",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  lemonsqueezy: {
    plans: [
      {
        variantId:
          process.env.NODE_ENV === "development"
            ? "123456"
            : "456789",
        name: "",
        description: "",
        price: 0,
        features: [],
      },
      {
        variantId:
          process.env.NODE_ENV === "development"
            ? "123456"
            : "456789",
        name: "",
        description: "",
        price: 0,
        features: [],
      },
    ],
  },
  cloudflare: {
    // URL pública del bucket R2 (dominio custom conectado al bucket, sin trailing slash)
    // Ejemplo: "https://cdn.tudominio.com"
    r2CdnUrl: process.env.NEXT_PUBLIC_R2_CDN_URL || "",
  },
  resend: {
    // 'From' field para magic links (se configura también en Supabase Dashboard > Auth > Email Templates).
    fromNoReply: `Virel <noreply@virel.app>`,
    // 'From' field para emails transaccionales enviados desde la app (libs/resend.ts).
    fromAdmin: `Virel <hello@virel.app>`,
    // Email de soporte. Si Crisp no está configurado, ButtonSupport abre mailto a este address.
    supportEmail: "support@virel.app",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: "#570df8",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
