# Genesys Cloud ↔ Azure Function Gateway

A single Azure Function endpoint that serves as a **unified gateway** for Genesys Cloud bot flows. Instead of creating separate data actions for every API call, Genesys sends an `action` name and parameters to one endpoint, which routes to the correct handler.

## Why This Architecture?

| Traditional approach | This gateway approach |
|---|---|
| 1 Genesys data action per API endpoint | **1 data action** for everything |
| N output contracts to maintain | **1 output contract** (standardized envelope) |
| URL changes = edit each action | URL changes = edit one action |
| Adding endpoints = Genesys admin work | Adding endpoints = **just deploy a new handler** |

## Quick Start

```bash
# Install dependencies
npm install

# Configure local settings
cp local.settings.json.example local.settings.json
# Edit local.settings.json with your values

# Build & run locally
npm start

# Test it
curl -X POST http://localhost:7071/api/genesys \
  -H "Content-Type: application/json" \
  -d '{"action": "GetHours", "params": {"param1": "support"}}'
```

## Response Envelope

Every action returns the same shape:

```json
{
  "success": true,
  "action": "GetCustomer",
  "result": "Customer Jane Doe found. Account tier: Gold.",
  "data": { "id": "123", "name": "Jane Doe", "accountTier": "Gold" },
  "errorMessage": ""
}
```

In Genesys, you only need to map `result` (string) to a flow variable — that's the text the bot speaks or uses in decisions.

## Available Actions

| Action | PARAM1 | PARAM2 | PARAM3 | Description |
|--------|--------|--------|--------|-------------|
| `GetCustomer` | customerId | phone | — | CRM customer lookup |
| `CheckBalance` | customerId | — | — | Account balance check |
| `BookAppointment` | customerId | date | time | Schedule appointment |
| `GetHours` | department | — | — | Business hours info |

## Adding a New Action

1. Create `src/handlers/yourAction.ts`:

```typescript
import { ActionHandler, HandlerResult } from "../types";

export const yourAction: ActionHandler = async (params): Promise<HandlerResult> => {
  const someInput = params.param1;
  // ... your logic, API calls, etc.
  return {
    result: "Human-readable response for the bot",
    data: { /* optional structured data */ },
  };
};
```

2. Register it in `src/handlers/index.ts`:

```typescript
import { yourAction } from "./yourAction";

const handlers: Record<string, ActionHandler> = {
  // ... existing handlers
  YourAction: yourAction,
};
```

3. Deploy. **No Genesys-side changes needed.**

## Genesys Cloud Setup

See [`genesys/README.md`](./genesys/README.md) for:
- Integration setup
- Data action import (`genesys/data-action.json`)
- Architect bot flow configuration

## Deployment

### Azure CLI

```bash
# Build
npm run build

# Create function app (first time only)
az functionapp create \
  --resource-group your-rg \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --name your-genesys-gateway \
  --storage-account yourstorageacct

# Deploy
func azure functionapp publish your-genesys-gateway

# Set environment variables
az functionapp config appsettings set \
  --name your-genesys-gateway \
  --resource-group your-rg \
  --settings API_KEY=your-key CRM_BASE_URL=https://your-crm.com
```

### GitHub Actions (CI/CD)

A workflow is included at `.github/workflows/deploy.yml` — set these repo secrets:
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
- `API_KEY`
- `CRM_BASE_URL`

## Project Structure

```
genesys-az-gateway/
├── src/
│   ├── functions/
│   │   └── genesys.ts          # HTTP trigger (single entry point)
│   ├── handlers/
│   │   ├── index.ts            # Handler registry
│   │   ├── getCustomer.ts      # CRM lookup
│   │   ├── checkBalance.ts     # Balance check
│   │   ├── bookAppointment.ts  # Appointment booking
│   │   └── getHours.ts         # Business hours
│   ├── types/
│   │   └── index.ts            # Shared interfaces
│   └── utils/
│       └── response.ts         # Envelope builder
├── genesys/
│   ├── data-action.json        # Importable Genesys data action
│   └── README.md               # Genesys setup guide
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── host.json
├── local.settings.json
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
