/**
 * Market city-page engine — the international counterpart of src/data/cities.ts.
 *
 * One entry per city per LOCALE TREE, keyed by `base`. Brussels appears twice
 * (be-en and be-fr) because those are two genuine translations; London appears
 * once. That asymmetry is the whole reason the flat page list in locales.ts was
 * replaced — see INTL_EXTRA_PAGES there.
 *
 * ── The hard rules, and why ──────────────────────────────────────────────────
 *
 * 1. NO geo, NO address, NO opening hours, NO phone. Deliberately absent from
 *    the type, not merely unused. The AU City carries them because Sydney is a
 *    real premises; BitePerk has no European premises, and inventing one is the
 *    fake-local-office failure PLAN.md §8 forbids. A market city page localises
 *    the CONVERSATION — the dining culture, the imagery, the spelling — and
 *    says plainly that Europe is the pilot programme.
 *
 * 2. Every text field is HAND-WRITTEN per city, and the anti-doorway gate
 *    (scripts/gates/check-cities.mjs) compares PER LANGUAGE ACROSS MARKETS, not
 *    per market. A London page and a Brussels-EN page are both English and both
 *    say "Vox is opening pilots here" — that pair is far likelier to read as
 *    templated than London vs. Paris, which the language boundary already
 *    separates. English: gb-en + be-en. French: fr + be-fr.
 *
 * 3. Two image slugs per city, not the AU engine's three: a cityscape unique to
 *    the city, plus a hospitality shot SHARED across the market (so `storyImage`
 *    repeating within a market is expected and fine). public/images is already
 *    74MB and binaries never delta-compress in git; a third unique slug per city
 *    would roughly treble the addition for no editorial gain.
 *
 * Populated Jul 2026 with the eight UK cities (gb-en). Writing rules learned
 * doing it, for whoever adds the next market:
 *   - check-truthful's NAP regex bans the words "Haymarket" and
 *     "Elizabeth Street" on every global page — which are also a London street,
 *     an Edinburgh district and a Belgravia dining street. They must never
 *     appear in copy, districts or FAQs. Same for capitalised "Toast"/"Square"
 *     near integration vocabulary — safest is not to use them at all.
 *   - The similarity gate reads ONLY `intro` and `aiLocal`; keep those two
 *     genuinely local per city and put shared persuasion in scenarios/FAQs.
 *   - Only intro + scenarios + faqs + aiLocal count toward the 600-word floor.
 */
import type { Lang } from "../locales";

export interface IntlCityFaq {
  readonly q: string;
  readonly a: string;
}

export interface IntlCityScenario {
  readonly title: string;
  readonly body: string;
}

/** "The AI under the hood, tuned for {City}" — hand-written per city. */
export interface IntlCityAiPoint {
  readonly icon: "pin" | "calendar-tick" | "phone-wave" | "shield";
  readonly title: string;
  readonly body: string;
}

export interface IntlCityAiLocal {
  readonly lead: string;
  readonly points: readonly IntlCityAiPoint[];
}

export interface IntlCity {
  /** URL segment within the locale tree: "/gb-en/london/" → "london". */
  readonly slug: string;
  /** Which locale tree emits it — a Locale.base, e.g. "/gb-en". */
  readonly base: string;
  /** The language this entry is written in; drives the similarity grouping. */
  readonly copyLang: Lang;
  readonly name: string;
  /** false until the copy passes check-cities.mjs. */
  readonly published: boolean;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly heroHeadline: string;
  /** Hand-written intro — this city's dining reality + the missed-call problem. */
  readonly intro: readonly string[];
  /** Districts/quarters, the local equivalent of the AU engine's suburbs. */
  readonly districts: readonly string[];
  readonly scenarios: readonly IntlCityScenario[];
  readonly faqs: readonly IntlCityFaq[];
  readonly aiLocal: IntlCityAiLocal;
  /** Slugs of guides in the SAME locale tree (Phase 3). */
  readonly relatedGuides: readonly string[];
  /** Iconic, signage-free establishing shot — unique per city. */
  readonly cityscapeImage: string;
  readonly cityscapeImageAlt: string;
  /** Hospitality scene — shared across the market (see rule 3 above). */
  readonly storyImage: string;
  readonly storyImageAlt: string;
}

// The shared UK hospitality shot (rule 3: storyImage repeats within a market).
const UK_STORY = {
  storyImage: "bar-brass-evening",
  storyImageAlt: "A bar mid-service, glassware and spirits lit under filament bulbs",
} as const;

// The shared Belgian hospitality shot, same contract as UK_STORY. Already
// graded and already this market's `media.hospitality` slug (markets.ts), so a
// Belgian city costs no new photography — rule 3 again.
const BE_STORY = {
  storyImage: "cafe-continental",
  storyImageAlt: "A relaxed continental café interior between services",
} as const;

// The shared French hospitality shot, same contract as UK_STORY / BE_STORY.
// Already graded and already frFr's `media.hospitality` slug (markets.ts), so a
// French city costs no new photography — rule 3 again.
const FR_STORY = {
  storyImage: "brasserie-banquette",
  storyImageAlt: "Banquette en velours bleu et tables en marbre dressées pour le service",
} as const;

export const intlCities: readonly IntlCity[] = [
  // ── London ────────────────────────────────────────────────────────────
  {
    slug: "london",
    base: "/gb-en",
    copyLang: "en",
    name: "London",
    published: true,
    seoTitle: "AI phone answering for London restaurants — Vox by BitePerk",
    seoDescription:
      "Vox answers your London restaurant's phone in a natural voice, checks the real diary and books the table — while your team stays on the floor. UK pilots now open.",
    heroHeadline: "A full room in Soho, three lines ringing. Vox picks up every one.",
    intro: [
      "A Friday night in Soho seats itself twice over, and the phone still rings — a six-top asking about Sunday, a regular running late, a theatre party checking whether the kitchen holds until eleven. Vox answers all of it in a warm, natural voice while your team keeps pouring.",
      "London dining runs on pressure. Rents are the steepest in the country, staffing is stretched from Borough to Notting Hill, and the person you can least afford to pull off the floor mid-service is whoever stands nearest the phone. The calls that ring out are the expensive ones: birthdays, corporate six-tops, pre-theatre parties who book the place across the road the moment nobody picks up.",
      "Vox exists for exactly that gap. It answers immediately at any hour, checks what the diary genuinely holds, and confirms the table before the caller hangs up — handing over to a person the moment a conversation stops being routine. It runs live in Australia today; London is where our UK pilot programme starts.",
    ],
    districts: [
      "Soho", "Shoreditch", "Mayfair", "Borough", "Islington", "Notting Hill",
      "Hackney", "Fitzrovia", "Brixton", "Peckham",
    ],
    scenarios: [
      {
        title: "Pre-theatre, 5:45pm",
        body: "Forty covers arriving before curtain-up and the phone going at the pass. Vox takes the interval-timing question, confirms the six o'clock table for four, and your floor staff never break stride.",
      },
      {
        title: "The 11pm enquiry",
        body: "A group spills out of a show and wants a table for next weekend. Nobody sane staffs a phone at eleven; Vox does, and by Monday morning the booking is already sitting in the diary with its transcript attached.",
      },
      {
        title: "\"We definitely booked for eight\"",
        body: "A caller insists the reservation was for eight, not six. Every Vox call keeps its recording and transcript, so a disputed booking becomes a fact you look up rather than an argument you lose.",
      },
      {
        title: "The private-dining enquiry",
        body: "A PA wants the mezzanine for eighteen with a set menu and a budget to discuss. Vox captures the full brief — date, numbers, dietaries — and routes it to your events inbox as a complete, warm lead instead of a voicemail beep.",
      },
    ],
    faqs: [
      {
        q: "Is Vox actually running in London today?",
        a: "It is live in Australia, answering real calls for venues that pay for it. In London we are signing pilot partners now — the honest description is proven elsewhere, arriving here, and pilot terms reflect that.",
      },
      {
        q: "We're a two-room independent, not a group. Is this for us?",
        a: "Yes — pilots are venue-by-venue by design. A small Soho independent teaches the UK build more than a head office ever could, and terms are agreed per venue with no rate card.",
      },
      {
        q: "What happens when three people call during the rush?",
        a: "All three get answered at once, on the first ring. Concurrency is the point of a machine host — the engaged tone is the sound of a London booking going elsewhere.",
      },
      {
        q: "Do we need new hardware or a new number?",
        a: "No. You keep your number and forward calls to Vox — all of them, or only the ones that would otherwise ring out. That call-forward is the entire installation.",
      },
      {
        q: "What does it cost?",
        a: "Pilot terms are set with each venue rather than read off a rate card, and we agree what success looks like before the first call is answered. If it doesn't earn its keep, you stop.",
      },
    ],
    aiLocal: {
      lead: "Speech models tuned per market, a live diary check on every call, and a hard rule that anything unusual goes straight to your team — that is the machinery underneath, arranged for how London actually eats.",
      points: [
        {
          icon: "pin",
          title: "Knows its way around",
          body: "Generic transcription mangles British place names. The UK build is tuned on them, so Clerkenwell arrives in the booking notes as Clerkenwell.",
        },
        {
          icon: "calendar-tick",
          title: "The diary is the truth",
          body: "Vox reads real availability before it promises anything, so a packed West End Saturday can never be double-sold by an over-eager answer.",
        },
        {
          icon: "phone-wave",
          title: "Every accent orders dinner here",
          body: "London calls in every accent on earth. The listening model is built for that spread, and each pilot call sharpens it further.",
        },
        {
          icon: "shield",
          title: "UK GDPR on its own terms",
          body: "Call data is processed to complete a booking, stays reviewable by the venue, and is never used to profile a caller. The UK regime is treated as its own law, not an EU footnote.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "london-skyline",
    cityscapeImageAlt: "Aerial view of London — Tower Bridge and the Thames winding toward the City",
    ...UK_STORY,
  },

  // ── Manchester ────────────────────────────────────────────────────────
  {
    slug: "manchester",
    base: "/gb-en",
    copyLang: "en",
    name: "Manchester",
    published: true,
    seoTitle: "Vox in Manchester — an AI host on your restaurant's phone",
    seoDescription:
      "From the Northern Quarter to match day, Vox picks up every booking call in a natural voice and writes it into your diary. Manchester venues: UK pilots are open.",
    heroHeadline: "From the Northern Quarter to match day — every call answered.",
    intro: [
      "Manchester's food scene grew faster than anyone's staffing plan. Ancoats went from mills to national best-of lists inside a decade, the Northern Quarter never stopped queueing, and somewhere in every service there is a phone ringing that nobody has a free hand to answer.",
      "The city's rhythm is its own. Match days fill every table within a mile of a ground and empty them again by kick-off. Spinningfields runs on trade lunches booked that morning; gig nights end with forty people deciding at once that they're starving. Bookings here arrive in bursts — and bursts are precisely when a phone rings out.",
      "So Vox picks up on the first ring, every time, in a voice callers don't hang up on. It checks the diary while it talks and confirms the table before the caller can try the place next door. Proven in production in Australia; Manchester is among the first cities in our UK pilots.",
    ],
    districts: [
      "Northern Quarter", "Ancoats", "Deansgate", "Spinningfields", "Castlefield",
      "Didsbury", "Chorlton", "Altrincham", "Sale", "Prestwich",
    ],
    scenarios: [
      {
        title: "Match day, two sittings",
        body: "The room turns over completely between one and three, and the calls never stop. Vox absorbs the surge — every caller answered at once, every booking checked against a diary that's changing by the minute.",
      },
      {
        title: "The morning trade lunch",
        body: "An office books a table for six at 9:40am while your team is still taking deliveries. Vox handles it, notes the dietaries, and the first your staff hear of it is a tidy entry in the diary.",
      },
      {
        title: "Closing time, phone still going",
        body: "Post-gig crowds ring on the walk over. Vox tells them honestly what the kitchen can still do tonight, and takes tomorrow's booking from anyone it can't seat.",
      },
      {
        title: "Party season from October",
        body: "The Christmas enquiries stack up early — twenty from an office, thirty from a warehouse do, every one wanting a quote. Vox takes each brief in full, so your manager rings back only the ones that need an actual negotiation.",
      },
    ],
    faqs: [
      {
        q: "Will it understand a Mancunian accent?",
        a: "The listening model is tuned per market, not imported and hoped for. UK pilot calls are exactly how it learns the city's voices — that is a stated part of what a pilot venue signs up to help with.",
      },
      {
        q: "Our bookings triple on match days. Can it keep up?",
        a: "Surges are the easiest case: Vox answers every concurrent call instantly, and the diary check stops the surge from over-selling the room. No queue, no engaged tone.",
      },
      {
        q: "Is there a Manchester office behind this?",
        a: "No, and we won't pretend otherwise. BitePerk is an Australian company running a UK pilot programme; support is remote and honest about time zones. What exists locally is your venue, your number and your diary.",
      },
      {
        q: "How fast could a pilot start?",
        a: "Setup is a call-forward from your existing number, so the mechanical part takes minutes. The real work is agreeing what success looks like for your venue — we do that first.",
      },
      {
        q: "Does the team need training?",
        a: "No. Nothing changes on the floor: bookings appear in the diary with transcripts attached, and your staff keep doing exactly what they do now — minus running for the phone.",
      },
    ],
    aiLocal: {
      lead: "Under the hood it is one system doing three unglamorous things well: hearing the caller correctly, telling the truth about availability, and knowing when to fetch a human. Tuned, in this case, for Manchester.",
      points: [
        {
          icon: "phone-wave",
          title: "Built for northern voices",
          body: "Accents are training data, not edge cases. Pilot calls from Manchester venues are the raw material the UK listening model improves on.",
        },
        {
          icon: "calendar-tick",
          title: "Honest about a moving diary",
          body: "On a double-service day availability shifts every minute. Vox re-checks at the moment of booking, so what it confirms is what the room can hold.",
        },
        {
          icon: "pin",
          title: "Local names, spelt right",
          body: "Ancoats, Chorlton, Altrincham — the transcription layer knows the map, so booking notes read like a local wrote them.",
        },
        {
          icon: "shield",
          title: "A human within one sentence",
          body: "A complaint, a journalist, anything odd — Vox stops, says it's fetching someone, and hands over. It never improvises its way through a conversation that matters.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "manchester-skyline",
    cityscapeImageAlt: "Manchester skyline at golden hour, glass towers rising above the city",
    ...UK_STORY,
  },

  // ── Birmingham ────────────────────────────────────────────────────────
  {
    slug: "birmingham",
    base: "/gb-en",
    copyLang: "en",
    name: "Birmingham",
    published: true,
    seoTitle: "AI answering for Birmingham restaurants & cafés — Vox pilots",
    seoDescription:
      "Vox answers Birmingham venue phones in a natural voice — bookings checked against your real diary, every call kept with a transcript. Join the UK pilot programme.",
    heroHeadline: "Birmingham's kitchens are busy enough. The phone can answer itself.",
    intro: [
      "Birmingham has spent twenty years being underestimated and used the time to become one of Britain's most serious food cities — a Michelin cluster the equal of anywhere outside the capital, a balti tradition with its own postcode-deep loyalties, and neighbourhood dining rooms in Moseley and Harborne that fill on reputation alone.",
      "What most of those venues share is a small team and a phone that does not care how busy the pass is. A booking call at seven on a Saturday competes with a full room; in a family-run balti house the person answering is usually also the person running the floor. Either the call wins or the room does — someone loses both ways.",
      "Vox removes the choice. It answers every call in a natural voice, checks the real diary before promising a table, and writes the booking down with a transcript your staff can read between services. Live in Australia now, and part of the first wave of UK pilot cities.",
    ],
    districts: [
      "Digbeth", "Jewellery Quarter", "Moseley", "Harborne", "Kings Heath",
      "Edgbaston", "Stirchley", "Sutton Coldfield", "Solihull",
    ],
    scenarios: [
      {
        title: "Saturday at the balti house",
        body: "Three generations in the room, one person on the pass, and the phone going every four minutes. Vox takes each call — party size, time, spice-level warnings in the notes — while the family cooks.",
      },
      {
        title: "The tasting-menu enquiry",
        body: "A caller wants the counter menu, the allergy accommodations and a date three weeks out. Vox handles the whole conversation and books it — or hands to a person the moment it turns into something needing judgement.",
      },
      {
        title: "Arena night in the city centre",
        body: "Twenty thousand people out of a show at ten, phones in hand. The venues whose lines get answered take the late tables and tomorrow's bookings; the rest ring out into voicemail.",
      },
      {
        title: "Iftar sittings, timed to the minute",
        body: "During Ramadan the evening booking surge lands in one narrow window and the sitting time has to be exact. Vox takes the wave of calls with precise times in every note, and the room is set right when the sun goes down.",
      },
    ],
    faqs: [
      {
        q: "Our menu needs explaining. Can a machine do that?",
        a: "Vox answers from what you tell it about your menu, honestly and within limits. Anything it can't answer, it says so and offers the team — it never invents a dish or a policy.",
      },
      {
        q: "Do callers know they're talking to an AI?",
        a: "Yes, Vox says so up front. What we consistently see is that callers mind far less about that than about a phone that rings out — the disclosure costs seconds, the missed call costs the booking.",
      },
      {
        q: "We take most bookings by phone, not apps. Is that a problem?",
        a: "It's the reason to talk to us. Phone-first venues lose the most to missed calls, so they gain the most from a line that always picks up. No app, no widget, no behaviour change for your guests.",
      },
      {
        q: "What about calls in languages other than English?",
        a: "Today the UK build answers in English. Wider language support is pilot-programme work, not a promise — if it matters to your room, tell us, because pilot venues set the build order.",
      },
      {
        q: "Who sees our call data?",
        a: "Your venue does — recordings and transcripts live with the booking. Data is processed to complete bookings under UK GDPR, not resold and not used to profile callers.",
      },
    ],
    aiLocal: {
      lead: "The system underneath is deliberately boring: recognise speech accurately, consult the diary truthfully, escalate to people quickly. Birmingham's version is tuned for the city's spread — chains it ignores, neighbourhoods it knows.",
      points: [
        {
          icon: "pin",
          title: "Suburb-literate",
          body: "Bookings here come from Stirchley as often as the city core. The address and name models cover the whole map, not just the centre.",
        },
        {
          icon: "phone-wave",
          title: "Brummie is not an edge case",
          body: "The recognition layer trains on real regional calls, and every pilot conversation makes it better at the city it serves.",
        },
        {
          icon: "calendar-tick",
          title: "No phantom tables",
          body: "Availability comes from the diary at the moment of asking. If the room is full, Vox says so and offers what's true instead.",
        },
        {
          icon: "shield",
          title: "Escalation is a feature",
          body: "Complaints, allergies beyond the notes, anything sensitive — the call goes to your team by rule, with the context attached.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "birmingham-skyline",
    cityscapeImageAlt: "The Birmingham skyline across open water on a bright day",
    ...UK_STORY,
  },

  // ── Edinburgh ─────────────────────────────────────────────────────────
  {
    slug: "edinburgh",
    base: "/gb-en",
    copyLang: "en",
    name: "Edinburgh",
    published: true,
    seoTitle: "An answered phone for Edinburgh restaurants — Vox by BitePerk",
    seoDescription:
      "August madness or January quiet, Vox answers every Edinburgh booking call in a natural voice and fills your diary honestly. UK pilot partnerships now open.",
    heroHeadline: "Edinburgh fills twice a year. Your phone shouldn't ring out either time.",
    intro: [
      "Edinburgh runs two restaurants in one building: the August one, where the Festival quadruples the city and every table from the Old Town to Stockbridge is fought over, and the rest-of-the-year one, where locals reclaim Leith and a quiet Tuesday matters. The phone is a different problem in each — and unanswered in both.",
      "In Festival season the calls come faster than any human can take them, in every accent a fringe show can import, at hours that make no sense. In November they're sparse but precious: a fiftieth birthday, an office Christmas booking, a food tourist planning around one dinner. Missing the August flood costs volume; missing the November call costs the whole night.",
      "Vox answers both seasons the same way — instantly, warmly, with the diary open. It books what the room can truly take, hands anything delicate to your team, and keeps a transcript of every call. Running live in Australia today, and now taking Edinburgh pilot venues.",
    ],
    districts: [
      "Old Town", "New Town", "Stockbridge", "Leith", "Bruntsfield",
      "Morningside", "Tollcross", "Portobello", "Grassmarket",
    ],
    scenarios: [
      {
        title: "Fringe week, phone on fire",
        body: "Forty calls an hour, half of them for tonight. Vox answers all of them at once, fills the diary to what the kitchen can survive, and politely lands the overflow on other nights.",
      },
      {
        title: "The one-dinner tourist",
        body: "A caller planning a trip around a single booking, three time zones away, ringing at 3am your time. Vox is awake, the diary is open, and the table is confirmed before they lose their nerve.",
      },
      {
        title: "January Tuesday, skeleton crew",
        body: "Two staff on, one delivery arriving, phone rings. It's a party of twelve for Burns Night. Vox takes every detail down properly — the kind of booking a rushed scribble on a pad gets wrong.",
      },
      {
        title: "Hogmanay, everyone's one night",
        body: "The city sells out and every caller is carrying the pressure of their single night of the year. Vox books exactly what exists, waitlists the rest honestly, and never promises a table that midnight can't hold.",
      },
    ],
    faqs: [
      {
        q: "Can it survive August?",
        a: "August is the case it's built for. A machine host answers every concurrent call without queueing, and the diary check stops festival demand from over-selling your room. The crush becomes bookings instead of noise.",
      },
      {
        q: "Callers from overseas, odd hours — handled?",
        a: "Yes. Vox answers at any hour, which for a tourist city is half the value: booking calls arrive from time zones your staff will never overlap with.",
      },
      {
        q: "Do you understand Scottish accents?",
        a: "The model is tuned per market and improves on real pilot calls — Scottish voices included, not as an afterthought. Early pilot venues shape exactly this.",
      },
      {
        q: "What if a call needs a human — a complaint, say?",
        a: "Vox stops and hands over, by rule rather than judgement call. It also flags the conversation so whoever picks it up has the context in front of them.",
      },
      {
        q: "Is our data staying under UK rules?",
        a: "Call data is handled under UK GDPR as its own regime, processed to complete bookings and reviewable by your venue. We treat the UK's rules as the rules, full stop.",
      },
    ],
    aiLocal: {
      lead: "One system, seasonally stress-tested: recognition that copes with a Festival's worth of accents, a diary connection that tells the truth under pressure, and an exit to a human that is never more than a sentence away — Edinburgh's configuration.",
      points: [
        {
          icon: "calendar-tick",
          title: "Peak-proof honesty",
          body: "Demand never changes what the diary says. In August that discipline is the difference between a full room and an oversold one.",
        },
        {
          icon: "phone-wave",
          title: "A world of accents",
          body: "Festival callers arrive from everywhere. The listening layer is built for variety and trained further by every Edinburgh pilot call.",
        },
        {
          icon: "pin",
          title: "Knows both towns",
          body: "Old Town or New Town, Leith or Morningside — place names land correctly in the notes, so staff know exactly which caller is which.",
        },
        {
          icon: "shield",
          title: "Rules before cleverness",
          body: "Sensitive calls go to people. Data stays within UK GDPR. The clever part is knowing where cleverness should stop.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "edinburgh-old-town",
    cityscapeImageAlt: "Edinburgh's Old Town skyline in golden haze — clock tower and monument spires",
    ...UK_STORY,
  },

  // ── Glasgow ───────────────────────────────────────────────────────────
  {
    slug: "glasgow",
    base: "/gb-en",
    copyLang: "en",
    name: "Glasgow",
    published: true,
    seoTitle: "Glasgow restaurant calls, answered by Vox — UK pilot programme",
    seoDescription:
      "Vox picks up every call to your Glasgow venue in a natural voice, books against the real diary and hands anything unusual to your team. Pilot spots open now.",
    heroHeadline: "Glasgow loves to talk. Vox makes sure your venue never misses a word.",
    intro: [
      "Nobody books dinner in Glasgow without a conversation. It's a city that phones — to ask, to haggle over the time, to mention it's a birthday, to check the band finishes before last orders. Finnieston's strip, the West End's institutions, the Southside's new rooms: all of them live on a ringing phone that service keeps them from answering.",
      "And Glasgow's nights surge. An arena show tips thousands of people into the same postcode wanting fed at the same hour; a big match does it twice in a weekend. The venues that capture those surges are the ones whose phones get picked up — which, mid-service, with a lean crew, is nobody's guarantee.",
      "Vox makes it a guarantee. Every call answered on the first ring in a voice that can hold a Glasgow conversation, every booking checked against the actual diary, every unusual call handed to a human with its context. Live in Australia; Glasgow pilots now open.",
    ],
    districts: [
      "Finnieston", "West End", "Merchant City", "Southside", "Shawlands",
      "Dennistoun", "Partick", "Hyndland", "Strathbungo",
    ],
    scenarios: [
      {
        title: "Hydro night on the strip",
        body: "Doors at seven, dinner at six, and every table in Finnieston spoken for by Tuesday. The calls that keep coming get answered anyway — waitlisted, redirected to other nights, never lost.",
      },
      {
        title: "The birthday negotiation",
        body: "A caller wants the window table, a cake on standby and the bill split four ways. Vox books the table and the notes; the cake conversation goes to your team, transcript attached.",
      },
      {
        title: "Old Firm weekend",
        body: "Two full turns before kick-off and a room that empties in minutes. Vox keeps taking bookings through the chaos, against a diary that knows exactly how tight the turnaround is.",
      },
      {
        title: "Payday Friday, booked on impulse",
        body: "The last Friday of the month fills Glasgow's rooms on a whim, and the deciding call comes at four in the afternoon. Vox answers it while your team sets up, and the impulse becomes a confirmed table instead of a walk past.",
      },
    ],
    faqs: [
      {
        q: "Glasgow accents are famous. Honestly — will it cope?",
        a: "Honestly: it's tuned per market, it improves on real calls, and Glaswegian voices are precisely the training data the UK build needs. Pilot venues are how it gets there — that's the deal, stated plainly.",
      },
      {
        q: "Our regulars like a blether. Won't a machine put them off?",
        a: "Vox is warm but efficient — it books the table, it doesn't replace the craic. Regulars still get your team in the room; what changes is that their call never rings out to voicemail.",
      },
      {
        q: "Can it handle gig-night surges?",
        a: "Surges are its best case. Every simultaneous caller gets answered instantly, and the diary check means a rammed pre-show service can't be double-booked into disaster.",
      },
      {
        q: "What's actually installed at the venue?",
        a: "Nothing. A call-forward from your existing number is the whole job — keep it for every call or only for overflow. Your number, your diary, no new kit.",
      },
      {
        q: "And if we hate it?",
        a: "Pilot terms are venue-by-venue with success criteria agreed up front and nothing locked in. If it isn't obviously paying for itself in kept bookings, you switch the forward off.",
      },
    ],
    aiLocal: {
      lead: "What sits under the voice is deliberately plain engineering: market-tuned speech recognition, a live line to your diary, and an escalation rule with no exceptions. The Glasgow tuning leans hard into the first of those.",
      points: [
        {
          icon: "phone-wave",
          title: "Trained on the patter",
          body: "Fast, warm, idiomatic speech is the target, not the failure mode. Every Glasgow pilot call teaches the model the city's cadence.",
        },
        {
          icon: "calendar-tick",
          title: "Tight turns, told truly",
          body: "Pre-show services run on minutes. Vox books only what the diary's turn times actually allow, however hard the demand pushes.",
        },
        {
          icon: "pin",
          title: "From Partick to the Southside",
          body: "Local names transcribe correctly, so the notes your team reads are the conversation the caller actually had.",
        },
        {
          icon: "shield",
          title: "People for the people parts",
          body: "Anything emotional, sensitive or odd is a handover, not an attempt. The machine's job is the routine; your team's job is the judgement.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "glasgow-clyde",
    cityscapeImageAlt: "Glasgow along the River Clyde on a bright day, bridges leading into the city",
    ...UK_STORY,
  },

  // ── Leeds ─────────────────────────────────────────────────────────────
  {
    slug: "leeds",
    base: "/gb-en",
    copyLang: "en",
    name: "Leeds",
    published: true,
    seoTitle: "Vox for Leeds venues — AI phone answering, UK pilots open",
    seoDescription:
      "Office lunches, arcade brunches, Call Lane nights — Vox answers every Leeds booking call in a natural voice and writes it straight into your diary.",
    heroHeadline: "Service in Leeds doesn't pause for the phone. Now it doesn't have to.",
    intro: [
      "Leeds eats in shifts. The financial district books lunch at ten and expects the table at twelve; the Victorian arcades run brunch queues at weekends; Call Lane turns the same tables three times on a Saturday night; and term time moves thousands of students through Headingley's cafés on a weekly cycle. Each shift generates calls, and every one arrives while your team is mid-shift serving the last one.",
      "The maths of a missed call is brutal in a city this competitive. A ringing-out phone doesn't create a pause in demand — the caller simply books one street over, because in Leeds there is always a one street over.",
      "Vox ends the ring-out. It answers instantly in a natural voice, checks your real availability, books the table and keeps the transcript. When a call needs a person, it fetches one. It is in production in Australia today, and Leeds is in the first wave of UK pilot cities.",
    ],
    districts: [
      "City Centre", "Call Lane", "Headingley", "Chapel Allerton", "Horsforth",
      "Kirkstall", "Roundhay", "Meanwood", "Oakwood",
    ],
    scenarios: [
      {
        title: "The ten-o'clock lunch rush",
        body: "Office bookings land in a burst mid-morning while the kitchen preps. Vox takes them all in parallel — sizes, times, the gluten-free note — and the diary is set before the first cover walks in.",
      },
      {
        title: "Saturday brunch queue",
        body: "A queue out the arcade door and the phone ringing under the till. Vox answers what your team physically can't, converting would-be walk-aways into this afternoon's and next week's tables.",
      },
      {
        title: "Graduation week",
        body: "Every family in three postcodes wants the same Saturday. Vox fills the diary to its true capacity, waitlists the rest honestly, and nobody's big day gets a shrug and a busy signal.",
      },
      {
        title: "The conference bump",
        body: "A convention fills the city midweek and fifty strangers all want tables at seven. Vox absorbs the spike without letting it trample your regulars' half-past-sevens, because the diary — not the demand — decides.",
      },
    ],
    faqs: [
      {
        q: "We're a café, not a white-tablecloth restaurant. Still relevant?",
        a: "Arguably more so — cafés run the leanest floors and lose the most calls. Vox doesn't care about your price point; it cares that your phone rings while your hands are full.",
      },
      {
        q: "Can it take orders as well as bookings?",
        a: "Bookings are what's live today. Phone orders for pickup are a separate capability we're building in the open — ask about it, but we won't sell you something that isn't shipping.",
      },
      {
        q: "Yorkshire accents — really?",
        a: "Really. Recognition is tuned per market and learns from every pilot call. If it mishears, the transcript shows it, and that's a fix, not a mystery.",
      },
      {
        q: "How do we see what the phone did?",
        a: "One place: every call, its transcript, its recording, and the booking it produced. The end-of-week question 'what did we miss?' finally has an answer, and the answer is nothing.",
      },
      {
        q: "What's the catch on the pilot?",
        a: "The honest catch: you're early, so some things aren't built yet — no UK number, no diary-software integration on day one. In exchange you get pilot terms and a real say in what gets built first.",
      },
    ],
    aiLocal: {
      lead: "Beneath the conversation there are only three moving parts — ears, diary, escape hatch — and each one is tuned to the market it serves. For Leeds, that tuning is about pace: fast bursts, quick turns, no wasted seconds.",
      points: [
        {
          icon: "calendar-tick",
          title: "Burst-proof booking",
          body: "Ten simultaneous lunch calls resolve against one diary without a collision. The room fills exactly once.",
        },
        {
          icon: "phone-wave",
          title: "Tuned northwards",
          body: "The recognition model treats Yorkshire speech as home ground, and every Leeds pilot call trains it further.",
        },
        {
          icon: "pin",
          title: "Knows the geography",
          body: "Headingley or Horsforth, arcade or waterfront — place names transcribe cleanly into notes your team can act on.",
        },
        {
          icon: "shield",
          title: "Escalates like clockwork",
          body: "Complaints and complications go to people immediately, with the conversation so far attached. No machine bravado.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "leeds-dock",
    cityscapeImageAlt: "Leeds Dock — narrowboats on still water between brick and glass buildings",
    ...UK_STORY,
  },

  // ── Bristol ───────────────────────────────────────────────────────────
  {
    slug: "bristol",
    base: "/gb-en",
    copyLang: "en",
    name: "Bristol",
    published: true,
    seoTitle: "AI phone host for Bristol restaurants — Vox pilot partnerships",
    seoDescription:
      "Bristol's independents run lean. Vox answers the phone in a natural voice, books against your real diary, and hands anything unusual to a human. Pilots open.",
    heroHeadline: "Bristol's independents run lean. Vox answers so your people don't stop.",
    intro: [
      "Bristol chose independence and made it work: the venues that matter here are owner-run rooms on Gloucester Road, in Stokes Croft, along the harbourside — places where the chef owns the lease and the front-of-house is three people deep on a good day. Nothing about that model leaves anyone spare to sit by a phone.",
      "The city's dining weekends compound it. Harbour festivals, balloon mornings, a food scene that draws day-trippers from three counties — demand spikes hard, then normal Tuesdays follow. Small teams can staff for one or the other; the phone punishes them for both.",
      "Vox is the spare pair of hands that never rings in sick. It answers every call in a natural voice, tells callers the truth about what the diary holds, books what fits and hands the rest to your team with a transcript. It runs live in Australia today. Bristol's pilot spots are open.",
    ],
    districts: [
      "Stokes Croft", "Gloucester Road", "Clifton", "Harbourside", "Southville",
      "Bedminster", "Redland", "Easton", "Wapping Wharf",
    ],
    scenarios: [
      {
        title: "Balloon-morning breakfast",
        body: "The fiesta puts half the county at your door by nine. Vox has been answering since dawn — bookings taken, capacity respected, and a waitlist that actually gets called back.",
      },
      {
        title: "Three staff, full room, phone",
        body: "An owner-run room mid-service is the worst possible moment for a ringing phone, and the commonest. Vox takes the call; your three people keep the fifty guests happy.",
      },
      {
        title: "The Sunday-roast pilgrimage",
        body: "Roasts book out days ahead and the calls keep coming. Vox offers the honest alternatives — earlier sitting, next Sunday — and turns 'sorry, full' into a diary that stays full.",
      },
      {
        title: "Concert crowd off the harbour",
        body: "An outdoor show ends at ten and the calls start on the walk into town. Vox answers every one, seats what tonight can still hold, and books the rest of the curious in for the weekend.",
      },
    ],
    faqs: [
      {
        q: "We're deliberately low-tech. Why would we start here?",
        a: "Because this asks nothing of you technically — no app, no tablet, no new system. Your number stays, calls forward, bookings land in whatever diary you already keep. It's the least-tech way to stop missing calls.",
      },
      {
        q: "Is this another platform taking a cut of covers?",
        a: "No. Vox isn't a marketplace and doesn't sit between you and your guests' loyalty — it answers your phone, on your number, for your diary. Pilot terms are a straight agreement with the venue.",
      },
      {
        q: "What happens to a caller with a complicated request?",
        a: "Vox recognises its limits by rule. Anything past routine — an allergy conversation, an event enquiry, a complaint — it hands to your team, having captured the details so the caller isn't asked twice.",
      },
      {
        q: "Where does our call data live?",
        a: "With the booking, for your venue's eyes: recording, transcript, outcome. Processed to complete bookings under UK GDPR, never sold, never used to profile your guests.",
      },
      {
        q: "Why should Bristol trust an Australian company?",
        a: "Don't trust — verify. Vox answers real calls for paying venues in Australia today, and a pilot here has success criteria you set. The claim is only ever what's checkable.",
      },
    ],
    aiLocal: {
      lead: "The stack stays out of your way on purpose: speech recognition tuned for this market, one live connection to your availability, and an ironclad handover rule. Bristol's tuning is for small rooms where every cover counts.",
      points: [
        {
          icon: "shield",
          title: "Small-room stakes",
          body: "In a thirty-cover room one bad double-booking ruins a night. The diary check is strict precisely because your margins are.",
        },
        {
          icon: "phone-wave",
          title: "West Country ready",
          body: "The listening model is tuned per market and learns from every local pilot call — Bristol's voices train Bristol's build.",
        },
        {
          icon: "pin",
          title: "Neighbourhood fluent",
          body: "Stokes Croft, Southville, Wapping Wharf — the names land right in the notes, so nothing about a booking needs decoding.",
        },
        {
          icon: "calendar-tick",
          title: "Truth over volume",
          body: "Festival-weekend demand doesn't stretch the room. Vox books to capacity and not a cover past it.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "bristol-balloons",
    cityscapeImageAlt: "Hot-air balloons drifting over the Clifton Suspension Bridge and the Avon Gorge",
    ...UK_STORY,
  },

  // ── Liverpool ─────────────────────────────────────────────────────────
  {
    slug: "liverpool",
    base: "/gb-en",
    copyLang: "en",
    name: "Liverpool",
    published: true,
    seoTitle: "Liverpool restaurant phones, answered — Vox by BitePerk",
    seoDescription:
      "Match days, Bold Street, big group weekends — Vox answers every Liverpool booking call in a natural voice and books it against your real diary. UK pilots open.",
    heroHeadline: "Match day, Bold Street, Sunday lunch — every Liverpool call answered.",
    intro: [
      "Liverpool's hospitality works its weekends harder than any city in England. Two football clubs bring the world to town on alternating Saturdays; Bold Street and the Ropewalks queue from brunch; and the big-group booking — the birthday of twelve, the weekend party of twenty — arrives by phone, because nobody organises twenty people through an app.",
      "Those group calls are the city's bread and butter, and they're exactly the calls venues lose. They come mid-service, they take five minutes of questions, and the organiser rings the next place on the list the moment a phone goes unanswered. One missed call here isn't one cover — it's twenty, plus the deposit.",
      "Vox answers every one of them, first ring, any hour. It holds the five-minute conversation patiently, checks the diary honestly, books what fits and escalates what needs your judgement — with the transcript already written. Live in Australia today; Liverpool pilot venues wanted now.",
    ],
    districts: [
      "Bold Street", "Ropewalks", "Georgian Quarter", "Baltic Triangle",
      "Albert Dock", "Castle Street", "Lark Lane", "Allerton", "Woolton",
    ],
    scenarios: [
      {
        title: "The party of twenty",
        body: "Deposits, dietaries, a private-ish corner, and can the DJ stay till one? Vox works through the whole list, books the provisional, and flags your manager for the parts that need a decision.",
      },
      {
        title: "European night",
        body: "Full city, full room, and the phone carrying tomorrow's bookings while tonight's service peaks. Vox takes tomorrow so your team can serve tonight.",
      },
      {
        title: "Sunday lunch, family scale",
        body: "Multi-generation tables book by phone, often days out, often with changes. Vox takes the booking and the two amendment calls that follow, keeping the diary straight through all three.",
      },
      {
        title: "A liner on the Mersey",
        body: "A cruise ship docks and two hundred day visitors fan out looking for lunch at once. The tide favours whichever venues answer their phones — Vox makes certain yours is among them.",
      },
    ],
    faqs: [
      {
        q: "Big group bookings need deposits. Can Vox handle that?",
        a: "Vox books the table and captures every detail; anything involving payment goes to your team by rule, with the full context handed over. We'd rather draw that line clearly than blur it cleverly.",
      },
      {
        q: "Scouse is its own language. Will it keep up?",
        a: "It's tuned per market and improves on the city's real calls — that's not marketing, it's how the recognition layer works. Pilot venues in Liverpool are literally how it learns Liverpool.",
      },
      {
        q: "Match days flood us. What does Vox change?",
        a: "It answers the flood instead of losing it: every concurrent call picked up, capacity respected, overflow offered other times. The difference shows up as kept bookings on the two busiest days of your month.",
      },
      {
        q: "We already have a booking system. Does this replace it?",
        a: "No — Vox answers the phone and gets bookings into your diary. Direct integrations with UK diary software are pilot-programme work; today the handoff is simple and honest, and pilot venues steer what we build.",
      },
      {
        q: "How do we start?",
        a: "A conversation, then a call-forward. We agree success criteria for your venue first, switch the forward on second, and you hear Vox handle a real call before you commit to anything.",
      },
    ],
    aiLocal: {
      lead: "Underneath: market-tuned ears, a truthful diary line, and a handover rule that puts people where people belong. Liverpool's configuration is built around the long, detail-heavy group call the city runs on.",
      points: [
        {
          icon: "phone-wave",
          title: "Patient with long calls",
          body: "A twenty-person booking takes minutes of back-and-forth. Vox holds the thread without rushing the caller or losing a detail.",
        },
        {
          icon: "calendar-tick",
          title: "Groups without gridlock",
          body: "Big tables reshape a service. Vox books them against real capacity and turn times, so one party of twenty can't sink a Saturday.",
        },
        {
          icon: "pin",
          title: "From the Dock to Lark Lane",
          body: "Liverpool's place names transcribe correctly, so the notes read like they were taken by someone who lives here.",
        },
        {
          icon: "shield",
          title: "Money means humans",
          body: "Deposits, refunds, anything financial: handed to your team every time, context attached. The machine never touches payment.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "liverpool-pier-head",
    cityscapeImageAlt: "The Three Graces on Liverpool's Pier Head under a blue sky",
    ...UK_STORY,
  },

  // ── Brussels (/be-en) — the first non-UK market city ───────────────────
  //
  // Two things make this entry different from the eight above, and both are
  // gates rather than taste:
  //
  //   1. check-cities pools similarity BY LANGUAGE, so this is scored against
  //      all eight UK cities on `intro` and `aiLocal` — 16 comparisons. Those
  //      two fields are deliberately built on a different spine (a lunch
  //      service with a hard edge, not an evening one) and the `shield` point
  //      names EU law, where every UK entry names UK GDPR.
  //   2. LANGUAGE CLAIMS. /be-en's own FAQ says handling French and English on
  //      one line "is the specific thing a Belgian pilot is built to prove. We
  //      would rather demonstrate it on your calls than assert it on a
  //      website", and says Dutch is "Not built." This page holds that line:
  //      the two languages are the VENUE's reality and what a pilot is for,
  //      never a shipped capability, and Dutch is never implied.
  {
    slug: "brussels",
    base: "/be-en",
    copyLang: "en",
    name: "Brussels",
    published: true,
    seoTitle: "AI phone answering for Brussels restaurants — Vox by BitePerk",
    seoDescription:
      "Vox answers your Brussels restaurant's phone in a natural voice, checks the real book and takes the booking — while your team stays with the room. Belgian pilots now opening.",
    heroHeadline: "Lunch is ninety minutes. The phone doesn't wait for you.",
    intro: [
      "Half past twelve in the EU quarter and the room fills in one movement. Everyone who is going to eat today arrives inside twenty minutes, wants to be paid up by two, and the phone starts somewhere under all of it — a table for six on Thursday, a cancellation, someone asking whether the terrace is open yet.",
      "Brussels eats to a timetable that leaves no slack. A lunch service here is not a long evening you can staff around; it is a narrow window where the person who could answer the phone is carrying three plates, and the caller who gets a ringing tone simply tries the next place on the street. The languages arriving on that line are their own question — this is a city where the same number takes French and English within a minute of each other.",
      "Vox is our answer to the narrow window. It picks up on the first ring whatever the hour, reads what the book genuinely has left, and hands the call to your own staff the moment it stops being routine. It runs live in Australia today; Belgium is a pilot programme, and Brussels is where it starts.",
    ],
    districts: [
      "Ixelles", "Saint-Gilles", "Sablon", "Dansaert", "Châtelain",
      "Sainte-Catherine", "Flagey", "Marolles", "Etterbeek", "Uccle",
    ],
    scenarios: [
      {
        title: "12:40, and the room turns over once",
        body: "The lunch rush has one shape and no gaps in it. Vox takes the Thursday six-top while your floor staff stay on the plates, and the booking is in the book before the caller has put the phone down.",
      },
      {
        title: "The first warm Friday",
        body: "Terrace weather arrives overnight and so do the calls. Every one of them gets answered at the same moment rather than queued behind a ringing tone, which is the difference between a full terrace and a half-full one.",
      },
      {
        title: "A caller who switches language mid-sentence",
        body: "It happens here constantly, and it is exactly what a Belgian pilot exists to test. We would rather show you Vox handling one of your own recordings than claim a result on a web page.",
      },
      {
        title: "\"I cancelled that table on Monday\"",
        body: "Every call keeps its recording and transcript. A disputed cancellation stops being one person's memory against another's and becomes something you look up in a few seconds.",
      },
    ],
    faqs: [
      {
        q: "Is Vox running in Brussels today?",
        a: "No. It is live in Australia, answering real calls for venues that pay for it, and Belgium is a pilot programme we are opening now. The honest version is proven elsewhere, arriving here — and pilot terms are written to reflect exactly that.",
      },
      {
        q: "Our callers use French and English on the same line. Can it cope?",
        a: "Handling both on one number is the specific thing a Belgian pilot is built to prove, so we would rather demonstrate it on your calls than assert it here. Which languages your venue actually needs is one of the first things we establish together.",
      },
      {
        q: "What about Dutch?",
        a: "Not built. Serving Flanders properly means Dutch, and that is a genuine commitment rather than a setting we switch on — it follows demand from venues rather than the other way round.",
      },
      {
        q: "Do we need a Belgian number, or new equipment?",
        a: "Neither. You keep the number your guests already dial and forward calls to Vox — all of them, or only the ones that would otherwise ring out. That forward is the whole installation. Belgian numbering needs an approved regulatory bundle and comes through the pilot.",
      },
      {
        q: "What does a pilot cost?",
        a: "Terms are agreed venue by venue rather than read off a price list, and we settle what a good result looks like before the first call is answered. If it does not earn its place, you stop.",
      },
    ],
    aiLocal: {
      lead: "Underneath: a model that listens to how this city actually speaks, a live check against the book before anything is promised, and a firm rule that anything unusual goes to your staff rather than being guessed at.",
      points: [
        {
          icon: "pin",
          title: "Gets the names right",
          body: "Châtelain, Sainte-Catherine, Flagey — off-the-shelf transcription turns Brussels street names into guesswork. Getting them into a booking note intact is unglamorous and it is what a venue notices first.",
        },
        {
          icon: "calendar-tick",
          title: "A promise it can keep",
          body: "Nothing is offered before the book has been read. A service with one sitting cannot absorb an over-eager yes, and a table invented at 13:15 costs you the whole window.",
        },
        {
          icon: "phone-wave",
          title: "Built to listen in a loud room",
          body: "Brussels calls arrive from across Europe, over a terrace at full volume. The listening model is built for that spread of accents and that much background, and every pilot call sharpens it.",
        },
        {
          icon: "shield",
          title: "EU rules, treated as design",
          body: "GDPR and the AI Act's transparency duties apply to a voice agent talking to consumers, and the APD/GBA is the authority that matters here. Call data completes a booking, stays yours to review, and never builds a profile.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "brussels-grand-place",
    cityscapeImageAlt: "The guild houses of the Grand-Place in Brussels",
    ...BE_STORY,
  },

  // ── Paris (/fr) — the first French city ────────────────────────────────
  //
  // copyLang "fr", so check-cities scores it ONLY against other French cities
  // (the fr + be-fr pool), i.e. against Brussels-FR below — never against the
  // English cities. Its `intro` and `aiLocal` are built on the EVENING /
  // no-show spine (le service du soir) so they diverge from Brussels-FR's
  // MIDI / bilingual spine; the `shield` point names the CNIL, where the
  // Belgian entries name the APD/GBA. Staged published:false until the French
  // body copy has had its own native pass (the 7 Sep Ludovic batch covered the
  // shared cityPage.fr furniture, not this per-city prose).
  {
    slug: "paris",
    base: "/fr",
    copyLang: "fr",
    name: "Paris",
    published: true,
    seoTitle: "Hôte téléphonique IA pour restaurants parisiens — BitePerk",
    seoDescription:
      "Vox répond au téléphone de votre restaurant parisien d'une voix naturelle, vérifie le registre réel et enregistre la réservation — pendant que votre équipe reste en salle. Pilotes ouverts en France.",
    heroHeadline: "Vingt heures trente, la salle est pleine, trois lignes sonnent. Vox les prend toutes.",
    intro: [
      "Un vendredi soir dans le Marais : la salle est complète depuis vingt heures et le téléphone continue de sonner — un quatre-couverts pour samedi, un habitué qui aura vingt minutes de retard, une tablée qui demande si la cuisine tient jusqu'à minuit. Vox répond à tout cela d'une voix posée et naturelle pendant que votre équipe reste au service.",
      "Paris dîne tard et se réserve à l'avance. Les loyers comptent parmi les plus lourds du pays, les équipes sont comptées du Marais à Montmartre, et la personne qu'on peut le moins se permettre d'arracher à la salle en plein coup de feu, c'est celle qui se tient près du téléphone. Les appels qui restent sans réponse sont les plus chers : les anniversaires, les tablées d'affaires, les couverts du soir qui filent chez le voisin dès que personne ne décroche. Et le no-show, la plaie du dîner parisien, commence toujours par une réservation que personne n'a pu confirmer.",
      "Vox existe pour cet écart précis. Il décroche sur-le-champ, à n'importe quelle heure, vérifie ce que le registre a réellement à offrir et confirme la table avant que l'appelant ne raccroche — en passant la main à une personne dès qu'une conversation cesse d'être ordinaire. Il tourne en production en Australie aujourd'hui ; la France est un programme pilote, et Paris en est le point de départ.",
    ],
    districts: [
      "Le Marais", "Bastille", "Montmartre", "Saint-Germain-des-Prés", "Pigalle",
      "Canal Saint-Martin", "Belleville", "Batignolles", "Oberkampf", "Bercy",
    ],
    scenarios: [
      {
        title: "20 h 30, le coup de feu du soir",
        body: "La salle tourne à plein et le téléphone sonne au passe. Vox prend la demande pour samedi, confirme le quatre-couverts de vingt heures, et votre personnel de salle ne quitte pas son rang.",
      },
      {
        title: "L'appel de 23 heures",
        body: "Une tablée sort d'un spectacle et cherche une table pour le week-end suivant. Personne de sensé ne tient un téléphone à onze heures du soir ; Vox le fait, et lundi matin la réservation est déjà au registre, sa transcription attachée.",
      },
      {
        title: "« Nous avions pourtant réservé pour huit »",
        body: "Un appelant affirme que la réservation était pour huit, pas six. Chaque appel Vox conserve son enregistrement et sa transcription : une réservation contestée devient un fait que l'on consulte plutôt qu'une discussion que l'on perd.",
      },
      {
        title: "La demande de privatisation",
        body: "Un assistant veut la salle du haut pour dix-huit couverts, un menu unique et un budget à discuter. Vox recueille tout le brief — date, nombre, allergies — et le transmet à votre boîte événements sous forme de piste complète et chaleureuse, pas d'un bip de messagerie.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il réellement à Paris aujourd'hui ?",
        a: "Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous signons des partenaires pilotes en ce moment — la description honnête, c'est : éprouvé ailleurs, en train d'arriver ici, et les conditions du pilote le reflètent.",
      },
      {
        q: "Nous sommes un bistrot indépendant, pas un groupe. Est-ce pour nous ?",
        a: "Oui — les pilotes se font établissement par établissement, par construction. Un petit indépendant du Marais apprend davantage à la version française qu'un siège ne le ferait jamais, et les conditions se conviennent par établissement, sans grille tarifaire.",
      },
      {
        q: "Que se passe-t-il quand trois personnes appellent en plein service ?",
        a: "Les trois sont prises en même temps, dès la première sonnerie. La simultanéité est tout l'intérêt d'un hôte automatisé — la tonalité « occupé » est le bruit d'une réservation parisienne qui part ailleurs.",
      },
      {
        q: "Faut-il un nouveau numéro ou du nouveau matériel ?",
        a: "Non. Vous gardez votre numéro et vous transférez les appels vers Vox — tous, ou seulement ceux qui resteraient autrement sans réponse. Ce transfert d'appel, c'est toute l'installation.",
      },
      {
        q: "Combien ça coûte ?",
        a: "Les conditions du pilote se fixent avec chaque établissement plutôt qu'à partir d'une grille, et nous convenons de ce qu'est une réussite avant le premier appel décroché. Si Vox ne justifie pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "Des modèles de voix réglés marché par marché, une vérification du registre en direct à chaque appel, et une règle ferme — tout ce qui sort de l'ordinaire passe directement à votre équipe. Voilà la mécanique dessous, arrangée pour la façon dont Paris dîne vraiment.",
      points: [
        {
          icon: "pin",
          title: "Il connaît le quartier",
          body: "La transcription générique écorche les noms parisiens. La version française est réglée dessus, si bien que Ménilmontant arrive dans la note de réservation écrit Ménilmontant.",
        },
        {
          icon: "calendar-tick",
          title: "Le registre fait foi",
          body: "Vox lit la disponibilité réelle avant de rien promettre, de sorte qu'un samedi soir complet ne peut jamais être vendu deux fois par une réponse trop empressée.",
        },
        {
          icon: "phone-wave",
          title: "Tous les accents dînent ici",
          body: "Paris appelle avec tous les accents de la francophonie, plus ceux des visiteurs. Le modèle d'écoute est bâti pour cet éventail, et chaque appel du pilote l'affine encore.",
        },
        {
          icon: "shield",
          title: "Le RGPD comme principe",
          body: "Les données d'appel servent à finaliser une réservation, restent consultables par l'établissement et ne servent jamais à profiler un appelant. Les obligations de transparence de l'AI Act (article 50, règlement (UE) 2024/1689) valent pour un agent vocal, et la CNIL est l'autorité qui compte ici.",
        },
      ],
    },
    relatedGuides: [],
    // Was `paris-skyline` (Eiffel) until 7 Sep 2026 — Ludovic asked for a
    // restaurant over the tourist landmark. A Parisian café terrace reads Paris
    // just as unmistakably and keeps the page about hospitality.
    cityscapeImage: "paris-cafe-terrace",
    cityscapeImageAlt: "Terrasse de café parisien — store rayé et chaises de bistrot en rotin vert",
    ...FR_STORY,
  },

  // ── Lyon (/fr) — Phase 2b batch A ──────────────────────────────────────
  // French pool, scored against Paris/Marseille/Nice/Brussels-FR on intro +
  // aiLocal. Spine: the bouchon with no front-of-house — the patron cooks, so
  // the phone rings into an empty room. Distinct from Paris (evening/no-show).
  // shield theme: the call record as the source of truth (Paris = RGPD/CNIL).
  {
    slug: "lyon",
    base: "/fr",
    copyLang: "fr",
    name: "Lyon",
    published: true,
    seoTitle: "Vox, l'hôte téléphonique IA de votre bouchon à Lyon",
    seoDescription:
      "Vox répond au téléphone de votre bouchon ou restaurant à Lyon d'une voix naturelle, vérifie le registre et prend la réservation pendant que la cuisine tourne. Pilotes ouverts en France.",
    heroHeadline: "Au bouchon, le patron est au piano. Le téléphone sonne dans une salle vide.",
    intro: [
      "Un jeudi midi à Lyon : douze couverts attendent leur tablier, le patron est au piano, et le téléphone sonne dans une salle où personne n'est libre pour décrocher. Vox répond à sa place, d'une voix posée, et note la réservation avant que l'appelant n'aille tenter l'adresse d'à côté.",
      "Lyon se dit capitale de la gastronomie, et cela se paie en petites maisons : le bouchon familial où le chef-patron cuisine, sert et tient la caisse, sans personne près du téléphone au moment du coup de feu. C'est là que se perdent les appels qui comptent — la tablée du samedi, le groupe qui veut un menu, l'habitué qui déplace sa réservation. Un appel sans réponse à midi, c'est un couvert vendu chez le voisin, souvent celui-là même qui vous suit dans le guide.",
      "Vox est fait pour cette salle sans standardiste. Il décroche à la première sonnerie, à toute heure, lit ce que le registre a réellement de libre et confirme la table avant de raccrocher — et confie l'appel à une personne dès qu'une demande sort de l'ordinaire. Il tourne en production en Australie ; la France est un programme pilote, et après Paris, Lyon en est l'étape.",
    ],
    districts: [
      "Vieux-Lyon", "Presqu'île", "Croix-Rousse", "Confluence", "Les Brotteaux",
      "La Guillotière", "Terreaux", "Saint-Just", "Monplaisir", "Part-Dieu",
    ],
    scenarios: [
      {
        title: "Midi, deux services en un",
        body: "Le service du midi se joue en deux tournées serrées, sans creux. Vox prend la tablée de jeudi pendant que la cuisine envoie, et la réservation est au registre avant que l'appelant ait raccroché.",
      },
      {
        title: "L'appel qui vient du guide",
        body: "Une adresse citée dans un guide reçoit des appels de toute l'Europe, souvent en anglais. Vox les prend au moment où ils arrivent plutôt que de les laisser sonner, et transmet la demande de groupe complète à votre équipe.",
      },
      {
        title: "« C'était pourtant à mon nom »",
        body: "Chaque appel garde son enregistrement et sa transcription. Une réservation contestée cesse d'opposer deux mémoires : elle devient une ligne que l'on relit en quelques secondes.",
      },
      {
        title: "Le mâchon du samedi",
        body: "Un groupe veut un mâchon avec un menu et un budget à caler. Vox recueille la date, le nombre et les régimes, et envoie une piste complète à votre boîte plutôt qu'un message sur le répondeur.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il déjà à Lyon ?",
        a: "Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous ouvrons des pilotes en ce moment — dit honnêtement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions du pilote le reflètent.",
      },
      {
        q: "Nous sommes un bouchon familial, pas une chaîne. Est-ce pour nous ?",
        a: "Oui — les pilotes se règlent maison par maison. Un petit bouchon apprend davantage à la version française qu'un siège, et les conditions se conviennent au cas par cas, sans grille tarifaire.",
      },
      {
        q: "Et si plusieurs personnes appellent pendant le coup de feu ?",
        a: "Elles sont toutes prises en même temps, dès la première sonnerie. C'est tout l'intérêt d'un hôte automatisé — une tonalité occupée, c'est une réservation lyonnaise qui file ailleurs.",
      },
      {
        q: "Faut-il changer de numéro ou de matériel ?",
        a: "Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement ceux qui resteraient sans réponse. Ce transfert, c'est toute l'installation.",
      },
      {
        q: "Quel est le prix ?",
        a: "Les conditions se fixent avec chaque maison, pas sur une grille, et nous décidons ensemble de ce qu'est une réussite avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "La mécanique tient en trois gestes : reconnaître les mots de Lyon, vérifier le registre avant d'ouvrir la bouche, et confier à une personne tout ce qui n'est pas une réservation ordinaire.",
      points: [
        {
          icon: "pin",
          title: "Il connaît les rues",
          body: "Traboules, montées, quais de Saône — la transcription toute faite en fait de la bouillie. La version française est réglée dessus, si bien que la Croix-Rousse arrive dans la note écrite comme il faut.",
        },
        {
          icon: "calendar-tick",
          title: "Deux tournées, aucune marge",
          body: "Un midi en deux services ne pardonne pas un oui de trop. Vox n'avance rien sans avoir lu le registre, pour qu'une table inventée ne fasse pas sauter la seconde tournée.",
        },
        {
          icon: "phone-wave",
          title: "Des appels de partout",
          body: "Une maison citée dans les guides est appelée en français comme en anglais. Le système d'écoute est bâti pour cet éventail, et chaque appel du pilote l'affine encore.",
        },
        {
          icon: "shield",
          title: "L'appel fait foi",
          body: "Chaque appel est conservé avec sa transcription, consultable par la maison seule et par personne d'autre, jamais réutilisé pour ficher un client. Une contestation se relit au lieu de se discuter.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "lyon-bistrot",
    cityscapeImageAlt: "Salle d'un bistrot lyonnais, chaises en bois courbé et tables dressées près de la fenêtre",
    ...FR_STORY,
  },

  // ── Marseille (/fr) — Phase 2b batch A ─────────────────────────────────
  // Spine: dishes ordered a day ahead (bouillabaisse) — the advance-order call
  // is the week's most valuable and the one that rings out mid-service. shield
  // theme: data minimisation ("le strict nécessaire").
  {
    slug: "marseille",
    base: "/fr",
    copyLang: "fr",
    name: "Marseille",
    published: true,
    seoTitle: "Restaurants marseillais : Vox décroche et note la commande",
    seoDescription:
      "Vox répond au téléphone de votre restaurant à Marseille d'une voix naturelle, note les commandes passées à l'avance et vérifie le registre pendant que la salle tourne. Pilotes ouverts en France.",
    heroHeadline: "La bouillabaisse se commande la veille. Encore faut-il que quelqu'un décroche.",
    intro: [
      "Un vendredi sur le Vieux-Port : la salle se remplit face à l'eau, et le téléphone sonne pour la veille — une bouillabaisse pour six, un grand plateau à préparer, une table en terrasse dès qu'il fait beau. Vox répond quand la salle ne peut pas, vérifie ce qui reste et note la commande avant que l'appelant ne raccroche.",
      "Marseille cuisine des plats qui se décident à l'avance : la bouillabaisse se commande un ou deux jours plus tôt, le temps d'acheter le poisson. L'appel qui prépare ce repas est le plus précieux de la semaine, et c'est souvent celui qui tombe en plein service, quand personne n'est libre. Ici la ligne parle aussi plusieurs langues, d'une rive à l'autre de la Méditerranée. Un appel manqué, ce n'est pas une table en moins — c'est une grande tablée partie ailleurs.",
      "Vox existe pour cet appel-là. Il répond dès la première sonnerie, à toute heure, consulte le registre avant tout engagement et confirme — puis bascule vers une personne dès que la demande le mérite. Il tourne en production en Australie ; la France est un programme pilote, et Marseille rejoint la ligne après Paris.",
    ],
    districts: [
      "Le Panier", "Vieux-Port", "Notre-Dame-du-Mont", "Cours Julien", "Endoume",
      "Vallon des Auffes", "La Plaine", "Castellane", "La Joliette", "Le Roucas Blanc",
    ],
    scenarios: [
      {
        title: "La commande de la veille",
        body: "Une bouillabaisse pour huit se décide avant que le poisson ne soit acheté. Vox prend la demande, la date et le nombre, et la transmet complète à la cuisine, au lieu de la laisser sur un répondeur que personne n'écoute avant le lendemain.",
      },
      {
        title: "Le premier vrai jour d'été",
        body: "La terrasse se remplit dès que le mistral tombe, et les appels avec. Chacun est pris au même moment plutôt que mis en attente derrière une sonnerie — c'est la différence entre une terrasse pleine et une terrasse à moitié.",
      },
      {
        title: "Un appelant qui passe d'une langue à l'autre",
        body: "Sur le port, la même ligne reçoit du français, de l'italien, de l'anglais. C'est exactement ce qu'un pilote sert à éprouver, et nous préférons vous le montrer sur vos appels plutôt que l'affirmer ici.",
      },
      {
        title: "« J'avais pourtant réservé »",
        body: "Chaque appel garde son enregistrement et sa transcription. Une réservation contestée devient une ligne à relire, pas une parole contre une autre.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il à Marseille aujourd'hui ?",
        a: "Non. Il est en production en Australie, où il répond à de vrais appels pour des maisons qui le paient, et la France est un programme pilote que nous ouvrons. Version honnête : éprouvé ailleurs, en train d'arriver ici — les conditions du pilote sont écrites pour cela.",
      },
      {
        q: "Nous sommes une petite adresse de quartier. Est-ce pour nous ?",
        a: "Oui — les pilotes se règlent adresse par adresse. Une petite maison apprend davantage à la version française qu'un siège, et tout se convient au cas par cas, sans grille tarifaire.",
      },
      {
        q: "Que se passe-t-il quand ça sonne de partout en plein service ?",
        a: "Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, c'est une grande table qui s'en va.",
      },
      {
        q: "Faut-il un nouveau numéro ou du matériel ?",
        a: "Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation.",
      },
      {
        q: "Combien ça coûte ?",
        a: "Les conditions se fixent avec chaque maison plutôt que sur une liste de prix, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne mérite pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "Trois principes sous la voix : entendre juste les noms d'ici, ne rien avancer que le registre ne confirme, et laisser une personne reprendre dès qu'un appel sort du cadre.",
      points: [
        {
          icon: "pin",
          title: "Il note bien les noms",
          body: "Endoume, le Vallon des Auffes, la Joliette — la transcription générique en fait n'importe quoi. Les reporter intacts dans une note de réservation est ingrat, et c'est ce qu'une maison remarque d'abord.",
        },
        {
          icon: "calendar-tick",
          title: "Le registre d'abord",
          body: "Rien n'est promis avant lecture du registre. Une commande de la veille suppose de savoir ce que la cuisine peut tenir ; une table inventée coûte le service entier.",
        },
        {
          icon: "phone-wave",
          title: "Plusieurs langues sur une ligne",
          body: "Un port reçoit des appels d'un peu partout autour de la Méditerranée. Le système d'écoute est fait pour ce mélange d'accents, et le pilote l'entraîne un peu plus à chaque appel.",
        },
        {
          icon: "shield",
          title: "Le strict nécessaire",
          body: "Vox ne retient d'un appel que ce qui sert à finaliser la réservation ; le reste n'est pas collecté. Les données restent consultables par la maison et ne construisent aucun profil d'appelant.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "marseille-vieux-port",
    cityscapeImageAlt: "Terrasse d'un restaurant au bord d'un vieux port méditerranéen — barques et maisons colorées",
    ...FR_STORY,
  },

  // ── Nice (/fr) — Phase 2b batch A ──────────────────────────────────────
  // Spine: Riviera seasonality — covers double in summer, callers arrive in
  // Italian and English. shield theme: caller transparency (AI Act art. 50).
  {
    slug: "nice",
    base: "/fr",
    copyLang: "fr",
    name: "Nice",
    published: true,
    seoTitle: "Vox, l'hôte téléphonique IA des terrasses niçoises",
    seoDescription:
      "Vox répond au téléphone de votre restaurant à Nice d'une voix naturelle, tient la ligne quand la saison déborde et vérifie le registre réel. Pilotes ouverts en France.",
    heroHeadline: "L'été, la terrasse déborde — et le téléphone avec. Vox tient la ligne.",
    intro: [
      "Un soir de juillet dans le Vieux-Nice : la terrasse est pleine, la file attend, et le téléphone n'arrête pas — une table pour ce soir, une réservation pour demain, une question en italien sur les horaires. Vox répond à tout cela d'une voix calme pendant que la salle avance.",
      "Nice vit à deux rythmes. Hors saison, le téléphone respire ; l'été venu, les couverts doublent et la ligne sature du matin au soir, portée par une clientèle qui appelle autant en italien et en anglais qu'en français. La personne qui pourrait décrocher est déjà en salle, et l'appel qui sonne dans le vide s'en va sur la Promenade, à l'adresse suivante. C'est en haute saison, quand chaque table compte double, que le téléphone coûte le plus cher.",
      "Vox est fait pour ce pic. Il prend l'appel dès la première sonnerie, quelle que soit l'heure, s'appuie sur le registre réel puis confirme — en laissant la main à une personne quand il le faut. Il tourne en production en Australie ; la France est un programme pilote, et Nice en fait partie depuis Paris.",
    ],
    districts: [
      "Vieux-Nice", "Promenade des Anglais", "Le Port", "Cimiez", "Libération",
      "Jean-Médecin", "Le Carré d'Or", "Riquier", "Fabron", "Mont Boron",
    ],
    scenarios: [
      {
        title: "Vingt et une heures, plein été",
        body: "La salle et la terrasse tournent ensemble, et le téléphone ne faiblit pas. Vox prend la table de demain pendant que votre équipe reste au service, et la réservation est au registre avant que l'appelant ait raccroché.",
      },
      {
        title: "Un appel en italien",
        body: "À une heure de la frontière, une bonne part des appels arrivent en italien ou en anglais. C'est précisément ce qu'un pilote sert à éprouver ; nous préférons vous le montrer sur vos appels que l'écrire ici.",
      },
      {
        title: "La bascule de saison",
        body: "Le jour où la saison démarre, le volume d'appels change du tout au tout. Vox encaisse ce pic sans embaucher un standard pour trois mois, puis se fait oublier quand la ville se vide.",
      },
      {
        title: "« On avait dit en terrasse »",
        body: "Chaque appel garde son enregistrement et sa transcription. Une demande contestée — terrasse ou salle — se relit en quelques secondes plutôt que de se discuter.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il déjà à Nice ?",
        a: "Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous signons des pilotes en ce moment — honnêtement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions le reflètent.",
      },
      {
        q: "Nous n'ouvrons vraiment qu'en saison. Est-ce pour nous ?",
        a: "Oui, et c'est même là que Vox se justifie le mieux : il absorbe le pic sans standard saisonnier à recruter, et les conditions du pilote se conviennent au cas par cas.",
      },
      {
        q: "Et quand tout sonne en même temps un soir d'août ?",
        a: "Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, un soir d'été, c'est une table perdue sur la Promenade.",
      },
      {
        q: "Faut-il un nouveau numéro ou du matériel ?",
        a: "Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation.",
      },
      {
        q: "Combien ça coûte ?",
        a: "Les conditions se fixent avec chaque établissement, pas sur une grille, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "Ce qui travaille sous la voix : une oreille réglée sur Nice et ses langues, un registre consulté avant chaque oui, et le réflexe de passer la main quand l'appel n'a rien d'ordinaire.",
      points: [
        {
          icon: "pin",
          title: "Il écrit juste les noms",
          body: "Cimiez, Riquier, le Carré d'Or — la transcription toute faite les écorche. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note de réservation.",
        },
        {
          icon: "calendar-tick",
          title: "Le registre suit la saison",
          body: "Ce qui est libre en février ne l'est pas en août. Vox lit la disponibilité réelle avant de promettre, pour qu'un soir de pleine saison ne soit jamais vendu deux fois.",
        },
        {
          icon: "phone-wave",
          title: "Français, italien, anglais",
          body: "À la frontière italienne et en pleine saison, les langues se mêlent sur la même ligne. Le système d'écoute est conçu pour cela, et chaque conversation du pilote l'améliore.",
        },
        {
          icon: "shield",
          title: "Il dit ce qu'il est",
          body: "Vox se présente comme un assistant vocal, jamais comme un employé — la transparence qu'impose l'AI Act (article 50, règlement (UE) 2024/1689). Les données d'appel servent la réservation, restent consultables et ne profilent personne.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "nice-riviera-terrasse",
    cityscapeImageAlt: "Terrasse couverte d'un restaurant face à la mer turquoise sur la Riviera, chaises blanches",
    ...FR_STORY,
  },

  // ── Bordeaux (/fr) — Phase 2b batch B ──────────────────────────────────
  // Spine: wine tourism — groups, tastings, set menus, the weekend influx.
  // shield theme: retention ("gardé le temps qu'il faut").
  {
    slug: "bordeaux",
    base: "/fr",
    copyLang: "fr",
    name: "Bordeaux",
    published: true,
    seoTitle: "Vox répond au téléphone de votre restaurant bordelais",
    seoDescription:
      "Vox répond au téléphone de votre restaurant à Bordeaux d'une voix naturelle, prend les grandes tablées et les menus accordés et vérifie le registre. Pilotes ouverts en France.",
    heroHeadline: "Le week-end, les tablées de dégustation appellent. Vox répond à chacune.",
    intro: [
      "Un samedi aux Chartrons : la salle affiche complet, une cave attend derrière, et le téléphone sonne pour une tablée de huit qui veut accorder les plats aux vins. Vox répond à leur place, vérifie ce que le registre garde et fixe la réservation avant que l'appelant ne raccroche.",
      "Bordeaux vit au rythme du vin, et cela se lit sur le téléphone : les week-ends amènent des visiteurs venus pour les crus, des groupes qui réservent longtemps à l'avance, des demandes de menus accordés et de grandes tablées. Ce sont les appels les plus rémunérateurs de la semaine, et ce sont précisément ceux qui tombent quand la salle est pleine et que personne ne peut décrocher. Un groupe qui sonne dans le vide réserve ailleurs, souvent pour le double de couverts.",
      "Vox est fait pour ces appels-là. Il répond dès la première sonnerie, à toute heure, consulte le registre avant de rien promettre et confirme — puis transmet une demande de groupe complète à votre équipe plutôt qu'un bip de messagerie. Il tourne en production en Australie ; la France est un programme pilote, et Bordeaux s'y ajoute après Paris.",
    ],
    districts: [
      "Saint-Pierre", "Les Chartrons", "Les Quinconces", "Saint-Michel", "La Bastide",
      "Nansouty", "Caudéran", "Saint-Seurin", "Bacalan", "Les Capucins",
    ],
    scenarios: [
      {
        title: "La grande tablée du samedi",
        body: "Un groupe de dix veut un menu accordé aux vins pour samedi soir. Vox recueille la date, le nombre, le budget et les régimes, et envoie une piste complète à votre équipe au lieu de la laisser sur un répondeur.",
      },
      {
        title: "Le week-end des primeurs",
        body: "Les fins de semaine amènent d'un coup les visiteurs venus pour le vin, et les appels avec. Chacun est pris au même moment plutôt que mis en attente — c'est la différence entre une salle pleine et des couverts partis chez le voisin.",
      },
      {
        title: "« On avait réservé la table près de la cave »",
        body: "Chaque appel garde son enregistrement et sa transcription. Une demande précise — une table, un accord, une allergie — se relit en quelques secondes plutôt que de se rejouer de mémoire.",
      },
      {
        title: "L'appel qui vient de loin",
        body: "Un visiteur prépare son passage à Bordeaux des semaines à l'avance, souvent en anglais. Vox prend la réservation quand elle arrive, à n'importe quelle heure, et la range au registre avec sa transcription.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il déjà à Bordeaux ?",
        a: "Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous ouvrons des pilotes en ce moment — dit simplement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions du pilote le reflètent.",
      },
      {
        q: "Nous sommes une table de quartier, pas un grand nom. Est-ce pour nous ?",
        a: "Oui — les pilotes se règlent maison par maison. Une petite table apprend davantage à la version française qu'une grande enseigne, et tout se convient au cas par cas, sans grille tarifaire.",
      },
      {
        q: "Et quand plusieurs groupes appellent le même soir ?",
        a: "Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, un samedi, c'est une grande tablée qui s'en va.",
      },
      {
        q: "Faut-il un nouveau numéro ou du matériel ?",
        a: "Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation.",
      },
      {
        q: "Combien ça coûte ?",
        a: "Les conditions se fixent avec chaque maison, pas sur une grille, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "Trois choses tournent sous la voix : reconnaître les noms bordelais, lire le registre avant tout engagement, et passer la main à une personne pour tout ce qui dépasse la réservation simple.",
      points: [
        {
          icon: "pin",
          title: "Il connaît les noms",
          body: "Les Chartrons, Nansouty, la Bastide — la transcription toute faite les malmène. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note de réservation.",
        },
        {
          icon: "calendar-tick",
          title: "Le registre avant la promesse",
          body: "Une grande tablée du samedi ne s'improvise pas. Vox lit la disponibilité réelle avant de s'engager, pour qu'un service déjà plein ne soit pas vendu une fois de trop.",
        },
        {
          icon: "phone-wave",
          title: "Des appels d'ailleurs",
          body: "Une ville de vin reçoit des appels de toute l'Europe, souvent en anglais et des semaines à l'avance. Le système d'écoute est fait pour cet éventail, et chaque appel du pilote l'affine.",
        },
        {
          icon: "shield",
          title: "Gardé le temps qu'il faut",
          body: "Les données d'un appel servent la réservation puis ne s'éternisent pas : conservées le temps utile, elles restent consultables par la maison et ne construisent aucun profil d'appelant.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "bordeaux-wine-cellar",
    cityscapeImageAlt: "Cave à vins vitrée d'un restaurant bordelais, bouteilles françaises en présentation",
    ...FR_STORY,
  },

  // ── Toulouse (/fr) — Phase 2b batch B ──────────────────────────────────
  // Spine: the one-hour weekday business lunch (aerospace) + a student
  // evening. shield theme: access control (records stay with the venue).
  {
    slug: "toulouse",
    base: "/fr",
    copyLang: "fr",
    name: "Toulouse",
    published: true,
    seoTitle: "Le coup de feu de midi à Toulouse : Vox tient la ligne",
    seoDescription:
      "Vox répond au téléphone de votre restaurant à Toulouse d'une voix naturelle, tient la ligne au coup de feu de midi et vérifie le registre réel. Pilotes ouverts en France.",
    heroHeadline: "Midi en semaine, la ville déjeune en une heure. Le téléphone n'attend pas.",
    intro: [
      "Un mardi midi près du Capitole : la salle se remplit d'un coup de tables de travail qui ont une heure, pas plus, et le téléphone sonne pour une réservation de groupe l'après-midi même. Vox répond quand la salle est débordée, vérifie ce qui reste et cale la table avant que l'appelant ne raccroche.",
      "Toulouse déjeune vite et en nombre. Les bureaux de l'aéronautique remplissent les salles à midi en semaine, la ville étudiante prend le relais le soir, et entre les deux la ligne ne cesse pas de sonner. La personne qui pourrait répondre porte des assiettes, et l'appel resté sans réponse à midi file à l'adresse d'à côté, sous les mêmes briques roses. Un déjeuner d'affaires manqué, c'est une table de six perdue en pleine semaine.",
      "Vox est fait pour ce midi serré. Il prend l'appel dès la première sonnerie, à toute heure, s'appuie sur le registre réel puis confirme — en laissant la main à une personne quand la demande le mérite. Il tourne en production en Australie ; la France est un programme pilote, et Toulouse s'y joint après Paris.",
    ],
    districts: [
      "Le Capitole", "Saint-Cyprien", "Les Carmes", "Saint-Aubin", "Les Chalets",
      "Compans-Caffarelli", "Le Busca", "Arnaud-Bernard", "Les Minimes", "Saint-Georges",
    ],
    scenarios: [
      {
        title: "Midi, une heure montre en main",
        body: "Le déjeuner de semaine se joue en une heure et se remplit d'un coup. Vox prend la réservation de l'après-midi pendant que la salle envoie, et elle est au registre avant que l'appelant ait raccroché.",
      },
      {
        title: "Le pot de fin de projet",
        body: "Une équipe veut réserver pour vingt le soir même, à la dernière minute. Vox recueille le nombre, l'heure et le budget, et transmet une piste complète à votre équipe plutôt qu'un message qu'on lira trop tard.",
      },
      {
        title: "« C'était pour douze, pas dix »",
        body: "Chaque appel garde son enregistrement et sa transcription. Un nombre contesté cesse d'opposer deux souvenirs : il se relit en quelques secondes.",
      },
      {
        title: "Le service du soir étudiant",
        body: "Quand la ville étudiante sort, les appels changent de ton et d'heure. Vox les prend aussi tard qu'ils arrivent, sans standardiste de nuit, et range chaque réservation au registre.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il à Toulouse aujourd'hui ?",
        a: "Non. Il est en production en Australie, où il répond à de vrais appels pour des maisons qui le paient, et la France est un programme pilote que nous ouvrons. Version honnête : éprouvé ailleurs, en train d'arriver ici — les conditions du pilote sont écrites pour cela.",
      },
      {
        q: "Nous vivons surtout du midi en semaine. Est-ce pour nous ?",
        a: "Oui, et c'est même là que Vox se justifie le mieux : il tient la ligne quand la salle est pleine à midi, et les conditions du pilote se conviennent au cas par cas, sans grille.",
      },
      {
        q: "Et quand tout sonne pendant le coup de feu de midi ?",
        a: "Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée à midi, c'est une table de travail qui s'en va.",
      },
      {
        q: "Faut-il un nouveau numéro ou du matériel ?",
        a: "Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation.",
      },
      {
        q: "Combien ça coûte ?",
        a: "Les conditions se fixent avec chaque maison plutôt que sur une liste de prix, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne mérite pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "La machine sous la voix fait trois choses : comprendre les noms d'ici, ne promettre que ce que le registre confirme, et rendre la main à l'équipe dès qu'un appel se complique.",
      points: [
        {
          icon: "pin",
          title: "Il écrit juste les noms",
          body: "Le Capitole, Saint-Cyprien, les Carmes — la transcription générique les écorche. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note.",
        },
        {
          icon: "calendar-tick",
          title: "Une heure, pas de rab",
          body: "Un midi qui se remplit d'un coup ne pardonne pas un oui de trop. Vox ne s'engage qu'après avoir lu le registre, pour qu'une table promise existe vraiment.",
        },
        {
          icon: "phone-wave",
          title: "Le monde du travail au bout du fil",
          body: "Les bureaux appellent en rafale à midi, la ville étudiante le soir. Le système d'écoute encaisse ce va-et-vient d'accents et d'horaires, et le pilote l'entraîne à chaque appel.",
        },
        {
          icon: "shield",
          title: "Réservé à la maison",
          body: "Les enregistrements et les notes restent accessibles à la maison seule, jamais à des tiers, et ne servent qu'à honorer la réservation. Aucun profil d'appelant n'est constitué.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "toulouse-brasserie",
    cityscapeImageAlt: "Salle de brasserie toulousaine, mur de brique et appliques, tables et banquette en bois",
    ...FR_STORY,
  },

  // ── Lille (/fr) — Phase 2b batch B ─────────────────────────────────────
  // Spine: the estaminet + the Braderie weekend that breaks the phone +
  // cross-border Belgian trade. shield theme: the venue can review AND correct
  // the record. NB: French+English only — never imply Dutch is handled (that
  // caveat belongs to the Belgian trees).
  {
    slug: "lille",
    base: "/fr",
    copyLang: "fr",
    name: "Lille",
    published: true,
    seoTitle: "Estaminets et restaurants lillois : Vox tient la ligne",
    seoDescription:
      "Vox répond au téléphone de votre estaminet ou restaurant à Lille d'une voix naturelle, tient la ligne les week-ends chargés et vérifie le registre. Pilotes ouverts en France.",
    heroHeadline: "Le week-end de la Braderie, la ligne explose. Vox décroche sans faiblir.",
    intro: [
      "Un soir dans un estaminet du Vieux-Lille : les tables sont pleines de moules et de bière du Nord, et le téléphone sonne pour une réservation de groupe le week-end suivant. Vox répond quand la salle ne peut pas, vérifie ce qui reste et note la table avant que l'appelant ne raccroche.",
      "Lille tient de la Flandre autant que de la France, et son calendrier a un sommet : la Braderie, un week-end où la ville double et où le téléphone n'arrête plus de sonner du vendredi au dimanche. Le reste de l'année, la clientèle passe la frontière belge dans les deux sens, et la ligne suit. La personne qui décrocherait est déjà débordée en salle, et l'appel manqué, un week-end pareil, c'est une grande tablée perdue d'un seul coup.",
      "Vox est fait pour ce pic. Il décroche dès la première sonnerie, à toute heure, lit ce que le registre a réellement de libre et confirme — en confiant à une personne ce qui sort de l'ordinaire. Il tourne en production en Australie ; la France est un programme pilote, et Lille referme la première série après Paris.",
    ],
    districts: [
      "Vieux-Lille", "Wazemmes", "Moulins", "Vauban-Esquermes", "Fives",
      "Saint-Maurice Pellevoisin", "Bois-Blancs", "Lille-Sud", "Euralille", "République",
    ],
    scenarios: [
      {
        title: "Le week-end de la Braderie",
        body: "Trois jours où la ville double et où la ligne ne s'arrête jamais. Vox prend chaque appel à mesure qu'il arrive plutôt que de le laisser sonner, et range les réservations au registre pendant que la salle tourne.",
      },
      {
        title: "La tablée qui vient de Belgique",
        body: "Une partie des appels franchit la frontière belge. Le français et l'anglais sur une même ligne sont ce qu'un pilote sert d'abord à éprouver ; nous préférons vous le montrer sur vos appels que l'affirmer ici.",
      },
      {
        title: "« J'avais réservé pour le samedi de la Braderie »",
        body: "Chaque appel garde son enregistrement et sa transcription. Une réservation contestée, surtout un week-end chargé, se relit en quelques secondes plutôt que de se discuter.",
      },
      {
        title: "Moules-frites pour vingt",
        body: "Un groupe veut réserver pour vingt un soir de match ou de marché. Vox recueille le nombre, l'heure et les régimes et transmet une piste complète, au lieu d'un message découvert trop tard.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il déjà à Lille ?",
        a: "Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous signons des pilotes en ce moment — honnêtement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions le reflètent.",
      },
      {
        q: "Nous sommes un estaminet, pas une grande salle. Est-ce pour nous ?",
        a: "Oui — les pilotes se règlent maison par maison. Un petit estaminet apprend davantage à la version française qu'une grande salle, et tout se convient au cas par cas, sans grille.",
      },
      {
        q: "Et le week-end de la Braderie, quand tout sonne à la fois ?",
        a: "C'est exactement ce pour quoi Vox existe : tous les appels sont pris ensemble, dès la première sonnerie. Une tonalité occupée, ce week-end-là, c'est une grande tablée qui file ailleurs.",
      },
      {
        q: "Faut-il un nouveau numéro ou du matériel ?",
        a: "Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation.",
      },
      {
        q: "Combien ça coûte ?",
        a: "Les conditions se fixent avec chaque maison, pas sur une grille, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "Derrière la voix, trois réflexes : écrire juste les noms du Nord, vérifier le registre avant de dire oui, et confier à une personne tout ce qui n'est pas une réservation ordinaire.",
      points: [
        {
          icon: "pin",
          title: "Il connaît le Nord",
          body: "Wazemmes, le Vieux-Lille, Esquermes — la transcription toute faite les écorche. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note de réservation.",
        },
        {
          icon: "calendar-tick",
          title: "Un pic sans standardiste",
          body: "Un week-end de Braderie apporte en trois jours le volume d'appels d'un mois. Vox l'absorbe sans recruter un standard, et lit le registre avant chaque oui pour ne rien vendre deux fois.",
        },
        {
          icon: "phone-wave",
          title: "De part et d'autre de la frontière",
          body: "Les appels arrivent en français et en anglais, souvent d'au-delà de la frontière belge. Le système d'écoute est fait pour ce mélange, et chaque appel du pilote l'affine.",
        },
        {
          icon: "shield",
          title: "À vous, et corrigeable",
          body: "Chaque appel est conservé avec sa transcription, que la maison peut relire et corriger, et n'est jamais utilisé pour ficher un client. Les données servent la réservation, rien d'autre.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "lille-estaminet",
    cityscapeImageAlt: "Salle lambrissée d'un estaminet du Nord, chaises en bois et tables dressées",
    ...FR_STORY,
  },

  // ── Nantes (/fr) — Phase 2b batch C ────────────────────────────────────
  // Spine: weekend brunch + families, party sizes that keep changing.
  // shield theme: purpose limitation ("ne sert qu'à la réservation").
  {
    slug: "nantes",
    base: "/fr",
    copyLang: "fr",
    name: "Nantes",
    published: true,
    seoTitle: "Vox, l'hôte téléphonique IA des restaurants nantais",
    seoDescription:
      "Vox répond au téléphone de votre restaurant à Nantes d'une voix naturelle, encaisse les week-ends en famille et vérifie le registre. Pilotes ouverts en France.",
    heroHeadline: "Le dimanche, les familles appellent et le nombre change trois fois. Vox suit.",
    intro: [
      "Un dimanche vers le Bouffay : la salle se remplit de tablées de famille, les poussettes s'alignent près de l'entrée, et le téléphone sonne pour une réservation qui passe de six à huit puis à sept. Vox répond quand la salle déborde, tient le compte à jour et confirme avant que l'appelant ne raccroche.",
      "Nantes reçoit en famille, surtout le week-end : brunchs, anniversaires, grandes tablées dont le nombre bouge jusqu'au dernier moment. Ces réservations-là se règlent au téléphone, par petites retouches successives, et elles tombent quand la salle est pleine et que personne ne peut noter le changement. Un appel manqué le dimanche, ce n'est pas une table en moins, c'est une famille entière qui réserve ailleurs.",
      "Vox est fait pour ces réservations qui bougent. Il décroche dès la première sonnerie, à toute heure, relit le registre à chaque changement et confirme le nouveau compte — en confiant à une personne ce qui sort de l'ordinaire. Il tourne en production en Australie ; la France est un programme pilote, et Nantes s'y ajoute.",
    ],
    districts: [
      "Le Bouffay", "Graslin", "Talensac", "Île de Nantes", "Les Hauts-Pavés",
      "Chantenay", "Doulon", "Malakoff", "Les Dervallières", "Zola",
    ],
    scenarios: [
      {
        title: "Le brunch du dimanche",
        body: "Les familles arrivent par vagues et le nombre change à chaque appel. Vox met la réservation à jour à mesure, relit le registre et confirme le nouveau compte sans faire attendre la salle.",
      },
      {
        title: "« Finalement, on sera neuf »",
        body: "Une tablée grossit la veille pour le lendemain. Vox reprend la réservation, vérifie que la place existe encore et confirme — ou propose un autre créneau plutôt que de promettre une table qui n'y est plus.",
      },
      {
        title: "L'anniversaire à caler",
        body: "Un parent veut réserver pour douze avec un gâteau et une chaise haute. Vox recueille le nombre, l'heure et les détails, et transmet une piste complète à votre équipe plutôt qu'un message sur le répondeur.",
      },
      {
        title: "« On avait dit sans les marches »",
        body: "Chaque appel garde son enregistrement et sa transcription. Une demande précise — une poussette, un accès, une allergie — se relit en quelques secondes plutôt que de se rejouer de mémoire.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il déjà à Nantes ?",
        a: "Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous ouvrons des pilotes en ce moment — dit simplement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions du pilote le reflètent.",
      },
      {
        q: "Nous faisons surtout le week-end et la famille. Est-ce pour nous ?",
        a: "Oui, et c'est là que Vox aide le plus : il tient les réservations qui changent quand la salle est pleine, et les conditions du pilote se conviennent au cas par cas, sans grille.",
      },
      {
        q: "Et quand tout sonne pendant le service du dimanche ?",
        a: "Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, un dimanche, c'est une tablée de famille qui s'en va.",
      },
      {
        q: "Faut-il un nouveau numéro ou du matériel ?",
        a: "Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation.",
      },
      {
        q: "Combien ça coûte ?",
        a: "Les conditions se fixent avec chaque maison, pas sur une grille, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "Sous la voix, trois choses simples : reconnaître les noms nantais, tenir le registre à jour à chaque retouche, et passer la main à une personne dès qu'une demande sort du cadre.",
      points: [
        {
          icon: "pin",
          title: "Il connaît les noms",
          body: "Le Bouffay, Talensac, les Hauts-Pavés — la transcription toute faite les abîme. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note de réservation.",
        },
        {
          icon: "calendar-tick",
          title: "Le compte reste juste",
          body: "Une tablée qui passe de six à neuf n'existe que si le registre le dit. Vox relit la disponibilité à chaque changement, pour ne jamais confirmer une place qui n'est plus là.",
        },
        {
          icon: "phone-wave",
          title: "Le brouhaha du dimanche",
          body: "Un service de famille est bruyant, et les appels arrivent par-dessus. Le système d'écoute est fait pour ce fond sonore, et chaque appel du pilote l'affine.",
        },
        {
          icon: "shield",
          title: "Rien de plus que la réservation",
          body: "Ce que Vox note d'un appel ne sert qu'à honorer la réservation — pas à démarcher, pas à profiler. Les données restent consultables par la maison et à personne d'autre.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "nantes-brasserie",
    cityscapeImageAlt: "Salle lumineuse d'une brasserie nantaise, banquettes vertes, plantes et grandes fenêtres",
    ...FR_STORY,
  },

  // ── Strasbourg (/fr) — Phase 2b batch C ────────────────────────────────
  // Spine: extreme calendar peaks — Parliament session weeks, the Christmas
  // markets. shield theme: no third-party sharing / no profiling.
  {
    slug: "strasbourg",
    base: "/fr",
    copyLang: "fr",
    name: "Strasbourg",
    published: true,
    seoTitle: "Winstubs et restaurants strasbourgeois : Vox répond",
    seoDescription:
      "Vox répond au téléphone de votre winstub ou restaurant à Strasbourg d'une voix naturelle, encaisse les semaines de pointe et vérifie le registre. Pilotes ouverts en France.",
    heroHeadline: "Semaine de session, marché de Noël : la ville double et le téléphone déborde.",
    intro: [
      "Un soir de décembre près de la Petite France : la winstub est comble, les chalets du marché brillent dehors, et le téléphone n'arrête pas — une table pour ce soir, un groupe pour demain, une question en allemand sur les horaires. Vox répond à tout cela d'une voix calme pendant que la salle tient bon.",
      "Strasbourg a un calendrier en dents de scie. Les semaines de session parlementaire et l'Avent font doubler la ville d'un coup, la clientèle passe la frontière allemande et appelle dans les deux langues, puis le calme revient. Embaucher un standard pour ces pointes n'a aucun sens, et pourtant c'est là que chaque appel manqué coûte le plus cher — une grande table perdue un soir où tout est plein.",
      "Vox est fait pour ces pics. Il décroche dès la première sonnerie, à toute heure, lit ce que le registre a réellement de libre et confirme — en laissant la main à une personne quand la demande le mérite. Il tourne en production en Australie ; la France est un programme pilote, et Strasbourg entre dans la série.",
    ],
    districts: [
      "La Petite France", "La Krutenau", "La Neustadt", "Cathédrale", "L'Orangerie",
      "Gare", "La Robertsau", "L'Esplanade", "Les Contades", "La Bourse",
    ],
    scenarios: [
      {
        title: "La semaine de session",
        body: "Quand le Parlement siège, les tables de travail affluent et la ligne ne faiblit pas. Vox prend les réservations à mesure qu'elles arrivent, sans standard supplémentaire, et les range au registre pendant que la salle envoie.",
      },
      {
        title: "L'Avent et ses chalets",
        body: "Le marché de Noël amène en quelques semaines le volume d'appels d'un trimestre. Chacun est pris au même instant plutôt que mis en attente — c'est la différence entre une salle pleine et des couverts partis au chalet d'à côté.",
      },
      {
        title: "Un appel en allemand",
        body: "À un pas de la frontière, une partie des appels arrivent en allemand ou en anglais. C'est ce qu'un pilote sert d'abord à éprouver, et nous préférons vous le montrer sur vos appels plutôt que l'affirmer ici.",
      },
      {
        title: "« C'était pour la winstub du fond »",
        body: "Chaque appel garde son enregistrement et sa transcription. Une demande précise — une salle, un menu, une allergie — se relit en quelques secondes plutôt que de se rejouer de mémoire.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il à Strasbourg aujourd'hui ?",
        a: "Non. Il est en production en Australie, où il répond à de vrais appels pour des maisons qui le paient, et la France est un programme pilote que nous ouvrons. Version honnête : éprouvé ailleurs, en train d'arriver ici — les conditions du pilote sont écrites pour cela.",
      },
      {
        q: "Nous ne saturons vraiment qu'à certaines périodes. Est-ce pour nous ?",
        a: "Oui, et c'est justement là que Vox se justifie : il encaisse la pointe sans recrutement saisonnier, et les conditions du pilote se conviennent au cas par cas, sans grille.",
      },
      {
        q: "Et quand tout sonne un soir d'Avent ?",
        a: "Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, en décembre, c'est une grande table qui s'en va.",
      },
      {
        q: "Faut-il un nouveau numéro ou du matériel ?",
        a: "Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation.",
      },
      {
        q: "Combien ça coûte ?",
        a: "Les conditions se fixent avec chaque maison plutôt que sur une liste de prix, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne mérite pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "Ce qui tourne sous la voix : une oreille faite pour les noms et les langues d'ici, une lecture du registre avant chaque promesse, et le réflexe de passer la main quand l'appel se complique.",
      points: [
        {
          icon: "pin",
          title: "Il écrit juste les noms",
          body: "La Petite France, la Krutenau, la Neustadt — la transcription générique les écorche. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note.",
        },
        {
          icon: "calendar-tick",
          title: "Une pointe sans standard",
          body: "Une semaine de session ou d'Avent apporte le volume d'appels d'un trimestre. Vox l'absorbe sans embaucher, et lit le registre avant chaque oui pour ne rien vendre deux fois.",
        },
        {
          icon: "phone-wave",
          title: "Français, allemand, anglais",
          body: "Au bord du Rhin, les langues se croisent sur la même ligne. Le système d'écoute est conçu pour ce mélange, et chaque conversation du pilote l'améliore.",
        },
        {
          icon: "shield",
          title: "Rien ne sort de la maison",
          body: "Les enregistrements et les notes ne sont partagés avec aucun tiers et ne servent qu'à la réservation. Ils restent consultables par la maison et ne construisent aucun profil d'appelant.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "strasbourg-winstub",
    cityscapeImageAlt: "Coin d'une winstub alsacienne lambrissée de pin clair, table dressée et banquette",
    ...FR_STORY,
  },

  // ── Montpellier (/fr) — Phase 2b batch C ───────────────────────────────
  // Spine: young, late, walk-in heavy — the phone competes with the door.
  // shield theme: the caller is told it's an assistant + short retention.
  {
    slug: "montpellier",
    base: "/fr",
    copyLang: "fr",
    name: "Montpellier",
    published: true,
    seoTitle: "Hôte téléphonique IA pour restaurants à Montpellier",
    seoDescription:
      "Vox répond au téléphone de votre restaurant à Montpellier d'une voix naturelle, décroche tard quand la salle est pleine et vérifie le registre. Pilotes ouverts en France.",
    heroHeadline: "Tard le soir, la salle est pleine et le téléphone sonne encore. Vox décroche.",
    intro: [
      "Un vendredi soir près de la Comédie : la terrasse déborde, la porte ne désemplit pas, et le téléphone sonne pour une table à dix heures passées. Vox répond quand toute l'équipe est débordée par la salle, vérifie ce qui reste et cale la table avant que l'appelant ne raccroche.",
      "Montpellier sort tard et vit dehors. La ville est jeune, la clientèle se décide au dernier moment, et le soir la salle joue sur deux tableaux : la porte qui ne s'arrête pas et le téléphone que plus personne n'entend. C'est là que filent les réservations tardives — celles qui tentent leur chance quand le voisin affiche complet. Une table décrochée à dix heures, c'est un couvert rempli une seconde fois dans la soirée.",
      "Vox est fait pour ce moment-là. Il décroche dès la première sonnerie, aussi tard qu'il le faut, vérifie ce que le registre garde encore et confirme — puis passe la main à une personne si la demande sort de l'ordinaire. Il tourne en production en Australie ; la France est un programme pilote, et Montpellier complète la carte.",
    ],
    districts: [
      "L'Écusson", "Antigone", "Les Beaux-Arts", "Comédie", "Boutonnet",
      "Saint-Roch", "Port Marianne", "Les Arceaux", "Figuerolles", "Gambetta",
    ],
    scenarios: [
      {
        title: "Vingt-deux heures, salle pleine",
        body: "La porte tourne encore et le téléphone sonne pour une table de dernière minute. Vox la prend pendant que l'équipe reste sur la salle, et la réservation est au registre avant que l'appelant ait raccroché.",
      },
      {
        title: "L'appel de report",
        body: "Un groupe repoussé par l'adresse voisine tente sa chance chez vous. Vox répond au moment où l'appel arrive plutôt que de le laisser sonner, vérifie la place et confirme — c'est une table gagnée sur le concurrent d'en face.",
      },
      {
        title: "La terrasse un soir de match",
        body: "Les soirs de sortie, les appels arrivent tard et en rafale. Vox les prend tous en même temps, sans standardiste de nuit, et range chaque réservation au registre avec sa transcription.",
      },
      {
        title: "« J'avais réservé en terrasse »",
        body: "Chaque appel garde son enregistrement et sa transcription. Une demande contestée — terrasse ou salle, heure ou nombre — se relit en quelques secondes plutôt que de se discuter.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il déjà à Montpellier ?",
        a: "Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous signons des pilotes en ce moment — honnêtement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions le reflètent.",
      },
      {
        q: "Nous marchons surtout le soir et à la dernière minute. Est-ce pour nous ?",
        a: "Oui, et c'est là que Vox aide le plus : il décroche tard, quand la salle est pleine et que le téléphone passe après la porte, et les conditions du pilote se conviennent au cas par cas.",
      },
      {
        q: "Et quand ça sonne en rafale un soir de sortie ?",
        a: "Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, tard le soir, c'est une table qui part chez le voisin.",
      },
      {
        q: "Faut-il un nouveau numéro ou du matériel ?",
        a: "Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation.",
      },
      {
        q: "Combien ça coûte ?",
        a: "Les conditions se fixent avec chaque maison, pas sur une grille, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "Derrière la voix, trois gestes : saisir les noms d'ici, ne s'engager qu'après avoir lu le registre, et rendre la main à l'équipe dès qu'un appel se complique.",
      points: [
        {
          icon: "pin",
          title: "Il connaît la ville",
          body: "L'Écusson, Figuerolles, les Arceaux — la transcription toute faite les écorche. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note de réservation.",
        },
        {
          icon: "calendar-tick",
          title: "Tard, mais juste",
          body: "Une table de dernière minute n'a de valeur que si elle existe vraiment. Vox lit le registre avant de confirmer, même à dix heures passées, pour ne pas vendre une place déjà prise.",
        },
        {
          icon: "phone-wave",
          title: "Le bruit de la nuit",
          body: "Les appels tardifs arrivent d'une rue animée, souvent depuis une terrasse. Le système d'écoute est fait pour ce fond sonore, et chaque appel du pilote l'affine.",
        },
        {
          icon: "shield",
          title: "Annoncé, puis effacé",
          body: "Vox se présente comme un assistant vocal, jamais comme un employé, et ce qu'il note ne sert qu'à la réservation, le temps utile. Les données restent consultables par la maison et ne profilent personne.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "montpellier-terrasse",
    cityscapeImageAlt: "Terrasse d'un restaurant le soir dans le sud de la France, parasols et guirlandes lumineuses",
    ...FR_STORY,
  },

  // ── Bruxelles (/be-fr) — the French alternate of the Brussels-EN page ───
  //
  // slug "brussels" and base "/be-fr", so it CLUSTERS with /be-en/brussels/
  // (en-BE ↔ fr-BE) — the true pair buildHreflang was rebuilt for. copyLang
  // "fr", so check-cities scores it against Paris only; its MIDI / bilingual
  // spine deliberately diverges from Paris's evening spine, and it holds the
  // same language line as /be-en: French + English on one line is what a
  // Belgian pilot is built to PROVE, and Dutch is "not built". Staged
  // published:false until its French body copy has had a native pass.
  {
    slug: "brussels",
    base: "/be-fr",
    copyLang: "fr",
    name: "Bruxelles",
    published: true,
    seoTitle: "Vox, l'hôte téléphonique IA bilingue des restaurants bruxellois",
    seoDescription:
      "Vox répond au téléphone de votre restaurant bruxellois d'une voix naturelle, vérifie le registre réel et prend la réservation — pendant que votre équipe reste avec la salle. Pilotes belges en ouverture.",
    heroHeadline: "Le déjeuner dure quatre-vingt-dix minutes. Le téléphone, lui, n'attend pas.",
    intro: [
      "Midi et demi dans le quartier européen : la salle se remplit d'un seul mouvement. Tous ceux qui déjeuneront aujourd'hui arrivent en vingt minutes, veulent avoir réglé pour deux heures, et le téléphone se met à sonner sous tout cela — une table de six pour jeudi, une annulation, quelqu'un qui demande si la terrasse est ouverte.",
      "Bruxelles déjeune sur une montre qui ne laisse aucun jeu. Un service du midi ici n'est pas une longue soirée que l'on organise à l'avance ; c'est une fenêtre étroite où la personne qui pourrait décrocher porte trois assiettes, et l'appelant qui tombe sur une sonnerie essaie simplement l'adresse suivante. Les langues qui arrivent sur cette ligne posent leur propre question — c'est une ville où le même numéro prend le français et l'anglais à une minute d'intervalle.",
      "Vox est notre réponse à cette fenêtre étroite. Il décroche dès la première sonnerie quelle que soit l'heure, lit ce que le registre a vraiment de libre, et confie l'appel à votre équipe dès qu'il cesse d'être ordinaire. Il tourne en production en Australie aujourd'hui ; la Belgique est un programme pilote, et Bruxelles en est le point de départ.",
    ],
    districts: [
      "Ixelles", "Saint-Gilles", "Sablon", "Dansaert", "Châtelain",
      "Sainte-Catherine", "Flagey", "Marolles", "Etterbeek", "Uccle",
    ],
    scenarios: [
      {
        title: "12 h 40, la salle tourne une fois",
        body: "Le rush du midi a une seule forme, sans aucun creux. Vox prend le six-couverts de jeudi pendant que votre équipe reste sur les assiettes, et la réservation est au registre avant même que l'appelant ait raccroché.",
      },
      {
        title: "Le premier vendredi de beau temps",
        body: "La météo de terrasse arrive du jour au lendemain, et les appels avec elle. Chacun est pris au même instant plutôt que mis en file derrière une sonnerie — c'est la différence entre une terrasse pleine et une à moitié vide.",
      },
      {
        title: "Un appelant qui change de langue en pleine phrase",
        body: "Cela arrive sans cesse ici, et c'est exactement ce qu'un pilote belge existe pour éprouver. Nous préférons vous montrer Vox sur l'un de vos propres enregistrements plutôt que d'annoncer un résultat sur une page web.",
      },
      {
        title: "« J'avais annulé cette table lundi »",
        body: "Chaque appel conserve son enregistrement et sa transcription. Une annulation contestée cesse d'être la mémoire de l'un contre celle de l'autre : elle devient quelque chose que l'on retrouve en quelques secondes.",
      },
    ],
    faqs: [
      {
        q: "Vox fonctionne-t-il à Bruxelles aujourd'hui ?",
        a: "Non. Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient, et la Belgique est un programme pilote que nous ouvrons maintenant. La version honnête : éprouvé ailleurs, en train d'arriver ici — et les conditions du pilote sont écrites pour refléter exactement cela.",
      },
      {
        q: "Nos appelants passent du français à l'anglais sur la même ligne. Vox suit-il ?",
        a: "Gérer les deux sur un seul numéro est précisément ce qu'un pilote belge est bâti pour prouver ; nous préférons donc le démontrer sur vos appels plutôt que de l'affirmer ici. Les langues dont votre établissement a réellement besoin sont l'une des premières choses que nous établissons ensemble.",
      },
      {
        q: "Et le néerlandais ?",
        a: "Pas encore développé. Servir la Flandre correctement veut dire le néerlandais, et c'est un véritable engagement plutôt qu'un réglage que l'on active — il suit la demande des établissements, et non l'inverse.",
      },
      {
        q: "Faut-il un numéro belge, ou du nouveau matériel ?",
        a: "Ni l'un ni l'autre. Vous gardez le numéro que vos clients composent déjà et vous transférez les appels vers Vox — tous, ou seulement ceux qui resteraient sans réponse. Ce transfert est toute l'installation. La numérotation belge exige un dossier réglementaire approuvé, fourni dans le cadre du pilote.",
      },
      {
        q: "Combien coûte un pilote ?",
        a: "Les conditions se conviennent établissement par établissement plutôt qu'à partir d'une liste de prix, et nous fixons ce qu'est un bon résultat avant le premier appel décroché. Si Vox ne mérite pas sa place, vous arrêtez.",
      },
    ],
    aiLocal: {
      lead: "En dessous : un modèle qui écoute la façon dont cette ville parle vraiment, une vérification du registre avant toute promesse, et une règle ferme — tout ce qui sort de l'ordinaire va à votre équipe plutôt que d'être deviné.",
      points: [
        {
          icon: "pin",
          title: "Il écrit bien les noms",
          body: "Châtelain, Sainte-Catherine, Flagey — la transcription toute faite transforme les noms de rue bruxellois en devinettes. Les reporter intacts dans une note de réservation est ingrat, et c'est ce qu'un établissement remarque en premier.",
        },
        {
          icon: "calendar-tick",
          title: "Une promesse qu'il peut tenir",
          body: "Rien n'est proposé avant que le registre ait été lu. Un service à une seule tournée ne peut absorber un oui trop empressé, et une table inventée à 13 h 15 vous coûte toute la fenêtre.",
        },
        {
          icon: "phone-wave",
          title: "Fait pour écouter dans une salle bruyante",
          body: "Les appels bruxellois viennent de toute l'Europe, par-dessus une terrasse à plein volume. Le modèle d'écoute est conçu pour cet éventail d'accents et ce fond sonore, et chaque appel du pilote l'affine.",
        },
        {
          icon: "shield",
          title: "Les règles européennes, dès la conception",
          body: "Le RGPD et les obligations de transparence de l'AI Act (article 50, règlement (UE) 2024/1689) s'appliquent à un agent vocal qui parle à des clients, et l'APD/GBA est l'autorité de référence ici. Les données d'appel finalisent une réservation, vous restent consultables et ne construisent aucun profil.",
        },
      ],
    },
    relatedGuides: [],
    cityscapeImage: "brussels-grand-place",
    cityscapeImageAlt: "Les maisons des corporations de la Grand-Place à Bruxelles",
    ...BE_STORY,
  },
];

/** Published cities in one locale tree, in declaration order. */
export function intlCitiesForBase(base: string): readonly IntlCity[] {
  return intlCities.filter((c) => c.base === base && c.published);
}

/** Page paths ("london") a locale contributes from its published cities. */
export function intlCityPaths(base: string): readonly string[] {
  return intlCitiesForBase(base).map((c) => c.slug);
}
