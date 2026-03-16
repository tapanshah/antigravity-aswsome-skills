/**
 * entitlements-lib.js — Central plan → entitlements mapping for Residency+.
 *
 * Single source of truth for feature limits and unlocked discovery sources.
 * Server functions should import this helper instead of hardcoding limits.
 */

export const PLAN_FREE = "free";
export const PLAN_RESIDENCY_PLUS = "residency_plus";
/** Core plan name for source entitlements (DB may still use residency_plus). */
export const PLAN_RESIDENCY_PLUS_CORE = "residency_plus_core";

/** All discovery source ids. Used for UI and adapter registry. */
export const SOURCE_IDS = [
  "soundcloud",
  "youtube",
  "internet_archive",
  "bandcamp",
  "vimeo",
  "tiktok",
  "instagram",
  "uploads"
];

/** Base unlocked sources per plan (no add-ons). */
const PLAN_SOURCES = {
  [PLAN_FREE]: ["soundcloud"],
  [PLAN_RESIDENCY_PLUS]: ["soundcloud", "youtube", "internet_archive", "uploads"],
  [PLAN_RESIDENCY_PLUS_CORE]: ["soundcloud", "youtube", "internet_archive", "uploads"]
};

/** Optional source packs: pack id → source ids. */
export const SOURCE_PACKS = {
  social_pack: ["instagram", "tiktok"],
  archive_pack: ["bandcamp", "vimeo"]
};

/** Which plan or pack unlocks each source (for locked-source hints). */
export const SOURCE_UNLOCKED_BY = {
  soundcloud: "free",
  youtube: "Residency+ Core",
  internet_archive: "Residency+ Core",
  uploads: "Residency+ Core",
  instagram: "Social Pack",
  tiktok: "Social Pack",
  bandcamp: "Archive Pack",
  vimeo: "Archive Pack"
};

/**
 * Returns the set of unlocked source ids for a plan and optional add-on packs.
 * @param {string} plan - Plan name (e.g. "free", "residency_plus").
 * @param {string[]} [addons] - Optional pack ids (e.g. ["social_pack", "video_pack"]).
 * @returns {string[]} Unlocked source ids.
 */
export function getUnlockedSources(plan, addons = []) {
  const p = (plan || "").toLowerCase();
  const base = PLAN_SOURCES[p] || PLAN_SOURCES[PLAN_RESIDENCY_PLUS_CORE] || PLAN_SOURCES[PLAN_FREE];
  const set = new Set(base);
  for (const packId of addons) {
    const sources = SOURCE_PACKS[packId];
    if (Array.isArray(sources)) sources.forEach(s => set.add(s));
  }
  return Array.from(set);
}

/**
 * Returns the entitlements object for the given plan.
 * Optionally pass addons (e.g. from future DB) to merge pack sources.
 *
 * All limits are soft upper-bounds enforced on the backend. Frontend may
 * optionally use the same values for UI hints, but the server is canonical.
 * @param {string} plan
 * @param {string[]} [addons]
 */
export function getEntitlementsForPlan(plan, addons = []) {
  const p = (plan || "").toLowerCase();
  const unlockedSources = getUnlockedSources(p, addons);

  if (p === PLAN_RESIDENCY_PLUS || p === PLAN_RESIDENCY_PLUS_CORE) {
    return {
      plan: PLAN_RESIDENCY_PLUS,
      crateLimit: 1000,
      historyLimit: 2000,
      playlistsLimit: 25,
      playlistItemsLimit: 200,
      exportLimit: 1000,
      vibePresetLimit: 50,
      playlistVibeLimit: 9999,
      unlockedSources
    };
  }

  return {
    plan: PLAN_FREE,
    crateLimit: 50,
    historyLimit: 200,
    playlistsLimit: 3,
    playlistItemsLimit: 50,
    exportLimit: 200,
    vibePresetLimit: 5,
    playlistVibeLimit: 3,
    unlockedSources
  };
}

