/**
 * Picker Profile persistence — localStorage.
 *
 * The profile is a handful of small string fields (no images), so
 * localStorage is the right tool and avoids an IndexedDB schema bump.
 * All access is guarded for SSR / private-mode where storage throws.
 */

import type { PickerProfile } from "./fieldRecommendation";

export const PROFILE_KEY = "proof_sleuth_picker_profile";
// Set once the user has either saved or skipped the wizard, so the
// first-run prompt doesn't reappear every visit.
export const PROFILE_PROMPTED_KEY = "proof_sleuth_picker_profile_prompted";

export function getProfile(): PickerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PickerProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: PickerProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    window.localStorage.setItem(PROFILE_PROMPTED_KEY, "true");
  } catch {
    // storage unavailable — profile simply won't persist this session
  }
}

export function hasBeenPrompted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PROFILE_PROMPTED_KEY) === "true";
  } catch {
    return false;
  }
}

export function markPrompted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_PROMPTED_KEY, "true");
  } catch {
    // ignore
  }
}
