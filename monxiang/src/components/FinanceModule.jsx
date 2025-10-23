import React, { useState } from 'react'
import { Plus, TrendingUp, PieChart } from 'lucide-react'
import { FinanceCharts } from './Charts'

const FinanceModule = () => {
  const [records, setRecords] = useState([
    { id: 1, type: 'expense', amount: 45, category: '餐饮', date: '2025-10-21', note: '午餐' },
    { id: 2, type: 'income', amount: 8000, category: '工资', date: '2025-10-20', note: '本月工资' },
    { id: 3, type: 'expense', amount: 120, category: '交通', date: '2025-10-19', note: '地铁卡充值' }
  ])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [newRecord, setNewRecord] = useState({ 
    type: 'expense', 
    amount: '', 
    category: '', 
    date: new Date().toISOString().split('T')[0], 
    note: '' 
  })

  const categories = {
    income: ['工资', '奖金', '投资', '其他收入'],
    expense: ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '其他支出']
  }

  const addRecord = () => {
    if (newRecord.amount && newRecord.category) {
      setRecords([...records, { 
        id: Date.now(), 
        ...newRecord, 
        amount: parseFloat(newRecord.amount) 
      }])
      setNewRecord({ 
        type: 'expense', 
        amount: '', 
        category: '', 
        date: new Date().toISOString().split('T')[0], 
        note: '' 
      })
      setShowForm(false)
    }
  }

  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-green-600 font-bold text-2xl">¥{totalIncome}</div>
          <div className="text-gray-600">总收入</div>
        </div>
        <div className="card text-center">
          <div className="text-red-600 font-bold text-2xl">¥{totalExpense}</div>
          <div className="text-gray-600">总支出</div>
        </div>
        <div className="card text-center">
          <div className={`font-bold text-2xl ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ¥{balance}
          </div>
          <div className="text-gray-600">结余</div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>记录账单</span>
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'list' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            列表
          </button>
          <button 
            onClick={() => setActiveTab('chart')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'chart' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            <TrendingUp size={16} className="inline mr-1" />
            趋势
          </button>
          <button 
            onClick={() => setActiveTab('pie')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'pie' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            <PieChart size={16} className="inline mr-1" />
            分布
          </button>
        </div>
      </div>

      {/* 新建记录表单 */}
      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-lg">记录账单</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">类型</label>
              <select 
                value={newRecord.type}
                onChange={(e) => setNewRecord({...newRecord, type: e.target.value, category: ''})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">金额</label>
              <input
                type="number"
                placeholder="0.00"
                value={newRecord.amount}
                onChange={(e) => setNewRecord({...newRecord, amount: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">分类</label>
              <select 
                value={newRecord.category}
                onChange={(e) => setNewRecord({...newRecord, category: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">选择分类</option>
                {categories[newRecord.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">日期</label>
              <input
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">备注</label>
              <input
                type="text"
                placeholder="备注信息"
                value={newRecord.note}
                onChange={(e) => setNewRecord({...newRecord, note: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={addRecord} className="btn-primary">保存</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg">取消</button>
          </div>
        </div>
      )}

      {/* 内容区域 */}
      {activeTab === 'list' && (
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">最近记录</h3>
          <div className="space-y-3">
            {records.map(record => (
              <div key={record.id} className="flex justify-between items-center p-3 border-b">
                <div>
                  <div className="font-medium">{record.note || record.category}</div>
                  <div className="text-sm text-gray-500">{record.date} • {record.category}</div>
                </div>
                <div className={`font-bold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {record.type === 'income' ? '+' : '-'}¥{record.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chart' && (
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">收支趋势</h3>
          <FinanceCharts financeData={records} />
        </div>
      )}

      {activeTab === 'pie' && (
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">支出分布</h3>
          <FinanceCharts financeData={records} />
        </div>
      )}
    </div>
  )
}

export default FinanceModule