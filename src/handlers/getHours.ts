import { ActionHandler, HandlerResult } from "../types";

/**
 * GetHours — return business hours for a department.
 *
 * Param mapping:
 *   PARAM1 → department (optional, defaults to "support")
 *
 * Replace with your actual business hours source.
 */
export const getHours: ActionHandler = async (
  params
): Promise<HandlerResult> => {
  const department = params.param1;

  const hours: Record<string, { open: string; close: string; days: string }> = {
    sales: { open: "8:00 AM", close: "6:00 PM", days: "Monday to Friday" },
    support: { open: "24/7", close: "24/7", days: "Every day" },
    billing: { open: "9:00 AM", close: "5:00 PM", days: "Monday to Friday" },
  };

  const key = (department || "support").toLowerCase();
  const info = hours[key] ?? hours["support"];

  return {
    result: `Our ${key} department is available ${info.days}, ${info.open === "24/7" ? "24 hours a day" : `from ${info.open} to ${info.close}`}.`,
    data: { department: key, ...info },
  };
};
