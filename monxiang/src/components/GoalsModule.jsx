import React, { useState } from 'react'
import { Plus, Target, CheckCircle, Clock } from 'lucide-react'

const GoalsModule = () => {
  const [goals, setGoals] = useState([
    { 
      id: 1, 
      title: '减重5斤', 
      type: 'short', 
      dueDate: '2025-12-31', 
      progress: 40,
      relatedTodos: [1, 3],
      completed: false 
    },
    { 
      id: 2, 
      title: '读完2本书', 
      type: 'short', 
      dueDate: '2025-11-30', 
      progress: 50,
      relatedTodos: [2],
      completed: false 
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    type: 'short', 
    dueDate: '', 
    progress: 0 
  })

  const addGoal = () => {
    if (newGoal.title.trim() && newGoal.dueDate) {
      setGoals([...goals, { 
        id: Date.now(), 
        ...newGoal, 
        relatedTodos: [],
        completed: false 
      }])
      setNewGoal({ title: '', type: 'short', dueDate: '', progress: 0 })
      setShowForm(false)
    }
  }

  const updateProgress = (id, progress) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, progress: Math.min(100, Math.max(0, progress)) } : goal
    ))
  }

  return (
    <div className="space-y-6">
      {/* 快速操作栏 */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>设定目标</span>
        </button>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Target size={16} />
          <span>进行中: {goals.filter(g => !g.completed).length} | 已完成: {goals.filter(g => g.completed).length}</span>
        </div>
      </div>

      {/* 新建目标表单 */}
      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-lg">设定新目标</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="目标名称（如：减重5斤）"
              value={newGoal.title}
              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <select 
                value={newGoal.type}
                onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="short">短期目标</option>
                <option value="long">长期目标</option>
              </select>
              <input
                type="date"
                value={newGoal.dueDate}
                onChange={(e) => setNewGoal({...newGoal, dueDate: e.target.value})}
                className="p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex space-x-2">
              <button onClick={addGoal} className="btn-primary">保存</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 目标列表 */}
      <div className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{goal.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <Clock size={14} />
                  <span>截止: {goal.dueDate}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    goal.type === 'short' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {goal.type === 'short' ? '短期' : '长期'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{goal.progress}%</div>
                <div className="text-sm text-gray-500">完成度</div>
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* 进度控制 */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button 
                  onClick={() => updateProgress(goal.id, goal.progress - 10)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  disabled={goal.progress <= 0}
                >
                  -10%
                </button>
                <button 
                  onClick={() => updateProgress(goal.id, goal.progress + 10)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  disabled={goal.progress >= 100}
                >
                  +10%
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                关联任务: {goal.relatedTodos.length} 个
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {goals.length === 0 && (
        <div className="card text-center py-12">
          <Target size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">还没有设定目标</h3>
          <p className="text-gray-500 mb-4">设定你的第一个目标，开始追踪进度吧</p>
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            设定目标
          </button>
        </div>
      )}
    </div>
  )
}

export default GoalsModule