export const SITE_URL = "https://www.rewardoxy.app";

export const MIN_COINS = 2000;
export const COINS_PER_USD = 1000;
export const MIN_WITHDRAWAL_USD = MIN_COINS / COINS_PER_USD;
export const PAYOUT_METHOD = "LTC" as const;
export const PAYOUT_METHOD_FULL = "Litecoin (LTC)";
export const SUPPORTED_COUNTRIES_COUNT = "100+";
export const REFERRAL_COMMISSION_PERCENT = 5;

export const siteFacts = {
  minCoins: MIN_COINS,
  coinsPerUsd: COINS_PER_USD,
  minWithdrawalUsd: MIN_WITHDRAWAL_USD,
  payoutMethod: PAYOUT_METHOD,
  payoutMethodFull: PAYOUT_METHOD_FULL,
  supportedCountries: SUPPORTED_COUNTRIES_COUNT,
  referralCommission: REFERRAL_COMMISSION_PERCENT,
};
