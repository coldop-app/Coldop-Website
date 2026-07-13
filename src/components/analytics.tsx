import { useEffect, useRef } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { env } from '@/lib/env';

function isPublicMarketingPath(pathname: string): boolean {
  return pathname === '/';
}

function loadScriptOnce(id: string, src: string, attrs?: Record<string, string>) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      script.setAttribute(key, value);
    }
  }
  document.head.appendChild(script);
}

function injectInlineOnce(id: string, code: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.textContent = code;
  document.head.appendChild(script);
}

/**
 * Loads marketing analytics only on the public landing page (`/`) when env IDs are set.
 * Authenticated app routes and `/login` are never tracked by default.
 */
export function Analytics() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const loaded = useRef(false);

  useEffect(() => {
    if (!isPublicMarketingPath(pathname)) return;
    if (loaded.current) return;

    const hasAny = !!env.gtmId || !!env.gaMeasurementId || !!env.clarityId;

    if (!hasAny) return;
    loaded.current = true;

    if (env.gtmId) {
      injectInlineOnce(
        'coldop-gtm',
        `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${env.gtmId}');`,
      );
    }

    if (env.gaMeasurementId && !env.gtmId) {
      loadScriptOnce(
        'coldop-ga-src',
        `https://www.googletagmanager.com/gtag/js?id=${env.gaMeasurementId}`,
      );
      injectInlineOnce(
        'coldop-ga-config',
        `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${env.gaMeasurementId}');`,
      );
    }

    if (env.clarityId) {
      injectInlineOnce(
        'coldop-clarity',
        `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${env.clarityId}");`,
      );
    }
  }, [pathname]);

  if (env.gtmId && isPublicMarketingPath(pathname)) {
    return (
      <noscript>
        <iframe
          title="Google Tag Manager"
          src={`https://www.googletagmanager.com/ns.html?id=${env.gtmId}`}
          height={0}
          width={0}
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    );
  }

  return null;
}
