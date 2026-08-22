import { postApiResponse } from "@/lib/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export function isValidEmail(email: string) {
  return EMAIL_REGEX.test(normalizeEmail(email));
}

export function submitFeedback(userEmail: string, subject: string, message: string) {
  return postApiResponse<void>("/api/common/feedback", {
    appName: "lifestep",
    userName: "",
    userEmail: normalizeEmail(userEmail),
    subject,
    message,
  });
}
