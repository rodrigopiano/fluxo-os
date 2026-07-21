"use client";

import { Trash2 } from "lucide-react";
import { deleteTagAction } from "@/lib/actions/categories";
import { TagFormDialog } from "@/components/categorias/tag-form-dialog";
import { Button } from "@/components/ui/button";
import type { Tag } from "@/lib/types";

export function TagList({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
        Nenhuma tag criada ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-1.5 rounded-full border py-1 pl-3 pr-1.5"
          style={{ borderColor: tag.color, color: tag.color }}
        >
          <span className="text-xs font-medium">{tag.name}</span>
          <TagFormDialog tag={tag} />
          <form action={deleteTagAction}>
            <input type="hidden" name="id" value={tag.id} />
            <Button variant="ghost" size="icon" className="size-6" type="submit">
              <Trash2 className="size-3" />
            </Button>
          </form>
        </div>
      ))}
    </div>
  );
}
