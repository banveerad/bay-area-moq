import { useEffect, useRef } from "react";

export const TURNSTILE_SITE_KEY = "0x4AAAAAAELWQ2DQMZzTp3LY";
/** Cloudflare's always-passes test key, used on hosts not registered with the real sitekey. */
const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

/** Hostnames allowed by the real Turnstile sitekey. */
const PRODUCTION_HOSTS = ["moqbayarea.com", "www.moqbayarea.com", "bay-area-moq.lovable.app"];

function siteKeyForHost() {
  if (typeof window === "undefined") return TURNSTILE_SITE_KEY;
  return PRODUCTION_HOSTS.includes(window.location.hostname)
    ? TURNSTILE_SITE_KEY
    : TURNSTILE_TEST_SITE_KEY;
}

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          theme?: "auto" | "light" | "dark";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve();
    let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = SCRIPT_ID;
      el.src = SCRIPT_SRC;
      el.async = true;
      el.defer = true;
      document.head.appendChild(el);
    }
    el.addEventListener("load", () => resolve());
    el.addEventListener("error", () => reject(new Error("turnstile-load-failed")));
  });
}

export function Turnstile({
  onVerify,
  resetKey = 0,
}: {
  onVerify: (token: string | null) => void;
  resetKey?: number;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const verify = useRef(onVerify);
  verify.current = onVerify;

  useEffect(() => {
    let cancelled = false;
    void loadScript()
      .then(() => {
        if (cancelled || !holder.current || !window.turnstile) return;
        holder.current.innerHTML = "";
        widgetId.current = window.turnstile.render(holder.current, {
          sitekey: siteKeyForHost(),
          theme: "dark",
          callback: (token) => verify.current(token),
          "expired-callback": () => verify.current(null),
          "error-callback": () => verify.current(null),
        });
      })
      .catch(() => verify.current(null));

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (resetKey > 0 && widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      verify.current(null);
    }
  }, [resetKey]);

  return <div ref={holder} className="min-h-[65px]" />;
}
