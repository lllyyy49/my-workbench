import { useState, useCallback, useMemo } from 'react';

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface TaggedItem {
  id: string;
  tags: string[];
  [key: string]: any;
}

const TAG_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
  '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#EC4899', '#F43F5E', '#78716C', '#64748B', '#0EA5E9',
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function useTagSystem() {
  const [tags, setTags] = useState<Tag[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('global-tags');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const saveTags = useCallback((newTags: Tag[]) => {
    setTags(newTags);
    localStorage.setItem('global-tags', JSON.stringify(newTags));
  }, []);

  const addTag = useCallback((name: string, color?: string) => {
    const existing = tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;

    const newTag: Tag = {
      id: generateId(),
      name,
      color: color || TAG_COLORS[tags.length % TAG_COLORS.length],
      count: 0,
    };
    saveTags([...tags, newTag]);
    return newTag.id;
  }, [tags, saveTags]);

  const removeTag = useCallback((tagId: string) => {
    saveTags(tags.filter(t => t.id !== tagId));
  }, [tags, saveTags]);

  const renameTag = useCallback((tagId: string, newName: string) => {
    saveTags(tags.map(t => t.id === tagId ? { ...t, name: newName } : t));
  }, [tags, saveTags]);

  const getTagById = useCallback((tagId: string) => {
    return tags.find(t => t.id === tagId);
  }, [tags]);

  const getTagByName = useCallback((name: string) => {
    return tags.find(t => t.name.toLowerCase() === name.toLowerCase());
  }, [tags]);

  const updateTagCounts = useCallback((items: TaggedItem[]) => {
    const tagCountMap: Record<string, number> = {};
    items.forEach(item => {
      item.tags?.forEach(tagId => {
        tagCountMap[tagId] = (tagCountMap[tagId] || 0) + 1;
      });
    });
    const updatedTags = tags.map(t => ({
      ...t,
      count: tagCountMap[t.id] || 0,
    }));
    saveTags(updatedTags);
  }, [tags, saveTags]);

  const filterByTag = useCallback((items: TaggedItem[], tagId: string) => {
    return items.filter(item => item.tags?.includes(tagId));
  }, []);

  const filterByTags = useCallback((items: TaggedItem[], tagIds: string[], mode: 'all' | 'any' = 'any') => {
    if (tagIds.length === 0) return items;
    return items.filter(item => {
      if (mode === 'all') {
        return tagIds.every(tagId => item.tags?.includes(tagId));
      }
      return tagIds.some(tagId => item.tags?.includes(tagId));
    });
  }, []);

  return {
    tags,
    addTag,
    removeTag,
    renameTag,
    getTagById,
    getTagByName,
    updateTagCounts,
    filterByTag,
    filterByTags,
    TAG_COLORS,
  };
}
