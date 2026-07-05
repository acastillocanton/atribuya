// Configuración de vanilla-cookieconsent (banner + preferencias + registro).
// Sustituye al banner propio anterior. La librería gestiona la UI, el
// almacenamiento en una cookie first-party y el registro versionado del
// consentimiento (ID + marca de tiempo + revisión + categorías), que es la
// prueba que exige el art. 7.1 RGPD. La carga de Google Analytics 4 la sigue
// gateando components/analytics/Analytics.tsx a través de onAnalyticsConsent.

import type { CookieConsentConfig } from "vanilla-cookieconsent";

// Categoría que gatea GA4. La comparamos contra las categorías aceptadas.
export const ANALYTICS_CATEGORY = "analytics";

// Revisión de la política de cookies. Subir este número invalida los
// consentimientos previos y vuelve a mostrar el banner (re-consentimiento
// cuando cambia lo que se declara). No bajarlo nunca.
export const CONSENT_REVISION = 1;

// Nombre de la cookie de consentimiento (first-party).
const CONSENT_COOKIE = "atribuya_consent";

type Locale = "es" | "en";

/**
 * Construye la configuración de vanilla-cookieconsent.
 * @param defaultLang idioma inicial (se puede cambiar luego con setLanguage).
 * @param onAnalyticsConsent callback que recibe si la categoría de analítica
 *   está aceptada; Analytics.tsx lo usa para cargar/omitir gtag.
 */
export function cookieConsentConfig({
  defaultLang,
  onAnalyticsConsent,
}: {
  defaultLang: Locale;
  onAnalyticsConsent: (accepted: boolean) => void;
}): CookieConsentConfig {
  const notify = (cookie?: { categories?: string[] }) => {
    onAnalyticsConsent(
      Boolean(cookie?.categories?.includes(ANALYTICS_CATEGORY)),
    );
  };

  return {
    revision: CONSENT_REVISION,
    cookie: { name: CONSENT_COOKIE },
    // Modo opt-in por defecto: no se activa ninguna categoría no necesaria
    // hasta que el usuario la acepta.
    guiOptions: {
      consentModal: {
        layout: "box",
        position: "bottom right",
        // «Rechazar» con la misma prominencia que «Aceptar» (exigencia AEPD).
        equalWeightButtons: true,
        flipButtons: false,
      },
      preferencesModal: {
        layout: "box",
        equalWeightButtons: true,
        flipButtons: false,
      },
    },
    categories: {
      necessary: { readOnly: true, enabled: true },
      [ANALYTICS_CATEGORY]: {},
    },
    onConsent: ({ cookie }) => notify(cookie),
    onChange: ({ cookie }) => notify(cookie),
    language: {
      default: defaultLang,
      translations: {
        es: {
          consentModal: {
            title: "Cookies analíticas",
            description:
              "Usamos Google Analytics para entender cómo se usa esta web y mejorarla. No se carga nada hasta que lo aceptes. Puedes cambiar de opinión cuando quieras desde el enlace «Cookies» del pie de página.",
            acceptAllBtn: "Aceptar",
            acceptNecessaryBtn: "Rechazar",
            showPreferencesBtn: "Preferencias",
            footer: `<a href="/privacidad">Política de privacidad</a>`,
          },
          preferencesModal: {
            title: "Preferencias de cookies",
            acceptAllBtn: "Aceptar todo",
            acceptNecessaryBtn: "Rechazar todo",
            savePreferencesBtn: "Guardar preferencias",
            closeIconLabel: "Cerrar",
            sections: [
              {
                title: "Uso de cookies",
                description:
                  "Guardamos tu elección en una cookie propia con marca de tiempo y versión, para poder respetarla y demostrar tu consentimiento. Puedes gestionar cada categoría por separado.",
              },
              {
                title: "Cookies estrictamente necesarias",
                description:
                  "Imprescindibles para el funcionamiento de la web y del área privada. Siempre activas, no requieren consentimiento.",
                linkedCategory: "necessary",
              },
              {
                title: "Analítica (Google Analytics)",
                description:
                  "Nos ayudan a medir el uso de las páginas públicas de forma agregada. Solo se cargan si las aceptas.",
                linkedCategory: ANALYTICS_CATEGORY,
              },
              {
                title: "Más información",
                description: `Consulta nuestra <a href="/privacidad">política de privacidad</a>.`,
              },
            ],
          },
        },
        en: {
          consentModal: {
            title: "Analytics cookies",
            description:
              "We use Google Analytics to understand how this site is used and improve it. Nothing loads until you accept. You can change your mind anytime from the “Cookies” link in the footer.",
            acceptAllBtn: "Accept",
            acceptNecessaryBtn: "Decline",
            showPreferencesBtn: "Preferences",
            footer: `<a href="/en/privacy">Privacy policy</a>`,
          },
          preferencesModal: {
            title: "Cookie preferences",
            acceptAllBtn: "Accept all",
            acceptNecessaryBtn: "Decline all",
            savePreferencesBtn: "Save preferences",
            closeIconLabel: "Close",
            sections: [
              {
                title: "Use of cookies",
                description:
                  "We store your choice in a first-party cookie with a timestamp and version, so we can honour it and demonstrate your consent. You can manage each category separately.",
              },
              {
                title: "Strictly necessary cookies",
                description:
                  "Essential for the website and the private area to work. Always on, no consent required.",
                linkedCategory: "necessary",
              },
              {
                title: "Analytics (Google Analytics)",
                description:
                  "They help us measure usage of the public pages in aggregate. They only load if you accept them.",
                linkedCategory: ANALYTICS_CATEGORY,
              },
              {
                title: "More information",
                description: `See our <a href="/en/privacy">privacy policy</a>.`,
              },
            ],
          },
        },
      },
    },
  };
}
