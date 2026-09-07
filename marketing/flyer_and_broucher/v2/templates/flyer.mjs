/** A5 flyer — front (hero + CTA band) and back (how it works, what you get, proof). */
import { esc, lockup, qr, cropMarks, draftRibbon } from "./shared.mjs";

export async function flyerSheets(c, { bleed, assets }) {
  const f = c.flyer;
  const t = c.testimonial;
  const bigQr = await qr(c.site.flyerUrl, { mm: 26 });
  const smallQr = await qr(c.site.flyerUrl, { mm: 14, light: "#111317", dark: "#f5c418" });
  const ribbon = draftRibbon(t.approved);
  const marks = cropMarks(bleed);

  const front = `
<section class="sheet">
  <div class="page">
    ${ribbon}
    <div class="safe" style="bottom:calc(var(--bleed) + 60mm)">
      <header style="display:flex;justify-content:space-between;align-items:center">
        ${lockup()}
        <span class="eyebrow">${esc(f.eyebrow)}</span>
      </header>

      <div style="margin-top:6mm;display:flex;align-items:baseline;gap:3mm">
        <span style="font-size:20pt;font-weight:800;letter-spacing:-0.02em;color:var(--white)">Vox<span style="color:var(--gold)">Table</span></span>
        <span class="small" style="font-weight:600">${esc(f.tagline)}</span>
      </div>

      <h1 class="h1" style="margin-top:4mm">${esc(f.headline[0])}<br><span class="gold">${esc(f.headline[1])}</span></h1>
      <p class="lead" style="margin-top:3.5mm;max-width:120mm">${esc(f.support)}</p>

      <div class="tiles" style="margin-top:4.5mm">
        ${f.tiles.map((x) => `<div class="tile"><div class="big">${esc(x.big)}</div><div class="label">${esc(x.label)}</div></div>`).join("")}
      </div>

      <div class="photo" style="margin-top:4.5mm;margin-bottom:1mm;flex:1 1 0;min-height:23mm">
        <img src="${assets.flyerStrip}" alt="">
        <div class="cap on-photo">${esc(f.photoLine)}</div>
      </div>
    </div>

    <!-- CTA band bleeds to the bottom and sides -->
    <div class="band band-bleed" style="position:absolute;left:0;right:0;bottom:0;height:calc(var(--bleed) + 56mm)">
      <div style="position:absolute;left:calc(var(--bleed) + var(--safe));right:calc(var(--bleed) + var(--safe));top:6mm;bottom:calc(var(--bleed) + 5mm);display:grid;grid-template-columns:26mm 1fr;gap:6mm;align-items:center">
        <div style="text-align:center">
          ${bigQr}
          <div class="fine caps" style="margin-top:1.6mm;text-align:center">${esc(f.cta.scan)}</div>
        </div>
        <div>
          <div class="h2" style="font-size:26pt">${esc(f.cta.title)}</div>
          <p class="body" style="margin-top:1.8mm;font-size:12pt">${esc(f.cta.body)}</p>
          <div style="margin-top:3mm;font-size:15pt;font-weight:800;letter-spacing:-0.005em;color:var(--gold-fill-text)">${esc(c.site.voxtableHost)}</div>
          <div style="margin-top:0.8mm;font-size:13pt;font-weight:600;color:var(--gold-fill-text)">${esc(f.cta.call)} <span style="font-weight:800">${esc(c.site.phone)}</span></div>
          <div class="fine caps" style="margin-top:2.6mm">${esc(f.cta.strip)}</div>
        </div>
      </div>
    </div>
    ${marks}
  </div>
</section>`;

  const back = `
<section class="sheet">
  <div class="page">
    ${ribbon}
    <div class="safe">
      <header style="display:flex;justify-content:space-between;align-items:center">
        <span class="eyebrow gold">Vox<span style="color:var(--white)">Table</span> · ${esc(f.back.howTitle)}</span>
        <span class="eyebrow">No hardware · No apps</span>
      </header>

      <div class="steps compact" style="margin-top:3.6mm">
        ${f.back.steps.map((s, i) => `
        <div class="step">
          <div class="num">${i + 1}</div>
          <div><div class="t">${esc(s.title)}</div><p class="b body">${esc(s.body)}</p></div>
        </div>`).join("")}
      </div>

      <div class="rule" style="margin:3mm 0 2.6mm"></div>
      <div class="eyebrow">${esc(f.back.getTitle)}</div>
      <div class="grid2" style="margin-top:2.2mm;row-gap:2.6mm">
        ${f.back.features.map((x) => `<div class="feat"><div class="t">${esc(x.title)}</div><div class="b">${esc(x.body)}</div></div>`).join("")}
      </div>

      <div class="eyebrow gold" style="margin-top:3.2mm">${esc(f.back.proofEyebrow)}</div>
      <div class="proof" style="margin-top:1.8mm;grid-template-columns:32mm 1fr;padding:3.4mm">
        <div class="photo" style="height:27mm"><img src="${assets.proof1}" alt=""></div>
        <div>
          <p class="q" style="font-size:12pt">${esc(t.quote)}</p>
          <div class="who">${esc(t.by)}</div>
          <div class="venue">${esc(t.venue)}</div>
          <span class="runs">${esc(t.runs)}</span>
        </div>
      </div>

      <div class="grow"></div>

      <footer style="display:grid;grid-template-columns:minmax(0,1fr) 14mm;gap:4mm;align-items:end">
        <div>
          <div style="display:flex;align-items:center;gap:4mm">
            ${lockup("sm")}
            <span class="body" style="font-weight:700;color:var(--white);font-size:12pt">${esc(c.site.phone)}</span>
          </div>
          <div class="body" style="margin-top:1mm;font-weight:700;font-size:11.5pt;color:var(--white)">${esc(c.site.email)}<span class="dot">·</span><span style="color:var(--gold)">${esc(c.site.voxtableHost)}</span></div>
          <div class="fine" style="margin-top:0.8mm;white-space:nowrap">BitePerk<span class="dot">·</span>${esc(c.site.nap)}</div>
        </div>
        ${smallQr}
      </footer>
    </div>
    ${marks}
  </div>
</section>`;

  return [front, back];
}
