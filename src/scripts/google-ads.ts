import { CONSENT_KEY, CONSENT_VERSION } from "@/data/consent";

/** Report a Google Ads conversion only when current marketing consent permits it. */
export function reportGoogleAdsConversion(destination: string | null): void {
  if (destination == null) return;

  try {
    const consent = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? "null") as {
      v?: number;
      marketing?: boolean;
    } | null;
    if (consent?.v !== CONSENT_VERSION || consent.marketing !== true) return;
  } catch {
    return;
  }

  const gtag = (window as unknown as {
    gtag?: (...args: unknown[]) => void;
  }).gtag;
  if (typeof gtag !== "function") return;

  // These forms render success in place, so Google's link-oriented callback
  // redirect is unnecessary and could navigate away from the confirmation.
  gtag("event", "conversion", { send_to: destination });
}
