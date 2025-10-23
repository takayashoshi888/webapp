import React, { useState } from 'react'
import { Plus, Folder, Tag, Search, FileText, LogOut } from 'lucide-react'

const NotesModule = () => {
  const [notes, setNotes] = useState([
    { 
      id: 1, 
      title: '项目规划要点', 
      content: '1. 确定项目目标\n2. 制定时间计划\n3. 分配资源', 
      folder: '工作', 
      tags: ['规划', '项目'], 
      createdAt: '2025-10-20',
      updatedAt: '2025-10-20'
    },
    { 
      id: 2, 
      title: '学习笔记', 
      content: 'React Hooks 使用技巧...', 
      folder: '学习', 
      tags: ['React', '前端'], 
      createdAt: '2025-10-19',
      updatedAt: '2025-10-21'
    }
  ])
  const [folders, setFolders] = useState(['工作', '学习', '生活'])
  const [tags, setTags] = useState(['规划', '项目', 'React', '前端'])
  const [activeNote, setActiveNote] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [selectedTag, setSelectedTag] = useState('all')

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('退出失败:', error)
    else window.location.reload()
  }

  const [newNote, setNewNote] = useState({ 
    title: '', 
    content: '', 
    folder: '', 
    tags: [] 
  })

  const addNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const now = new Date().toISOString().split('T')[0]
      setNotes([...notes, { 
        id: Date.now(), 
        ...newNote, 
        createdAt: now,
        updatedAt: now
      }])
      
      // 更新文件夹和标签
      if (newNote.folder && !folders.includes(newNote.folder)) {
        setFolders([...folders, newNote.folder])
      }
      newNote.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          setTags([...tags, tag])
        }
      })
      
      setNewNote({ title: '', content: '', folder: '', tags: [] })
      setActiveNote(null)
    }
  }

  const updateNote = () => {
    if (activeNote && activeNote.title.trim() && activeNote.content.trim()) {
      setNotes(notes.map(note => 
        note.id === activeNote.id 
          ? { ...activeNote, updatedAt: new Date().toISOString().split('T')[0] }
          : note
      ))
      setActiveNote(null)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFolder = selectedFolder === 'all' || note.folder === selectedFolder
    const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag)
    return matchesSearch && matchesFolder && matchesTag
  })

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
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNote({...note})}
              className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${
                activeNote?.id === note.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="font-medium truncate">{note.title}</div>
              <div className="text-sm text-gray-500 truncate mt-1">{note.content}</div>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                <span>{note.folder}</span>
                <span>{note.updatedAt}</span>
              </div>
            </button>
          ))}
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
              createdAt: '',
              updatedAt: ''
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
                </select>
                <input
                  type="text"
                  placeholder="标签（用逗号分隔）"
                  value={activeNote.tags.join(', ')}
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