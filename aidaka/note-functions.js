// ========== 笔记附件和标签功能实现 ==========

// 全局变量
let currentAttachments = [];
let currentTags = ['工作笔记'];

// 显示附件上传区域
function showAttachmentSection() {
    document.getElementById('attachment-section').style.display = 'block';
    document.getElementById('tag-section').style.display = 'none';
}

// 隐藏附件上传区域
function hideAttachmentSection() {
    document.getElementById('attachment-section').style.display = 'none';
}

// 显示标签管理区域
function showTagSection() {
    document.getElementById('tag-section').style.display = 'block';
    document.getElementById('attachment-section').style.display = 'none';
}

// 隐藏标签管理区域
function hideTagSection() {
    document.getElementById('tag-section').style.display = 'none';
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// 处理文件列表
function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        // 检查文件大小（最大10MB）
        if (file.size > 10 * 1024 * 1024) {
            showToast(`文件 "${file.name}" 太大，请选择小于10MB的文件`, 'error');
            return;
        }
        
        // 检查文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                             'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                             'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                             'text/plain', 'application/zip'];
        
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip)$/i)) {
            showToast(`不支持的文件类型：${file.name}`, 'error');
            return;
        }
        
        // 添加到附件列表
        const attachment = {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            file: file,
            uploadTime: new Date().toISOString()
        };
        
        currentAttachments.push(attachment);
        updateAttachmentList();
        
        showToast(`已添加附件：${file.name}`, 'success');
    });
    
    // 清空文件输入框
    document.getElementById('file-input').value = '';
}

// 更新附件列表显示
function updateAttachmentList() {
    const attachmentList = document.getElementById('attachment-list');
    attachmentList.innerHTML = '';
    
    if (currentAttachments.length === 0) {
        attachmentList.innerHTML = '<p style="text-align: center; color: #6c757d;">暂无附件</p>';
        return;
    }
    
    currentAttachments.forEach(attachment => {
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-item';
        
        // 获取文件图标
        let iconClass = 'fas fa-file';
        if (attachment.type.startsWith('image/')) {
            iconClass = 'fas fa-file-image';
        } else if (attachment.type === 'application/pdf') {
            iconClass = 'fas fa-file-pdf';
        } else if (attachment.type.includes('word')) {
            iconClass = 'fas fa-file-word';
        } else if (attachment.type.includes('excel') || attachment.type.includes('spreadsheet')) {
            iconClass = 'fas fa-file-excel';
        } else if (attachment.type === 'text/plain') {
            iconClass = 'fas fa-file-alt';
        } else if (attachment.type === 'application/zip') {
            iconClass = 'fas fa-file-archive';
        }
        
        attachmentItem.innerHTML = `
            <div class="attachment-info">
                <i class="${iconClass}"></i>
                <span class="attachment-name" title="${attachment.name}">${attachment.name}</span>
                <span class="attachment-size">${formatFileSize(attachment.size)}</span>
            </div>
            <button class="remove-attachment" data-id="${attachment.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 添加删除事件
        attachmentItem.querySelector('.remove-attachment').addEventListener('click', () => {
            removeAttachment(attachment.id);
        });
        
        attachmentList.appendChild(attachmentItem);
    });
}

// 移除附件
function removeAttachment(id) {
    currentAttachments = currentAttachments.filter(att => att.id !== id);
    updateAttachmentList();
    showToast('附件已移除', 'info');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 从输入框添加标签
function addTagFromInput() {
    const tagInput = document.getElementById('tag-input');
    const tag = tagInput.value.trim();
    
    if (!tag) {
        showToast('请输入标签名称', 'error');
        return;
    }
    
    if (tag.length > 20) {
        showToast('标签名称不能超过20个字符', 'error');
        return;
    }
    
    addTag(tag);
    tagInput.value = '';
}

// 添加标签
function addTag(tag) {
    // 检查是否已存在
    if (currentTags.includes(tag)) {
        showToast('标签已存在', 'warning');
        return;
    }
    
    // 添加到标签列表
    currentTags.push(tag);
    updateTagList();
    showToast(`已添加标签：${tag}`, 'success');
}

// 移除标签
function removeTag(tag) {
    // 不允许删除默认的"工作笔记"标签
    if (tag === '工作笔记') {
        showToast('不能删除默认标签', 'warning');
        return;
    }
    
    currentTags = currentTags.filter(t => t !== tag);
    updateTagList();
    showToast(`已删除标签：${tag}`, 'info');
}

// 更新标签列表显示
function updateTagList() {
    const tagList = document.getElementById('tag-list');
    tagList.innerHTML = '';
    
    currentTags.forEach(tag => {
        const tagItem = document.createElement('div');
        tagItem.className = 'tag-item';
        
        tagItem.innerHTML = `
            <span>${tag}</span>
            <button class="remove-tag" data-tag="${tag}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 添加删除事件
        tagItem.querySelector('.remove-tag').addEventListener('click', () => {
            removeTag(tag);
        });
        
        tagList.appendChild(tagItem);
    });
}

// ========== 笔记分享功能 ==========

// 分享笔记
function shareNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    // 创建分享弹窗
    const shareModal = document.createElement('div');
    shareModal.className = 'modal share-modal';
    shareModal.id = 'share-modal';
    
    shareModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-share-alt"></i> 分享笔记</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="share-options">
                    <button class="share-option" data-share="link">
                        <i class="fas fa-link"></i>
                        <span>分享链接</span>
                    </button>
                    <button class="share-option" data-share="copy">
                        <i class="fas fa-copy"></i>
                        <span>复制内容</span>
                    </button>
                    <button class="share-option" data-share="export">
                        <i class="fas fa-download"></i>
                        <span>导出文件</span>
                    </button>
                </div>
                <div class="share-preview">
                    <div class="share-preview-header">
                        <span>预览内容</span>
                    </div>
                    <div class="share-preview-content">
                        <h4>${note.title}</h4>
                        <div class="share-preview-text">${note.content}</div>
                        <div class="share-preview-meta">
                            <span><i class="fas fa-calendar"></i> ${formatDateTime(note.timestamp)}</span>
                            ${note.tags && note.tags.length > 0 ? `
                                <div class="share-preview-tags">
                                    ${note.tags.map(tag => `<span class="share-preview-tag">${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn">取消</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(shareModal);
    
    // 显示弹窗
    setTimeout(() => {
        shareModal.classList.add('active');
    }, 100);
    
    // 添加事件监听器
    shareModal.querySelector('.close-modal').addEventListener('click', () => {
        closeShareModal();
    });
    
    shareModal.querySelector('.cancel-btn').addEventListener('click', () => {
        closeShareModal();
    });
    
    // 分享选项
    shareModal.querySelector('.share-option[data-share="link"]').addEventListener('click', () => {
        generateShareLink(note.id);
    });
    
    shareModal.querySelector('.share-option[data-share="copy"]').addEventListener('click', () => {
        copyNoteContent(note);
    });
    
    shareModal.querySelector('.share-option[data-share="export"]').addEventListener('click', () => {
        exportNote(note);
    });
    
    // 背景点击关闭
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            closeShareModal();
        }
    });
}

// 关闭分享弹窗
function closeShareModal() {
    const shareModal = document.getElementById('share-modal');
    if (shareModal) {
        shareModal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(shareModal);
        }, 300);
    }
}

// 生成分享链接
function generateShareLink(noteId) {
    // 生成随机分享ID
    const shareId = btoa(noteId + '_' + Date.now());
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
    
    // 复制到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('分享链接已复制到剪贴板', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(shareUrl);
        });
    } else {
        fallbackCopyTextToClipboard(shareUrl);
    }
}

// 复制笔记内容
function copyNoteContent(note) {
    let content = `【${note.title}】\n\n${note.content}\n\n创建时间：${formatDateTime(note.timestamp)}`;
    
    // 添加标签
    if (note.tags && note.tags.length > 0) {
        content += `\n标签：${note.tags.join(', ')}`;
    }
    
    // 添加附件信息
    if (note.attachments && note.attachments.length > 0) {
        content += `\n附件：${note.attachments.map(att => att.name).join(', ')}`;
    }
    
    // 复制到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
            showToast('笔记内容已复制到剪贴板', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(content);
        });
    } else {
        fallbackCopyTextToClipboard(content);
    }
}

// 导出笔记
function exportNote(note) {
    // 创建导出内容
    let exportContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${note.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f7fa;
        }
        .note-container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .note-header {
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .note-title {
            font-size: 24px;
            font-weight: 700;
            color: #1e3c72;
            margin: 0 0 10px 0;
        }
        .note-meta {
            font-size: 14px;
            color: #6c757d;
        }
        .note-content {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .note-tags {
            margin-top: 20px;
        }
        .note-tag {
            display: inline-block;
            background: #1e3c72;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-right: 5px;
            margin-bottom: 5px;
        }
        .note-attachments {
            margin-top: 20px;
        }
        .attachment-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border: 1px solid #eee;
            border-radius: 5px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="note-container">
        <div class="note-header">
            <h1 class="note-title">${note.title}</h1>
            <div class="note-meta">创建时间：${formatDateTime(note.timestamp)}</div>
        </div>
        <div class="note-content">${note.content.replace(/\n/g, '<br>')}</div>
        ${note.tags && note.tags.length > 0 ? `
            <div class="note-tags">
                ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
            </div>
        ` : ''}
        ${note.attachments && note.attachments.length > 0 ? `
            <div class="note-attachments">
                <h3>附件列表：</h3>
                ${note.attachments.map(att => `
                    <div class="attachment-item">
                        <i class="fas fa-file"></i>
                        <span>${att.name} (${formatFileSize(att.size)})</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    </div>
</body>
</html>`;
    
    // 创建下载链接
    const blob = new Blob([exportContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('笔记已导出为HTML文件', 'success');
}