import { useState, useCallback } from "react";
import type { Category, AppData } from "../types";
import { DEFAULT_CATEGORIES } from "../types";

interface UseCategoriesProps {
  data: AppData;
  onSave: (data: AppData) => Promise<void>;
}

export function useCategories({ data, onSave }: UseCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>(
    data.categories?.length ? data.categories : DEFAULT_CATEGORIES
  );

  const addCategory = useCallback(
    async (name: string, color: string) => {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name,
        color,
        isDefault: false,
      };
      const newCategories = [...categories, newCategory];
      setCategories(newCategories);
      await onSave({ ...data, categories: newCategories });
      return newCategory;
    },
    [categories, data, onSave]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const cat = categories.find((c) => c.id === id);
      if (cat?.isDefault) return false;
      const newCategories = categories.filter((c) => c.id !== id);
      setCategories(newCategories);
      await onSave({ ...data, categories: newCategories });
      return true;
    },
    [categories, data, onSave]
  );

  return { categories, addCategory, deleteCategory };
}
