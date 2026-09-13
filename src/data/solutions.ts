/**
 * Solutions catalogue — commercial-intent vertical pages (Phase 1C).
 *
 * People search “AI receptionist for restaurants”, not product names. This
 * registry is the SSOT for /solutions/{slug}/.
 *
 * Keep slugs stable: they become URL segments and Ads final URLs.
 */

export type SolutionPurpose = "traffic" | "trust" | "conversion";
export type SolutionSector = "hospitality" | "services" | "enterprise";
export type SolutionStatus = "planned" | "draft" | "live";
export type ProductSlugRef =
  | "voxtable"
  | "voxorder"
  | "voxstay"
  | "voxconcierge"
  | "voxdrive";

export type FaqItem = { readonly q: string; readonly a: string };

export type SolutionPageCopy = {
  readonly seo: { readonly title: string; readonly description: string };
  readonly hero: {
    readonly eyebrow: string;
    readonly headline: string;
    readonly sub: string;
  };
  readonly problem: { readonly title: string; readonly body: string };
  readonly lostRevenue: {
    readonly title: string;
    readonly body: string;
    readonly points: readonly string[];
  };
  readonly howWeSolve: {
    readonly title: string;
    readonly body: string;
    readonly steps: readonly { readonly title: string; readonly body: string }[];
  };
  readonly features: readonly { readonly title: string; readonly body: string }[];
  readonly benefits: readonly string[];
  /**
   * "Why we built this" — BitePerk's own account of the vertical. It is NOT a
   * customer story and the template never labels it as one: until 13 Sep 2026
   * this rendered under a "Customer story" eyebrow with no customer in it,
   * which is exactly the kind of framing the truthfulness gates exist to stop.
   */
  readonly story: {
    readonly title: string;
    readonly body: string;
    readonly attribution?: string;
  };
  /**
   * Real, approved proof — a quote from a named venue that has agreed to it.
   * Optional; only three verticals have one today (the two founding venues).
   * Never fabricate: the wording must be the venue's own, on record
   * (products.ts voxProof / marketing collateral approvals).
   */
  readonly proof?: { readonly quote: string; readonly author: string; readonly role: string };
  readonly faq: readonly FaqItem[];
};

export type Solution = {
  readonly slug: string;
  readonly name: string;
  readonly sector: SolutionSector;
  readonly purposes: readonly SolutionPurpose[];
  readonly status: SolutionStatus;
  readonly primaryProduct: ProductSlugRef;
  readonly shortDescription: string;
  readonly page: SolutionPageCopy;
};

export const SOLUTION_SLUGS = [
  "restaurants",
  "hotels",
  "cafes",
  "takeaway",
  "drive-thru",
  "medical",
  "professional-services",
  "enterprise",
] as const;

export type SolutionSlug = (typeof SOLUTION_SLUGS)[number];

// The section order (hero → problem → lost revenue → how we solve → features
// → benefits → why we built this → FAQ → book demo) lives in ONE place:
// src/pages/solutions/[slug].astro. A parallel SOLUTION_PAGE_SECTIONS constant
// used to sit here, imported by nothing and asserted only as a string in a
// unit test — a contract that could not be broken because nothing read it.

export const solutions: readonly Solution[] = [
  {
    slug: "restaurants",
    name: "Restaurants",
    sector: "hospitality",
    purposes: ["traffic", "conversion"],
    status: "live",
    primaryProduct: "voxtable",
    shortDescription: "AI phone host that answers booking calls during service.",
    page: {
      seo: {
        title: "AI receptionist for restaurants · BitePerk",
        description:
          "Stop losing bookings when the floor is slammed. Vox answers every restaurant call in a warm Australian voice, checks availability, and writes the booking to your screen.",
      },
      hero: {
        eyebrow: "Restaurants",
        headline: "The phone rings through service. It should still get answered.",
        sub: "Vox is an AI phone host for Australian restaurants — it picks up when your team can’t, takes the booking properly, and keeps diners from hanging up.",
      },
      problem: {
        title: "The missed-call problem is a floor problem",
        body: "During the rush, nobody can leave a table to answer the landline. Guests try once, maybe twice, then book somewhere else. Voicemail does not fix it — diners want a yes or a no while they still have the phone in their hand.",
      },
      lostRevenue: {
        title: "What those unanswered rings actually cost",
        body: "A single missed booking is not just one cover. It is a table that stays empty, a review that never happens, and a regular who quietly switches venues.",
        points: [
          "Peak hours are when the phone is busiest — and when staff are least free",
          "Callback lists go cold; diners have already chosen somewhere else",
          "Hosts who juggle the phone drop service quality on the floor",
        ],
      },
      howWeSolve: {
        title: "How BitePerk solves it",
        body: "Vox (VoxTable) answers in a natural Australian voice, understands the ask, checks what you actually have free, and writes the booking where your team will see it.",
        steps: [
          { title: "Call answered", body: "Every inbound ring gets a competent voice — not a queue, not a hold loop." },
          { title: "Availability checked", body: "Vox works from your real diary rules, not a hopeful guess." },
          { title: "Booking written", body: "Name, party size, time and notes land on your screen before the guest hangs up." },
          { title: "Team stays on the floor", body: "Hosts keep serving; the phone stops stealing attention mid-service." },
        ],
      },
      features: [
        { title: "Warm Australian voice", body: "Built for local guests — not a generic overseas call-centre tone." },
        { title: "Booking, not just a message", body: "The outcome is a reservation on the book, not a voicemail to chase later." },
        { title: "Works with your hours", body: "Overflow, after-close, and mid-service peaks are the point — not a nice-to-have." },
        { title: "Sydney-hosted records", body: "Business call records stay onshore for Australian venues." },
      ],
      benefits: [
        "Fewer empty tables from unanswered booking calls",
        "Hosts stay with diners instead of the handset",
        "Clearer weekly picture of what the phone actually produced",
        "A demo you can hear on your own line in minutes",
      ],
      story: {
        title: "Built beside Australian dining rooms",
        body: "BitePerk started by watching Sydney and Melbourne venues lose covers to a ringing phone. Vox exists to take that call without taking a human off the floor — narrow on purpose, measured on bookings taken.",
        attribution: "BitePerk · Sydney",
      },
      // On record: products.ts voxProof (the same quote the product pages carry).
      proof: {
        quote:
          "We used to lose tables every Friday night just because nobody could reach the phone. Bella picks up every single call — and the bookings just appear on our screen. It paid for itself in the first week.",
        author: "Natalia",
        role: "Owner · Natalia's Bistro, Sydney",
      },
      faq: [
        {
          q: "Will guests know they are talking to AI?",
          a: "Yes — Vox says so when it answers. In practice, diners care more that someone competent picked up than that a human left them on hold.",
        },
        {
          q: "How fast can a restaurant go live?",
          a: "Setup takes about 48 hours after a short walkthrough. Book a demo and we will put Vox on a test call to your line.",
        },
        {
          q: "Does this replace my booking system?",
          a: "No. Vox answers the phone and writes bookings into the flow you already run — it is the missing receptionist, not a new POS.",
        },
      ],
    },
  },
  {
    slug: "hotels",
    name: "Hotels",
    sector: "hospitality",
    purposes: ["traffic", "conversion"],
    status: "live",
    primaryProduct: "voxstay",
    shortDescription: "AI receptionist for independent hotels and small chains.",
    page: {
      seo: {
        title: "AI phone receptionist for hotels · BitePerk",
        description:
          "VoxStay is BitePerk’s AI receptionist for independent hotels — answers booking calls, quotes real stay prices with taxes, and texts a secure payment link. In development; join the waitlist.",
      },
      hero: {
        eyebrow: "Hotels",
        headline: "Front desk phones deserve the same competence as the lobby.",
        sub: "VoxStay is Bella at the hotel phone — built for independent and small-chain properties that lose stays when reception is slammed or after hours.",
      },
      problem: {
        title: "Overflow calls are lost stays",
        body: "When reception is checking someone in, the next caller hears rings. After hours, many independents still rely on a mobile that goes to voicemail. Travellers move on to the next property on the list.",
      },
      lostRevenue: {
        title: "Direct bookings you never see",
        body: "OTAs will take the booking if your phone does not. Every unanswered direct enquiry is margin you have already paid to attract.",
        points: [
          "After-hours enquiries convert elsewhere",
          "Front desk cannot quote accurately while multi-tasking",
          "Card details taken poorly create chargebacks and no-shows",
        ],
      },
      howWeSolve: {
        title: "How BitePerk solves it",
        body: "VoxStay (in development) is designed to answer the booking call, offer real room options with taxes included, take a name and mobile, and text a secure payment link — never inventing a price.",
        steps: [
          { title: "Answer the stay enquiry", body: "A calm voice handles the first question while reception stays with the guest in front of them." },
          { title: "Quote truthfully", body: "Real availability and tax-inclusive pricing — no invented rates." },
          { title: "Secure the hold", body: "Name, mobile, and a texted payment link — card numbers stay off the call." },
          { title: "Fall back to humans", body: "Anything it cannot do rings through to the front desk." },
        ],
      },
      features: [
        { title: "Hotel-shaped conversation", body: "Dates, room types, and stay length — not a restaurant script wearing a different hat." },
        { title: "EU-first architecture", body: "Designed for European hosting requirements; Australian hotels can join the waitlist." },
        { title: "Payment link, not card-on-call", body: "Guests pay on a secure link — safer for them and for you." },
        { title: "Human fallback", body: "When the ask is out of scope, the call escalates rather than inventing an answer." },
      ],
      benefits: [
        "Fewer lost direct enquiries after hours",
        "Reception stays with in-person guests",
        "Clearer path from call to secured stay",
        "Early access via waitlist while VoxStay finishes",
      ],
      story: {
        title: "Same voice family, hotel problem",
        body: "VoxStay extends the Vox family to the front desk. It is in active development — no fake occupancy metrics, no invented hotel logos. If you run an independent property, the waitlist is the honest next step.",
      },
      faq: [
        {
          q: "Is VoxStay live in Australia today?",
          a: "Not yet — it is in development. Australian hotels and motels can join the waitlist; early pilots are oriented EU-first.",
        },
        {
          q: "Will it invent room rates?",
          a: "No. Pricing must come from real availability. If it cannot quote truthfully, it escalates to reception.",
        },
        {
          q: "How do I register interest?",
          a: "Book a demo / waitlist conversation from this page and tell us your property type and markets.",
        },
      ],
    },
  },
  {
    slug: "cafes",
    name: "Cafes",
    sector: "hospitality",
    purposes: ["traffic", "conversion"],
    status: "live",
    primaryProduct: "voxtable",
    shortDescription: "Never miss a table or takeaway call in the morning rush.",
    page: {
      seo: {
        title: "AI phone answering for cafes · BitePerk",
        description:
          "Morning rush should not mean a missed booking or takeaway order. Vox answers cafe calls so baristas stay on the machine.",
      },
      hero: {
        eyebrow: "Cafes",
        headline: "The machine is screaming. The phone still has to get answered.",
        sub: "Australian cafes lose tables and pickups every morning because nobody can leave the bench. Vox takes those calls without pulling a barista off the group head.",
      },
      problem: {
        title: "Small teams, peak chaos",
        body: "A cafe phone is rarely staffed as a job. It is answered between extractions — or not at all. Regulars learn to stop calling.",
      },
      lostRevenue: {
        title: "Quiet losses add up",
        body: "A missed 10am table for two and two ignored pickup calls do not look dramatic in the moment. Across a week they are real revenue.",
        points: [
          "Pickup orders abandoned after three rings",
          "Table bookings that never make the book",
          "Staff interrupted mid-drink, quality drops",
        ],
      },
      howWeSolve: {
        title: "How BitePerk solves it",
        body: "Vox answers with the same calm voice restaurants use, scoped to cafe reality — bookings, wait times, and when to escalate to the floor.",
        steps: [
          { title: "Catch the ring", body: "Overflow and mid-rush calls get a voice immediately." },
          { title: "Take the ask", body: "Table time, party size, or pickup intent — captured cleanly." },
          { title: "Write it down", body: "Your team sees the outcome without stopping the shot." },
          { title: "Escalate when needed", body: "Odd requests go to a human instead of a wrong promise." },
        ],
      },
      features: [
        { title: "Built for short calls", body: "Cafe conversations are brisk — Vox is tuned for that pace." },
        { title: "Keeps baristas on coffee", body: "The phone stops being a third job behind the machine." },
        { title: "Australian voice", body: "Sounds like the neighbourhood, not an offshore script." },
        { title: "Same stack as restaurants", body: "One BitePerk account model when you grow into dinner service." },
      ],
      benefits: [
        "Fewer abandoned morning calls",
        "Cleaner handoff to the floor",
        "Better guest experience when you are three-deep",
        "Demo on your actual cafe line",
      ],
      story: {
        title: "Neighbourhood hospitality first",
        body: "BitePerk’s product sense comes from Australian service venues — including the cafes where the phone is always an afterthought until it costs a regular.",
      },
      // Approved wording, Camilo & Mauro, 7 Sep 2026 (marketing/flyer_and_broucher/v2/copy.mjs).
      proof: {
        quote: "Bella picks up the calls we used to miss. Bookings and takeaway orders just land on our screen.",
        author: "Camilo & Mauro",
        role: "Owners · Mazcina Resto-Bar, Darlinghurst",
      },
      faq: [
        {
          q: "Can Vox handle pickup orders?",
          a: "Yes for clear takeaway asks, with escalation when the order needs a human. VoxOrder deepens this for heavier phone-order venues.",
        },
        {
          q: "We only have one handset behind the counter",
          a: "That is exactly the setup Vox is for — forward the line and keep making coffee.",
        },
      ],
    },
  },
  {
    slug: "takeaway",
    name: "Takeaway",
    sector: "hospitality",
    purposes: ["traffic", "conversion"],
    status: "live",
    primaryProduct: "voxorder",
    shortDescription: "Phone ordering that keeps the pass moving.",
    page: {
      seo: {
        title: "AI phone ordering for takeaway · BitePerk",
        description:
          "Phone orders should not stall the pass. VoxOrder takes takeaway calls, captures the order cleanly, and keeps your kitchen moving.",
      },
      hero: {
        eyebrow: "Takeaway",
        headline: "Phone orders without stopping the pass.",
        sub: "VoxOrder is BitePerk’s AI for takeaway and pickup calls — so the kitchen hears a clean order instead of a half-heard shout over the fryer.",
      },
      problem: {
        title: "The ticket line is not a call centre",
        body: "When the same person runs the pass and the phone, orders get mangled or ignored. Marketplaces take the margin you could have kept on a direct call.",
      },
      lostRevenue: {
        title: "Direct phone orders you give away",
        body: "If calling you is harder than tapping an app, guests leave — and you pay commission on the ones who do.",
        points: [
          "Misheard items and remakes",
          "Abandoned calls during the dinner spike",
          "Commission leakage to delivery marketplaces",
        ],
      },
      howWeSolve: {
        title: "How BitePerk solves it",
        body: "VoxOrder answers the takeaway line, walks the guest through the order, and lands a clear ticket for the kitchen.",
        steps: [
          { title: "Answer every order call", body: "No more choosing between the pass and the handset." },
          { title: "Capture the order", body: "Items, modifiers, name, and pickup timing — spoken back for confirmation." },
          { title: "Send it to the kitchen", body: "A ticket your team can trust, not a scribbled guess." },
          { title: "Keep marketplace as backup", body: "Direct calls become viable again beside your app channels." },
        ],
      },
      features: [
        { title: "Order-shaped dialogue", body: "Built for menus and modifiers, not restaurant bookings alone." },
        { title: "Confirmation loop", body: "Guests hear the order back before it hits the pass." },
        { title: "Peak-hour overflow", body: "The dinner spike is the workload, not an edge case." },
        { title: "Australian voice", body: "Clear, local, and easy to understand on a noisy line." },
      ],
      benefits: [
        "Fewer remakes from misheard calls",
        "More direct orders kept in-house",
        "Kitchen focus stays on the pass",
        "Demo against your real menu flow",
      ],
      story: {
        title: "Direct relationships still matter",
        body: "Marketplaces are useful. They should not be the only way a guest can reach you by phone. VoxOrder is how BitePerk brings the takeaway line back under your control.",
      },
      // Approved wording, Camilo & Mauro, 7 Sep 2026 (marketing/flyer_and_broucher/v2/copy.mjs).
      proof: {
        quote: "Bella picks up the calls we used to miss. Bookings and takeaway orders just land on our screen.",
        author: "Camilo & Mauro",
        role: "Owners · Mazcina Resto-Bar, Darlinghurst",
      },
      faq: [
        {
          q: "Is VoxOrder live?",
          a: "Yes — it is part of the live Vox family for takeaway and pickup. Book a demo to hear it on your menu.",
        },
        {
          q: "Can it read my marketplace menu?",
          a: "We set the phone menu from what you actually sell. Bring your current list to the demo and we will map it.",
        },
      ],
    },
  },
  {
    slug: "drive-thru",
    name: "Drive-Thru",
    sector: "hospitality",
    purposes: ["traffic", "trust"],
    status: "live",
    primaryProduct: "voxdrive",
    shortDescription: "Voice ordering for drive-thru lanes — in development story.",
    page: {
      seo: {
        title: "AI drive-thru voice ordering · BitePerk",
        description:
          "VoxDrive is BitePerk’s drive-thru voice ordering concept — lane speed without sacrificing order accuracy. Join the conversation early.",
      },
      hero: {
        eyebrow: "Drive-Thru",
        headline: "Lane speed is a voice problem.",
        sub: "VoxDrive is on the drawing board: an AI order-taker for drive-thru that keeps cars moving without turning the order into a remake.",
      },
      problem: {
        title: "Headsets and haste",
        body: "Drive-thru mistakes are expensive and public. Human order-takers burn out on repetition; rushed speech destroys accuracy at the window.",
      },
      lostRevenue: {
        title: "Every remake is margin and time",
        body: "A wrong order blocks the lane twice — once leaving, once returning. Guests remember the delay more than the apology.",
        points: [
          "Lane dwell time spikes at peak",
          "Mishears on complex combos",
          "Staff turnover on the headset",
        ],
      },
      howWeSolve: {
        title: "Where BitePerk is taking it",
        body: "VoxDrive is a concept in the Vox family — same voice craft, lane-shaped dialogue. We are not shipping vapour metrics; we are designing the conversation with operators who live this problem.",
        steps: [
          { title: "Greet and capture", body: "A consistent opener that pulls the order cleanly." },
          { title: "Confirm before the window", body: "Read-back that prevents remakes." },
          { title: "Hand to the booth", body: "Humans keep the exceptions and the smile at the window." },
          { title: "Learn the menu", body: "Combo logic owned by your store, not a generic script." },
        ],
      },
      features: [
        { title: "Lane-first design", body: "Optimised for speed and confirmation, not a restaurant booking clone." },
        { title: "Human at the window", body: "AI on the order pad; people on hospitality." },
        { title: "Honest roadmap", body: "Marked as concept until it earns a live badge." },
        { title: "Same brand voice", body: "Vox family continuity when you already run BitePerk elsewhere." },
      ],
      benefits: [
        "Early input into the product shape",
        "A clear path from today’s Vox stack",
        "No fake ‘live in 50 lanes’ claims",
        "Conversation with the builders, not a brochure",
      ],
      story: {
        title: "We will not pretend it ships tomorrow",
        body: "Drive-thru is hard. BitePerk would rather show you the design problem and invite the right operators in early than slap a live sticker on a demo video.",
      },
      faq: [
        {
          q: "Can I buy VoxDrive today?",
          a: "Not yet — it is a concept. Tell us about your lane volume and menu complexity so we build the right thing.",
        },
        {
          q: "Does it use the same voice as VoxTable?",
          a: "It sits in the same Vox family. The dialogue and latency targets are drive-thru specific.",
        },
      ],
    },
  },
  {
    slug: "medical",
    name: "Medical",
    sector: "services",
    purposes: ["traffic", "trust"],
    status: "live",
    primaryProduct: "voxconcierge",
    shortDescription: "After-hours and overflow call handling for clinics.",
    page: {
      seo: {
        title: "AI phone answering for medical clinics · BitePerk",
        description:
          "Overflow and after-hours clinic calls deserve a competent answer. VoxConcierge is in development for professional front-desk coverage — register interest for medical use cases.",
      },
      hero: {
        eyebrow: "Medical",
        headline: "Patients call when your desks are already full.",
        sub: "Clinics lose goodwill on hold music and full voicemail. BitePerk is extending VoxConcierge toward professional overflow — carefully, because healthcare calls are not restaurant bookings.",
      },
      problem: {
        title: "Reception is a clinical bottleneck",
        body: "Appointment changes, directions, and after-hours triage attempts all land on the same line. Understaffed desks create angry patients and burnt-out admins.",
      },
      lostRevenue: {
        title: "No-shows and abandoned booking attempts",
        body: "When callers cannot reschedule easily, they simply do not arrive — or they never book.",
        points: [
          "After-hours ringing with no path to book",
          "Hold times that drive patients to another clinic",
          "Admin time burned on repetitive FAQs",
        ],
      },
      howWeSolve: {
        title: "How BitePerk approaches it",
        body: "VoxConcierge (in development) is the front-desk capability in the Vox family. For medical, we prioritise escalation rules, clear AI disclosure, and never inventing clinical advice.",
        steps: [
          { title: "Answer and disclose", body: "A clear AI introduction — trust before efficiency." },
          { title: "Handle the admin ask", body: "Hours, location, appointment intent — within policy." },
          { title: "Escalate clinical content", body: "Anything medical goes to a human pathway you define." },
          { title: "Log the outcome", body: "Your team sees what happened on the line." },
        ],
      },
      features: [
        { title: "Policy-first design", body: "Healthcare is not a prompt tweak on a restaurant bot." },
        { title: "Human escalation", body: "Clinical questions never get an improvised answer." },
        { title: "After-hours coverage", body: "Aimed at the rings that currently die in voicemail." },
        { title: "Waitlist for clinics", body: "We onboard carefully; interest now shapes the rollout." },
      ],
      benefits: [
        "Fewer abandoned admin calls",
        "Clearer after-hours experience",
        "Reception protected from repetitive load",
        "A vendor that will not overclaim clinical AI",
      ],
      story: {
        title: "Restraint is the feature",
        body: "BitePerk’s hospitality products are live because the risk envelope is understood. Medical follows only with the same honesty — no diagnosis theatre, no fake compliance badges.",
      },
      faq: [
        {
          q: "Does Vox give medical advice?",
          a: "No. Clinical questions must escalate to your defined human pathway.",
        },
        {
          q: "Is this available to clinics now?",
          a: "VoxConcierge is in development. Register interest and we will talk scope, escalation, and timeline honestly.",
        },
      ],
    },
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    sector: "services",
    purposes: ["traffic", "conversion"],
    status: "live",
    primaryProduct: "voxconcierge",
    shortDescription: "Front-desk phone coverage for firms that live on inbound calls.",
    page: {
      seo: {
        title: "AI receptionist for professional services · BitePerk",
        description:
          "Law, accounting, agency and advisory firms lose work on unanswered inbound calls. VoxConcierge is BitePerk’s front-desk AI in development — join the waitlist.",
      },
      hero: {
        eyebrow: "Professional Services",
        headline: "Inbound calls are business development — treat them that way.",
        sub: "When partners are in meetings, the front desk still has to sound sharp. VoxConcierge is being built for that overflow.",
      },
      problem: {
        title: "Everyone is billable; nobody is on the phone",
        body: "Small professional firms run lean. The landline becomes a graveyard of missed new-business calls and frustrated clients chasing updates.",
      },
      lostRevenue: {
        title: "Matters that start with a ring",
        body: "A prospect who cannot reach you will not leave a detailed voicemail. They will call the next firm on the search results.",
        points: [
          "New-enquiry calls unanswered mid-meeting",
          "Clients stuck in voicemail for simple scheduling",
          "Reception overload on busy filing weeks",
        ],
      },
      howWeSolve: {
        title: "How BitePerk solves it",
        body: "VoxConcierge takes the repetitive front-desk asks — who you are, how to book, where to send documents — and escalates anything that needs a professional.",
        steps: [
          { title: "Greet like a receptionist", body: "Firm name, calm pace, clear next step." },
          { title: "Route the intent", body: "New enquiry, existing client, courier, spam — sorted." },
          { title: "Capture the lead", body: "Name, callback, matter type — written for the team." },
          { title: "Escalate with context", body: "Humans get the summary, not a cold transfer into chaos." },
        ],
      },
      features: [
        { title: "Professional tone", body: "No hospitality slang on a legal intake call." },
        { title: "Lead capture", body: "New business rings become records, not memories." },
        { title: "Calendar-aware later", body: "Roadmap includes scheduling handoffs as the product hardens." },
        { title: "Waitlist access", body: "In development — early firms help set the rules." },
      ],
      benefits: [
        "Fewer lost new-business calls",
        "Clients get a competent first answer",
        "Partners stay in deep work longer",
        "Honest timeline from the VoxConcierge team",
      ],
      story: {
        title: "Same craft, different stakes",
        body: "The Vox voice stack started in restaurants because missed covers are measurable. Professional services miss revenue the same way — quietly, one unanswered ring at a time.",
      },
      faq: [
        {
          q: "Can it book consultations today?",
          a: "Intake and messaging come first; deeper calendar booking follows as VoxConcierge matures. Tell us your tools in the waitlist call.",
        },
        {
          q: "Will it discuss confidential matter details?",
          a: "No. It captures contact and intent, then escalates. Confidential substance stays with your people.",
        },
      ],
    },
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    sector: "enterprise",
    purposes: ["trust", "conversion"],
    status: "live",
    primaryProduct: "voxtable",
    shortDescription: "Multi-site voice automation with central visibility.",
    page: {
      seo: {
        title: "Enterprise AI phone automation · BitePerk",
        description:
          "Multi-site hospitality groups need one voice standard and central visibility. Talk to BitePerk about rolling Vox across venues without a frankenstein telephony stack.",
      },
      hero: {
        eyebrow: "Enterprise",
        headline: "One voice standard across every venue phone.",
        sub: "Groups that run more than one site still lose bookings the same way — site by site. BitePerk helps you deploy Vox with shared craft and central clarity.",
      },
      problem: {
        title: "Telephony patchworks do not scale",
        body: "Each venue invents its own overflow hack. Head office cannot see what the phones produced. Brand experience drifts.",
      },
      lostRevenue: {
        title: "Network-level leakage",
        body: "Run the arithmetic: a 2% miss rate across twenty venues is not a local anecdote — it is a budget line.",
        points: [
          "Inconsistent guest experience by site",
          "No single view of call outcomes",
          "Rollouts blocked by one-off integrations",
        ],
      },
      howWeSolve: {
        title: "How BitePerk solves it",
        body: "Start from the live Vox products that already work, then roll site-by-site with shared configuration, reporting, and a human success path.",
        steps: [
          { title: "Pilot one venue", body: "Prove bookings taken on a real line before a wide rollout." },
          { title: "Standardise the voice", body: "Same craft, local details where they matter." },
          { title: "Expand with playbooks", body: "Site onboarding that does not reinvent telephony each time." },
          { title: "See the network", body: "Outcomes visible beyond a single manager’s notebook." },
        ],
      },
      features: [
        { title: "Product that already ships", body: "Enterprise conversations start from live VoxTable/VoxOrder capability." },
        { title: "Site-level control", body: "Local hours and rules without losing group standards." },
        { title: "Australian data posture", body: "Onshore records for AU operations." },
        { title: "Human success partner", body: "You are not left alone with a self-serve maze." },
      ],
      benefits: [
        "Consistent guest phone experience",
        "Clearer portfolio-level outcomes",
        "Faster site onboarding after the pilot",
        "A demo path that respects procurement reality",
      ],
      story: {
        title: "Earn the rollout",
        body: "BitePerk would rather win a second site because the first one took more bookings than sell a slide deck about ‘transformation’. Enterprise starts with a working venue phone.",
      },
      faq: [
        {
          q: "Do you support multi-brand groups?",
          a: "Yes — we will talk brand voice, shared reporting, and site exceptions in the demo.",
        },
        {
          q: "Is there a separate enterprise SKU?",
          a: "Commercial shape depends on venue count and products. Start with a pilot conversation rather than a catalogue code.",
        },
      ],
    },
  },
] as const;

/** Assert catalogue ↔ slug list stay locked (build-time safety for agents). */
if (solutions.length !== SOLUTION_SLUGS.length) {
  throw new Error(
    `solutions.ts: expected ${SOLUTION_SLUGS.length} solutions, found ${solutions.length}`,
  );
}
for (const slug of SOLUTION_SLUGS) {
  if (!solutions.some((s) => s.slug === slug)) {
    throw new Error(`solutions.ts: missing slug ${slug}`);
  }
}

export function solutionBySlug(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}

export function liveSolutions(): readonly Solution[] {
  return solutions.filter((s) => s.status === "live");
}

/**
 * Which solution pages BUILD: live and draft (draft = written, not yet linked
 * from the nav). One predicate for [slug].astro's getStaticPaths AND
 * locales.ts's AU_STATIC_PAGES, so the route gate and the build cannot
 * disagree — they did (the gate expected every SOLUTION_SLUG unconditionally).
 */
export function renderableSolutions(): readonly Solution[] {
  return solutions.filter((s) => s.status === "live" || s.status === "draft");
}
export const RENDERABLE_SOLUTION_SLUGS: readonly string[] = renderableSolutions().map((s) => s.slug);

export function solutionPath(slug: string): string {
  return `/solutions/${slug}/`;
}
