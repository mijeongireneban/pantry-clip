"use client";

import { useState } from "react";

import { getRecipeThumbnailCandidates } from "@/src/apps/recipes/ui.helpers";
import type { RecipeItem } from "@/src/apps/recipes/ui.types";
import { ImgPlaceholder } from "@/src/apps/recipes/components/shared";

export function RecipeThumbnail({
  recipe,
  alt,
  className
}: {
  recipe: Pick<RecipeItem, "sourceType" | "sourceUrl">;
  alt: string;
  className?: string;
}) {
  const candidates = getRecipeThumbnailCandidates(recipe);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const src = candidates[candidateIndex];

  if (!src) {
    return <ImgPlaceholder className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        setCandidateIndex((current) => current + 1);
      }}
    />
  );
}
