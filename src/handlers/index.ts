import { ActionHandler } from "../types";
import { getCustomer } from "./getCustomer";
import { checkBalance } from "./checkBalance";
import { bookAppointment } from "./bookAppointment";
import { getHours } from "./getHours";

/**
 * Handler Registry
 *
 * Maps action names (case-insensitive at lookup) to handler functions.
 * To add a new action, just:
 *   1. Create a new handler file in this folder
 *   2. Register it here
 * That's it — no changes needed in the Azure Function trigger or Genesys config.
 */
const handlers: Record<string, ActionHandler> = {
  GetCustomer: getCustomer,
  CheckBalance: checkBalance,
  BookAppointment: bookAppointment,
  GetHours: getHours,
};

/**
 * Look up a handler by action name (case-insensitive).
 * Returns undefined if the action doesn't exist.
 */
export function getHandler(action: string): ActionHandler | undefined {
  // Try exact match first, then case-insensitive
  if (handlers[action]) return handlers[action];

  const key = Object.keys(handlers).find(
    (k) => k.toLowerCase() === action.toLowerCase()
  );
  return key ? handlers[key] : undefined;
}

/** List all registered action names (useful for diagnostics) */
export function listActions(): string[] {
  return Object.keys(handlers);
}
