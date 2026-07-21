"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  moveCategoryAction,
  deleteCategoryAction,
  moveSubcategoryAction,
  deleteSubcategoryAction,
} from "@/lib/actions/categories";
import { CategoryFormDialog } from "@/components/categorias/category-form-dialog";
import { SubcategoryFormDialog } from "@/components/categorias/subcategory-form-dialog";
import type { Category, CategoryKind, Subcategory } from "@/lib/types";

export function CategoryList({
  kind,
  categories,
  subcategories,
}: {
  kind: CategoryKind;
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const sorted = [...categories].sort((a, b) => a.position - b.position);

  const subcategoriesByCategory = new Map<string, Subcategory[]>();
  for (const s of subcategories) {
    const list = subcategoriesByCategory.get(s.category_id) ?? [];
    list.push(s);
    subcategoriesByCategory.set(s.category_id, list);
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
        Nenhuma categoria por aqui ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((category, index) => {
        const subs = (subcategoriesByCategory.get(category.id) ?? []).sort(
          (a, b) => a.position - b.position,
        );
        const isOpen = expanded.has(category.id);

        return (
          <Card key={category.id}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggle(category.id)}
                  className="shrink-0 text-muted-foreground"
                >
                  {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <p className="min-w-0 flex-1 truncate font-medium">{category.name}</p>
                <div className="flex shrink-0 items-center gap-0.5">
                  <form action={moveCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="direction" value="up" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      type="submit"
                      disabled={index === 0}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                  </form>
                  <form action={moveCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="direction" value="down" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      type="submit"
                      disabled={index === sorted.length - 1}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </form>
                  <CategoryFormDialog kind={kind} category={category} />
                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <Button variant="ghost" size="icon" className="size-7" type="submit">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </form>
                </div>
              </div>

              {isOpen ? (
                <div className="ml-9 flex flex-col gap-1.5 border-l border-border pl-3">
                  {subs.map((sub, subIndex) => (
                    <div key={sub.id} className="flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                        {sub.name}
                      </p>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <form action={moveSubcategoryAction}>
                          <input type="hidden" name="id" value={sub.id} />
                          <input type="hidden" name="direction" value="up" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            type="submit"
                            disabled={subIndex === 0}
                          >
                            <ArrowUp className="size-3" />
                          </Button>
                        </form>
                        <form action={moveSubcategoryAction}>
                          <input type="hidden" name="id" value={sub.id} />
                          <input type="hidden" name="direction" value="down" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            type="submit"
                            disabled={subIndex === subs.length - 1}
                          >
                            <ArrowDown className="size-3" />
                          </Button>
                        </form>
                        <SubcategoryFormDialog categoryId={category.id} subcategory={sub} />
                        <form action={deleteSubcategoryAction}>
                          <input type="hidden" name="id" value={sub.id} />
                          <Button variant="ghost" size="icon" className="size-6" type="submit">
                            <Trash2 className="size-3" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))}
                  <SubcategoryFormDialog categoryId={category.id} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
