import { randomUUID } from "crypto";
import { ActionHandler, HandlerResult } from "../types";

/**
 * BookAppointment — reserve an appointment slot.
 *
 * Param mapping:
 *   PARAM1 → customerId
 *   PARAM2 → date
 *   PARAM3 → time (optional, defaults to 10:00 AM)
 *
 * Replace mock logic with your actual scheduling API.
 */
export const bookAppointment: ActionHandler = async (
  params
): Promise<HandlerResult> => {
  const customerId = params.param1;
  const date = params.param2;
  const time = params.param3;

  if (!customerId || !date) {
    throw new Error("Missing required params: PARAM1 (customerId), PARAM2 (date)");
  }

  // ----- Replace with real scheduling API call -----
  // const res = await fetch(`${process.env.CRM_BASE_URL}/appointments`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ customerId, date, time }),
  // });
  // const booking = await res.json();
  // ---------------------------------------------------

  const booking = {
    confirmationId: `APT-${randomUUID()}`,
    customerId,
    date,
    time: time || "10:00 AM",
  };

  return {
    result: `Appointment booked for ${booking.date} at ${booking.time}. Your confirmation number is ${booking.confirmationId}.`,
    data: booking,
  };
};
