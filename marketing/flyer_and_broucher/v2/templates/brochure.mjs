/** A5 brochure — photo-led front with the demo line, information back with the "Talk to Sam" band. */
import { esc, lockup, qr, tick, cropMarks, draftRibbon } from "./shared.mjs";

export async function brochureSheets(c, { bleed, assets }) {
  const b = c.brochure;
  const t = c.testimonial;
  const bandQr = await qr(c.site.brochureUrl, { mm: 22 });
  const ribbon = draftRibbon(t.approved);
  const marks = cropMarks(bleed);

  const front = `
<section class="sheet">
  <div class="page">
    ${ribbon}
    <div class="photo" style="position:absolute;inset:0;border-radius:0">
      <img src="${assets.cover}" alt="">
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(17,19,23,0.55) 0%, rgba(17,19,23,0.35) 30%, rgba(17,19,23,0.88) 62%, rgba(17,19,23,0.98) 100%)"></div>
    </div>
    <div class="safe on-photo">
      <header>${lockup()}</header>
      <div class="grow"></div>
      <div class="eyebrow gold on-photo">${esc(b.eyebrow)}</div>
      <h1 class="h1 on-photo" style="margin-top:2.5mm;color:#f7f8fa">${esc(b.headline[0])}<br><span class="gold" style="color:#f5c418">${esc(b.headline[1])}</span></h1>
      <p class="lead on-photo" style="margin-top:4mm;max-width:118mm;color:#e6e9ee">${esc(b.support)}</p>
      <ul class="ticks on-photo" style="margin-top:4.5mm">
        ${b.ticks.map((x) => `<li class="on-photo" style="color:#f7f8fa">${tick()}<span class="on-photo">${esc(x)}</span></li>`).join("")}
      </ul>

      <div class="band" style="margin-top:6.5mm;padding:5.5mm 6mm 5mm;text-align:center">
        <div style="font-size:16pt;font-weight:700;letter-spacing:-0.005em">${esc(b.demo.title)}</div>
        <div style="margin-top:1.5mm;font-family:var(--serif);font-weight:700;font-size:38pt;line-height:1;letter-spacing:-0.01em">${esc(c.demoLine)}</div>
        <div class="fine caps" style="margin-top:2.4mm;font-size:9pt">${esc(b.demo.sub)}</div>
      </div>

      <div class="fine caps on-photo" style="margin-top:4.5mm;text-align:center;color:#c8ced9;font-size:9pt">${b.foot.map(esc).join('<span class="dot">·</span>')}</div>
    </div>
    ${marks}
  </div>
</section>`;

  const back = `
<section class="sheet">
  <div class="page">
    ${ribbon}
    <div class="safe" style="bottom:calc(var(--bleed) + 49mm)">
      <header style="display:flex;justify-content:space-between;align-items:center">
        <span class="eyebrow gold">Vox<span style="color:var(--white)">Table</span> · ${esc(b.back.howTitle)}</span>
        ${lockup()}
      </header>

      <div class="steps compact" style="margin-top:3.5mm">
        ${b.back.steps.map((s, i) => `
        <div class="step">
          <div class="num">${i + 1}</div>
          <div><div class="t">${esc(s.title)}</div><p class="b body">${esc(s.body)}</p></div>
        </div>`).join("")}
      </div>

      <div style="margin-top:3.5mm;border:1pt solid var(--gold-fill);border-radius:3.2mm;padding:2.6mm 4mm">
        <span style="font-size:13pt;font-weight:700;color:var(--gold)">${esc(b.back.setupTitle)}</span><span class="dot" style="color:var(--gold)">·</span><span class="body" style="font-size:11.5pt">${esc(b.back.setupBody)}</span>
      </div>

      <div class="grid2" style="margin-top:3.5mm;row-gap:1.8mm;column-gap:3mm">
        ${b.back.ticks.map((x) => `<div style="display:flex;align-items:center;gap:2.4mm;font-size:11pt;font-weight:600;color:var(--white);white-space:nowrap">${tick().replace('class="tk"', 'class="tk sm"')}<span>${esc(x)}</span></div>`).join("")}
      </div>

      <div class="eyebrow gold" style="margin-top:3.6mm">${esc(b.back.proofEyebrow)}</div>
      <div class="proof" style="margin-top:2mm;grid-template-columns:26mm 26mm 1fr;padding:3.4mm">
        <div class="photo" style="height:29mm"><img src="${assets.proof1}" alt=""></div>
        <div class="photo" style="height:29mm"><img src="${assets.proof2}" alt=""></div>
        <div>
          <p class="q" style="font-size:11.5pt">${esc(t.quote)}</p>
          <div class="who">${esc(t.by)}</div>
          <div class="venue">${esc(t.venue)}</div>
          <span class="runs">${esc(t.runs)}</span>
        </div>
      </div>

      <div class="grow"></div>
    </div>

    <div class="band band-bleed" style="position:absolute;left:0;right:0;bottom:0;height:calc(var(--bleed) + 45mm)">
      <div style="position:absolute;left:calc(var(--bleed) + var(--safe));right:calc(var(--bleed) + var(--safe));top:4.5mm;bottom:calc(var(--bleed) + 4mm);display:grid;grid-template-columns:minmax(0,1fr) 22mm;gap:6mm;align-items:center">
        <div>
          <div class="h2" style="font-size:21pt">${esc(b.back.talk.title)}</div>
          <div class="body" style="margin-top:1.2mm;font-size:11.5pt">${esc(b.back.talk.sub)}</div>
          <div style="margin-top:2mm;font-size:13pt;font-weight:800;color:var(--gold-fill-text)">${esc(c.samEmail)}<span class="dot">·</span>${esc(c.site.phone)}</div>
          <div style="font-size:13pt;font-weight:800;color:var(--gold-fill-text)">${esc(c.site.web)}</div>
          <div class="fine" style="margin-top:2mm;white-space:nowrap">${esc(b.back.legal)}<span class="dot">·</span>${esc(b.foot[0])}</div>
          <div class="fine" style="white-space:nowrap">BitePerk<span class="dot">·</span>${esc(c.site.nap)}</div>
        </div>
        <div style="text-align:center">
          ${bandQr}
          <div class="fine caps" style="margin-top:1.4mm;font-size:8.5pt">${esc(b.back.scan)}</div>
        </div>
      </div>
    </div>
    ${marks}
  </div>
</section>`;

  return [front, back];
}
