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
];

/** Published cities in one locale tree, in declaration order. */
export function intlCitiesForBase(base: string): readonly IntlCity[] {
  return intlCities.filter((c) => c.base === base && c.published);
}

/** Page paths ("london") a locale contributes from its published cities. */
export function intlCityPaths(base: string): readonly string[] {
  return intlCitiesForBase(base).map((c) => c.slug);
}
