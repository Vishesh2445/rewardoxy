import type { FaqItem } from "./schema";
import { MIN_COINS, COINS_PER_USD, PAYOUT_METHOD_FULL } from "./site-facts";

export const SITE_FAQS: FaqItem[] = [
  {
    q: "What is Rewardoxy?",
    a: "Rewardoxy is a free online rewards platform that pays you for completing surveys, trying apps, playing games, and finishing micro-tasks. Advertisers pay us when you engage with their content, and we share that revenue with you as coins.",
  },
  {
    q: "Is Rewardoxy free to join?",
    a: "Yes, creating an account is completely free. There are no hidden fees, subscriptions, or upfront costs. You sign up with your email or Google account and start earning immediately.",
  },
  {
    q: "How do I earn coins?",
    a: "After signing up, go to the Earn page where you'll find offers from multiple partner offerwalls. Each offer shows the coin reward before you start. Complete the requirements (install an app, answer a survey, reach a game level, etc.) and coins are credited to your balance automatically.",
  },
  {
    q: "What is the minimum withdrawal amount?",
    a: `The minimum withdrawal is ${MIN_COINS.toLocaleString()} coins ($${(MIN_COINS / COINS_PER_USD).toFixed(2)} USD). Once your balance meets the minimum, you can request a payout at any time.`,
  },
  {
    q: "How are payouts processed?",
    a: `Payouts are sent as ${PAYOUT_METHOD_FULL} cryptocurrency directly to the wallet address you provide. Most withdrawals are processed within minutes after approval.`,
  },
  {
    q: "Which countries are supported?",
    a: "Rewardoxy is available worldwide. However, the number and value of available offers varies by country. Users in the US, UK, Canada, Australia, and Western Europe typically see the highest-paying offers.",
  },
  {
    q: "Why was my offer not credited?",
    a: "Offers can take anywhere from a few minutes to 24 hours to credit. Make sure you completed all requirements listed in the offer description. If an offer still hasn't credited after 24 hours, contact our support team with the offer name and completion details.",
  },
  {
    q: "Can I use a VPN?",
    a: "No. Using a VPN, proxy, or any tool that masks your real IP address will result in offers not crediting and may lead to account suspension. Advertisers require genuine engagement from real locations.",
  },
  {
    q: "How does the referral program work?",
    a: "Every user gets a unique referral code. When someone signs up using your code, you earn 5% of their earnings as a bonus — without reducing what they earn. Visit the Referral Program page to learn more.",
  },
  {
    q: "Is my data safe?",
    a: "We take privacy seriously. We only collect information necessary to operate the platform and process payouts. We never sell your personal data to third parties. Read our Privacy Policy for full details.",
  },
  {
    q: "What if I have a problem with my account?",
    a: "Contact us at support@rewardoxy.app or use the Contact page. Include your account email and a description of the issue. We typically respond within 24 hours.",
  },
  {
    q: "How is Rewardoxy different from other GPT sites?",
    a: "We focus on instant crypto payouts, a clean user experience, and partnering only with reputable offerwalls. There are no point inflation tricks — our coin-to-crypto rate is transparent and consistent.",
  },
  {
    q: "Is Rewardoxy legit?",
    a: "Yes. Rewardoxy is a legitimate get-paid-to platform that partners with established offerwall providers like CPX Research, Notik, and GemiAd. We pay users in Litecoin (LTC) with a transparent conversion rate of 1,000 coins = $1 USD.",
  },
  {
    q: "How to withdraw LTC from Rewardoxy?",
    a: "Go to the Cashout page once your balance reaches 2,000 coins ($2 minimum). Enter your Litecoin wallet address, confirm the amount, and submit. Most LTC withdrawals are processed within minutes after approval.",
  },
  {
    q: "Which offerwalls does Rewardoxy use?",
    a: "Rewardoxy integrates CPX Research, TheoremReach, Revtoo, Notik, GemiAd, Taskwall, Klink, MyLead, Vortex, and TimeWall. All earnings from these partners credit to one Rewardoxy balance.",
  },
];
