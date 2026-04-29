/**
 * TheoremReach Surveywall Postback Handler (S2S)
 * 
 * This endpoint receives postback notifications from TheoremReach when users complete surveys.
 * 
 * IMPORTANT: Configure this URL in TheoremReach Dashboard → App Settings → Postback URL
 * 
 * Correct Postback URL Format:
 * https://rewardoxy.app/api/theoremreach-postback?transaction_id={YOUR_UNIQUE_TRANSACTION_ID}&currency={CURRENCY}&reward={REWARD}&partner_id={YOUR_PUBLISHER_IDS}&hash={HASH_STRING}
 * 
 * Parameter Mapping (TheoremReach macros → query params):
 * - transaction_id: Unique identifier for every transaction (format: userId_timestamp)
 * - currency: USD amount earned
 * - reward: Converted reward amount in your app's currency
 * - partner_id: Your publisher ID (correlates to Placements)
 * - debug: Testing flag (when true, don't credit user)
 * - hash: SHA-1 HMAC security hash for verification
 * 
 * Security:
 * - Hash verification: Base64(SHA1-HMAC(full_url, secret_key))
 * - Duplicate prevention: Check transaction_id before processing
 * 
 * CRITICAL: Always return HTTP 200 with JSON response
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase env vars');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function GET(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { 
    logs.push(msg); 
    console.log('[theoremreach-postback]', msg); 
  };

  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract parameters from TheoremReach callback
    const reward = searchParams.get("reward"); // Converted reward amount
    const currency = searchParams.get("currency"); // USD amount
    const user_id = searchParams.get("user_id"); // User ID
    const tx_id = searchParams.get("tx_id"); // Transaction ID
    const hash = searchParams.get("hash"); // Security hash
    const reversal = searchParams.get("reversal"); // "1" if reversal, "0" if completion
    const debug = searchParams.get("debug"); // "1" for debug mode
    const screenout = searchParams.get("screenout"); // "1" if screenout
    const profiler = searchParams.get("profiler"); // "1" if profiler
    const offer = searchParams.get("offer"); // "1" if offer (not survey)
    const offer_name = searchParams.get("offer_name"); // Offer/survey name
    const ip = searchParams.get("ip"); // User IP address
    const offer_id = searchParams.get("offer_id"); // Offer/survey ID
    const placement_id = searchParams.get("placement_id"); // Placement ID

    log(`Received: user_id=${user_id}, tx_id=${tx_id}, reward=${reward}, currency=${currency}, reversal=${reversal}, debug=${debug}`);

    // Don't credit if debug mode
    if (debug === "1") {
      log("Debug mode - not crediting user");
      return NextResponse.json({ 
        success: true, 
        message: "Debug callback received" 
      });
    }

    // Validate required parameters
    if (!user_id || !tx_id || !reward) {
      log("Missing required parameters");
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify hash for security
    const secretKey = process.env.THEOREMREACH_SECRET_KEY;
    if (secretKey && hash) {
      // Reconstruct the callback URL without the hash parameter
      const baseUrl = `${request.nextUrl.origin}${request.nextUrl.pathname}`;
      const paramsWithoutHash = new URLSearchParams(searchParams);
      paramsWithoutHash.delete("hash");
      const urlToHash = `${baseUrl}?${paramsWithoutHash.toString()}`;
      
      // Calculate expected hash
      const expectedHash = crypto
        .createHmac("sha1", secretKey)
        .update(urlToHash)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      if (hash !== expectedHash) {
        log(`Hash verification failed: expected=${expectedHash}, received=${hash}`);
        return NextResponse.json(
          { success: false, error: "Invalid hash" },
          { status: 403 }
        );
      }
      log("Hash validation PASSED");
    }

    // Convert reward to number
    const rewardAmount = parseFloat(reward);
    const currencyAmount = parseFloat(currency || "0");
    
    if (isNaN(rewardAmount)) {
      log("Invalid reward amount");
      return NextResponse.json(
        { success: false, error: "Invalid reward amount" },
        { status: 400 }
      );
    }

    // Check if this is a reversal
    const isReversal = reversal === "1";
    const isScreenout = screenout === "1";
    const isProfiler = profiler === "1";
    const isOffer = offer === "1";

    log(`Transaction type: reversal=${isReversal}, screenout=${isScreenout}, profiler=${isProfiler}, offer=${isOffer}`);

    // Initialize Supabase client
    const supabase = getSupabase();

    // Check for duplicate transaction
    const { data: existingTransaction } = await supabase
      .from("theoremreach_transactions")
      .select("id, is_reversal")
      .eq("tx_id", tx_id)
      .single();

    if (existingTransaction) {
      // If we already processed this exact transaction type, skip it
      if (existingTransaction.is_reversal === isReversal) {
        log(`Duplicate transaction detected: ${tx_id} (reversal=${isReversal})`);
        return NextResponse.json({
          success: true,
          message: "Transaction already processed",
        });
      }
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, coins_balance, total_earned, referred_by, email_verified")
      .eq("id", user_id)
      .single();

    if (userError || !userData) {
      log(`User not found: ${user_id}`);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    log(`User found: ${user_id}, balance before: ${userData.coins_balance}`);

    // Process based on transaction type
    if (isReversal) {
      // ═══════════════════════════════════════════════════════════════════
      // REVERSAL HANDLER
      // ═══════════════════════════════════════════════════════════════════
      log(`Processing reversal: tx_id=${tx_id}, reward=${rewardAmount}`);

      const deductAmount = Math.abs(rewardAmount);

      if (deductAmount > 0) {
        log(`Deducting ${deductAmount} coins from user ${user_id}`);

        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_points', {
          p_userid: user_id,
          p_amount: Math.floor(deductAmount)
        });

        if (deductError) {
          log(`Deduct RPC failed: ${deductError.message}`);
          return NextResponse.json(
            { success: false, error: "Failed to deduct balance" },
            { status: 500 }
          );
        }

        const newBalance = deductResult?.[0]?.new_balance ?? deductResult?.new_balance ?? '?';
        log(`SUCCESS: Deducted ${deductAmount} from user ${user_id}. New balance: ${newBalance}`);
      }

      // Log reversal transaction
      const { error: transactionError } = await supabase
        .from("theoremreach_transactions")
        .insert({
          tx_id: tx_id,
          user_id: user_id,
          reward: -Math.floor(deductAmount),
          currency_usd: currencyAmount,
          is_reversal: true,
          is_screenout: isScreenout,
          is_profiler: isProfiler,
          is_offer: isOffer,
          offer_name: offer_name,
          offer_id: offer_id,
          ip_address: ip,
          placement_id: placement_id,
        });

      if (transactionError) {
        log(`Error logging reversal: ${transactionError.message}`);
      } else {
        log(`Reversal logged: tx_id=${tx_id}`);
      }

      return NextResponse.json({
        success: true,
        message: "Reversal processed successfully",
        amount: -deductAmount,
      });

    } else {
      // ═══════════════════════════════════════════════════════════════════
      // COMPLETION HANDLER
      // ═══════════════════════════════════════════════════════════════════
      
      // Only credit if reward is positive
      if (rewardAmount > 0) {
        // Credit user using RPC function
        const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
          p_user_id: user_id,
          p_amount: rewardAmount
        });

        if (creditError) {
          log(`Credit RPC failed: ${creditError.message}`);
          return NextResponse.json(
            { success: false, error: "Failed to update balance" },
            { status: 500 }
          );
        }

        const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
        const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
        log(`SUCCESS: Credited ${rewardAmount} to user ${user_id}. New balance: ${newBalance}, New total: ${newTotal}`);
      } else {
        log(`Reward is 0 or negative, skipping credit`);
      }

      // Log transaction
      const { error: transactionError } = await supabase
        .from("theoremreach_transactions")
        .insert({
          tx_id: tx_id,
          user_id: user_id,
          reward: Math.floor(rewardAmount),
          currency_usd: currencyAmount,
          is_reversal: false,
          is_screenout: isScreenout,
          is_profiler: isProfiler,
          is_offer: isOffer,
          offer_name: offer_name,
          offer_id: offer_id,
          ip_address: ip,
          placement_id: placement_id,
        });

      if (transactionError) {
        log(`Error logging transaction: ${transactionError.message}`);
      } else {
        log(`Transaction logged: tx_id=${tx_id}, offer=${offer_name}`);
      }

      // Check for referrer and add 5% commission (only for completions, not reversals)
      if (rewardAmount > 0 && userData.referred_by && userData.email_verified) {
        const commissionAmount = Math.round(rewardAmount * 0.05);
        if (commissionAmount > 0) {
          const { error: commissionError } = await supabase.rpc('increment_pending_referral_earnings', {
            uid: userData.referred_by,
            amount: commissionAmount,
          });
          if (commissionError) {
            log(`Referral commission failed: ${commissionError.message}`);
          } else {
            log(`Referral commission: ${commissionAmount} coins added to pending earnings for referrer ${userData.referred_by}`);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Reward credited successfully",
        amount: rewardAmount,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("TheoremReach postback error:", message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Support POST method as well
export async function POST(request: NextRequest) {
  return GET(request);
}
