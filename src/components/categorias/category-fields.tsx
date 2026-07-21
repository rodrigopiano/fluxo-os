"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, CategoryKind, Subcategory } from "@/lib/types";

const NONE = "__none__";

export function CategoryFieldSelect({
  id,
  categories,
  kind,
  value,
  onChange,
}: {
  id?: string;
  categories: Category[];
  kind: CategoryKind;
  value: string | null;
  onChange: (categoryId: string | null) => void;
}) {
  const options = categories.filter((c) => c.kind === kind);

  return (
    <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : v)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Selecione" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Sem categoria</SelectItem>
        {options.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SubcategoryFieldSelect({
  id,
  subcategories,
  categoryId,
  value,
  onChange,
}: {
  id?: string;
  subcategories: Subcategory[];
  categoryId: string | null;
  value: string | null;
  onChange: (subcategoryId: string | null) => void;
}) {
  const options = subcategories.filter((s) => s.category_id === categoryId);

  return (
    <Select
      value={value ?? NONE}
      onValueChange={(v) => onChange(v === NONE ? null : v)}
      disabled={!categoryId || options.length === 0}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Nenhuma" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Nenhuma</SelectItem>
        {options.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
