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

    const hasAny = !!env.gtmId || !!env.gaMeasurementId || !!env.clarityId || !!env.posthogKey;

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

    if (env.posthogKey) {
      const host = env.posthogHost || 'https://us.i.posthog.com';
      injectInlineOnce(
        'coldop-posthog',
        `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_session_id createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('${env.posthogKey}',{api_host:'${host}',person_profiles:'identified_only'});`,
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
