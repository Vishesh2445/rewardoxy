export type OfferwallType = "surveys" | "games" | "apps" | "mixed";

export type Offerwall = {
  slug: string;
  name: string;
  type: OfferwallType;
  logo: string;
  tagline: string;
  description: string[];
  payoutRange: string;
  tips: string[];
  pros: string[];
  cons: string[];
  faqs: { q: string; a: string }[];
  relatedVertical: "/surveys" | "/play-and-earn" | "/app-trials" | "/offers";
  relatedSlugs: string[];
};

export const OFFERWALLS: Offerwall[] = [
  {
    slug: "cpx-research",
    name: "CPX Research",
    type: "surveys",
    logo: "/cpx.png",
    tagline: "One of the largest survey routers with global inventory.",
    description: [
      "CPX Research is a leading market research platform that connects advertisers with survey respondents worldwide. On Rewardoxy, CPX powers both individual survey listings and a full survey wall where you can browse available studies matched to your profile.",
      "CPX Research works with hundreds of research companies, which means a steady stream of surveys across demographics, industries, and countries. Surveys typically range from 5 to 25 minutes and cover topics like consumer products, media habits, technology, and healthcare.",
      "When you complete a CPX survey on Rewardoxy, coins are credited automatically via server-to-server postback once the research company confirms your completion.",
    ],
    payoutRange: "$0.20 – $3.00 per survey (20–300 coins)",
    tips: [
      "Complete your demographic profile fully — CPX matches surveys based on age, location, and interests.",
      "Check the survey wall multiple times per day; new inventory appears throughout the day.",
      "Answer screening questions consistently to avoid quality flags.",
      "Longer surveys (15+ minutes) typically pay more per minute than short ones.",
      "If disqualified from one survey, immediately try another — disqualification is normal.",
      "Disable ad blockers when taking CPX surveys to prevent tracking issues.",
    ],
    pros: [
      "Massive global survey inventory across all demographics",
      "Fast crediting — most surveys pay within minutes",
      "Both individual surveys and full survey wall available",
    ],
    cons: [
      "Screen-out rates can be high for niche demographics",
      "Payout per survey is lower than high-value game offers",
      "Survey availability varies significantly by country",
    ],
    faqs: [
      {
        q: "Why didn't my CPX Research survey credit?",
        a: "Most CPX surveys credit within 5 minutes. If it has been over 24 hours, ensure you completed the entire survey without closing the tab early. Contact support with the survey ID if the issue persists.",
      },
      {
        q: "Is CPX Research available in my country?",
        a: "CPX Research operates in 100+ countries. Tier-1 markets (US, UK, CA, AU, DE) see the highest volume and payouts.",
      },
      {
        q: "How do I access CPX Research on Rewardoxy?",
        a: "Sign up for Rewardoxy, go to the Earn page, and click the CPX Research card to open the survey wall or browse individual CPX surveys in the surveys section.",
      },
    ],
    relatedVertical: "/surveys",
    relatedSlugs: ["theoremreach", "revtoo-surveys", "notik"],
  },
  {
    slug: "theoremreach",
    name: "TheoremReach",
    type: "surveys",
    logo: "/theoremreach.svg",
    tagline: "AI-powered survey matching for higher completion rates.",
    description: [
      "TheoremReach uses intelligent matching technology to connect users with surveys they're most likely to qualify for. On Rewardoxy, TheoremReach runs as an embedded survey wall accessible from the Earn page.",
      "The platform focuses on reducing screen-outs by pre-qualifying users before they start a survey. This means less wasted time and more completed surveys per session compared to traditional routers.",
      "TheoremReach partners with major brands and research firms, offering surveys on consumer behavior, product feedback, and market trends.",
    ],
    payoutRange: "$0.30 – $2.50 per survey (30–250 coins)",
    tips: [
      "Let TheoremReach's matching algorithm work — start with their top recommendations.",
      "Use a stable internet connection; disconnections can void survey progress.",
      "Be honest and consistent in your responses to maintain a high quality score.",
      "Try TheoremReach during peak hours (9 AM–5 PM local time) for more inventory.",
      "If the wall shows no surveys, check back in a few hours or try CPX Research.",
    ],
    pros: [
      "Smart matching reduces time wasted on screen-outs",
      "Clean, mobile-friendly survey interface",
      "Reliable postback crediting on Rewardoxy",
    ],
    cons: [
      "Smaller inventory than CPX in some regions",
      "Fewer high-paying long-form surveys",
      "Requires iframe access — ad blockers may interfere",
    ],
    faqs: [
      {
        q: "Why is my TheoremReach wall empty?",
        a: "Survey inventory fluctuates based on demand and your profile. Check back later or try CPX Research and Revtoo Surveys for additional inventory.",
      },
      {
        q: "Does TheoremReach work on mobile?",
        a: "Yes. TheoremReach's survey wall works on both mobile and desktop browsers through Rewardoxy.",
      },
    ],
    relatedVertical: "/surveys",
    relatedSlugs: ["cpx-research", "revtoo-surveys", "revtoo"],
  },
  {
    slug: "revtoo-surveys",
    name: "Revtoo Surveys",
    type: "surveys",
    logo: "/revtoo.svg",
    tagline: "Dedicated survey wall with consumer research focus.",
    description: [
      "Revtoo Surveys is the survey-specific wall from Revtoo, separate from their general offers wall. It focuses on market research studies about consumer products, media consumption, and brand preferences.",
      "On Rewardoxy, Revtoo Surveys appears as its own card on the Earn page. This gives you a third survey source alongside CPX Research and TheoremReach, increasing your chances of finding available surveys at any time.",
      "Revtoo's survey inventory tends to favor English-speaking markets but is expanding globally.",
    ],
    payoutRange: "$0.25 – $2.00 per survey (25–200 coins)",
    tips: [
      "Use Revtoo Surveys as a backup when CPX or TheoremReach have low inventory.",
      "Complete surveys in one sitting — don't switch tabs mid-survey.",
      "Focus on surveys above 50 coins for better time-to-pay ratio.",
      "Keep your Rewardoxy account email verified for faster crediting.",
    ],
    pros: [
      "Dedicated survey inventory separate from Revtoo game offers",
      "Good supplement to CPX and TheoremReach",
      "Straightforward survey completion flow",
    ],
    cons: [
      "Smaller catalog than CPX Research",
      "Best availability in US, UK, and Canada",
      "Some surveys have strict attention checks",
    ],
    faqs: [
      {
        q: "What's the difference between Revtoo and Revtoo Surveys?",
        a: "Revtoo Surveys is a dedicated survey wall. The main Revtoo wall focuses on app installs, game offers, and mixed tasks. Both credit to your Rewardoxy balance.",
      },
      {
        q: "How long do Revtoo survey credits take?",
        a: "Most credits appear within 5–15 minutes. Some surveys may take up to 24 hours for manual verification.",
      },
    ],
    relatedVertical: "/surveys",
    relatedSlugs: ["cpx-research", "theoremreach", "revtoo"],
  },
  {
    slug: "notik",
    name: "Notik",
    type: "mixed",
    logo: "/notik.webp",
    tagline: "High-paying app, game, and survey offers.",
    description: [
      "Notik is a premium offerwall known for competitive payouts on mobile game offers, app installs, and surveys. On Rewardoxy, Notik provides both a curated offers feed and a full offerwall that opens in a new tab.",
      "Notik's strength is high-value Cost-Per-Engagement (CPE) game offers where you earn coins for reaching specific milestones in mobile games — often paying $1 to $120 depending on the game and level required.",
      "Because Notik doesn't support iframe embedding, offers open in a new browser tab. Make sure to start offers through Rewardoxy so your user ID is tracked correctly.",
    ],
    payoutRange: "$0.50 – $120 per offer (50–12,000 coins)",
    tips: [
      "Always start Notik offers from Rewardoxy — never search for the app directly in the store.",
      "Read milestone requirements carefully before starting a game offer.",
      "New users get the best game offer rates — prioritize high-paying CPE offers first.",
      "Allow tracking permissions when prompted on mobile for proper attribution.",
      "Check the Notik wall daily — new high-paying offers appear frequently.",
      "Complete offers on the same device you started them on.",
    ],
    pros: [
      "Some of the highest-paying game offers available",
      "Large variety of app installs, games, and surveys",
      "Offers API shows payouts before you start",
    ],
    cons: [
      "Opens in new tab (no iframe) — easy to lose track of offers",
      "Game milestones can take hours or days to complete",
      "Some offers are iOS or Android only",
    ],
    faqs: [
      {
        q: "Why didn't my Notik offer credit?",
        a: "Ensure you installed the app through the Notik link from Rewardoxy, completed all required milestones, and didn't use a VPN. Game offers can take up to 24–48 hours to credit.",
      },
      {
        q: "Why does Notik open in a new tab?",
        a: "Notik doesn't support iframe embedding. This is normal — just make sure you access offers through Rewardoxy's Earn page.",
      },
    ],
    relatedVertical: "/play-and-earn",
    relatedSlugs: ["gemiad", "taskwall", "klink"],
  },
  {
    slug: "gemiad",
    name: "GemiAd",
    type: "mixed",
    logo: "/gemiad-logo.png",
    tagline: "Reliable offerwall for apps, games, and sign-ups.",
    description: [
      "GemiAd is a well-established offerwall providing app install offers, game milestones, survey redirects, and sign-up tasks. On Rewardoxy, GemiAd offers appear in the aggregated offers feed and via an embedded offerwall on the Earn page.",
      "GemiAd is particularly strong for Android app install offers (CPI) and simple sign-up tasks that credit quickly. It's a good starting point for new users who want fast, low-effort earnings.",
      "The GemiAd wall supports iframe embedding, making it easy to browse and complete offers without leaving Rewardoxy.",
    ],
    payoutRange: "$0.30 – $80 per offer (30–8,000 coins)",
    tips: [
      "Filter for quick CPI offers when you want fast coins.",
      "Disable ad blockers before opening the GemiAd wall.",
      "Complete sign-up offers with a real email you can access for verification.",
      "Check GemiAd's featured offers section for limited-time high payouts.",
      "Don't uninstall apps immediately — some offers have retention requirements.",
    ],
    pros: [
      "Fast-crediting app install offers",
      "Embedded iframe wall for seamless browsing",
      "Good mix of easy and high-value offers",
    ],
    cons: [
      "Lower average payouts than Notik for game offers",
      "Some offers have geographic restrictions",
      "Duplicate offers may appear across multiple walls",
    ],
    faqs: [
      {
        q: "How fast do GemiAd offers credit?",
        a: "Simple app installs often credit within 5–15 minutes. Game milestone offers may take 24–48 hours after reaching the required level.",
      },
      {
        q: "Can I complete the same GemiAd offer twice?",
        a: "No. Each offer can only be completed once per user. If you've done an offer on another platform, it may not credit on Rewardoxy.",
      },
    ],
    relatedVertical: "/app-trials",
    relatedSlugs: ["notik", "taskwall", "revtoo"],
  },
  {
    slug: "revtoo",
    name: "Revtoo",
    type: "mixed",
    logo: "/revtoo.svg",
    tagline: "Versatile offerwall for games, apps, and tasks.",
    description: [
      "Revtoo is a multi-category offerwall offering mobile game offers, app trials, sign-ups, and miscellaneous tasks. On Rewardoxy, the main Revtoo wall (separate from Revtoo Surveys) focuses on higher-paying engagement offers.",
      "Revtoo's game offers often feature popular titles with multi-level milestone payouts. App install offers tend to credit quickly, making Revtoo a solid daily earner.",
      "The Revtoo wall is accessible via iframe on Rewardoxy's Earn page and also contributes offers to the aggregated offers feed.",
    ],
    payoutRange: "$0.40 – $100 per offer (40–10,000 coins)",
    tips: [
      "Browse both Revtoo and Revtoo Surveys for maximum earning opportunities.",
      "Prioritize offers marked as 'hot' or 'featured' for bonus payouts.",
      "Keep games installed until the offer credits to avoid reversals.",
      "Use the same Google/Apple account throughout a game offer.",
      "Check requirements for 'new users only' offers before starting.",
    ],
    pros: [
      "Good balance of quick and high-value offers",
      "Reliable crediting through Rewardoxy postback",
      "Both iframe wall and API-fed offers available",
    ],
    cons: [
      "Inventory overlaps with other walls like Notik and GemiAd",
      "Some game offers require significant time investment",
      "Limited availability in certain regions",
    ],
    faqs: [
      {
        q: "Revtoo vs Revtoo Surveys — which should I use?",
        a: "Use Revtoo for game offers, app installs, and tasks. Use Revtoo Surveys specifically for paid surveys. Both credit to the same Rewardoxy balance.",
      },
      {
        q: "Why was my Revtoo game offer reversed?",
        a: "Offers can be reversed if you uninstall the app before the hold period ends, use a VPN, or fail to reach the required milestone.",
      },
    ],
    relatedVertical: "/play-and-earn",
    relatedSlugs: ["revtoo-surveys", "notik", "gemiad"],
  },
  {
    slug: "taskwall",
    name: "Taskwall",
    type: "mixed",
    logo: "/taskwall.svg",
    tagline: "Diverse task marketplace with game and app offers.",
    description: [
      "Taskwall aggregates offers from multiple advertisers, including game publishers and app developers. On Rewardoxy, Taskwall provides both API-fed offers in the main feed and a dedicated iframe offerwall.",
      "Taskwall is known for featuring Lootably-sourced game offers prominently, which often include high-paying mobile game milestones. It's a strong option for users who enjoy playing games for rewards.",
      "The platform supports CPI, CPE, CPA, and CPL offer types, giving you flexibility in how you earn.",
    ],
    payoutRange: "$0.25 – $100 per offer (25–10,000 coins)",
    tips: [
      "Look for Lootably game offers pinned at the top of Taskwall inventory.",
      "Start game offers you can realistically complete within the deadline.",
      "Enable app tracking on iOS (Settings → Privacy → Tracking).",
      "Complete all tutorial levels before uninstalling any game.",
      "Check Taskwall daily for rotating featured offers.",
    ],
    pros: [
      "Strong game offer selection including Lootably inventory",
      "Multiple offer types (install, engagement, sign-up)",
      "Embedded wall and API integration on Rewardoxy",
    ],
    cons: [
      "Offer quality varies — read requirements carefully",
      "Some offers have short expiration windows",
      "Crediting can take up to 48 hours for game milestones",
    ],
    faqs: [
      {
        q: "What are Lootably offers on Taskwall?",
        a: "Lootably is an offer source integrated through Taskwall. These are typically high-paying mobile game offers with level-based milestones.",
      },
      {
        q: "Why does Taskwall show different offers than Notik?",
        a: "Each offerwall has different advertiser partnerships. Checking multiple walls on Rewardoxy maximizes your earning opportunities.",
      },
    ],
    relatedVertical: "/play-and-earn",
    relatedSlugs: ["notik", "klink", "gemiad"],
  },
  {
    slug: "klink",
    name: "Klink",
    type: "mixed",
    logo: "/klink-icon.png",
    tagline: "Finance and lifestyle offers with competitive rates.",
    description: [
      "Klink (Klink Finance) is an offerwall that specializes in finance apps, lifestyle services, and mobile game offers. On Rewardoxy, Klink provides API-fed offers and an embedded offerwall on the Earn page.",
      "Klink tends to feature offers from fintech apps, subscription services, and casual mobile games. Payouts are competitive, especially for finance-related sign-ups and app trials.",
      "Klink's offerwall is a good complement to Notik and Taskwall, often surfacing different advertisers and exclusive deals.",
    ],
    payoutRange: "$0.50 – $90 per offer (50–9,000 coins)",
    tips: [
      "Finance app offers on Klink often pay $2–$15 for sign-ups — read terms carefully.",
      "Use a real phone number for verification when required.",
      "Check Klink for offers not available on other Rewardoxy walls.",
      "Complete free trial offers before cancellation deadlines if required.",
      "Game offers on Klink may have shorter milestone requirements than competitors.",
    ],
    pros: [
      "Unique finance and fintech offer inventory",
      "Competitive payouts on sign-up offers",
      "Embedded iframe wall on Rewardoxy",
    ],
    cons: [
      "Smaller overall catalog than Notik or GemiAd",
      "Finance offers may require identity verification",
      "Some offers are region-locked to specific countries",
    ],
    faqs: [
      {
        q: "Are Klink finance offers safe?",
        a: "Klink features legitimate advertiser offers. Always read terms before signing up for financial products. Rewardoxy only credits when the advertiser confirms completion.",
      },
      {
        q: "How do I open the Klink wall on Rewardoxy?",
        a: "Go to the Earn page and click the Klink card. The offerwall opens in an embedded iframe within Rewardoxy.",
      },
    ],
    relatedVertical: "/app-trials",
    relatedSlugs: ["notik", "taskwall", "revtoo"],
  },
  {
    slug: "mylead",
    name: "MyLead",
    type: "mixed",
    logo: "/mylead_logo.svg",
    tagline: "European-rooted offerwall with global reach.",
    description: [
      "MyLead is a well-known offerwall platform popular in Europe and expanding globally. On Rewardoxy, MyLead runs as an embedded iframe wall accessible from the Earn page.",
      "MyLead offers include app installs, game engagement tasks, lead generation forms, and product trials. The platform is known for reliable tracking and consistent payouts.",
      "MyLead is particularly strong in European markets but serves users worldwide with localized offer inventory.",
    ],
    payoutRange: "$0.20 – $60 per offer (20–6,000 coins)",
    tips: [
      "MyLead excels in EU markets — check it if you're in Europe.",
      "Lead generation offers pay well but require valid information.",
      "Use the embedded wall to browse all categories systematically.",
      "Complete offers in your browser's normal mode (not incognito).",
      "Check MyLead for cashback and shopping offers in addition to apps.",
    ],
    pros: [
      "Strong European offer inventory",
      "Reliable tracking and crediting",
      "Variety beyond just games and apps",
    ],
    cons: [
      "Lower volume in some non-EU countries",
      "Lead gen offers require real personal details",
      "Some offers have language restrictions",
    ],
    faqs: [
      {
        q: "Is MyLead good for US users?",
        a: "Yes, though inventory is often richer in European markets. US users will still find app installs, game offers, and surveys on MyLead.",
      },
      {
        q: "Why didn't my MyLead offer track?",
        a: "Ensure you clicked through from Rewardoxy's Earn page, disabled ad blockers, and didn't switch devices mid-offer.",
      },
    ],
    relatedVertical: "/app-trials",
    relatedSlugs: ["vortex", "gemiad", "notik"],
  },
  {
    slug: "vortex",
    name: "Vortex",
    type: "mixed",
    logo: "/mobivortex-icon.png",
    tagline: "Mobile-focused offerwall via VortexWall.",
    description: [
      "Vortex (VortexWall) is a mobile-centric offerwall featuring app installs, game offers, and engagement tasks optimized for smartphone users. On Rewardoxy, Vortex appears as an embedded iframe wall on the Earn page.",
      "Vortex specializes in CPI and CPE offers for Android and iOS apps. If you primarily earn on your phone, Vortex is one of the best walls to check daily.",
      "The platform uses server-to-server postback to credit coins to your Rewardoxy balance automatically upon offer completion.",
    ],
    payoutRange: "$0.30 – $70 per offer (30–7,000 coins)",
    tips: [
      "Vortex is optimized for mobile — browse offers on your phone for the best experience.",
      "Install apps directly when prompted; don't switch to the store manually.",
      "Keep apps installed for at least 24 hours after completing requirements.",
      "Check Vortex for exclusive mobile game offers not on other walls.",
      "Disable battery optimization for offer apps to ensure tracking works.",
    ],
    pros: [
      "Mobile-optimized interface and offer selection",
      "Good Android and iOS game offer variety",
      "Embedded iframe on Rewardoxy",
    ],
    cons: [
      "Desktop experience is less polished",
      "Smaller catalog than Notik or Taskwall",
      "Some offers are device-specific (iOS only or Android only)",
    ],
    faqs: [
      {
        q: "What is VortexWall?",
        a: "VortexWall is the offerwall platform branded as 'Vortex' on Rewardoxy. It provides mobile app and game offers with automatic coin crediting.",
      },
      {
        q: "Can I use Vortex on desktop?",
        a: "Yes, but many offers are mobile-only app installs. For the best results, access Vortex from your smartphone.",
      },
    ],
    relatedVertical: "/play-and-earn",
    relatedSlugs: ["mylead", "timewall", "notik"],
  },
  {
    slug: "timewall",
    name: "TimeWall",
    type: "mixed",
    logo: "/taskwall.svg",
    tagline: "Time-based offers and engagement tasks.",
    description: [
      "TimeWall is an offerwall focused on time-based engagement offers — tasks where you earn rewards for spending time in apps, reaching playtime milestones, or completing timed activities.",
      "On Rewardoxy, TimeWall runs as an embedded iframe wall. It's a great option for users who prefer passive earning through playtime offers rather than active survey-taking or sign-up tasks.",
      "TimeWall complements other Rewardoxy walls by offering unique time-based inventory that may not appear on Notik, GemiAd, or Taskwall.",
    ],
    payoutRange: "$0.20 – $50 per offer (20–5,000 coins)",
    tips: [
      "TimeWall playtime offers credit based on actual time spent — keep the app open.",
      "Check for daily check-in bonuses within TimeWall offers.",
      "Combine TimeWall playtime offers with other walls' milestone offers.",
      "Ensure background app refresh is enabled for playtime tracking.",
      "Browse TimeWall when you have downtime — playtime offers reward patience.",
    ],
    pros: [
      "Unique time-based and playtime offer inventory",
      "Good for passive earning while using apps",
      "Embedded wall on Rewardoxy Earn page",
    ],
    cons: [
      "Playtime offers require keeping apps running",
      "Lower per-hour rate than active survey completion",
      "Smaller overall catalog than major walls",
    ],
    faqs: [
      {
        q: "How do TimeWall playtime offers work?",
        a: "You install an app through TimeWall and earn coins for spending a specified amount of time in the app. The timer tracks automatically once you start using the app.",
      },
      {
        q: "Why didn't my TimeWall playtime credit?",
        a: "Ensure the app was running in the foreground for the required duration, tracking permissions were granted, and you started the offer through Rewardoxy.",
      },
    ],
    relatedVertical: "/play-and-earn",
    relatedSlugs: ["vortex", "taskwall", "mylead"],
  },
];

export function getOfferwallBySlug(slug: string): Offerwall | undefined {
  return OFFERWALLS.find((o) => o.slug === slug);
}

export function getOfferwallsByType(type: OfferwallType): Offerwall[] {
  return OFFERWALLS.filter((o) => o.type === type);
}
