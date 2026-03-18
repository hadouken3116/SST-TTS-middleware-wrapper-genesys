import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { GenesysRequest } from "../types";
import { getHandler } from "../handlers";
import { successResponse, errorResponse } from "../utils/response";

/**
 * Genesys Gateway — Single HTTP trigger that routes to action handlers.
 *
 * Genesys Cloud calls this ONE endpoint via a Web Services Data Action.
 * The `action` field in the JSON body determines which handler runs.
 *
 * POST /api/genesys
 * Body: { "action": "GetCustomer", "params": { "customerId": "123" } }
 */
async function genesysGateway(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Genesys gateway invoked: ${request.method} ${request.url}`);

  // --- API key validation (optional but recommended) ---
  const expectedKey = process.env.API_KEY;
  if (expectedKey) {
    const providedKey = request.headers.get("x-api-key");

    if (providedKey !== expectedKey) {
      return jsonResponse(401, errorResponse("", "Unauthorized"));
    }
  }

  // --- Parse request body ---
  let body: GenesysRequest;
  try {
    body = (await request.json()) as GenesysRequest;
  } catch {
    return jsonResponse(
      400,
      errorResponse("", "Invalid JSON body. Expected: { action, params }")
    );
  }

  const { action, params } = body;

  if (!action) {
    return jsonResponse(
      400,
      errorResponse("", "Missing 'action' field.")
    );
  }

  // --- Route to handler ---
  const handler = getHandler(action);

  if (!handler) {
    context.warn(`Unknown action requested: ${action}`);
    return jsonResponse(
      404,
      errorResponse(action, `Unknown action '${action}'.`)
    );
  }

  // --- Execute handler ---
  try {
    context.log(`Executing action: ${action}`, params);
    const result = await handler(params ?? {});
    const response = successResponse(action, result);
    context.log(`Action ${action} completed successfully`);
    return jsonResponse(200, response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    context.error(`Action ${action} failed: ${message}`);
    return jsonResponse(500, errorResponse(action, message));
  }
}

/** Helper to return JSON with correct headers */
function jsonResponse(status: number, body: unknown): HttpResponseInit {
  return {
    status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// --- Register the function ---
app.http("genesys", {
  methods: ["POST"],
  authLevel: "function",
  handler: genesysGateway,
});
