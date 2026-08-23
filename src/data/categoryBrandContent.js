/**
 * Brand-page closing content (SEO article + FAQs) per sell category.
 * Same layout/assets everywhere — only copy changes.
 */

function faqSet(device, plural, extra = []) {
  const d = device;
  const p = plural;
  return [
    {
      q: `How do I sell my old ${d} on DeviceKart?`,
      a: `Select your ${d} brand and model, check its price by answering a few condition questions, confirm the quote, and book a free doorstep pickup. After verification you get paid via UPI, bank transfer, or cash.`,
    },
    {
      q: `Why should I use DeviceKart to sell my ${d}?`,
      a: `DeviceKart makes it quick and transparent to sell old ${p} online — market-linked pricing, free doorstep pickup, instant payment options, and data safety support in one flow.`,
    },
    {
      q: `How does DeviceKart decide how much to pay for ${p}?`,
      a: `We combine live market pricing with your condition answers — age, functionality, cosmetic state, and accessories. Honest details help you get the most accurate quote before pickup.`,
    },
    {
      q: `Can I sell any ${d} model on DeviceKart?`,
      a: `DeviceKart accepts popular ${p} from major brands. Browse brands above or use search to find your model. If something isn’t listed, contact support for a custom quote.`,
    },
    {
      q: `Is it safe to sell my ${d} with DeviceKart?`,
      a: `Yes. You get a clear online quote, verified doorstep agents, secure payment options, and guidance to protect your data before handover — with no hidden buyer surprises.`,
    },
    {
      q: `Are there any hidden fees when I sell my ${d}?`,
      a: `No. The quote you accept after verification is what you get paid. Pickup and inspection do not add extra charges.`,
    },
    {
      q: `How do I know the price of my old ${d}?`,
      a: `Pick your brand and model (or search), answer the condition quiz, and get an instant price. Accept the offer, schedule free pickup, and get paid once the device is checked.`,
    },
    {
      q: `Can I sell a damaged or non-working ${d}?`,
      a: `Yes. Select the right condition options so the quote matches the real state of your ${d}. You may get a lower price, but the offer stays transparent.`,
    },
    {
      q: `What documents do I need to sell my ${d}?`,
      a: `You may be asked about the bill and original box during the condition steps. Even without them, you can usually still sell on DeviceKart — have a valid ID ready for pickup.`,
    },
    {
      q: 'Is doorstep pickup really free?',
      a: 'Yes. DeviceKart offers free doorstep pickup on serviceable pincodes. There are no hidden charges for pickup or inspection.',
    },
    {
      q: `Why sell on DeviceKart instead of a local shop?`,
      a: `You get clearer price transparency online, free doorstep pickup, instant payment options, and stronger data-safety practices than typical walk-in dealers — without shop visits or cash-only haggling.`,
    },
    ...extra,
  ];
}

export const CATEGORY_BRAND_META = {
  mobile: {
    key: 'mobile',
    noun: 'phone',
    nounPlural: 'phones',
    label: 'Phone',
    labelPlural: 'Phones',
    howAccent: 'phone',
    howSubtitle: 'From brand selection to instant payment — six clear steps for your handset.',
    whyEyebrow: 'Selling your phone?',
    whyTitleBefore: 'Why phone sellers choose',
    whySubtitle:
      'Pick your brand above, get a clear quote, and finish with free pickup — built for mobiles, not a one-size marketplace pitch.',
    scoreRailHint: 'Phone buyback at a glance',
    faqTitle: 'Frequently asked questions about selling your phone',
    faqSubtitle: 'Straight answers on quotes, pickup, payment, condition checks, and documents.',
    testimonialHint: 'Real phone sellers across India',
    pillars: [
      {
        title: 'Best phone prices',
        desc: 'Market-linked quotes that often beat walk-in buyers and typical online platforms.',
      },
      {
        title: 'Paid in minutes',
        desc: 'Accept the offer after doorstep verification and get UPI, bank, or cash instantly.',
      },
      {
        title: 'Free phone pickup',
        desc: 'We collect your handset at home — no courier fees, no shop visit.',
      },
      {
        title: 'Private & wiped',
        desc: 'Certified data wipe so your chats, photos, and accounts stay protected.',
      },
    ],
  },
  laptop: {
    key: 'laptop',
    noun: 'laptop',
    nounPlural: 'laptops',
    label: 'Laptop',
    labelPlural: 'Laptops',
    howAccent: 'laptop',
    howSubtitle: 'From brand selection to instant payment — six clear steps for your laptop.',
    whyEyebrow: 'Selling your laptop?',
    whyTitleBefore: 'Why laptop sellers choose',
    whySubtitle:
      'Pick your brand above, get a clear quote, and finish with free pickup — built for notebooks and MacBooks.',
    scoreRailHint: 'Laptop buyback at a glance',
    faqTitle: 'Frequently asked questions about selling your laptop',
    faqSubtitle: 'Straight answers on quotes, pickup, payment, condition checks, and documents.',
    testimonialHint: 'Trusted by device sellers across India',
    pillars: [
      {
        title: 'Best laptop prices',
        desc: 'Market-linked quotes for MacBooks, Windows notebooks, and gaming laptops.',
      },
      {
        title: 'Paid in minutes',
        desc: 'Accept the offer after doorstep verification and get UPI, bank, or cash instantly.',
      },
      {
        title: 'Free laptop pickup',
        desc: 'We collect your laptop at home — no courier fees, no shop visit.',
      },
      {
        title: 'Private & wiped',
        desc: 'Secure handling and data wipe support so your files and accounts stay protected.',
      },
    ],
  },
  smartwatch: {
    key: 'smartwatch',
    noun: 'smartwatch',
    nounPlural: 'smartwatches',
    label: 'Smartwatch',
    labelPlural: 'Smartwatches',
    howAccent: 'smartwatch',
    howSubtitle: 'From brand selection to instant payment — six clear steps for your wearable.',
    whyEyebrow: 'Selling your smartwatch?',
    whyTitleBefore: 'Why smartwatch sellers choose',
    whySubtitle:
      'Pick your brand above, get a clear quote, and finish with free pickup — built for wearables.',
    scoreRailHint: 'Smartwatch buyback at a glance',
    faqTitle: 'Frequently asked questions about selling your smartwatch',
    faqSubtitle: 'Straight answers on quotes, pickup, payment, condition checks, and documents.',
    testimonialHint: 'Trusted by device sellers across India',
    pillars: [
      {
        title: 'Best watch prices',
        desc: 'Fair quotes for Apple Watch, Samsung Galaxy Watch, Noise, boAt, and more.',
      },
      {
        title: 'Paid in minutes',
        desc: 'Accept the offer after doorstep verification and get UPI, bank, or cash instantly.',
      },
      {
        title: 'Free pickup',
        desc: 'We collect your smartwatch at home — no courier fees, no shop visit.',
      },
      {
        title: 'Private & wiped',
        desc: 'Unpair guidance and secure handling so your health data stays protected.',
      },
    ],
  },
  earbuds: {
    key: 'earbuds',
    noun: 'earbuds',
    nounPlural: 'earbuds',
    label: 'Earbuds',
    labelPlural: 'Earbuds',
    howAccent: 'earbuds',
    howSubtitle: 'From brand selection to instant payment — six clear steps for your earbuds.',
    whyEyebrow: 'Selling your earbuds?',
    whyTitleBefore: 'Why earbuds sellers choose',
    whySubtitle:
      'Pick your brand above, get a clear quote, and finish with free pickup — built for TWS and wireless audio.',
    scoreRailHint: 'Earbuds buyback at a glance',
    faqTitle: 'Frequently asked questions about selling your earbuds',
    faqSubtitle: 'Straight answers on quotes, pickup, payment, condition checks, and documents.',
    testimonialHint: 'Trusted by device sellers across India',
    pillars: [
      {
        title: 'Best earbuds prices',
        desc: 'Market-linked quotes for AirPods, Galaxy Buds, OnePlus Buds, and more.',
      },
      {
        title: 'Paid in minutes',
        desc: 'Accept the offer after doorstep verification and get UPI, bank, or cash instantly.',
      },
      {
        title: 'Free pickup',
        desc: 'We collect your earbuds at home — no courier fees, no shop visit.',
      },
      {
        title: 'Simple & secure',
        desc: 'Transparent condition checks for buds, case, and battery — no hidden cuts.',
      },
    ],
  },
  tablet: {
    key: 'tablet',
    noun: 'tablet',
    nounPlural: 'tablets',
    label: 'Tablet',
    labelPlural: 'Tablets',
    howAccent: 'tablet',
    howSubtitle: 'From brand selection to instant payment — six clear steps for your tablet.',
    whyEyebrow: 'Selling your tablet?',
    whyTitleBefore: 'Why tablet sellers choose',
    whySubtitle:
      'Pick your brand above, get a clear quote, and finish with free pickup — built for iPads and Android tablets.',
    scoreRailHint: 'Tablet buyback at a glance',
    faqTitle: 'Frequently asked questions about selling your tablet',
    faqSubtitle: 'Straight answers on quotes, pickup, payment, condition checks, and documents.',
    testimonialHint: 'Trusted by device sellers across India',
    pillars: [
      {
        title: 'Best tablet prices',
        desc: 'Strong quotes for iPad, Samsung Galaxy Tab, and other popular tablets.',
      },
      {
        title: 'Paid in minutes',
        desc: 'Accept the offer after doorstep verification and get UPI, bank, or cash instantly.',
      },
      {
        title: 'Free tablet pickup',
        desc: 'We collect your tablet at home — no courier fees, no shop visit.',
      },
      {
        title: 'Private & wiped',
        desc: 'Certified data wipe support so apps, files, and accounts stay protected.',
      },
    ],
  },
  gaming: {
    key: 'gaming',
    noun: 'gaming console',
    nounPlural: 'gaming consoles',
    label: 'Gaming Console',
    labelPlural: 'Gaming Consoles',
    howAccent: 'console',
    howSubtitle: 'From brand selection to instant payment — six clear steps for your console.',
    whyEyebrow: 'Selling your console?',
    whyTitleBefore: 'Why console sellers choose',
    whySubtitle:
      'Pick your brand above, get a clear quote, and finish with free pickup — built for PlayStation, Xbox, and Switch.',
    scoreRailHint: 'Console buyback at a glance',
    faqTitle: 'Frequently asked questions about selling your gaming console',
    faqSubtitle: 'Straight answers on quotes, pickup, payment, condition checks, and documents.',
    testimonialHint: 'Trusted by device sellers across India',
    pillars: [
      {
        title: 'Best console prices',
        desc: 'Competitive quotes for PS5, Xbox Series, Nintendo Switch, and accessories.',
      },
      {
        title: 'Paid in minutes',
        desc: 'Accept the offer after doorstep verification and get UPI, bank, or cash instantly.',
      },
      {
        title: 'Free console pickup',
        desc: 'We collect your console at home — no courier fees, no shop visit.',
      },
      {
        title: 'Account-safe handover',
        desc: 'Clear guidance to sign out and wipe so your games and profiles stay protected.',
      },
    ],
  },
  mac: {
    key: 'mac',
    noun: 'iMac',
    nounPlural: 'iMacs',
    label: 'iMac',
    labelPlural: 'iMacs',
    howAccent: 'iMac',
    howSubtitle: 'From brand selection to instant payment — six clear steps for your iMac.',
    whyEyebrow: 'Selling your iMac?',
    whyTitleBefore: 'Why iMac sellers choose',
    whySubtitle:
      'Pick your configuration above, get a clear quote, and finish with free pickup — built for desktop Macs.',
    scoreRailHint: 'iMac buyback at a glance',
    faqTitle: 'Frequently asked questions about selling your iMac',
    faqSubtitle: 'Straight answers on quotes, pickup, payment, condition checks, and documents.',
    testimonialHint: 'Trusted by device sellers across India',
    pillars: [
      {
        title: 'Best iMac prices',
        desc: 'Market-linked quotes based on screen size, chip, memory, and condition.',
      },
      {
        title: 'Paid in minutes',
        desc: 'Accept the offer after doorstep verification and get UPI, bank, or cash instantly.',
      },
      {
        title: 'Free iMac pickup',
        desc: 'We collect your iMac at home — no courier fees, no shop visit.',
      },
      {
        title: 'Private & wiped',
        desc: 'Secure erase guidance so your files, photos, and Apple ID stay protected.',
      },
    ],
  },
};

export const CATEGORY_SEO_CONTENT = {
  mobile: {
    trustPoints: [
      'Quick and accurate phone price evaluation',
      'Free doorstep pickup across serviceable cities',
      'Instant and secure payments after verification',
      'Guaranteed data safety with verified wipe support',
      'All major brands and phone conditions accepted',
    ],
    sections: [
      {
        h2: 'Sell Old Phone And Get Instant Cash',
        p: 'Upgrading your smartphone or clearing out unused gadgets? With DeviceKart, you can sell old mobile phones in a quick, safe, and completely hassle-free way. Instead of letting your device collect dust, convert it into instant cash in just a few steps. DeviceKart is trusted across India for fair prices, doorstep convenience, and secure transactions when you sell old phone online.',
      },
      {
        h2: "Check Your Phone's Value In Seconds",
        p: "Getting started is easy. Choose your phone's brand and model above, answer a few questions about its condition, and receive an instant resale price. DeviceKart uses live market data to keep quotes accurate and competitive, so you get the best possible value when you sell old phone — without bargaining or hidden deductions.",
      },
      {
        h2: 'Sell Old Phone From Home With Free Doorstep Pickup',
        p: 'No store visits. No courier hassles. Once you confirm the price, book a free doorstep pickup at a time that suits you. A trained DeviceKart executive visits your location, verifies the device, and completes the pickup smoothly. The entire experience to sell old mobile phone is built to save your time and effort.',
      },
      {
        h2: 'Get Paid Instantly, Without Delays',
        p: 'Why wait for your money? With DeviceKart, you receive payment as soon as your phone is verified at pickup. Choose secure options such as UPI, bank transfer, or cash. The process is fast, reliable, and transparent — so you stay in control from quote to payout.',
      },
      {
        h2: 'Phones Accepted In All Conditions',
        p: 'DeviceKart makes it easy to sell old phone in any condition. Whether your device is nearly new, lightly used, scratched, has a broken screen, battery issues, or is not working at all, you can still sell it. We accept phones from all major brands and work to get you the maximum resale value for the real state of your handset.',
      },
      {
        h2: 'Your Privacy Comes First',
        p: 'Your data security is our responsibility. DeviceKart follows strict privacy standards and supports certified data wiping so personal information is permanently removed from your device. You can sell old mobile phone confidently, knowing your chats, photos, and accounts stay protected.',
      },
      {
        h2: 'Sell Smart. Sell Sustainably.',
        p: "Selling your old phone on DeviceKart isn't only convenient — it's better for the planet. By choosing reuse and responsible recycling of electronics, you help reduce e-waste and support a greener upgrade cycle every time you sell used phone online.",
      },
    ],
    closing:
      "Whether you're upgrading to a new phone or simply decluttering your space, DeviceKart offers a smarter way to sell old phone online — fair quotes, free pickup, instant payment, and data you can trust.",
  },
  laptop: {
    trustPoints: [
      'Quick and accurate laptop price evaluation',
      'Free doorstep pickup across serviceable cities',
      'Instant and secure payments after verification',
      'Guaranteed data safety with verified wipe support',
      'MacBooks, Windows laptops, and major brands accepted',
    ],
    sections: [
      {
        h2: 'Sell Old Laptop And Get Instant Cash',
        p: 'Upgrading your notebook or clearing unused machines? With DeviceKart, you can sell old laptops in a quick, safe, and hassle-free way. Convert idle MacBooks or Windows laptops into instant cash in a few steps. DeviceKart is trusted across India for fair prices, doorstep convenience, and secure transactions when you sell old laptop online.',
      },
      {
        h2: "Check Your Laptop's Value In Seconds",
        p: "Choose your laptop brand and model above, answer a few questions about its condition, storage, and performance, and receive an instant resale price. DeviceKart uses live market data so you get a competitive value when you sell old laptop — without bargaining or hidden deductions.",
      },
      {
        h2: 'Sell Old Laptop From Home With Free Doorstep Pickup',
        p: 'No store visits. No courier hassles. Confirm the price, book a free doorstep pickup, and a trained DeviceKart executive will verify your laptop at your location. Selling an old laptop online is designed to save your time and effort.',
      },
      {
        h2: 'Get Paid Instantly, Without Delays',
        p: 'Receive payment as soon as your laptop is verified at pickup via UPI, bank transfer, or cash. Fast, reliable, and transparent — you’re in control from quote to payout.',
      },
      {
        h2: 'Laptops Accepted In All Conditions',
        p: 'Sell old laptop devices that are nearly new, lightly used, scratched, have battery wear, keyboard issues, or even limited functionality. We accept major brands and price for the real condition of your machine.',
      },
      {
        h2: 'Your Privacy Comes First',
        p: 'Factory reset before pickup is recommended. DeviceKart supports secure handling and data wipe so documents, passwords, and accounts stay protected when you sell used laptop online.',
      },
      {
        h2: 'Sell Smart. Sell Sustainably.',
        p: 'Selling your old laptop on DeviceKart keeps devices in reuse cycles and helps reduce e-waste — a smarter, greener upgrade path.',
      },
    ],
    closing:
      "Whether you're upgrading to a new notebook or decluttering your desk, DeviceKart is a smarter way to sell old laptop online — fair quotes, free pickup, instant payment, and data you can trust.",
  },
  smartwatch: {
    trustPoints: [
      'Quick and accurate smartwatch price evaluation',
      'Free doorstep pickup across serviceable cities',
      'Instant and secure payments after verification',
      'Account unpair guidance for safer handover',
      'Apple Watch, Samsung, and popular brands accepted',
    ],
    sections: [
      {
        h2: 'Sell Old Smartwatch And Get Instant Cash',
        p: 'Upgrading your wearable or clearing a drawer of unused watches? DeviceKart lets you sell old smartwatches quickly and safely. Turn your Apple Watch, Galaxy Watch, or other wearables into instant cash with fair pricing and free pickup across India.',
      },
      {
        h2: "Check Your Smartwatch's Value In Seconds",
        p: 'Choose your smartwatch brand and model, answer a few condition questions, and get an instant resale price. Live market data keeps quotes competitive when you sell old smartwatch online — no bargaining or hidden cuts.',
      },
      {
        h2: 'Sell Old Smartwatch From Home With Free Doorstep Pickup',
        p: 'Book a free doorstep pickup after you confirm the quote. A DeviceKart executive verifies your watch at your location so you can sell used smartwatch without visiting a store.',
      },
      {
        h2: 'Get Paid Instantly, Without Delays',
        p: 'Get paid after verification via UPI, bank transfer, or cash. Transparent and fast from quote to payout.',
      },
      {
        h2: 'Smartwatches Accepted In All Conditions',
        p: 'Scratches, battery wear, missing straps, or limited functionality — you can still sell. Select the right condition options for a fair residual value.',
      },
      {
        h2: 'Your Privacy Comes First',
        p: 'Unpair your watch and remove accounts before pickup. DeviceKart follows secure handling so health data and personal info stay protected.',
      },
      {
        h2: 'Sell Smart. Sell Sustainably.',
        p: 'Reusing wearables reduces e-waste. Selling on DeviceKart is convenient and better for the planet.',
      },
    ],
    closing:
      'Whether you’re upgrading to a new wearable or decluttering, DeviceKart is a smarter way to sell old smartwatch online — fair quotes, free pickup, and instant payment.',
  },
  earbuds: {
    trustPoints: [
      'Quick and accurate earbuds price evaluation',
      'Free doorstep pickup across serviceable cities',
      'Instant and secure payments after verification',
      'Transparent checks for buds, case, and battery',
      'AirPods, Galaxy Buds, and popular TWS accepted',
    ],
    sections: [
      {
        h2: 'Sell Old Earbuds And Get Instant Cash',
        p: 'Upgrading your audio or clearing unused TWS buds? DeviceKart helps you sell old earbuds in a quick, safe, hassle-free flow. Convert AirPods, Galaxy Buds, and other wireless earbuds into instant cash with fair prices and free pickup.',
      },
      {
        h2: "Check Your Earbuds' Value In Seconds",
        p: 'Pick your brand and model, answer condition questions about buds, case, and battery life, and get an instant resale price when you sell old earbuds online.',
      },
      {
        h2: 'Sell Old Earbuds From Home With Free Doorstep Pickup',
        p: 'Confirm the quote and book free doorstep pickup. A DeviceKart executive verifies your earbuds at home — no store visit required.',
      },
      {
        h2: 'Get Paid Instantly, Without Delays',
        p: 'Payment follows verification via UPI, bank transfer, or cash. Fast and transparent end to end.',
      },
      {
        h2: 'Earbuds Accepted In All Conditions',
        p: 'Missing one bud, case wear, battery drain, or fully working sets — select the right condition so your quote matches reality.',
      },
      {
        h2: 'Your Privacy Comes First',
        p: 'Forget the device from your phone before pickup. DeviceKart handles collection securely with no hidden fees.',
      },
      {
        h2: 'Sell Smart. Sell Sustainably.',
        p: 'Reusing wireless audio gear reduces e-waste. Selling earbuds on DeviceKart is an easy, greener choice.',
      },
    ],
    closing:
      'Whether you’re upgrading audio or decluttering, DeviceKart is a smarter way to sell old earbuds online — fair quotes, free pickup, and instant payment.',
  },
  tablet: {
    trustPoints: [
      'Quick and accurate tablet price evaluation',
      'Free doorstep pickup across serviceable cities',
      'Instant and secure payments after verification',
      'Guaranteed data safety with verified wipe support',
      'iPad, Samsung Galaxy Tab, and major brands accepted',
    ],
    sections: [
      {
        h2: 'Sell Old Tablet And Get Instant Cash',
        p: 'Upgrading your iPad or clearing unused tablets? DeviceKart lets you sell old tablets quickly and safely. Convert idle iPads and Android tablets into instant cash with fair prices, free pickup, and secure payment across India.',
      },
      {
        h2: "Check Your Tablet's Value In Seconds",
        p: 'Choose your tablet brand and model, answer a few condition questions, and receive an instant resale price. Market-linked quotes help you get strong value when you sell old tablet online.',
      },
      {
        h2: 'Sell Old Tablet From Home With Free Doorstep Pickup',
        p: 'Book free doorstep pickup after confirming your quote. A trained executive verifies your tablet at your location — no courier hassles.',
      },
      {
        h2: 'Get Paid Instantly, Without Delays',
        p: 'Get paid after verification via UPI, bank transfer, or cash. Transparent from quote to payout.',
      },
      {
        h2: 'Tablets Accepted In All Conditions',
        p: 'Nearly new, scratched, cracked glass, battery wear, or limited function — you can still sell. Honest condition answers mean accurate pricing.',
      },
      {
        h2: 'Your Privacy Comes First',
        p: 'Sign out of accounts and erase the tablet before pickup. DeviceKart supports secure wipe so your apps and files stay protected.',
      },
      {
        h2: 'Sell Smart. Sell Sustainably.',
        p: 'Reusing tablets reduces e-waste. Selling on DeviceKart is convenient and environmentally responsible.',
      },
    ],
    closing:
      'Whether you’re upgrading to a new iPad or decluttering, DeviceKart is a smarter way to sell old tablet online — fair quotes, free pickup, and instant payment.',
  },
  gaming: {
    trustPoints: [
      'Quick and accurate console price evaluation',
      'Free doorstep pickup across serviceable cities',
      'Instant and secure payments after verification',
      'Account sign-out guidance for safer handover',
      'PlayStation, Xbox, Nintendo Switch and more accepted',
    ],
    sections: [
      {
        h2: 'Sell Old Gaming Console And Get Instant Cash',
        p: 'Upgrading your setup or clearing unused consoles? DeviceKart helps you sell old gaming consoles quickly and safely. Turn PlayStation, Xbox, Nintendo Switch, and more into instant cash with fair quotes and free doorstep pickup.',
      },
      {
        h2: "Check Your Console's Value In Seconds",
        p: 'Select your console brand and model, answer condition questions, and get an instant resale price. Competitive market data powers quotes when you sell old gaming console online.',
      },
      {
        h2: 'Sell Old Console From Home With Free Doorstep Pickup',
        p: 'Confirm the price and book free pickup. A DeviceKart executive verifies your console at home so you avoid store visits and courier hassles.',
      },
      {
        h2: 'Get Paid Instantly, Without Delays',
        p: 'Payment after verification via UPI, bank transfer, or cash — fast and transparent.',
      },
      {
        h2: 'Consoles Accepted In All Conditions',
        p: 'Working, scratched, disc-drive issues, or incomplete accessories — select the right options for a fair residual value.',
      },
      {
        h2: 'Your Privacy Comes First',
        p: 'Sign out of PSN, Xbox, or Nintendo accounts before pickup. DeviceKart supports secure handover of your console and controllers.',
      },
      {
        h2: 'Sell Smart. Sell Sustainably.',
        p: 'Keeping consoles in reuse cycles reduces e-waste. Selling on DeviceKart is an easy, greener upgrade path.',
      },
    ],
    closing:
      'Whether you’re upgrading your gaming setup or decluttering, DeviceKart is a smarter way to sell old gaming console online — fair quotes, free pickup, and instant payment.',
  },
  mac: {
    trustPoints: [
      'Quick and accurate iMac price evaluation',
      'Free doorstep pickup across serviceable cities',
      'Instant and secure payments after verification',
      'Guaranteed data safety with secure erase support',
      'Multiple iMac sizes, chips, and conditions accepted',
    ],
    sections: [
      {
        h2: 'Sell Old iMac And Get Instant Cash',
        p: 'Upgrading your desktop Mac or clearing workspace clutter? DeviceKart lets you sell old iMacs in a quick, safe, hassle-free way. Convert your iMac into instant cash with fair pricing, free pickup, and secure payment across India.',
      },
      {
        h2: "Check Your iMac's Value In Seconds",
        p: 'Choose your iMac configuration, answer condition questions, and receive an instant resale price. Live market data keeps quotes competitive when you sell old iMac online.',
      },
      {
        h2: 'Sell Old iMac From Home With Free Doorstep Pickup',
        p: 'Confirm the quote and book free doorstep pickup. A trained DeviceKart executive verifies your iMac at your location — no courier or store visit required.',
      },
      {
        h2: 'Get Paid Instantly, Without Delays',
        p: 'Get paid after verification via UPI, bank transfer, or cash. Transparent from quote to payout.',
      },
      {
        h2: 'iMacs Accepted In All Conditions',
        p: 'Nearly new, screen wear, performance issues, or older generations — honest condition answers unlock a fair residual value.',
      },
      {
        h2: 'Your Privacy Comes First',
        p: 'Sign out of Apple ID and erase the Mac before pickup. DeviceKart supports secure wipe so your files and accounts stay protected.',
      },
      {
        h2: 'Sell Smart. Sell Sustainably.',
        p: 'Reusing desktop Macs reduces e-waste. Selling your iMac on DeviceKart is convenient and environmentally responsible.',
      },
    ],
    closing:
      'Whether you’re upgrading to a newer Mac or decluttering your desk, DeviceKart is a smarter way to sell old iMac online — fair quotes, free pickup, and instant payment.',
  },
};

export const CATEGORY_BRAND_FAQS = {
  mobile: [
    ...faqSet('phone', 'phones', [
      {
        q: 'Can I sell an old phone that was bought internationally (not Indian variant)?',
        a: 'Usually yes, but it depends on the model. Some international variants may have limited support for valuation or spare-part compatibility. If your exact variant isn’t listed, choose the closest model or contact DeviceKart support for guidance.',
      },
      {
        q: 'Can I sell a phone that’s still under EMI or loan?',
        a: 'Selling a phone that is still under EMI is not recommended unless it is fully paid off. DeviceKart may not verify EMI status at pickup, but selling a financed device can create legal risk for you. Clear the loan first whenever possible.',
      },
      {
        q: 'What if my phone is not turning on?',
        a: 'Even if your phone is off or not working, you can still sell it. Select the right condition options so the quote matches a non-working device — you still get a fair residual value.',
      },
    ]),
  ],
  laptop: faqSet('laptop', 'laptops', [
    {
      q: 'Can I sell a laptop that does not power on?',
      a: 'Yes. Mention power and other issues in the quiz. You may get a lower price, but DeviceKart still offers a fair residual value for non-working laptops.',
    },
    {
      q: 'Do I need the charger to sell my laptop?',
      a: 'Having the original charger helps the quote, but you can often still sell without it. Select the right accessory options in the condition quiz.',
    },
  ]),
  smartwatch: faqSet('smartwatch', 'smartwatches', [
    {
      q: 'Do I need the original strap and charger?',
      a: 'Original strap and charger can improve the offer, but you can still sell without them. Select the correct accessory options in the quiz.',
    },
  ]),
  earbuds: faqSet('earbuds', 'earbuds', [
    {
      q: 'Can I sell earbuds if one bud or the case is missing?',
      a: 'Often yes, at a reduced price. Select the exact condition and accessory options so the quote matches what you are handing over.',
    },
  ]),
  tablet: faqSet('tablet', 'tablets', [
    {
      q: 'Can I sell an iPad with a cracked screen?',
      a: 'Yes. Choose the correct screen condition in the quiz so the quote reflects damage. DeviceKart still offers a fair residual value.',
    },
  ]),
  gaming: faqSet('gaming console', 'gaming consoles', [
    {
      q: 'Can I sell a console with controllers or games?',
      a: 'Yes. Mention included accessories in the condition steps — extra controllers and games can improve your offer when available.',
    },
  ]),
  mac: faqSet('iMac', 'iMacs', [
    {
      q: 'Do I need the original stand, keyboard, or mouse?',
      a: 'Accessories can improve the quote when included. Select the right options in the quiz; you can still sell the iMac without every original peripheral.',
    },
  ]),
};

export function getCategoryBrandMeta(category = 'mobile') {
  return CATEGORY_BRAND_META[category] || CATEGORY_BRAND_META.mobile;
}

export function getCategorySeoContent(category = 'mobile') {
  return CATEGORY_SEO_CONTENT[category] || CATEGORY_SEO_CONTENT.mobile;
}

export function getCategoryBrandFaqs(category = 'mobile') {
  return CATEGORY_BRAND_FAQS[category] || CATEGORY_BRAND_FAQS.mobile;
}
