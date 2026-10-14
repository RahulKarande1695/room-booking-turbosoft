export const SLOT_MS = 15 * 60 * 1000;
export const OPEN = "09:00";
export const CLOSE = "18:00";

export const fail = (status, message) => Object.assign(new Error(message), { status });