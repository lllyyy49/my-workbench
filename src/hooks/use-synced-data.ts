import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// 用户 ID（固定为 li2024，因为这是个人应用）
const USER_ID = 'li2024';

/**
 * 通用的云同步数据 Hook
 * @param tableName 表名
 * @param storageKey localStorage key（用于降级）
 */
export function useSyncedData<T>(tableName: string, storageKey: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从云端加载数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: items, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (items) {
        setData(items as T[]);
        // 同步到 localStorage 作为缓存
        localStorage.setItem(storageKey, JSON.stringify(items));
      }
    } catch (err) {
      console.error(`加载${tableName}失败:`, err);
      setError(err instanceof Error ? err.message : '加载失败');
      // 降级到 localStorage
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setData(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  }, [tableName, storageKey]);

  // 添加数据
  const addItem = useCallback(async (item: Omit<T, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newItem = {
        ...item,
        user_id: USER_ID,
      };

      const { data, error } = await supabase
        .from(tableName)
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      setData(prev => [data as T, ...prev]);
      return data;
    } catch (err) {
      console.error(`添加${tableName}失败:`, err);
      throw err;
    }
  }, [tableName]);

  // 更新数据
  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setData(prev => prev.map(item => (item as any).id === id ? data as T : item));
      return data;
    } catch (err) {
      console.error(`更新${tableName}失败:`, err);
      throw err;
    }
  }, [tableName]);

  // 删除数据
  const deleteItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData(prev => prev.filter(item => (item as any).id !== id));
    } catch (err) {
      console.error(`删除${tableName}失败:`, err);
      throw err;
    }
  }, [tableName]);

  // 批量删除
  const deleteItems = useCallback(async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', ids);

      if (error) throw error;

      setData(prev => prev.filter(item => !ids.includes((item as any).id)));
    } catch (err) {
      console.error(`批量删除${tableName}失败:`, err);
      throw err;
    }
  }, [tableName]);

  // 批量同步（替换所有数据）
  const sync = useCallback(async (items: T[]) => {
    try {
      // 先删除所有数据
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('user_id', USER_ID);

      if (deleteError) throw deleteError;

      // 插入新数据
      if (items.length > 0) {
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(
            items.map(item => ({
              ...item,
              user_id: USER_ID,
            }))
          );

        if (insertError) throw insertError;
      }

      setData(items);
    } catch (err) {
      console.error(`同步${tableName}失败:`, err);
      throw err;
    }
  }, [tableName]);

  // 初始加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    deleteItems,
    sync,
    refresh: loadData,
  };
}
