import { supabase } from '../lib/supabase'

// 文件上传工具函数
export const uploadFile = async (file, folder = 'uploads') => {
  try {
    // 检查文件大小（200MB限制）
    if (file.size > 200 * 1024 * 1024) {
      throw new Error('文件大小不能超过200MB')
    }

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // 上传文件到Supabase Storage
    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, file)

    if (error) throw error

    // 获取文件公开URL
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath)

    return {
      success: true,
      filePath: data.path,
      publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    }

  } catch (error) {
    console.error('文件上传失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 文件下载函数
export const downloadFile = async (filePath, fileName) => {
  try {
    const { data, error } = await supabase.storage
      .from('files')
      .download(filePath)

    if (error) throw error

    // 创建下载链接
    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true }

  } catch (error) {
    console.error('文件下载失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 删除文件函数
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('files')
      .remove([filePath])

    if (error) throw error

    return { success: true }

  } catch (error) {
    console.error('文件删除失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取文件列表
export const listFiles = async (folder = 'uploads') => {
  try {
    const { data, error } = await supabase.storage
      .from('files')
      .list(folder)

    if (error) throw error

    return {
      success: true,
      files: data || []
    }

  } catch (error) {
    console.error('获取文件列表失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 文件类型检查
export const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation'
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive'
  return 'other'
}

// 文件大小格式化
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 图片预览函数
export const previewImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}