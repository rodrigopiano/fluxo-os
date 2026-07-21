"use client";

import type { Tag } from "@/lib/types";

export function TagToggleList({
  tags,
  value,
  onChange,
}: {
  tags: Tag[];
  value: string[];
  onChange: (tagIds: string[]) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = value.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() =>
              onChange(active ? value.filter((id) => id !== tag.id) : [...value, tag.id])
            }
            className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
            style={
              active
                ? { backgroundColor: tag.color, borderColor: tag.color, color: "#fff" }
                : { borderColor: tag.color, color: tag.color }
            }
          >
            {tag.name}
          </button>
        );
      })}
      {value.map((id) => (
        <input key={id} type="hidden" name="tagIds" value={id} />
      ))}
    </div>
  );
}
