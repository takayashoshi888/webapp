import React from 'react'

const Loading = ({ size = 'medium', text = '加载中...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin mb-4`}></div>
      <p className="text-gray-600">{text}</p>
    </div>
  )
}

export default Loading

// 页面级加载组件
export const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading size="large" text="页面加载中..." />
  </div>
)

// 按钮加载状态
export const ButtonLoading = ({ size = 'small' }) => (
  <div className={`${size === 'small' ? 'w-4 h-4' : 'w-6 h-6'} border-2 border-white border-t-transparent rounded-full animate-spin`} />
)