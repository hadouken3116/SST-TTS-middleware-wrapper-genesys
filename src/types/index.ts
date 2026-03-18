/**
 * Genesys Gateway - Shared Types
 *
 * Standardized envelope so Genesys Cloud needs only ONE data action
 * with ONE output contract to talk to all your backend logic.
 */

/** Inbound request from Genesys data action */
export interface GenesysRequest {
  /** The action to route to, e.g. "GetCustomer", "CheckBalance" */
  action: string;
  /** Key-value params passed from the bot flow */
  params: Record<string, string>;
}

/** Standardized response envelope back to Genesys */
export interface GenesysResponse {
  /** Whether the action executed successfully */
  success: boolean;
  /** Echo of the action name for traceability */
  action: string;
  /** Human-readable result string — this is what the bot reads to the caller */
  result: string;
  /** Optional structured data (Genesys will ignore this unless you map it) */
  data: Record<string, unknown> | null;
  /** Error message if success is false */
  errorMessage: string;
}

/** Every handler implements this interface */
export interface ActionHandler {
  (params: Record<string, string>): Promise<HandlerResult>;
}

/** What a handler returns before it gets wrapped in the envelope */
export interface HandlerResult {
  result: string;
  data?: Record<string, unknown>;
}
