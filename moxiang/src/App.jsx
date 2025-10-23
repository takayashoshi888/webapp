import React, { useState, useEffect } from 'react'
import { Calendar, DollarSign, Target, FileText, Cloud, Menu, X, User, LogOut, Shield } from 'lucide-react'
import FinanceModule from './components/FinanceModule'
import TodoModule from './components/TodoModule'
import GoalsModule from './components/GoalsModule'
import NotesModule from './components/NotesModule'
import CloudModule from './components/CloudModule'
import Auth from './components/Auth'
import { useUserData } from './hooks/useSupabase'
import { supabase } from './lib/supabase'

const modules = [
  { id: 'finance', name: '财务统计', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  { id: 'todo', name: '日程待办', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'goals', name: '目标管理', icon: Target, color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: 'notes', name: '随心记', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'cloud', name: '个人云盘', icon: Cloud, color: 'text-gray-600', bg: 'bg-gray-100' }
]

function App() {
  const [activeModule, setActiveModule] = useState('todo')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const currentUser = useUserData()

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    }
  }, [currentUser])

  const handleAuthSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (error) {
      console.error('退出登录失败:', error.message)
    }
  }

  const renderModule = () => {
    if (!user) {
      return <Auth onAuthSuccess={handleAuthSuccess} />
    }

    switch (activeModule) {
      case 'finance': return <FinanceModule user={user} />
      case 'todo': return <TodoModule user={user} />
      case 'goals': return <GoalsModule user={user} />
      case 'notes': return <NotesModule user={user} />
      case 'cloud': return <CloudModule user={user} />
      default: return <TodoModule user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 移动端侧边栏按钮 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="flex">
        {/* 侧边栏 */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                梦想管理
              </h1>
            </div>
            
            {/* 用户信息 */}
            {user && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{user.user_metadata?.username || user.email}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 flex items-center text-sm text-gray-600 hover:text-red-600 w-full p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} className="mr-2" />
                  <span>退出登录</span>
                </button>
              </div>
            )}
            
            <nav className="flex-1">
              {user ? (
                <div className="space-y-1">
                  {modules.map((module) => {
                    const Icon = module.icon
                    return (
                      <button
                        key={module.id}
                        onClick={() => {
                          setActiveModule(module.id)
                          setSidebarOpen(false)
                        }}
                        className={`
                          w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                          ${activeModule === module.id 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <div className={`
                          p-2 rounded-lg
                          ${activeModule === module.id 
                            ? 'bg-white bg-opacity-20' 
                            : `${module.bg} ${module.color}`
                          }
                        `}>
                          <Icon size={20} />
                        </div>
                        <span className="font-medium">{module.name}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="bg-gray-100 rounded-xl p-4 inline-block">
                    <Shield className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2">请先登录以使用功能模块</p>
                  </div>
                </div>
              )}
            </nav>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                © 2023 梦想管理 v1.0
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 lg:ml-0 min-h-screen">
          <main className="p-4 md:p-6">
            {/* 模块标题 */}
            <div className="mb-6">
              {modules
                .filter(m => m.id === activeModule)
                .map((module) => {
                  const Icon = module.icon
                  return (
                    <div key={module.id} className="flex items-center space-x-4">
                      <div className={`
                        p-3 rounded-xl shadow-sm
                        ${module.bg}
                      `}>
                        <Icon className={module.color} size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{module.name}</h2>
                        <p className="text-sm text-gray-500">
                          {module.id === 'finance' && '管理您的财务状况和收支记录'}
                          {module.id === 'todo' && '安排日常任务和重要事项'}
                          {module.id === 'goals' && '设定并追踪您的目标进度'}
                          {module.id === 'notes' && '记录想法和重要信息'}
                          {module.id === 'cloud' && '存储和管理您的个人文件'}
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* 模块内容 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              {renderModule()}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App