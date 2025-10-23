import { useState, useEffect } from 'react'
import { supabase, TABLES } from '../lib/supabase'

// 通用数据操作Hook
export const useSupabase = (tableName, options = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(tableName).select('*')
      
      // 添加排序
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending !== false })
      }
      
      // 添加过滤条件
      if (options.filters) {
        options.filters.forEach(filter => {
          query = query.filter(filter.column, filter.operator, filter.value)
        })
      }

      const { data: result, error: queryError } = await query
      
      if (queryError) throw queryError
      
      setData(result || [])
    } catch (err) {
      setError(err.message)
      console.error(`获取 ${tableName} 数据失败:`, err)
    } finally {
      setLoading(false)
    }
  }

  const insertData = async (newData) => {
    try {
      const { data: result, error: insertError } = await supabase
        .from(tableName)
        .insert([{ ...newData, created_at: new Date().toISOString() }])
        .select()
      
      if (insertError) throw insertError
      
      if (result && result[0]) {
        setData(prev => [...prev, result[0]])
        return result[0]
      }
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateData = async (id, updates) => {
    try {
      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      
      if (updateError) throw updateError
      
      if (result && result[0]) {
        setData(prev => prev.map(item => item.id === id ? result[0] : item))
        return result[0]
      }
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteData = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      setData(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchData()
  }, [tableName, JSON.stringify(options)])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    insert: insertData,
    update: updateData,
    remove: deleteData
  }
}

// 用户特定的Hook
export const useUserData = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return user
}