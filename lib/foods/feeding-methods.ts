const FEEDING_METHOD_PROFILES = {
  oral: {
    label: "Oral",
    texture:
      "Normal solid foods — no texture modification needed",
    prepGuidance:
      "Prepare as usual. No special texture modification required.",
  },
  "ngt-soft": {
    label: "NGT + Soft",
    texture:
      "Soft, minced, or ground — easy to chew and swallow, no tough fibers, no hard pieces",
    prepGuidance:
      "Cook until tender, then mince or grind finely. Remove any tough skins, seeds, or fibers.",
  },
  "ngt-pureed": {
    label: "NGT + Pureed",
    texture:
      "Smooth, uniform puree — pudding-like consistency, no chunks or lumps, thin enough for tube feeding if needed",
    prepGuidance:
      "Cook until very soft, then blend until completely smooth. Strain if needed. Add broth or water to reach desired consistency.",
  },
} as const;

type FeedingMethodProfile =
  (typeof FEEDING_METHOD_PROFILES)[keyof typeof FEEDING_METHOD_PROFILES];

export function getFeedingMethodProfile(
  method: string,
): FeedingMethodProfile {
  const profile =
    FEEDING_METHOD_PROFILES[
      method as keyof typeof FEEDING_METHOD_PROFILES
    ];
  if (!profile) {
    return FEEDING_METHOD_PROFILES.oral;
  }
  return profile;
}
