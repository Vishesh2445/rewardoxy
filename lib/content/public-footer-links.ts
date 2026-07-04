export type FooterLink = { text: string; url: string; isEmail?: boolean };

export type FooterSection = { title: string; links: FooterLink[] };

export const PUBLIC_FOOTER_TAGLINE =
  "Complete tasks. Earn rewards. Withdraw as Litecoin (LTC). Join thousands earning crypto by completing offers, surveys and games.";

export const PUBLIC_FOOTER_LINKS: FooterSection[] = [
  {
    title: "Earn",
    links: [
      { text: "Offerwalls", url: "/offers" },
      { text: "Paid Surveys", url: "/surveys" },
      { text: "Play & Earn", url: "/play-and-earn" },
      { text: "App Trials", url: "/app-trials" },
      { text: "Crypto Payout", url: "/crypto-payout" },
    ],
  },
  {
    title: "Learn",
    links: [
      { text: "How It Works", url: "/how-it-works" },
      { text: "Blog", url: "/blog" },
      { text: "Referral Program", url: "/referral-program" },
      { text: "FAQ", url: "/faq" },
    ],
  },
  {
    title: "About",
    links: [
      { text: "About Us", url: "/about" },
      { text: "Terms of Service", url: "/terms" },
      { text: "Privacy Policy", url: "/privacy" },
      { text: "Contact", url: "/contact" },
    ],
  },
  {
    title: "Contact",
    links: [{ text: "support@rewardoxy.app", url: "mailto:support@rewardoxy.app", isEmail: true }],
  },
];
