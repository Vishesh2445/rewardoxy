import type { FaqItem } from "./schema";

export type Country = {
  slug: string;
  name: string;
  flag: string;
  intro: string[];
  topVerticals: { name: string; reason: string }[];
  bestOfferwalls: string[];
  avgEarnings: string;
  payoutNotes: string;
  tips: string[];
  faq: FaqItem[];
};

export const COUNTRIES: Country[] = [
  {
    slug: "united-states",
    name: "United States",
    flag: "🇺🇸",
    intro: [
      "The United States is the largest market for get-paid-to platforms, and Rewardoxy users in the US have access to the widest selection of high-paying offers across all categories.",
      "US users typically see the highest survey payouts ($0.50–$3.00 per survey), premium game offers ($5–$120), and exclusive app trials from major brands. Tier-1 advertisers prioritize US traffic, which means more inventory and better rates.",
      "Litecoin (LTC) withdrawals work seamlessly for US users — major exchanges like Coinbase, Kraken, and Binance.US support LTC deposits from Rewardoxy cashouts.",
    ],
    topVerticals: [
      { name: "Paid Surveys", reason: "Highest per-survey payouts globally; CPX Research and TheoremReach have massive US inventory." },
      { name: "Mobile Game Offers", reason: "US game advertisers pay premium CPE rates — $10–$120 for reaching game milestones." },
      { name: "App Trials", reason: "Streaming, fintech, and subscription app trials pay $2–$15 for US sign-ups." },
    ],
    bestOfferwalls: ["cpx-research", "notik", "theoremreach", "taskwall"],
    avgEarnings: "$30–$150/month for active users",
    payoutNotes: "LTC is widely supported on US exchanges. Coinbase and Kraken allow instant LTC deposits. No tax withholding on crypto rewards, but earnings may be taxable — consult a tax professional.",
    tips: [
      "Check CPX Research and TheoremReach first — US survey volume peaks 9 AM–8 PM EST.",
      "iOS users get exclusive app offers; Android users see more game inventory.",
      "Complete your profile with accurate US zip code for better survey matching.",
      "Game offers from Notik and Taskwall pay highest in the first week of account creation.",
      "Avoid VPNs — US advertisers strictly verify IP location.",
    ],
    faq: [
      { q: "Is Rewardoxy available in all US states?", a: "Yes. Rewardoxy is available in all 50 US states. Offer availability is the same nationwide, though some individual offers may have state restrictions." },
      { q: "What's the best way to earn in the US?", a: "Combine surveys (CPX, TheoremReach) with high-value game offers (Notik, Taskwall). Active US users typically earn $30–$150/month." },
    ],
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    flag: "🇬🇧",
    intro: [
      "The UK is one of Rewardoxy's strongest markets for paid surveys and app offers. British users benefit from high advertiser demand and GBP-equivalent payouts that rank among the best in Europe.",
      "UK-specific survey inventory from CPX Research and TheoremReach covers topics like retail, banking, media, and politics. Game offers from Notik and Revtoo frequently feature titles popular in the UK market.",
      "LTC withdrawals are straightforward for UK users via exchanges like Coinbase, Kraken, and Binance that operate in the UK.",
    ],
    topVerticals: [
      { name: "Paid Surveys", reason: "Strong UK survey demand from market research firms; payouts comparable to US rates." },
      { name: "App Trials", reason: "UK fintech and streaming trials (Revolut, Netflix trials) pay well through MyLead and Klink." },
      { name: "Mobile Games", reason: "Popular UK game titles feature in Notik and Taskwall with £5–£80 milestone payouts." },
    ],
    bestOfferwalls: ["cpx-research", "mylead", "notik", "theoremreach"],
    avgEarnings: "£20–£100/month for active users",
    payoutNotes: "LTC can be deposited to UK-friendly exchanges and converted to GBP. Crypto earnings may be subject to Capital Gains Tax — keep records of withdrawals.",
    tips: [
      "MyLead has particularly strong UK/EU inventory — check it alongside CPX.",
      "Survey volume is highest weekday evenings (6–10 PM GMT).",
      "Use your real UK postcode in survey profiles for better qualification rates.",
      "Banking and insurance survey offers pay premium rates for UK respondents.",
      "Game offers often require reaching Level 10–20 — budget your time accordingly.",
    ],
    faq: [
      { q: "Do UK users get the same offers as US users?", a: "Offer inventory is geo-targeted. UK users see UK-specific surveys and apps, which are plentiful but may differ from US listings." },
      { q: "Can I withdraw LTC to a UK bank account?", a: "Withdraw LTC to an exchange (Coinbase, Kraken), then sell for GBP and transfer to your bank. Rewardoxy sends LTC directly to your wallet." },
    ],
  },
  {
    slug: "india",
    name: "India",
    flag: "🇮🇳",
    intro: [
      "India has one of the fastest-growing GPT user bases globally. While per-offer payouts are lower than Tier-1 countries, the volume of available app installs and mobile game offers makes India one of the most active earning markets on Rewardoxy.",
      "Indian users excel at app install offers (CPI), mobile game milestones, and shorter surveys. Notik, GemiAd, and Vortex have strong Android-focused inventory for the Indian market.",
      "LTC is popular in India and can be converted to INR through exchanges like WazirX, CoinDCX, and Binance.",
    ],
    topVerticals: [
      { name: "App Installs", reason: "High volume of CPI offers paying ₹10–₹200 per install through GemiAd and Vortex." },
      { name: "Mobile Games", reason: "Android game offers are abundant; popular titles like Ludo, Rummy, and casual games pay for milestones." },
      { name: "Surveys", reason: "CPX Research has growing Indian survey inventory, especially for 18–35 age group." },
    ],
    bestOfferwalls: ["gemiad", "vortex", "notik", "cpx-research"],
    avgEarnings: "₹500–₹3,000/month for active users",
    payoutNotes: "LTC withdrawals to Indian exchanges work well. Minimum Rewardoxy cashout is $2 (2,000 coins) — achievable within the first few days of active earning.",
    tips: [
      "Android users have significantly more offers than iOS in India.",
      "Focus on quick app install offers for fast daily earnings.",
      "Complete 3–5 app installs per day for steady coin accumulation.",
      "Avoid VPNs — Indian advertisers verify local IP addresses.",
      "Game offers with low-level milestones (Level 5–10) offer the best time-to-pay ratio.",
    ],
    faq: [
      { q: "Why are payouts lower in India?", a: "Advertisers pay based on market value. Indian offers pay less per task but are available in much higher volume, so total monthly earnings can still be significant." },
      { q: "Which payment method works best in India?", a: "Rewardoxy pays in LTC (Litecoin). Withdraw to WazirX, CoinDCX, or Binance and convert to INR." },
    ],
  },
  {
    slug: "canada",
    name: "Canada",
    flag: "🇨🇦",
    intro: [
      "Canada offers a strong middle ground between US and European markets on Rewardoxy. Canadian users enjoy high survey payouts, good game offer availability, and bilingual (English/French) survey options.",
      "CPX Research and TheoremReach both have dedicated Canadian survey panels. Notik and Taskwall feature game offers from publishers active in the Canadian App Store and Google Play.",
      "LTC is fully legal in Canada and supported by major exchanges like Newton, Coinbase, and Kraken.",
    ],
    topVerticals: [
      { name: "Paid Surveys", reason: "Canadian panels pay near-US rates; bilingual surveys available in Quebec." },
      { name: "Game Offers", reason: "Strong mobile game inventory with CAD-equivalent payouts of $5–$80." },
      { name: "App Trials", reason: "Canadian streaming and fintech trials available through Klink and Revtoo." },
    ],
    bestOfferwalls: ["cpx-research", "notik", "theoremreach", "revtoo"],
    avgEarnings: "$25–$120 CAD/month for active users",
    payoutNotes: "LTC deposits to Canadian exchanges are instant. Crypto earnings may be taxable under CRA guidelines — track your withdrawals.",
    tips: [
      "Select Canada and your province in survey profiles for better matching.",
      "French-speaking users in Quebec may qualify for exclusive bilingual surveys.",
      "Check all survey walls — Canadian inventory rotates between CPX, TheoremReach, and Revtoo Surveys.",
      "Winter months often see increased survey demand from retail advertisers.",
      "Use a Canadian IP address — VPN usage will block offer crediting.",
    ],
    faq: [
      { q: "Are French-language surveys available in Canada?", a: "Yes. Some CPX Research and TheoremReach surveys target French-speaking Canadians, especially in Quebec." },
      { q: "Is Rewardoxy legal in Canada?", a: "Yes. Rewardoxy is a legitimate rewards platform. Users earn by completing advertiser offers and withdraw earnings as LTC." },
    ],
  },
  {
    slug: "australia",
    name: "Australia",
    flag: "🇦🇺",
    intro: [
      "Australia is a Tier-1 market on Rewardoxy with excellent survey payouts and growing game offer inventory. Australian users benefit from high advertiser demand in retail, banking, and telecommunications research.",
      "Survey routers like CPX Research and TheoremReach maintain active Australian panels. Game offers from Notik and Taskwall frequently feature titles popular in the Australian market.",
      "LTC is supported by Australian exchanges including CoinSpot, Swyftx, and Binance Australia.",
    ],
    topVerticals: [
      { name: "Paid Surveys", reason: "Premium AUD-equivalent payouts; strong demand from retail and telco researchers." },
      { name: "Mobile Games", reason: "Growing game offer catalog with $5–$60 milestone payouts." },
      { name: "App Trials", reason: "Streaming and subscription trials from brands active in the Australian market." },
    ],
    bestOfferwalls: ["cpx-research", "theoremreach", "notik", "taskwall"],
    avgEarnings: "$25–$100 AUD/month for active users",
    payoutNotes: "Withdraw LTC to CoinSpot or Swyftx and convert to AUD. The $2 minimum cashout is low enough for quick first withdrawals.",
    tips: [
      "Australian survey volume peaks evenings AEST/AEDT (7–10 PM).",
      "Telco and banking surveys pay above average for Australian respondents.",
      "Complete profile with accurate Australian postcode for survey matching.",
      "Check multiple walls daily — Australian inventory is smaller than US but high-paying.",
      "Game offers on weekends often have bonus payouts.",
    ],
    faq: [
      { q: "How much can Australians earn on Rewardoxy?", a: "Active Australian users typically earn $25–$100 AUD per month. Survey-heavy users in major cities can earn more." },
      { q: "Which crypto exchange works for Australian users?", a: "CoinSpot and Swyftx both accept LTC deposits. Withdraw from Rewardoxy to your LTC wallet, then transfer to your exchange." },
    ],
  },
  {
    slug: "philippines",
    name: "Philippines",
    flag: "🇵🇭",
    intro: [
      "The Philippines is one of Southeast Asia's most active mobile earning markets. Filipino users on Rewardoxy primarily earn through mobile game offers, app installs, and micro-tasks — categories that match the country's mobile-first internet usage.",
      "Android dominates the Philippine market, making Vortex, GemiAd, and Notik particularly valuable. Game offers featuring popular mobile titles pay for reaching early milestones.",
      "LTC is widely used in the Philippines and can be converted to PHP via Coins.ph, Binance, and other local exchanges.",
    ],
    topVerticals: [
      { name: "Mobile Games", reason: "Highest volume category; casual and strategy games pay ₱50–₱2,000 for milestones." },
      { name: "App Installs", reason: "Quick CPI offers from GemiAd and Vortex credit within minutes." },
      { name: "Surveys", reason: "Growing CPX Research inventory for Filipino respondents aged 18–34." },
    ],
    bestOfferwalls: ["vortex", "gemiad", "notik", "timewall"],
    avgEarnings: "₱500–₱2,500/month for active users",
    payoutNotes: "LTC to PHP conversion via Coins.ph or Binance is fast. The $2 minimum withdrawal is achievable within 1–2 days of active game and app offer completion.",
    tips: [
      "Mobile data users should connect to WiFi when starting game offers to avoid download issues.",
      "Focus on games you enjoy — milestone offers require real playtime.",
      "TimeWall playtime offers are great for passive earning on commutes.",
      "Complete 2–3 app installs daily for steady income.",
      "GCash-friendly exchanges make LTC-to-PHP conversion easy.",
    ],
    faq: [
      { q: "Can I earn on Rewardoxy using mobile data?", a: "Yes, but WiFi is recommended for downloading game and app offers. Once installed, mobile data works fine for playtime tracking." },
      { q: "What's the fastest way to earn in the Philippines?", a: "App install offers on GemiAd and Vortex credit within minutes. Combine these with game milestone offers for higher payouts." },
    ],
  },
  {
    slug: "germany",
    name: "Germany",
    flag: "🇩🇪",
    intro: [
      "Germany is Europe's largest GPT market with strong survey demand and strict data privacy standards. German users on Rewardoxy benefit from high-quality survey panels and reputable offerwall partners.",
      "CPX Research and MyLead both maintain active German survey and offer inventory. German users see surveys on automotive, technology, insurance, and consumer goods topics with above-average payouts.",
      "LTC is legal in Germany and supported by exchanges like Bitpanda, Coinbase, and Kraken.",
    ],
    topVerticals: [
      { name: "Paid Surveys", reason: "Premium European payouts; strong demand from German market researchers." },
      { name: "App Trials", reason: "German fintech and insurance app trials through MyLead and Klink." },
      { name: "Mobile Games", reason: "Moderate game offer inventory; strategy and puzzle games most common." },
    ],
    bestOfferwalls: ["cpx-research", "mylead", "theoremreach", "notik"],
    avgEarnings: "€20–€80/month for active users",
    payoutNotes: "LTC to EUR conversion via Bitpanda or Kraken. German tax law may require reporting crypto income — consult a Steuerberater for amounts over €600/year.",
    tips: [
      "MyLead has excellent German/EU inventory — check it daily.",
      "Complete surveys in German when available for higher qualification rates.",
      "German surveys often have attention checks — read questions carefully.",
      "Automotive and insurance surveys pay premium rates for German respondents.",
      "GDPR-compliant platforms like Rewardoxy are preferred by German advertisers.",
    ],
    faq: [
      { q: "Are surveys available in German on Rewardoxy?", a: "Yes. CPX Research and MyLead serve German-language surveys. Your profile language settings affect which surveys you see." },
      { q: "Is earning on Rewardoxy legal in Germany?", a: "Yes. Completing offers for rewards is legal. Crypto earnings may be taxable depending on the amount." },
    ],
  },
  {
    slug: "brazil",
    name: "Brazil",
    flag: "🇧🇷",
    intro: [
      "Brazil is Latin America's largest mobile earning market. Brazilian Rewardoxy users earn primarily through Android app installs, mobile games, and an expanding survey market.",
      "The Brazilian mobile gaming scene is enormous, and advertisers pay for installs and engagement on popular titles. GemiAd, Vortex, and Notik have strong Brazilian inventory.",
      "LTC is popular in Brazil and can be converted to BRL through Binance, Mercado Bitcoin, and Foxbit.",
    ],
    topVerticals: [
      { name: "Mobile Games", reason: "Massive Android game offer volume; casual games pay R$5–R$100 for milestones." },
      { name: "App Installs", reason: "High-volume CPI offers credit quickly through GemiAd and Vortex." },
      { name: "Surveys", reason: "Growing CPX Research panel for Brazilian Portuguese speakers." },
    ],
    bestOfferwalls: ["gemiad", "vortex", "notik", "cpx-research"],
    avgEarnings: "R$30–R$200/month for active users",
    payoutNotes: "LTC to BRL via Binance or Mercado Bitcoin. Pix integration on some exchanges makes withdrawal to Brazilian bank accounts fast.",
    tips: [
      "Android offers dominate — iOS users will see fewer options.",
      "Portuguese-language surveys qualify better for Brazilian users.",
      "Focus on game offers with low milestones (Level 3–5) for quick earnings.",
      "Peak earning hours are evenings BRT (7–11 PM).",
      "Avoid switching between WiFi and mobile data during offer tracking.",
    ],
    faq: [
      { q: "Por que algumas ofertas não creditam no Brasil?", a: "Offers may not credit if you used a VPN, didn't install through Rewardoxy's link, or didn't complete all requirements. Wait 24 hours before contacting support." },
      { q: "Qual a melhor forma de sacar no Brasil?", a: "Withdraw LTC from Rewardoxy to Binance or Mercado Bitcoin, convert to BRL, and transfer via Pix to your bank." },
    ],
  },
  {
    slug: "indonesia",
    name: "Indonesia",
    flag: "🇮🇩",
    intro: [
      "Indonesia has over 200 million internet users, making it one of Southeast Asia's largest mobile earning markets. Indonesian Rewardoxy users thrive on app install offers and mobile game milestones.",
      "The market is overwhelmingly Android-focused. Vortex, GemiAd, and TimeWall provide the best inventory for Indonesian users, with game offers featuring popular local and international titles.",
      "LTC can be converted to IDR through Indodax, Tokocrypto, and Binance.",
    ],
    topVerticals: [
      { name: "App Installs", reason: "Highest volume; CPI offers pay Rp 5,000–Rp 50,000 per install." },
      { name: "Mobile Games", reason: "Strategy and casual games with milestone payouts of Rp 20,000–Rp 500,000." },
      { name: "Playtime Offers", reason: "TimeWall playtime offers suit users who keep apps running during the day." },
    ],
    bestOfferwalls: ["gemiad", "vortex", "timewall", "notik"],
    avgEarnings: "Rp 100,000–Rp 500,000/month for active users",
    payoutNotes: "LTC to IDR via Indodax or Tokocrypto. The $2 minimum cashout is very accessible — most active users reach it within 1–2 days.",
    tips: [
      "Use WiFi for downloading game and app offers to save mobile data.",
      "TimeWall playtime offers work well for users who multitask on their phones.",
      "Complete 3–5 app installs per day for consistent daily earnings.",
      "Game offers with Level 3–5 milestones offer the best return on time.",
      "Ensure Google Play is updated for smooth app install tracking.",
    ],
    faq: [
      { q: "Apakah Rewardoxy tersedia di Indonesia?", a: "Yes. Rewardoxy is available in Indonesia with app install, game, and survey offers. Android users see the most inventory." },
      { q: "Berapa minimum penarikan di Rewardoxy?", a: "The minimum withdrawal is 2,000 coins ($2 USD). This is achievable quickly with app install offers." },
    ],
  },
  {
    slug: "nigeria",
    name: "Nigeria",
    flag: "🇳🇬",
    intro: [
      "Nigeria is Africa's largest mobile earning market with a young, tech-savvy population eager to earn online. Nigerian Rewardoxy users earn through app installs, mobile games, and surveys.",
      "Android dominates the Nigerian market. GemiAd, Vortex, and Notik provide strong inventory for Nigerian users. Survey availability is growing through CPX Research's African panels.",
      "LTC is widely used in Nigeria for remittances and can be converted to NGN through Binance, Quidax, and Luno.",
    ],
    topVerticals: [
      { name: "App Installs", reason: "Quick CPI offers pay ₦200–₦2,000 per install; highest volume category." },
      { name: "Mobile Games", reason: "Casual and sports games pay ₦500–₦10,000 for reaching milestones." },
      { name: "Surveys", reason: "Growing CPX Research inventory for Nigerian respondents." },
    ],
    bestOfferwalls: ["gemiad", "vortex", "notik", "cpx-research"],
    avgEarnings: "₦5,000–₦30,000/month for active users",
    payoutNotes: "LTC to NGN via Quidax, Binance, or Luno. Crypto adoption is high in Nigeria, making LTC withdrawals practical and fast.",
    tips: [
      "Stable internet is important — use WiFi when possible for offer tracking.",
      "App install offers are the fastest way to reach the $2 minimum withdrawal.",
      "Complete offers during off-peak hours for better app download speeds.",
      "Binance P2P offers quick NGN conversion from LTC.",
      "Keep apps installed for at least 24 hours to avoid credit reversals.",
    ],
    faq: [
      { q: "Can Nigerians withdraw earnings to a bank account?", a: "Rewardoxy pays in LTC. Withdraw to Quidax or Binance, convert to NGN, and transfer to your Nigerian bank account." },
      { q: "Why are some offers not available in Nigeria?", a: "Advertisers geo-target offers. While Nigerian inventory is growing, some premium offers are limited to Tier-1 countries. Focus on app installs and games for best results." },
    ],
  },
];

export function getCountryBySlug(slug: string): Country | undefined {
  return COUNTRIES.find((c) => c.slug === slug);
}
