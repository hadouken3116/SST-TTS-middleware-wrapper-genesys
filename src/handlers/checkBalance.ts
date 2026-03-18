import { ActionHandler, HandlerResult } from "../types";

/**
 * CheckBalance — retrieve account balance for a customer.
 *
 * Param mapping:
 *   PARAM1 → customerId
 *
 * Replace mock logic with your actual billing/CRM API call.
 */
export const checkBalance: ActionHandler = async (
  params
): Promise<HandlerResult> => {
  const customerId = params.param1;

  if (!customerId) {
    throw new Error("Missing required param: PARAM1 (customerId)");
  }

  // ----- Replace with real API call -----
  // const res = await fetch(`${process.env.CRM_BASE_URL}/balance/${customerId}`);
  // const data = await res.json();
  // ----------------------------------------

  const balance = {
    customerId,
    currentBalance: 1250.75,
    currency: "USD",
    lastPaymentDate: "2026-03-01",
  };

  return {
    result: `Your current balance is $${balance.currentBalance.toFixed(2)} ${balance.currency}. Last payment received on ${balance.lastPaymentDate}.`,
    data: balance,
  };
};
