# Genesys Cloud Setup Guide

## 1. Create the Web Services Data Actions Integration

1. Go to **Admin → Integrations → + Add Integration**
2. Search for **Web Services Data Actions**
3. Name it (e.g. "Azure Gateway Integration")
4. Under **Credentials**, add a credential field:
   - Field name: `apiKey`
   - Value: your Azure Function API key
5. Set integration to **Active**

## 2. Import the Data Action

1. Go to **Admin → Integrations → Actions**
2. Click **Import** and select `data-action.json` from this folder
3. Associate it with the integration you created in step 1
4. Update the `requestUrlTemplate` to your actual Azure Function URL:
   ```
   https://YOUR_FUNCTION_APP.azurewebsites.net/api/genesys
   ```
5. **Test** the action:
   - ACTION: `GetHours`
   - PARAM1: `support`
   - PARAM2: *(empty)*
   - PARAM3: *(empty)*
6. Verify you get a success response, then **Publish** the action

## 3. Use in Architect Bot Flow

### Call Data Action setup:

1. Drag **Call Data Action** into your bot flow task
2. Category: **Web Services Data Actions**
3. Data Action: **Genesys Azure Gateway**
4. Map inputs:
   | Input  | Value |
   |--------|-------|
   | ACTION | `"GetCustomer"` (hardcoded string or flow variable) |
   | PARAM1 | `Flow.CustomerId` (or whatever your variable is) |
   | PARAM2 | *(optional)* |
   | PARAM3 | *(optional)* |

5. Map Success Outputs:
   | Output       | Variable              |
   |--------------|-----------------------|
   | success      | `Flow.ApiSuccess`     |
   | result       | `Flow.ApiResult`      |
   | errorMessage | `Flow.ApiError`       |

### Use the result:

After the Call Data Action, use `Flow.ApiResult` in:
- **Send Response** → speak the result to the caller
- **Decision** → branch based on `Flow.ApiSuccess`
- **Update Data** → store for later use

### Error handling:

Always configure all three paths:
- **Success** → use `Flow.ApiResult`
- **Failure** → play fallback message or transfer to agent
- **Timeout** → retry with Loop (max 2-3 attempts) or transfer

## 4. Param Mapping Per Action

| Action          | PARAM1       | PARAM2 | PARAM3     |
|-----------------|-------------|--------|------------|
| GetCustomer     | customerId  | phone  | —          |
| CheckBalance    | customerId  | —      | —          |
| BookAppointment | customerId  | date   | time       |
| GetHours        | department  | —      | —          |

In each case, the param names map to the keys in the `params` object
that the Azure Function receives:
- PARAM1 → `params.param1` (renamed in the handler if needed)

> **Tip:** If you need more than 3 params, add PARAM4/PARAM5 to
> the input contract and request template — or pass a JSON string
> in PARAM1 and parse it server-side.
