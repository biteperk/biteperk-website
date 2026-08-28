/**
 * Report a confirmed conversion through Google's advanced consent mode.
 * The Google tag owns the consent decision: when advertising consent is
 * denied it sends a cookieless ping; when granted it may use ad storage.
 */
export function reportGoogleAdsConversion(destination: string | null): void {
  if (destination == null) return;

  const gtag = (window as unknown as {
    gtag?: (...args: unknown[]) => void;
  }).gtag;
  if (typeof gtag !== "function") return;

  // These forms render success in place, so Google's link-oriented callback
  // redirect is unnecessary and could navigate away from the confirmation.
  gtag("event", "conversion", { send_to: destination });
}
