import React, { useState } from 'react'
import { Plus, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const TodoModule = () => {
  const [todos, setTodos] = useState([
    { id: 1, title: '完成项目规划', priority: 'high', dueDate: '2025-10-22', completed: false },
    { id: 2, title: '购买办公用品', priority: 'medium', dueDate: '2025-10-25', completed: true },
    { id: 3, title: '学习新技术', priority: 'low', dueDate: '2025-10-30', completed: false }
  ])
  const [showForm, setShowForm] = useState(false)
  const [newTodo, setNewTodo] = useState({ title: '', priority: 'medium', dueDate: '' })

  const addTodo = () => {
    if (newTodo.title.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        ...newTodo, 
        completed: false 
      }])
      setNewTodo({ title: '', priority: 'medium', dueDate: '' })
      setShowForm(false)
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="text-red-500" size={16} />
      case 'medium': return <Clock className="text-yellow-500" size={16} />
      case 'low': return <CheckCircle className="text-green-500" size={16} />
      default: return <Clock className="text-yellow-500" size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {/* 快速操作栏 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>新建待办</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>总计: {todos.length} | 已完成: {todos.filter(t => t.completed).length}</span>
        </div>
      </div>

      {/* 新建待办表单 */}
      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-lg">新建待办</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="待办事项内容"
              value={newTodo.title}
              onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <div className="flex space-x-4">
              <select 
                value={newTodo.priority}
                onChange={(e) => setNewTodo({...newTodo, priority: e.target.value})}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="high">高优先级</option>
                <option value="medium">中优先级</option>
                <option value="low">低优先级</option>
              </select>
              <input
                type="date"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                className="p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex space-x-2">
              <button onClick={addTodo} className="btn-primary">保存</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 待办列表 */}
      <div className="space-y-3">
        {todos.map(todo => (
          <div key={todo.id} className="card flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => toggleTodo(todo.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  todo.completed 
                    ? 'bg-primary border-primary' 
                    : 'border-gray-300'
                }`}
              >
                {todo.completed && <CheckCircle size={14} className="text-white" />}
              </button>
              <div>
                <span className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.title}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {getPriorityIcon(todo.priority)}
                  <span>截止: {todo.dueDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TodoModule