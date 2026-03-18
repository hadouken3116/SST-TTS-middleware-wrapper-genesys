# CLAUDE.md — Genesys Azure Gateway

## Project Overview

Azure Function (TypeScript/Node 20) that acts as a single middleware gateway between **Genesys Cloud** bot flows and backend CRM/scheduling services. Genesys sends all requests to one endpoint; an `action` field in the body routes to the correct handler.

## Commands

```bash
npm run build      # Compile TypeScript → dist/
npm run watch      # Watch mode
npm run clean      # Remove dist/
npm start          # Clean, build, then run locally via Azure Functions Core Tools
npm test           # Run Jest tests
```

> Requires [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) for `npm start`.

## Architecture

```
POST /api/genesys
      │
      ▼
src/functions/genesys.ts        ← Azure Function trigger, auth, routing
      │
      ▼
src/handlers/index.ts           ← Handler registry (case-insensitive lookup)
      │
      ├── getCustomer.ts        ← action: "GetCustomer"
      ├── checkBalance.ts       ← action: "CheckBalance"
      ├── bookAppointment.ts    ← action: "BookAppointment"
      └── getHours.ts           ← action: "GetHours"

src/types/index.ts              ← Shared interfaces (GenesysRequest, GenesysResponse, ActionHandler)
src/utils/response.ts           ← successResponse() / errorResponse() envelope helpers
genesys/data-action.json        ← Import into Genesys Cloud Admin → Integrations
```

## Request / Response Contract

**Request** (Genesys → this function):
```json
{ "action": "GetCustomer", "params": { "param1": "CID-123", "param2": "", "param3": "" } }
```

**Response** (this function → Genesys):
```json
{ "success": true, "action": "GetCustomer", "result": "Customer Jane Doe found...", "data": {...}, "errorMessage": "" }
```

Only `result` is read aloud by the Genesys bot. `data` carries structured fields for variable mapping.

## Adding a New Action

1. Create `src/handlers/myAction.ts` implementing `ActionHandler`:
   ```typescript
   import { ActionHandler, HandlerResult } from "../types";
   export const myAction: ActionHandler = async (params): Promise<HandlerResult> => {
     // params.param1, params.param2, params.param3
     return { result: "Human-readable string for the bot.", data: {} };
   };
   ```
2. Register it in `src/handlers/index.ts`:
   ```typescript
   import { myAction } from "./myAction";
   const handlers = { ..., MyAction: myAction };
   ```
3. No changes needed anywhere else.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `API_KEY` | Recommended | Validates `x-api-key` request header. Skip to disable auth. |
| `CRM_BASE_URL` | When implemented | Base URL for your CRM/backend API |
| `CRM_API_KEY` | When implemented | API key for your CRM/backend API |

Local development: copy `local.settings.json` and fill in values. **Never commit real secrets.**

Production: set via Azure Function App → Configuration → Application Settings (or Azure Key Vault references).

## Authentication

API key must be passed as a **request header only**:
```
x-api-key: <your-api-key>
```
Query parameters are not accepted (they appear in logs).

## CI/CD

`.github/workflows/deploy.yml` triggers on push to `main`. Required GitHub secrets:

| Secret | Value |
|---|---|
| `AZURE_FUNCTIONAPP_NAME` | Your Azure Function App name |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | Download from Azure Portal → Function App → Get publish profile |

## Known Limitations / TODOs

- All handlers currently return **mock data**. Replace the commented-out API calls in each handler with real CRM/scheduling API calls before production.
- No unit tests yet (`jest` is installed; `npm test` passes with zero tests).
- No rate limiting — consider Azure API Management in front of this function for throttling.
