import type { BookingDto, BookingListDto, CreateBookingInput } from "@bookmark/shared";
import { api } from "./client";

export function createBooking(input: CreateBookingInput): Promise<BookingDto> {
  return api<BookingDto>("/bookings", { method: "POST", body: JSON.stringify(input) });
}

export function getBooking(reference: string): Promise<BookingDto> {
  return api<BookingDto>(`/bookings/${encodeURIComponent(reference)}`);
}

export function lookupBookingsByIdNumber(idNumber: string): Promise<BookingListDto> {
  return api<BookingListDto>(`/bookings?idNumber=${encodeURIComponent(idNumber)}`);
}
