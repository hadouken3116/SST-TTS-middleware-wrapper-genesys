import { GenesysResponse, HandlerResult } from "../types";

/** Wrap a successful handler result in the standard envelope */
export function successResponse(
  action: string,
  handlerResult: HandlerResult
): GenesysResponse {
  return {
    success: true,
    action,
    result: handlerResult.result,
    data: handlerResult.data ?? null,
    errorMessage: "",
  };
}

/** Wrap an error in the standard envelope */
export function errorResponse(
  action: string,
  message: string
): GenesysResponse {
  return {
    success: false,
    action,
    result: "",
    data: null,
    errorMessage: message,
  };
}
