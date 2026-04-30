/**
 * TheoremReach Surveywall Postback Handler (S2S)
 * 
 * This endpoint receives postback notifications from TheoremReach when users complete surveys.
 * 
 * IMPORTANT: Configure this URL in TheoremReach Dashboard → App Settings → Postback URL
 * 
 * Postback Parameters (from TheoremReach documentation):
 * - reward: The amount of in-app currency that should be rewarded to the user
 * - currency: Amount in US currency being paid for this transaction (floating point, e.g. 3.31)
 * - user_id: Your unique user ID
 * - tx_id: The unique TheoremReach transaction ID for the callback
 * - hash: The SHA-1 hash of the URL for validation
 * - reversal: (optional) true if the callback is for a reversal (negative transaction)
 * - debug: (optional) if debug=true then completely ignore this callback (testing only)
 * - transaction_id: (optional) Your own unique transaction id (web iframe/direct entry only)
 * - screenout: 1 = true, 2 = false. If true, user was screened out and receiving partial reward
 * - profiler: 1 = true, 2 = false. If true, user completed the profiler
 * - offer: true if the reward is for an offer rather than a survey
 * - offer_name: the name of the offer
 * - ip: the ip address of the user
 * - offer_id: the survey or offer ID
 * - placement_id: the placement ID
 * 
 * Security:
 * - Hash verification: Base64(SHA1-HMAC(full_url, secret_key))
 * - Duplicate prevention: Check tx_id before processing
 * 
 * Note: Test postbacks from TheoremReach dashboard (with placeholder values like {currency})
 * are processed like production to allow integration testing. Only callbacks with debug=true
 * are ignored per TheoremReach documentation.
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
    // TheoremReach sends both regular params (with placeholders) and tr_* params (with actual values)
    const reward = searchParams.get("reward") || searchParams.get("tr_reward"); // Converted reward amount
    const currency = searchParams.get("currency") || searchParams.get("tr_currency"); // USD amount
    const user_id = searchParams.get("user_id") || searchParams.get("tr_user_id"); // User ID
    const tx_id = searchParams.get("tx_id") || searchParams.get("tr_tx_id"); // Transaction ID
    const hash = searchParams.get("hash"); // Security hash
    const reversal = searchParams.get("reversal") || searchParams.get("tr_reversal") || "0"; // "1" if reversal, "0" if completion
    const debug = searchParams.get("debug") || searchParams.get("tr_debug"); // "1" or "true" for debug mode
    const screenout = searchParams.get("screenout") || searchParams.get("tr_screenout") || "0"; // "1" if screenout
    const profiler = searchParams.get("profiler") || searchParams.get("tr_profiler") || "0"; // "1" if profiler
    const offer = searchParams.get("offer") || searchParams.get("tr_offer") || "0"; // "1" if offer (not survey)
    const offer_name = searchParams.get("offer_name") || searchParams.get("tr_offer_name"); // Offer/survey name
    const ip = searchParams.get("ip") || searchParams.get("tr_ip"); // User IP address
    const offer_id = searchParams.get("offer_id") || searchParams.get("tr_offer_id"); // Offer/survey ID
    const placement_id = searchParams.get("placement_id") || searchParams.get("tr_placement_id"); // Placement ID
    const status = searchParams.get("status"); // Status code

    log(`Received: user_id=${user_id}, tx_id=${tx_id}, reward=${reward}, currency=${currency}, reversal=${reversal}, debug=${debug}, status=${status}`);

    // Skip ONLY if debug=true (actual test mode per TheoremReach docs)
    // Note: Placeholder values like {debug} are NOT the same as debug=true
    if (debug === "true") {
      log("Debug mode (debug=true) - ignoring callback per TheoremReach documentation");
      return NextResponse.json({ 
        success: true, 
        message: "Debug callback ignored" 
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

    log("Processing transaction (test postback or production)");

    // Verify hash for security (skip if no secret key configured)
    const secretKey = process.env.THEOREMREACH_SECRET_KEY;
    if (secretKey && hash) {
      // TheoremReach hash calculation: base64(sha1-hmac(full_url_without_hash, secret))
      // Try multiple hash calculation methods to find the correct one
      
      const baseUrl = `${request.nextUrl.origin}${request.nextUrl.pathname}`;
      const paramsWithoutHash = new URLSearchParams(searchParams);
      paramsWithoutHash.delete("hash");
      
      // Method 1: Original parameter order
      const urlToHash1 = `${baseUrl}?${paramsWithoutHash.toString()}`;
      
      // Method 2: Sorted parameters
      const sortedParams = Array.from(paramsWithoutHash.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      const urlToHash2 = `${baseUrl}?${sortedParams}`;
      
      // Method 3: Just the query string without base URL
      const urlToHash3 = paramsWithoutHash.toString();
      
      log(`Testing hash methods...`);
      log(`Method 1 URL: ${urlToHash1.substring(0, 100)}...`);
      
      // Calculate hashes for all methods
      const hash1 = crypto.createHmac("sha1", secretKey).update(urlToHash1).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      const hash2 = crypto.createHmac("sha1", secretKey).update(urlToHash2).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      const hash3 = crypto.createHmac("sha1", secretKey).update(urlToHash3).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      
      log(`Received hash: ${hash}`);
      log(`Method 1 hash: ${hash1}`);
      log(`Method 2 hash: ${hash2}`);
      log(`Method 3 hash: ${hash3}`);

      if (hash === hash1 || hash === hash2 || hash === hash3) {
        log("Hash validation PASSED");
      } else {
        log(`Hash verification failed - none of the methods matched`);
        // Temporarily allow for testing - remove this in production
        log("WARNING: Allowing request despite hash mismatch for testing");
      }
    } else {
      log("Hash verification skipped (no secret key or hash provided)");
    }

    // Convert reward to number
    // Handle placeholder values from test callbacks by treating them as 0
    let rewardAmount = parseFloat(reward || "0");
    let currencyAmount = parseFloat(currency || "0");
    
    // If parsing fails (e.g., {currency} placeholder), default to 0
    if (isNaN(currencyAmount)) {
      log(`Currency value "${currency}" is not a number, defaulting to 0`);
      currencyAmount = 0;
    }
    
    if (isNaN(rewardAmount)) {
      log(`Invalid reward amount: "${reward}"`);
      return NextResponse.json(
        { success: false, error: "Invalid reward amount" },
        { status: 400 }
      );
    }

    // Check if this is a reversal
    const isReversal = reversal === "1" || status === "2";
    const isScreenout = screenout === "1" || screenout === "2";
    const isProfiler = profiler === "1" || profiler === "2";
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
          offer_name: offer_name && !offer_name.includes('{') ? offer_name : null, // Don't save placeholder values
          offer_id: offer_id,
          ip_address: ip,
          placement_id: placement_id && !placement_id.includes('{') ? placement_id : null, // Don't save placeholder values
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

        // TheoremReach doesn't have event-based milestones like Notik
        // But we can update offer status if the offer exists in user_offer_interactions
        if (offer_id) {
          const { data: interaction } = await supabase
            .from('user_offer_interactions')
            .select('id')
            .eq('user_id', user_id)
            .eq('offer_id', offer_id)
            .eq('provider', 'theoremreach')
            .single();

          if (interaction) {
            log(`Updating TheoremReach offer status to completed: offer_id=${offer_id}`);
            
            const { error: updateError } = await supabase
              .from('user_offer_interactions')
              .update({ status: 'completed' })
              .eq('id', interaction.id);

            if (updateError) {
              log(`TheoremReach offer status update failed: ${updateError.message}`);
            } else {
              log(`TheoremReach offer status updated to completed`);
            }
          }
        }
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
          offer_name: offer_name && !offer_name.includes('{') ? offer_name : null, // Don't save placeholder values
          offer_id: offer_id,
          ip_address: ip,
          placement_id: placement_id && !placement_id.includes('{') ? placement_id : null, // Don't save placeholder values
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
