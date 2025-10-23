import React from 'react'

// 简单的SVG图表组件（无需外部依赖）
export const LineChart = ({ data, width = 400, height = 200, color = '#3B82F6' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        暂无数据
      </div>
    )
  }

  const padding = 20
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // 计算数据范围
  const values = data.map(d => d.value)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const valueRange = maxValue - minValue || 1

  // 生成路径点
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth
    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight
    return { x, y }
  })

  // 生成路径
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <svg width={width} height={height} className="bg-white rounded">
      {/* 网格线 */}
      {[0.25, 0.5, 0.75].map(ratio => (
        <line
          key={ratio}
          x1={padding}
          y1={padding + ratio * chartHeight}
          x2={width - padding}
          y2={padding + ratio * chartHeight}
          stroke="#f0f0f0"
          strokeWidth="1"
        />
      ))}
      
      {/* 趋势线 */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 数据点 */}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="3"
          fill={color}
        />
      ))}
      
      {/* X轴标签 */}
      {data.map((point, index) => (
        <text
          key={index}
          x={padding + (index / (data.length - 1)) * chartWidth}
          y={height - 5}
          textAnchor="middle"
          fontSize="10"
          fill="#666"
        >
          {point.label}
        </text>
      ))}
    </svg>
  )
}

export const PieChart = ({ data, width = 200, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        暂无数据
      </div>
    )
  }

  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 10

  // 计算总和
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  // 颜色数组
  const colors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899']

  let currentAngle = 0

  return (
    <svg width={width} height={height} className="bg-white rounded">
      {data.map((item, index) => {
        const percentage = item.value / total
        const angle = percentage * 2 * Math.PI
        const endAngle = currentAngle + angle
        
        // 计算弧线路径
        const x1 = centerX + radius * Math.cos(currentAngle)
        const y1 = centerY + radius * Math.sin(currentAngle)
        const x2 = centerX + radius * Math.cos(endAngle)
        const y2 = centerY + radius * Math.sin(endAngle)
        
        const largeArcFlag = angle > Math.PI ? 1 : 0
        
        const pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z'
        ].join(' ')
        
        currentAngle = endAngle
        
        return (
          <g key={index}>
            <path
              d={pathData}
              fill={colors[index % colors.length]}
              opacity={0.8}
            />
            
            {/* 标签位置 */}
            <text
              x={centerX + (radius * 0.7) * Math.cos(currentAngle - angle / 2)}
              y={centerY + (radius * 0.7) * Math.sin(currentAngle - angle / 2)}
              textAnchor="middle"
              fontSize="10"
              fill="white"
              fontWeight="bold"
            >
              {Math.round(percentage * 100)}%
            </text>
          </g>
        )
      })}
      
      {/* 中心圆 */}
      <circle cx={centerX} cy={centerY} r={radius * 0.3} fill="white" />
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        fontSize="12"
        fill="#666"
        dy="4"
      >
        总计
      </text>
    </svg>
  )
}

export const BarChart = ({ data, width = 400, height = 200, color = '#10B981' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        暂无数据
      </div>
    )
  }

  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const barWidth = chartWidth / data.length - 10

  const values = data.map(d => d.value)
  const maxValue = Math.max(...values)

  return (
    <svg width={width} height={height} className="bg-white rounded">
      {/* 网格线 */}
      {[0.25, 0.5, 0.75, 1].map(ratio => (
        <line
          key={ratio}
          x1={padding}
          y1={padding + (1 - ratio) * chartHeight}
          x2={width - padding}
          y2={padding + (1 - ratio) * chartHeight}
          stroke="#f0f0f0"
          strokeWidth="1"
        />
      ))}
      
      {/* 柱状图 */}
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight
        const x = padding + index * (chartWidth / data.length)
        const y = padding + chartHeight - barHeight
        
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              opacity={0.8}
            />
            
            {/* 数值标签 */}
            <text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#666"
            >
              {item.value}
            </text>
            
            {/* X轴标签 */}
            <text
              x={x + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#666"
            >
              {item.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// 财务图表组件
export const FinanceCharts = ({ financeData }) => {
  // 处理最近7天的数据
  const last7DaysData = financeData.slice(-7).map((item, index) => ({
    label: `第${index + 1}天`,
    value: item.amount
  }))

  // 支出分类数据
  const expenseData = financeData
    .filter(item => item.type === 'expense')
    .reduce((acc, item) => {
      const existing = acc.find(d => d.label === item.category)
      if (existing) {
        existing.value += item.amount
      } else {
        acc.push({ label: item.category, value: item.amount })
      }
      return acc
    }, [])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">最近7天收支趋势</h3>
        <LineChart data={last7DaysData} width={600} height={200} />
      </div>
      
      <div>
        <h3 className="font-semibold mb-4">支出分类占比</h3>
        <div className="flex items-center space-x-6">
          <PieChart data={expenseData} width={200} height={200} />
          <div className="space-y-2">
            {expenseData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ 
                    backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'][index % 4] 
                  }}
                ></div>
                <span className="text-sm">{item.label}</span>
                <span className="text-sm text-gray-500">
                  ¥{item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}