import React, { useState } from 'react'
import { Upload, Folder, File, Download, Trash2, Plus } from 'lucide-react'

const CloudModule = () => {
  const [files, setFiles] = useState([
    { 
      id: 1, 
      name: '项目规划.docx', 
      type: 'document', 
      size: '2.4MB', 
      folder: '工作',
      uploadedAt: '2025-10-20',
      url: '#'
    },
    { 
      id: 2, 
      name: '产品原型.png', 
      type: 'image', 
      size: '1.2MB', 
      folder: '设计',
      uploadedAt: '2025-10-19',
      url: '#'
    },
    { 
      id: 3, 
      name: '会议记录.pdf', 
      type: 'document', 
      size: '0.8MB', 
      folder: '工作',
      uploadedAt: '2025-10-18',
      url: '#'
    }
  ])
  const [folders, setFolders] = useState(['工作', '设计', '个人', '学习'])
  const [currentFolder, setCurrentFolder] = useState('all')
  const [showUpload, setShowUpload] = useState(false)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <File className="text-blue-500" />
      case 'document': return <File className="text-green-500" />
      case 'audio': return <File className="text-purple-500" />
      default: return <File className="text-gray-500" />
    }
  }

  const addFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName)) {
      setFolders([...folders, newFolderName])
      setNewFolderName('')
      setShowNewFolder(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // 检查文件大小（200MB限制）
      if (file.size > 200 * 1024 * 1024) {
        alert('文件大小不能超过200MB')
        return
      }
      
      const newFile = {
        id: Date.now(),
        name: file.name,
        type: getFileType(file.type),
        size: formatFileSize(file.size),
        folder: currentFolder === 'all' ? '未分类' : currentFolder,
        uploadedAt: new Date().toISOString().split('T')[0],
        url: '#'
      }
      
      setFiles([...files, newFile])
      setShowUpload(false)
      event.target.value = '' // 重置文件输入
    }
  }

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document'
    return 'other'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const deleteFile = (id) => {
    setFiles(files.filter(file => file.id !== id))
  }

  const filteredFiles = currentFolder === 'all' 
    ? files 
    : files.filter(file => file.folder === currentFolder)

  const totalSize = files.reduce((sum, file) => {
    const size = parseFloat(file.size)
    const unit = file.size.replace(/[0-9.]/g, '')
    const multiplier = unit === 'KB' ? 1024 : unit === 'MB' ? 1024 * 1024 : 1
    return sum + size * multiplier
  }, 0)

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary">{files.length}</div>
          <div className="text-gray-600">文件数量</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{formatFileSize(totalSize)}</div>
          <div className="text-gray-600">总容量</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{folders.length}</div>
          <div className="text-gray-600">文件夹</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">200MB</div>
          <div className="text-gray-600">单文件限制</div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <label className="btn-primary flex items-center space-x-2 cursor-pointer">
            <Upload size={16} />
            <span>上传文件</span>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
          </label>
          
          <button 
            onClick={() => setShowNewFolder(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg"
          >
            <Folder size={16} />
            <span>新建文件夹</span>
          </button>
        </div>

        <div className="text-sm text-gray-600">
          已使用: {formatFileSize(totalSize)} / 5GB
        </div>
      </div>

      {/* 新建文件夹表单 */}
      {showNewFolder && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-lg">新建文件夹</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="文件夹名称"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
            <button onClick={addFolder} className="btn-primary">创建</button>
            <button onClick={() => setShowNewFolder(false)} className="px-4 py-2 border border-gray-300 rounded-lg">取消</button>
          </div>
        </div>
      )}

      {/* 文件夹导航 */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setCurrentFolder('all')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            currentFolder === 'all' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          全部文件
        </button>
        {folders.map(folder => (
          <button
            key={folder}
            onClick={() => setCurrentFolder(folder)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              currentFolder === folder ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            {folder}
          </button>
        ))}
      </div>

      {/* 文件列表 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map(file => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-sm text-gray-500">{file.size} • {file.folder}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{file.uploadedAt}</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {/* 下载功能 */}}
                    className="text-blue-600 hover:text-blue-800"
                    title="下载"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => deleteFile(file.id)}
                    className="text-red-600 hover:text-red-800"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <File size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {currentFolder === 'all' ? '还没有文件' : `${currentFolder}文件夹为空`}
            </h3>
            <p className="text-gray-500">上传你的第一个文件开始使用云盘功能</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CloudModule