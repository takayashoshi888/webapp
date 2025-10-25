import React, { useState, useEffect } from 'react'
import { Plus, Folder, Tag, Search, FileText, LogOut } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import { useUserData } from '../hooks/useSupabase'

const NotesModule = () => {
  const user = useUserData()
  const [notes, setNotes] = useState([])
  const [folders, setFolders] = useState([])
  const [tags, setTags] = useState([])
  const [activeNote, setActiveNote] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [selectedTag, setSelectedTag] = useState('all')
  const [loading, setLoading] = useState(true)

  // 获取笔记数据
  useEffect(() => {
    if (user) {
      fetchNotes()
      fetchFoldersAndTags()
    }
  }, [user])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.NOTES)
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      
      setNotes(data || [])
    } catch (error) {
      console.error('获取笔记失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFoldersAndTags = async () => {
    try {
      // 获取用户的所有笔记以提取文件夹和标签
      const { data, error } = await supabase
        .from(TABLES.NOTES)
        .select('folder, tags')
        .eq('user_id', user.id)
      
      if (error) throw error
      
      // 提取唯一的文件夹
      const allFolders = data.map(note => note.folder).filter(folder => folder)
      const uniqueFolders = [...new Set(allFolders)]
      setFolders(uniqueFolders)
      
      // 提取唯一的标签
      const allTags = data.flatMap(note => note.tags || [])
      const uniqueTags = [...new Set(allTags)]
      setTags(uniqueTags)
    } catch (error) {
      console.error('获取文件夹和标签失败:', error)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('退出失败:', error)
    else window.location.reload()
  }

  const addNote = async () => {
    if (activeNote && activeNote.title.trim() && activeNote.content.trim()) {
      try {
        const newNoteData = {
          user_id: user.id,
          title: activeNote.title,
          content: activeNote.content,
          folder: activeNote.folder || '',
          tags: activeNote.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from(TABLES.NOTES)
          .insert([newNoteData])
          .select()
        
        if (error) throw error
        
        if (data && data[0]) {
          setNotes(prev => [data[0], ...prev])
          // 更新文件夹和标签
          if (data[0].folder && !folders.includes(data[0].folder)) {
            setFolders(prev => [...prev, data[0].folder])
          }
          data[0].tags.forEach(tag => {
            if (tag && !tags.includes(tag)) {
              setTags(prev => [...prev, tag])
            }
          })
        }
        
        setActiveNote(null)
      } catch (error) {
        console.error('创建笔记失败:', error)
      }
    }
  }

  const updateNote = async () => {
    if (activeNote && activeNote.id && activeNote.title.trim() && activeNote.content.trim()) {
      try {
        const updatedNoteData = {
          title: activeNote.title,
          content: activeNote.content,
          folder: activeNote.folder || '',
          tags: activeNote.tags || [],
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from(TABLES.NOTES)
          .update(updatedNoteData)
          .eq('id', activeNote.id)
          .eq('user_id', user.id)
          .select()
        
        if (error) throw error
        
        if (data && data[0]) {
          setNotes(prev => prev.map(note => 
            note.id === activeNote.id ? data[0] : note
          ))
          // 更新文件夹和标签
          if (data[0].folder && !folders.includes(data[0].folder)) {
            setFolders(prev => [...prev, data[0].folder])
          }
          data[0].tags.forEach(tag => {
            if (tag && !tags.includes(tag)) {
              setTags(prev => [...prev, tag])
            }
          })
        }
        
        setActiveNote(null)
      } catch (error) {
        console.error('更新笔记失败:', error)
      }
    }
  }

  const deleteNote = async (noteId) => {
    try {
      const { error } = await supabase
        .from(TABLES.NOTES)
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      setNotes(prev => prev.filter(note => note.id !== noteId))
      if (activeNote && activeNote.id === noteId) {
        setActiveNote(null)
      }
    } catch (error) {
      console.error('删除笔记失败:', error)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFolder = selectedFolder === 'all' || note.folder === selectedFolder
    const matchesTag = selectedTag === 'all' || (note.tags && note.tags.includes(selectedTag))
    return matchesSearch && matchesFolder && matchesTag
  })

  if (!user) {
    return (
      <div className="card h-full flex items-center justify-center">
        <p>请先登录以使用笔记功能</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* 侧边栏 */}
      <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 mr-6">
        <div className="p-4 border-b">
          {/* 搜索框 */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索笔记..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* 文件夹筛选 */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 mb-2">
              <Folder size={16} />
              <span>文件夹</span>
            </div>
            <select 
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">全部文件夹</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>

          {/* 标签筛选 */}
          <div>
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 mb-2">
              <Tag size={16} />
              <span>标签</span>
            </div>
            <select 
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">全部标签</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 笔记列表 */}
        <div className="overflow-y-auto h-[calc(100%-140px)]">
          {loading ? (
            <div className="p-4 text-center">加载中...</div>
          ) : (
            filteredNotes.map(note => (
              <div key={note.id} className="relative">
                <button
                  onClick={() => setActiveNote({...note})}
                  className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${
                    activeNote?.id === note.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="font-medium truncate">{note.title}</div>
                  <div className="text-sm text-gray-500 truncate mt-1">{note.content.substring(0, 50)}...</div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <span>{note.folder}</span>
                    <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNote(note.id)
                  }}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs"
                >
                  删除
                </button>
              </div>
            ))
          )}
        </div>

        {/* 新建笔记按钮 */}
        <div className="p-4 border-t space-y-2">
          <button 
            onClick={() => setActiveNote({ 
              id: null, 
              title: '', 
              content: '', 
              folder: folders[0] || '', 
              tags: [],
              created_at: '',
              updated_at: ''
            })}
            className="w-full bg-[#3A86FF] hover:bg-[#3A86FF]/90 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>新建笔记</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
          >
            <LogOut size={16} />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1">
        {activeNote ? (
          <div className="card h-full flex flex-col">
            <div className="flex-1">
              <input
                type="text"
                placeholder="笔记标题"
                value={activeNote.title}
                onChange={(e) => setActiveNote({...activeNote, title: e.target.value})}
                className="w-full text-2xl font-bold border-none outline-none mb-4"
              />
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select 
                  value={activeNote.folder}
                  onChange={(e) => setActiveNote({...activeNote, folder: e.target.value})}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">选择文件夹</option>
                  {folders.map(folder => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                  <option value="">无文件夹</option>
                </select>
                <input
                  type="text"
                  placeholder="标签（用逗号分隔）"
                  value={activeNote.tags ? activeNote.tags.join(', ') : ''}
                  onChange={(e) => setActiveNote({...activeNote, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <textarea
                placeholder="开始写作..."
                value={activeNote.content}
                onChange={(e) => setActiveNote({...activeNote, content: e.target.value})}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none"
              />
            </div>
            
            <div className="flex space-x-2 pt-4 border-t">
              <button 
                onClick={activeNote.id ? updateNote : addNote}
                className="btn-primary"
                disabled={!activeNote.title.trim() || !activeNote.content.trim()}
              >
                {activeNote.id ? '保存' : '创建'}
              </button>
              <button 
                onClick={() => setActiveNote(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="card h-full flex items-center justify-center text-center">
            <div>
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">选择或创建笔记</h3>
              <p className="text-gray-500">点击左侧笔记开始编辑，或创建新笔记</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesModule