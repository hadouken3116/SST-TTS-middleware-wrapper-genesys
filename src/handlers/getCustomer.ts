import { ActionHandler, HandlerResult } from "../types";

/**
 * GetCustomer — look up a customer by ID or phone number.
 *
 * Param mapping (from Genesys data action):
 *   PARAM1 → customerId
 *   PARAM2 → phone (optional fallback lookup)
 *
 * Replace the mock logic with your actual CRM / database call.
 */
export const getCustomer: ActionHandler = async (
  params
): Promise<HandlerResult> => {
  const customerId = params.param1;
  const phone = params.param2;

  if (!customerId && !phone) {
    throw new Error("Missing required param: PARAM1 (customerId) or PARAM2 (phone)");
  }

  // ----- Replace with real CRM call -----
  // const crmBaseUrl = process.env.CRM_BASE_URL;
  // const res = await fetch(`${crmBaseUrl}/customers?id=${customerId}`);
  // const customer = await res.json();
  // ----------------------------------------

  const customer = {
    id: customerId ?? "unknown",
    name: "Jane Doe",
    phone: phone ?? "555-0100",
    accountTier: "Gold",
  };

  return {
    result: `Customer ${customer.name} found. Account tier: ${customer.accountTier}.`,
    data: customer,
  };
};
