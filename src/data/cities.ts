/**
 * City landing-page engine — single source of truth for /[city]/ pages.
 *
 * Every non-suburb text field is HAND-WRITTEN per city. That is a hard
 * anti-doorway rule enforced by scripts/gates/check-cities.mjs (min unique word
 * count + cross-city similarity check): templated copy with a city name
 * swapped in is how sites get classified as doorway spam.
 *
 * Sydney is the flagship (real NAP, isHQ). Other cities are honest
 * remote-served markets — the LocalBusiness NAP never changes; cities are
 * expressed as `areaServed` + per-page Service nodes in JSON-LD.
 *
 * Add a city: one entry here (published: false until its copy is done and
 * its hero image slot exists), then flip `published`.
 */
import { u } from "./locales";

export interface CityFaq {
  readonly q: string;
  readonly a: string;
}

export interface CityScenario {
  readonly title: string;
  readonly body: string;
}

/** "The AI under the hood, tuned for {City}" — hand-written per city.
 *  Four fixed topics (speech recognition + local suburbs, live availability,
 *  confidence gating → human, records kept in Australia) with per-city wording. */
export interface CityAiPoint {
  readonly icon: "pin-au" | "calendar-tick" | "phone-wave" | "shield";
  readonly title: string;
  readonly body: string;
}
export interface CityAiLocal {
  readonly lead: string;
  readonly points: readonly CityAiPoint[];
}

export interface City {
  readonly slug: string;
  readonly name: string;
  readonly state: "NSW" | "VIC" | "QLD" | "WA" | "SA";
  readonly stateName: string;
  readonly isHQ: boolean;
  readonly published: boolean;
  readonly geo: { readonly lat: number; readonly lng: number };
  /** Short label used in nav/footer, e.g. "AI for Sydney restaurants". */
  readonly navLabel: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly heroHeadline: string;
  /** Hand-written intro — the city's dining reality + the missed-call problem. */
  readonly intro: readonly string[];
  readonly suburbs: readonly string[];
  /** Localised "how Vox fits this city" cards. */
  readonly scenarios: readonly CityScenario[];
  readonly faqs: readonly CityFaq[];
  /** The AI/ML explainer, localised to this city. */
  readonly aiLocal: CityAiLocal;
  /** Blog slugs for internal linking. */
  readonly relatedGuides: readonly string[];
  /** ImageBlock slug for the hero photo. */
  readonly heroImage: string;
  readonly heroImageAlt: string;
  /** Mid-page "local story" photo (distinct per city, warm hospitality). */
  readonly storyImage: string;
  readonly storyImageAlt: string;
  /** Iconic, signage-free city establishing shot for the cityscape band. */
  readonly cityscapeImage: string;
  readonly cityscapeImageAlt: string;
}

export const cities: readonly City[] = [
  {
    slug: "sydney",
    name: "Sydney",
    state: "NSW",
    stateName: "New South Wales",
    isHQ: true,
    published: true,
    geo: { lat: -33.8798, lng: 151.2058 },
    navLabel: "Sydney",
    seoTitle: "AI phone answering for Sydney restaurants",
    seoDescription:
      "AI phone answering and an AI receptionist for Sydney restaurants. Bella answers every call from Surry Hills to Manly, checks live availability and books the table — 24/7, built in Sydney.",
    heroHeadline: "AI phone answering for Sydney restaurants.",
    intro: [
      "Every night, Sydney venues lose tables to a phone nobody can reach during service. At 7:30 on a Friday in Surry Hills or the CBD, your floor staff are carrying plates, not picking up the phone — and in a city with this much choice, callers rarely ring back. A handful of missed calls a week quietly adds up to thousands of dollars a month in lost covers.",
      "Biteperk is built, hosted and supported right here in Sydney. Bella answers every call in a warm Australian voice, checks your live availability, and books the table — 24/7, including the public-holiday Monday your voicemail usually eats. Voicemail doesn't fix the problem; diners want an answer now, not a callback after the kitchen has closed.",
      "From harbourside fine dining to a Newtown wine bar doing forty covers, the pattern is the same: the phone rings most exactly when nobody can answer it. That's the gap VoxTable closes — and being in the same time zone, we're on the phone ourselves when you need a human.",
    ],
    suburbs: [
      "Sydney CBD", "Surry Hills", "Newtown", "Darlinghurst", "Potts Point",
      "Bondi", "Paddington", "Chippendale", "Haymarket", "Marrickville",
      "Glebe", "Redfern", "Manly", "Balmain", "Leichhardt", "Parramatta",
    ],
    scenarios: [
      {
        title: "The Friday-night rush",
        body: "Peak service in Sydney is brutal on the phone: bookings, running-late calls and \"are you open?\" all landing while the pass is stacked. Bella picks up in under a second, every time — no hold music, no lost covers.",
      },
      {
        title: "A voice that knows the suburbs",
        body: "Bella is tuned for Australian English and local place names — she pronounces Woolloomooloo and Marrickville correctly, so callers get a warm, familiar answer instead of an overseas script.",
      },
      {
        title: "Bookings straight to your screen",
        body: "Live availability is checked before anything is promised, and confirmed reservations land in your dashboard. No double-bookings, no scribbled notes at the host stand.",
      },
      {
        title: "Local team, local data",
        body: "Your booking records stay in Australia, and call recordings self-delete after 30 days. When you want a human, you get the Sydney team who built the product — in your time zone, on your public holidays.",
      },
      {
        title: "Vivid Sydney to New Year's Eve",
        body: "Sydney's event calendar floods venues with first-time callers — Vivid crowds, harbour fireworks bookings, Mardi Gras weekends. Bella answers every one of them at once, so an event-night surge never means a ringing-out phone.",
      },
    ],
    faqs: [
      {
        q: "Can Bella take bookings during a blackout period or set a minimum group size?",
        a: "Yes. Your availability rules are yours: blackout dates, service windows, maximum party sizes, deposit-required thresholds. Bella books inside the rules and takes a structured message for anything outside them, so New Year's Eve doesn't end up double-booked.",
      },
      {
        q: "Do you only work with restaurants in Sydney?",
        a: "Sydney is home — we're built, hosted and supported here — but VoxTable works for restaurants and venues right across Australia. Sydney venues just get the bonus of a team in the same time zone who knows the local suburbs and the rhythm of a Sydney Friday night.",
      },
      {
        q: "How does AI phone answering work for a Sydney restaurant?",
        a: "You forward your existing venue number to your VoxTable line — about five minutes with Telstra, Optus or your VoIP provider. From then on, Bella answers every call in a natural Australian voice, checks your live availability, and writes the booking straight to your dashboard. No app for guests to download, no menus, no hold music.",
      },
      {
        q: "Will the voice sound local?",
        a: "Yes. Bella is trained on Australian English and tuned for local place names, so she pronounces the suburbs and streets your guests mention correctly — no overseas-call-centre feel.",
      },
      {
        q: "Where is my call and booking data stored?",
        a: "Your booking records stay in Australia (Sydney), and call recordings auto-delete after 30 days — never used to train AI models. Biteperk is Privacy Act compliant and your bookings always stay yours.",
      },
      {
        q: "What does it cost?",
        a: "VoxTable starts at a flat $80/month with no per-cover or per-call fees, scaling up for busier venues and multi-location groups. Most Sydney venues make it back from the bookings they stop missing in the first week.",
      },
      {
        q: "Is Bella an AI receptionist or just an answering service?",
        a: "An answering service takes a message and passes it on — you still have to ring the Sydney caller back, usually after they've booked somewhere else. Bella is an AI receptionist: she completes the booking on the call, against your live availability, and only takes a message for the genuinely unusual requests. The table is confirmed before the caller hangs up.",
      },
    ],
    aiLocal: {
      lead: "Vox is built and trained in Sydney, and it shows in the details. The speech model is tuned for Australian English and the way this city actually talks — so Bella isn't guessing at the names your guests take for granted.",
      points: [
        {
          icon: "pin-au",
          title: "She says the suburbs like a local",
          body: "Leichhardt lands as \"Lie-cart,\" not letter-by-letter. Marrickville, Parramatta, Woolloomooloo — the place names a generic overseas model mangles are exactly the ones our Sydney-trained recogniser gets right.",
        },
        {
          icon: "calendar-tick",
          title: "Checked against your real diary",
          body: "Bella doesn't improvise a time. She reads your live availability the instant a caller asks, offers a table that genuinely exists, and writes it back — so a Friday-night rush never becomes a double-booking.",
        },
        {
          icon: "phone-wave",
          title: "When she's unsure, a human steps in",
          body: "Every answer carries a confidence score. Below the line — an odd request, a name she can't quite catch — she stops guessing, takes the details, and flags your team to call back. A maybe becomes a callback, never a wrong booking.",
        },
        {
          icon: "shield",
          title: "Records kept in Australia",
          body: "Your booking records stay in Australia, call recordings auto-delete after 30 days, and nothing is used to train AI models. The team you reach when you want a person is the one that built the product.",
        },
      ],
    },
    relatedGuides: [
      "ai-phone-answering-for-sydney-restaurants",
      "what-missed-calls-cost-your-restaurant",
      "why-an-australian-voice-matters",
    ],
    heroImage: "sydney-cafe-morning",
    heroImageAlt: "A Sydney café in the morning, warm light through the windows, ready for service.",
    storyImage: "sydney-cafe-street",
    storyImageAlt: "A Sydney café street at golden hour, an awning over the footpath.",
    cityscapeImage: "sydney-harbour-dusk",
    cityscapeImageAlt: "Sydney Harbour at dusk — the Opera House and Harbour Bridge on the water.",
  },
  {
    slug: "melbourne",
    name: "Melbourne",
    state: "VIC",
    stateName: "Victoria",
    isHQ: false,
    published: true,
    geo: { lat: -37.8136, lng: 144.9631 },
    navLabel: "Melbourne",
    seoTitle: "AI phone answering for Melbourne restaurants",
    seoDescription:
      "An AI receptionist for Melbourne restaurants. Bella answers every call — Fitzroy laneway bar or CBD dining room — checks live availability and books the table, 24/7.",
    heroHeadline: "AI phone answering for Melbourne restaurants.",
    intro: [
      "Melbourne runs on tight rooms and tighter margins. A forty-seat laneway diner doesn't have a host standing by the phone — the person nearest it is also running the pass, polishing glasses and seating walk-ins. When the room is loud and the espresso machine is screaming, the phone loses. Every one of those unanswered calls is a table that quietly books the place two doors down.",
      "Melbourne's dining culture also books differently: more no-shows to chase, more \"can we push to 8:15?\" calls, more groups reorganising themselves on a Thursday night. Bella handles the churn — answering instantly, checking your real availability, confirming, amending and rebooking — so your floor staff never have to choose between the guest in front of them and the one on the line.",
      "You keep your existing number; forwarding takes minutes with any carrier. Bella speaks natural Australian English tuned for Melbourne's suburbs — she won't mangle Prahran or Fitzroy — and every booking lands in your dashboard, with your records kept in Australia under Australian privacy law.",
    ],
    suburbs: [
      "Melbourne CBD", "Fitzroy", "Carlton", "Collingwood", "Richmond",
      "South Yarra", "Prahran", "St Kilda", "Brunswick", "Northcote",
      "Southbank", "Docklands", "Footscray", "Hawthorn", "Windsor", "Abbotsford",
    ],
    scenarios: [
      {
        title: "Laneway rooms, no front desk",
        body: "Most Melbourne venues don't have a dedicated phone person — the room is too small and the labour maths doesn't work. Bella is the front desk you don't have floor space for.",
      },
      {
        title: "The 8:15 shuffle",
        body: "Melburnians amend bookings constantly. Bella takes the \"running late\", \"make it six people\" and \"push it back\" calls, updates the reservation, and your floor plan stays true.",
      },
      {
        title: "Coffee-hour chaos",
        body: "Cafés doing a brunch trade get booking calls during the exact hours the phone can't be heard over the grinder. Bella answers while your baristas pour.",
      },
      {
        title: "Winter no-show insurance",
        body: "Cold, wet Melbourne nights breed no-shows. Bella confirms bookings by phone the way a human host would — and a confirmed caller shows up far more often than a web form ever does.",
      },
      {
        title: "Footy nights and festival weeks",
        body: "An MCG blockbuster or a comedy-festival week reshapes the whole city's booking pattern in an afternoon. Bella rides the surge — taking the pre-match six-o'clock rush and the post-show supper calls without a single busy signal.",
      },
    ],
    faqs: [
      {
        q: "Does Biteperk have a Melbourne office?",
        a: "Our team is based in Sydney — same time zone, one hour of the year excepted. VoxTable itself is fully remote to set up: you forward your existing Melbourne number, and support is a phone call or email away during Australian business hours.",
      },
      {
        q: "Will Bella cope with Melbourne suburb and street names?",
        a: "Yes. She's tuned for Australian place names — Prahran, Cremorne, Errol Street — and pronounces them like a local, because nothing breaks a caller's trust faster than a voice that can't say where they live.",
      },
      {
        q: "We're a small laneway venue. Is this overkill?",
        a: "Small rooms benefit most. If you seat forty, two missed bookings on a Friday is five percent of your night gone. VoxTable's entry tier is a flat $80/month — no per-call or per-cover fees — which most small venues cover with the first table they stop losing.",
      },
      {
        q: "Can Bella handle our group bookings and function enquiries?",
        a: "Bella books standard tables end-to-end and takes structured messages for anything bespoke — large groups, functions, whole-venue enquiries — so the detail is waiting in your dashboard instead of half-remembered from a loud room.",
      },
      {
        q: "Where does our data live?",
        a: "Your booking records stay in Australia, recordings auto-delete after 30 days, nothing is used to train AI models, and everything is handled under the Privacy Act. Your bookings are yours.",
      },
      {
        q: "We already take bookings through a widget — why add phone answering?",
        a: "Because Melbourne still rings. Older diners, group organisers and anyone with a question a form can't answer will always pick up the phone — and those callers skew toward bigger tables and special occasions. Bella catches the bookings your widget never sees.",
      },
      {
        q: "Is Bella an AI receptionist or just an answering service?",
        a: "A Melbourne answering service writes down the request and leaves you to call back — which, with this city's amendment habit, means playing phone tag over a table time. Bella is an AI receptionist: she books it there and then, moves the 8:15 to 8:30 if that's what's asked, and confirms it against your real diary. Only the odd request becomes a message.",
      },
    ],
    aiLocal: {
      lead: "Melbourne diners amend. \"Push it to 8:15, make it six, actually can we sit inside\" — the model behind Bella is tuned for Australian English and the fast, chatty way this city changes its mind on the phone.",
      points: [
        {
          icon: "pin-au",
          title: "Prahran, not \"Pra-han\"",
          body: "Our Australian-trained speech recogniser handles the names locals shorten and swallow — Prahran as \"P'ran,\" Northcote, Brunswick — where an overseas model spells them out or gets them wrong.",
        },
        {
          icon: "phone-wave",
          title: "Understanding, not keyword-matching",
          body: "\"Any chance of four-ish around eight?\" is a request with a party size and a rough time, and Bella reads it as one — then confirms the specifics rather than forcing the caller into a menu.",
        },
        {
          icon: "calendar-tick",
          title: "Booked against the live diary",
          body: "Every table she offers is checked against your real availability in the moment, and the confirmed booking lands on your screen — no laneway 40-seater juggling paper at the pass.",
        },
        {
          icon: "shield",
          title: "Your records stay in Australia",
          body: "Your booking records stay in Australia and call recordings self-delete after 30 days. Nothing is used to train AI models, and low-confidence moments become a flagged callback, not a guess.",
        },
      ],
    },
    relatedGuides: [
      "ai-phone-answering-for-melbourne-restaurants",
      "what-missed-calls-cost-your-restaurant",
      "how-to-reduce-no-shows-at-your-restaurant",
    ],
    heroImage: "busy-service-night",
    heroImageAlt: "A dim, busy restaurant dining room mid-service, staff moving between tables.",
    storyImage: "table-set-candles",
    storyImageAlt: "A restaurant table set with candles and cutlery, ready for dinner service.",
    cityscapeImage: "melbourne-skyline",
    cityscapeImageAlt: "The Melbourne city skyline across the Yarra River, framed by parkland.",
  },
  {
    slug: "brisbane",
    name: "Brisbane",
    state: "QLD",
    stateName: "Queensland",
    isHQ: false,
    published: true,
    geo: { lat: -27.4698, lng: 153.0251 },
    navLabel: "Brisbane",
    seoTitle: "AI phone answering for Brisbane restaurants",
    seoDescription:
      "AI phone answering for Brisbane restaurants. Bella is the AI receptionist that answers every call from West End to Teneriffe, handles deck-or-inside changes and books tables 24/7.",
    heroHeadline: "AI phone answering for Brisbane restaurants.",
    intro: [
      "Brisbane dining is outdoor dining — river decks at Howard Smith Wharves, beer gardens in West End, footpath tables in Teneriffe. That makes the phone busier, not quieter: every change in the sky produces a wave of \"is the deck still on?\", \"can we move inside?\" and \"are you open if it storms?\" calls, all landing while your team is resetting tables in the heat.",
      "Queensland's early rhythm changes the maths too. Brisbane books earlier, eats earlier and calls earlier — the booking rush hits at knock-off time, right through the pre-service hour when nobody can spare a hand for the phone. Bella answers every one of those calls instantly, checks your real availability, and books or amends the table without anyone leaving the floor.",
      "Setup is remote: keep your existing number, forward it in minutes, and every confirmed booking lands in your dashboard. Your booking records stay in Australia, and our Sydney-based team supports you in your own time zone — no international queue, no ticket black hole. From a Valley rooftop to a James Street bistro to a Woolloongabba pub kitchen, the venues that grow in Brisbane are the ones that never let a booking ring out.",
    ],
    suburbs: [
      "Brisbane CBD", "Fortitude Valley", "West End", "South Brisbane",
      "New Farm", "Teneriffe", "Newstead", "Paddington", "Milton",
      "Woolloongabba", "Kangaroo Point", "Bulimba", "Ascot", "Toowong",
      "Stones Corner", "Sandgate",
    ],
    scenarios: [
      {
        title: "Storm-front phone surges",
        body: "A southeast-Queensland storm cell turns every outdoor booking into a phone call at once. Bella absorbs the surge — moving tables inside, rebooking, reassuring — while your team physically moves the furniture.",
      },
      {
        title: "The early rush",
        body: "Brisbane's booking calls peak at 4–6pm, exactly when prep peaks too. Bella covers the pre-service window so the kitchen brief doesn't get interrupted forty times.",
      },
      {
        title: "Weekend markets and events",
        body: "Riverfire, the Ekka, a Gabba game — event weekends flood venues with first-time callers asking the same questions. Bella answers all of them, every time, in one ring.",
      },
      {
        title: "Deck-or-inside, answered",
        body: "Bella takes structured booking notes — outdoor preference, pram access, the works — so requests arrive in your dashboard as usable detail, not a voicemail to decipher.",
      },
      {
        title: "Sunday-session bookings",
        body: "Brisbane's long Sunday sessions generate a stream of same-day calls from midday onward. Bella books them against your live floor plan while your team runs the garden, so the afternoon fills itself.",
      },
    ],
    faqs: [
      {
        q: "We're in Brisbane — how does support work from Sydney?",
        a: "Same time zone for most of the year, and always Australian business hours. Setup is remote and takes minutes; if you need a human, you ring and get the team that built the product, not an offshore queue.",
      },
      {
        q: "Can Bella handle weather-driven booking changes?",
        a: "Yes — amendments are her bread and butter. Callers can move a deck booking inside, shift the time or resize the group, and Bella updates the reservation against your live availability so the floor plan stays accurate.",
      },
      {
        q: "Our venue is seasonal — can we scale up and down?",
        a: "Plans are monthly with no lock-in contracts, so a venue that roars in spring and quietens in February isn't paying peak pricing year-round. Start on the $80/month tier and move up when the deck fills.",
      },
      {
        q: "Does Bella understand Queensland place names?",
        a: "She's tuned for Australian English including Queensland names — Woolloongabba, Teneriffe, Toowong — pronounced like someone who lives there, not a synthetic overseas voice reading syllables.",
      },
      {
        q: "Where is our call data processed?",
        a: "Your booking records stay in Australia (Sydney). Recordings auto-delete after 30 days, are never used to train AI models, and everything is handled in line with the Privacy Act.",
      },
      {
        q: "Can Bella tell callers about our outdoor areas and wet-weather policy?",
        a: "Yes — you configure the facts once (covered deck, umbrellas, the move-inside rule) and Bella answers them consistently on every call, which is exactly the question Brisbane venues get asked most.",
      },
      {
        q: "Is Bella an AI receptionist or just an answering service?",
        a: "An answering service in Brisbane just relays a message and leaves the booking to you. Bella is an AI receptionist: on a storm-night rush of deck-or-inside calls she checks your live diary and confirms each table herself, in parallel, and only hands you a message for anything she can't resolve. Fewer callbacks, no missed covers.",
      },
    ],
    aiLocal: {
      lead: "A Brisbane storm rolls in and the deck-or-inside calls arrive all at once. Bella takes every one of them in parallel — and because the model is tuned for Australian English, the Queensland place names never trip her up.",
      points: [
        {
          icon: "calendar-tick",
          title: "Real availability, in real time",
          body: "When the weather turns and everyone wants to move off the deck, Bella checks your live diary before she offers anything — so a wet-Friday rush rebooks cleanly instead of stacking clashes.",
        },
        {
          icon: "pin-au",
          title: "Queensland names, said right",
          body: "Woolloongabba, Teneriffe, Toowong — the suburbs a generic recogniser fumbles are the ones ours is trained on. Callers get a warm, local-sounding answer, not an overseas script sounding them out.",
        },
        {
          icon: "shield",
          title: "Records that stay in Australia",
          body: "Your booking records stay in Australia, recordings self-delete after 30 days, and nothing is ever fed to AI training. Your bookings stay yours.",
        },
        {
          icon: "phone-wave",
          title: "A human for the tricky ones",
          body: "Bella scores her own confidence on every turn. When something's off — a big function, a request she can't place — she takes a message and flags your team rather than committing to a booking she's unsure of.",
        },
      ],
    },
    relatedGuides: [
      "ai-phone-answering-for-brisbane-restaurants",
      "what-missed-calls-cost-your-restaurant",
      "how-to-forward-your-restaurant-phone-to-an-ai-host",
    ],
    heroImage: "restaurant-evening",
    heroImageAlt: "A candlelit restaurant interior in the evening, tables set for service.",
    storyImage: "restaurant-pass",
    storyImageAlt: "A kitchen pass with a prepared dish under service light.",
    cityscapeImage: "brisbane-river",
    cityscapeImageAlt: "The Brisbane city skyline at dusk, high-rises above the river.",
  },
  {
    slug: "perth",
    name: "Perth",
    state: "WA",
    stateName: "Western Australia",
    isHQ: false,
    published: true,
    geo: { lat: -31.9523, lng: 115.8613 },
    navLabel: "Perth",
    seoTitle: "AI phone answering for Perth restaurants",
    seoDescription:
      "An AI receptionist that never checks the clock. Bella answers Perth restaurant calls 24/7 — Northbridge to Fremantle — so the time zone never costs you a booking.",
    heroHeadline: "AI phone answering for Perth restaurants.",
    intro: [
      "Perth runs two to three hours behind the east coast, and hospitality feels it everywhere: suppliers, platforms and support desks are closing just as your service begins. The phone doesn't care. Beach-suburb bistros in Cottesloe and wine bars in Mount Lawley get their booking calls at Perth time — through the afternoon prep window and deep into a Friday night when there is nobody spare to answer.",
      "Bella never checks a clock. She answers every call instantly, around the clock, in a natural Australian voice — checks your live availability, books the table, takes the message — and because she's software, the time-zone gap that makes every other service feel far away simply doesn't exist. A Melbourne visitor calling at 9pm AWST gets answered exactly like a local calling at noon.",
      "West Australians are famously loyal to venues that treat them well, and famously unforgiving of ones that don't pick up. Keep your existing number, forward it in minutes, and every confirmed booking lands in your dashboard, with your records kept in Australia under the Privacy Act. Whether you're pouring natural wine in Northbridge or plating dhufish in Claremont, the phone should be an asset — not the job nobody on the roster wants.",
    ],
    suburbs: [
      "Perth CBD", "Northbridge", "Fremantle", "Cottesloe", "Subiaco",
      "Leederville", "Mount Lawley", "Highgate", "Scarborough", "Claremont",
      "Victoria Park", "South Perth", "Nedlands", "Mount Hawthorn",
      "East Perth", "Applecross",
    ],
    scenarios: [
      {
        title: "The time-zone tax, cancelled",
        body: "Eastern-states visitors book at eastern-states hours — often before your doors open. Bella answers at 6am AWST as brightly as at 8pm, so interstate bookings stop leaking away.",
      },
      {
        title: "Sundowner season",
        body: "Perth's long summer evenings pack terraces from Scarborough to South Perth, and the walk-in-or-book question rings all afternoon. Bella handles the phone queue while your team pours, so the sunset crowd books instead of drifting on.",
      },
      {
        title: "FIFO Fridays",
        body: "Swing changes bring bursts of large, last-minute group bookings. Bella takes group size, time and requests as structured detail your host can act on — not a garbled voicemail.",
      },
      {
        title: "Small crews, long nights",
        body: "WA's hospitality staffing crunch is real. Bella is the team member who never calls in sick, never needs a visa sponsorship, and costs less per month than one Friday shift.",
      },
      {
        title: "Fremantle weekends",
        body: "Markets, gigs and the Freo strip pull unpredictable crowds every weekend. Bella turns the walk-in-or-wait chaos into confirmed bookings, taken while the queue is still forming outside.",
      },
    ],
    faqs: [
      {
        q: "Does the Sydney time difference affect support?",
        a: "Bella herself works 24/7, so the product never sleeps. For human support, we cover Australian business hours and schedule around AWST for setup calls — you'll never be told to call back when Sydney wakes up for anything urgent.",
      },
      {
        q: "Can Bella answer calls outside our opening hours?",
        a: "Yes — that's where Perth venues win most. Overnight and pre-open calls from interstate diners get answered and booked against your live availability instead of hitting voicemail and vanishing.",
      },
      {
        q: "Will callers realise Bella is AI?",
        a: "Bella introduces herself honestly and sounds like a warm Australian host, not a robot menu. Most callers simply get their table booked in under a minute — which is what they rang for.",
      },
      {
        q: "How long does setup take from Perth?",
        a: "The same as anywhere: forward your existing number (Telstra, Optus or VoIP — about five minutes), tell us your availability rules, and most venues take their first Bella-answered call within 48 hours.",
      },
      {
        q: "Where is our data kept?",
        a: "Your booking records stay in Australia, with Privacy Act compliance. Recordings auto-delete after 30 days and are never used to train AI models.",
      },
      {
        q: "Our venue also does functions — can Bella handle those enquiries?",
        a: "Bella books standard tables end-to-end and captures function enquiries as structured messages — date, numbers, budget hints, contact details — so your events person calls back with everything they need instead of playing phone tag.",
      },
      {
        q: "Is Bella an AI receptionist or just an answering service?",
        a: "A traditional answering service takes a message you have to action later — no use at 6am in Perth when the caller is an eastern-states booking. Bella is an AI receptionist: she completes the booking on the spot, around the clock, against your live availability, and only escalates the genuinely tricky calls to your team. The time zone stops costing you tables.",
      },
    ],
    aiLocal: {
      lead: "Software doesn't have a time zone. An eastern-states caller ringing a Perth venue at what feels like mid-morning to them is 6am in Perth — and Bella answers that call in the same warm, Australian-tuned voice she uses at dinner service.",
      points: [
        {
          icon: "phone-wave",
          title: "Awake when the east coast calls",
          body: "There's no roster gap for Bella to fall through. She picks up around the clock and, when a request is beyond a quick booking, takes the details and flags your team instead of guessing — a callback, not a wrong answer.",
        },
        {
          icon: "pin-au",
          title: "Subiaco, said the local way",
          body: "\"Subi-AH-co,\" Cottesloe, Fremantle — WA names have their own rhythm, and the Australian-English model behind Bella is tuned for them where an offshore recogniser guesses.",
        },
        {
          icon: "calendar-tick",
          title: "Checked against your book",
          body: "Bella reads your live availability the moment a caller asks and only offers a table that actually exists, writing the confirmed booking straight to your dashboard.",
        },
        {
          icon: "shield",
          title: "In Australia, and yours",
          body: "Your booking records stay in Australia and recordings auto-delete after 30 days — never used to train AI models. Privacy Act compliant, start to finish.",
        },
      ],
    },
    relatedGuides: [
      "ai-phone-answering-for-perth-restaurants",
      "what-missed-calls-cost-your-restaurant",
      "how-much-does-ai-phone-answering-cost-for-a-restaurant",
    ],
    heroImage: "phone-on-bar",
    heroImageAlt: "A phone resting on a timber bar counter in warm afternoon light.",
    storyImage: "coffee-window",
    storyImageAlt: "A café service window in warm morning light.",
    cityscapeImage: "perth-city",
    cityscapeImageAlt: "The Perth skyline reflected in the Swan River at dusk.",
  },
  {
    slug: "adelaide",
    name: "Adelaide",
    state: "SA",
    stateName: "South Australia",
    isHQ: false,
    published: true,
    geo: { lat: -34.9285, lng: 138.6007 },
    navLabel: "Adelaide",
    seoTitle: "AI phone answering for Adelaide restaurants",
    seoDescription:
      "AI phone answering for Adelaide restaurants and wine bars. Bella, an AI receptionist, answers every call — Peel Street to Glenelg — books the table and rides the Mad March surge, 24/7.",
    heroHeadline: "AI phone answering for Adelaide restaurants.",
    intro: [
      "Adelaide punches absurdly above its weight — a city of heritage-stone wine bars, Peel Street rooms with twelve tables, and East End dining built on personal service. That intimacy is the point, and it's also the problem: in a venue where the owner is on the floor, there is genuinely nobody to answer the phone, and the person calling can hear it ring out.",
      "The city's rhythm is spiky, too. Mad March alone — Fringe, the Festival, the motorsport crowd — can triple booking calls for weeks, then vintage season fills weekends with cellar-door visitors ringing from the Hills on their way back into town. Bella flattens the spikes: every call answered in one ring, availability checked, tables booked and amended without a single interruption to the room.",
      "For venues built on relationships, handing the phone to software feels like a leap — so Bella is deliberately warm, honest about what she is, and scrupulous about detail. The regular who always sits at the window gets their note passed through to your dashboard; you keep the hospitality, she just catches the calls you were already missing. In a city where everyone knows everyone, the venue that always answers earns the reputation — and the repeat bookings that come with it.",
    ],
    suburbs: [
      "Adelaide CBD", "North Adelaide", "Norwood", "Unley", "Hyde Park",
      "Prospect", "Glenelg", "Henley Beach", "Goodwood", "Parkside",
      "Stepney", "Kent Town", "Semaphore", "Port Adelaide", "Mile End", "Thebarton",
    ],
    scenarios: [
      {
        title: "Mad March, managed",
        body: "Festival season triples call volume exactly when your room is fullest. Bella scales infinitely for those four weeks — and costs the same flat monthly fee.",
      },
      {
        title: "Twelve tables, zero hosts",
        body: "Small rooms can't staff a phone. Bella is the host stand a Peel Street bar doesn't have, booking against live availability while the owner pours.",
      },
      {
        title: "Wine-country weekenders",
        body: "Visitors ring from Barossa and McLaren Vale on their way back to the city. Bella catches the 4pm \"table for six tonight?\" calls that voicemail loses to another venue.",
      },
      {
        title: "Regulars, remembered",
        body: "Bella takes notes callers volunteer — anniversary, window seat, the usual — and passes them to your dashboard so your team can do the personal touch Adelaide is famous for.",
      },
      {
        title: "Sunday in the Hills, sorted",
        body: "When the cellar doors close, the city fills. Bella catches the late-afternoon convoy of \"table for four in an hour?\" calls so the Sunday-evening book writes itself while your floor resets.",
      },
    ],
    faqs: [
      {
        q: "Our venue trades on personal service. Won't AI undermine that?",
        a: "Bella answers the calls that were ringing out — she isn't replacing a host you have, she's catching the bookings your missing host loses. She's honest about being AI, warm on the line, and passes every personal detail through so your team delivers the actual hospitality.",
      },
      {
        q: "Can Bella cope with festival-season volume?",
        a: "Yes — she answers every concurrent call instantly, whether it's two on a Tuesday or forty during Fringe. There's no per-call charge, so a Mad March surge costs you nothing extra.",
      },
      {
        q: "Do you support South Australian venues from Sydney?",
        a: "Yes, in Australian business hours (Adelaide is 30 minutes behind Sydney, so effectively identical). Setup is remote — forward your existing number in minutes — and support is the actual product team.",
      },
      {
        q: "How does Bella handle wine-list or menu questions?",
        a: "She answers what you've configured — opening hours, dietary basics, booking policy — and takes a structured message for anything deeper, like cellar requests or degustation queries, so the right person calls back with the right answer.",
      },
      {
        q: "Where does our data live?",
        a: "Your booking records stay in Australia (Sydney), Privacy Act compliant; recordings auto-delete after 30 days and are never used to train AI models.",
      },
      {
        q: "What does VoxTable cost for a small Adelaide venue?",
        a: "The entry tier is a flat $80/month with no per-call or per-cover fees — festival fortnights included. For a twelve-table room, one saved Saturday booking usually covers it.",
      },
      {
        q: "Is Bella an AI receptionist or just an answering service?",
        a: "An answering service records the call and leaves the booking to you — extra work in a small Adelaide room already run off its feet. Bella is an AI receptionist: she books the table herself, checked against your live diary, and because she knows her own limits she takes a message only when she's genuinely unsure. A maybe becomes a callback, not a wrong booking.",
      },
    ],
    aiLocal: {
      lead: "In a twelve-table Adelaide dining room, one wrong booking is a real problem. That's why the AI behind Bella is built to know its own limits — and why it's tuned for Australian English and the small-bar names locals rattle off.",
      points: [
        {
          icon: "phone-wave",
          title: "A maybe is a callback, never a mistake",
          body: "Bella scores her confidence on every turn. When she isn't sure — an unusual request, a name she can't catch in a busy room — she takes a message and flags your team rather than risk a booking you'd have to unpick.",
        },
        {
          icon: "calendar-tick",
          title: "Only tables that exist",
          body: "She checks your live diary before she promises anything, so the Mad March surge fills the room instead of overfilling it. Confirmed bookings write straight to your screen.",
        },
        {
          icon: "pin-au",
          title: "Glenelg, Thebarton, Norwood",
          body: "The suburbs your regulars name are the ones our Australian-trained recogniser is tuned for — so callers hear a familiar, local answer, not an overseas call-centre feel.",
        },
        {
          icon: "shield",
          title: "Kept in Australia",
          body: "Your booking records stay in Australia, recordings auto-delete after 30 days, and nothing trains AI models. The people you reach for a hand are an Australian team.",
        },
      ],
    },
    relatedGuides: [
      "ai-phone-answering-for-adelaide-restaurants",
      "what-missed-calls-cost-your-restaurant",
      "do-diners-want-to-talk-to-an-ai",
    ],
    heroImage: "kitchen-rush",
    heroImageAlt: "A busy kitchen mid-service, tickets and plates lined up on the pass.",
    storyImage: "pour-shot",
    storyImageAlt: "A drink being poured under low, dramatic bar light.",
    cityscapeImage: "adelaide-city",
    cityscapeImageAlt: "Adelaide seen from the hills, the city stretching out toward the gulf.",
  },
  {
    slug: "gold-coast",
    name: "Gold Coast",
    state: "QLD",
    stateName: "Queensland",
    isHQ: false,
    published: true,
    geo: { lat: -28.0167, lng: 153.4 },
    navLabel: "Gold Coast",
    seoTitle: "AI phone answering for Gold Coast restaurants",
    seoDescription:
      "An AI receptionist for Gold Coast restaurants. Bella answers tourist calls 24/7 — Burleigh to Broadbeach — books same-day tables and never takes schoolies week off.",
    heroHeadline: "AI phone answering for Gold Coast restaurants.",
    intro: [
      "The Gold Coast feeds a permanent holiday crowd, and holiday-makers behave nothing like locals: they book same-day, they call from the beach at 3pm for tonight, they ask for directions, parking, kids' menus and whether thongs are fine — and if the phone rings out they simply call the next place on the strip. On the Coast, an unanswered phone isn't a missed booking, it's a donation to your competitor.",
      "Volume swings are wild — school holidays, schoolies, the 500, a wet week that empties the beach and fills every indoor table at once. Staffing a phone for peak means overpaying for the shoulder; staffing for the shoulder means drowning at peak. Bella is elastic: she answers every concurrent call instantly in a natural Australian voice, checks live availability, and books the table for one flat monthly fee.",
      "Tourists also call at tourist hours — before your doors open, after the kitchen closes, from other time zones entirely. Bella works 24/7 on your existing number (forwarding takes minutes), every booking lands in your dashboard, and your records are kept in Australia under the Privacy Act. From a Burleigh headland bistro to a Broadbeach steakhouse, the maths is the same: the strip rewards whoever picks up first.",
    ],
    suburbs: [
      "Surfers Paradise", "Broadbeach", "Burleigh Heads", "Palm Beach",
      "Coolangatta", "Currumbin", "Miami", "Mermaid Beach", "Nobby Beach",
      "Main Beach", "Southport", "Robina", "Mudgeeraba", "Tallebudgera",
      "Kirra", "Chevron Island",
    ],
    scenarios: [
      {
        title: "The 3pm beach call",
        body: "Tourists decide on dinner mid-afternoon, phone in hand on the sand. Bella answers instantly, books tonight's table and texts nothing — the reservation just appears on your floor plan.",
      },
      {
        title: "Holiday-peak elasticity",
        body: "September holidays can double your call volume overnight. Bella takes every concurrent call at once, so peak season stops meaning ringing-out season.",
      },
      {
        title: "Tourist questions, handled",
        body: "Parking, dress code, kids' menu, \"how far from the tram?\" — Bella answers the configured basics and books the table, saving your staff the fifty-question calls.",
      },
      {
        title: "Rain-day rebookings",
        body: "One wet forecast reshuffles the whole strip. Bella absorbs the wave of cancellations and rebookings against live availability, keeping your book accurate while the sky sorts itself out.",
      },
      {
        title: "Big-group holiday bookings",
        body: "Families and reunion groups travel in packs of ten. Bella captures group size, highchairs, split-bill warnings and the works as structured detail, so your floor manager isn't decoding a shouted voicemail from the beach.",
      },
    ],
    faqs: [
      {
        q: "Most of our callers are tourists. Does that change anything?",
        a: "It's exactly where Bella shines. Tourists book same-day, call at odd hours and ask predictable questions — she answers 24/7, books against live availability and handles the basics you configure, so first-time callers get treated as well as regulars.",
      },
      {
        q: "Can Bella handle schoolies / holiday-peak call volume?",
        a: "Yes. She answers every concurrent call instantly with no per-call fees, so your busiest fortnight of the year costs the same flat monthly price as the quietest.",
      },
      {
        q: "Do interstate and overseas callers get answered overnight?",
        a: "Around the clock. A caller from Auckland or Perth gets a warm Australian voice and a confirmed booking whatever the hour — no voicemail, no time-zone tax.",
      },
      {
        q: "How fast can a Gold Coast venue get set up?",
        a: "Forward your existing number — about five minutes with any Australian carrier — tell us your availability rules, and most venues take their first Bella-answered call within 48 hours. Support runs on Australian business hours from our Sydney team.",
      },
      {
        q: "Where is our call and booking data stored?",
        a: "Your booking records stay in Australia, Privacy Act compliant; recordings auto-delete after 30 days and are never used to train AI models.",
      },
      {
        q: "We're a café that turns tables fast — is phone booking even worth it?",
        a: "For high-turn venues Bella acts more like a traffic controller than a reservations desk: she answers the \"how long's the wait?\" calls, takes larger-group bookings that are worth holding a table for, and spares your counter staff the phone entirely during the brunch crush.",
      },
      {
        q: "Is Bella an AI receptionist or just an answering service?",
        a: "An answering service takes a tourist's message and hopes you call back before they've booked another Gold Coast venue. Bella is an AI receptionist: she answers every holiday-peak call at once, confirms same-day tables against your live diary on the call, and only takes a message for the requests she can't complete. The booking is locked before they hang up.",
      },
    ],
    aiLocal: {
      lead: "Gold Coast phones ring with first-time visitors in every accent — interstate, overseas, someone reading your name off a map. Bella answers all of them at once, and the Australian-tuned model still gets the local names right.",
      points: [
        {
          icon: "pin-au",
          title: "Mudgeeraba and Coolangatta, no stumble",
          body: "\"Mudge-er-AH-ba,\" Coolangatta, Currumbin — the names that catch out a visitor catch out a generic model too. Ours is trained on them, so a tourist gets a confident, local-sounding answer.",
        },
        {
          icon: "calendar-tick",
          title: "Same-day tables, checked live",
          body: "A 3pm \"anything for tonight?\" from the beach is checked against your real diary on the spot — Bella offers what's genuinely open and books it straight to your screen.",
        },
        {
          icon: "phone-wave",
          title: "Every caller at once, humans on standby",
          body: "Holiday-peak volume doesn't put anyone on hold; Bella takes calls in parallel. And when a request is beyond her confidence, she captures the details and flags your team for a callback.",
        },
        {
          icon: "shield",
          title: "Australian data, always",
          body: "Your booking records stay in Australia and recordings auto-delete after 30 days — never used to train AI models, however far away the caller happens to be.",
        },
      ],
    },
    relatedGuides: [
      "ai-phone-answering-for-gold-coast-restaurants",
      "what-missed-calls-cost-your-restaurant",
      "how-much-does-ai-phone-answering-cost-for-a-restaurant",
    ],
    heroImage: "empty-tables-evening",
    heroImageAlt: "Empty restaurant tables set for evening service in soft, warm light.",
    storyImage: "bar-cocktail-action",
    storyImageAlt: "A bartender mixing a cocktail behind a busy bar.",
    cityscapeImage: "gold-coast-skyline",
    cityscapeImageAlt: "The Gold Coast skyline along the beach at Surfers Paradise.",
  },
];

export const publishedCities = cities.filter((c) => c.published);

export const getCity = (slug: string) => cities.find((c) => c.slug === slug);

export const cityUrl = (c: City) => u(`/${c.slug}/`);
