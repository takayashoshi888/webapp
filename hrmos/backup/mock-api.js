// 模拟后端API - 仅用于本地开发
const mockAPI = {
    // 模拟用户数据库
    users: [],
    tokens: {},
    
    // 生成UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    // 密码哈希（简化版）
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'mock_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    // 生成随机token
    generateToken() {
        return Array.from({length: 24}, () => 
            Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
        ).join('');
    },
    
    // 注册API
    async register(username, email, password) {
        if (!username || !email || !password) {
            return { error: 'invalid_input' };
        }
        
        // 检查邮箱是否已存在
        if (this.users.some(user => user.email === email)) {
            return { error: 'email_exists' };
        }
        
        // 创建新用户
        const id = this.generateUUID();
        const passwordHash = await this.hashPassword(password);
        const createdAt = new Date().toISOString();
        
        const newUser = {
            id,
            username,
            email,
            password_hash: passwordHash,
            created_at: createdAt
        };
        
        this.users.push(newUser);
        return { id, username, email };
    },
    
    // 登录API
    async login(usernameOrEmail, password) {
        if (!usernameOrEmail || !password) {
            return { error: 'invalid_input' };
        }
        
        // 查找用户
        const user = this.users.find(user => 
            user.email === usernameOrEmail || user.username === usernameOrEmail
        );
        
        if (!user) {
            return { error: 'invalid_credentials' };
        }
        
        // 验证密码
        const passwordHash = await this.hashPassword(password);
        if (user.password_hash !== passwordHash) {
            return { error: 'invalid_credentials' };
        }
        
        // 生成token
        const token = this.generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        
        this.tokens[token] = {
            user_id: user.id,
            created_at: new Date().toISOString(),
            expires_at: expiresAt
        };
        
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    },
    
    // 验证token
    validateToken(token) {
        if (!token || !this.tokens[token]) {
            return null;
        }
        
        const tokenData = this.tokens[token];
        if (new Date(tokenData.expires_at) < new Date()) {
            delete this.tokens[token];
            return null;
        }
        
        return tokenData.user_id;
    }
};

    // 初始化模拟API
console.log('Initializing mock API, hostname:', location.hostname);
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    // 模拟考勤记录数据
    const attendanceRecords = {};
    
    // 拦截fetch请求
    const originalFetch = window.fetch;
    window.fetch = async function(url, options = {}) {
        // 处理所有API请求
        if (typeof url === 'string' && (
            url.startsWith('/api/') || 
            (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('http'))
        )) {
            // 处理API请求
            const path = url.replace('/api', '').startsWith('/') ? 
                url.replace('/api', '') : 
                url.replace('/api/', '/');
            
            const method = options.method || 'GET';
            console.log('Mock API handling:', path, method); // 添加调试日志
            
            // 从请求头获取授权token
            const authHeader = options.headers?.Authorization || '';
            const token = authHeader.replace('Bearer ', '');
            const userId = mockAPI.validateToken(token);
            
            try {
                let response;
                
                // 注册
                if ((path === '/register' || path === 'register') && method === 'POST') {
                    console.log('Processing register request'); // 添加调试日志
                    try {
                        const body = JSON.parse(options.body);
                        response = await mockAPI.register(body.username, body.email, body.password);
                        console.log('Register response:', response); // 添加调试日志
                        return new Response(JSON.stringify(response), {
                            status: response.error ? 400 : 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    } catch (e) {
                        console.error('Register error:', e);
                        return new Response(JSON.stringify({ error: 'server_error' }), {
                            status: 500,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
                
                // 登录
                if ((path === '/login' || path === 'login') && method === 'POST') {
                    console.log('Processing login request'); // 添加调试日志
                    try {
                        const body = JSON.parse(options.body);
                        response = await mockAPI.login(body.usernameOrEmail, body.password);
                        return new Response(JSON.stringify(response), {
                            status: response.error ? 401 : 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    } catch (e) {
                        console.error('Login error:', e);
                        return new Response(JSON.stringify({ error: 'server_error' }), {
                            status: 500,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
                
                // 考勤记录相关API
                if (path.startsWith('/records') || path.startsWith('records')) {
                    // 需要认证
                    if (!userId) {
                        return new Response(JSON.stringify({ error: 'unauthorized' }), {
                            status: 401,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    
                    // 获取记录列表
                    if (path === '/records' && method === 'GET') {
                        const urlObj = new URL(url, window.location.origin);
                        const month = urlObj.searchParams.get('month');
                        
                        let userRecords = attendanceRecords[userId] || [];
                        
                        // 按月份过滤
                        if (month) {
                            userRecords = userRecords.filter(record => 
                                record.record_date.startsWith(month)
                            );
                        }
                        
                        return new Response(JSON.stringify(userRecords), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    
                    // 创建新记录
                    if (path === '/records' && method === 'POST') {
                        const body = JSON.parse(options.body);
                        const id = mockAPI.generateUUID();
                        const record = {
                            id,
                            user_id: userId,
                            record_date: body.record_date,
                            employee_name: body.employee_name,
                            employee_count: body.employee_count,
                            site_name: body.site_name,
                            room_type: body.room_type || '',
                            room_number: body.room_number || '',
                            parking_fee: body.parking_fee || 0,
                            highway_fee: body.highway_fee || 0,
                            created_at: new Date().toISOString()
                        };
                        
                        if (!attendanceRecords[userId]) {
                            attendanceRecords[userId] = [];
                        }
                        
                        attendanceRecords[userId].push(record);
                        
                        return new Response(JSON.stringify(record), {
                            status: 201,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    
                    // 更新记录
                    if (path.startsWith('/records/') && method === 'PUT') {
                        const id = path.split('/').pop();
                        const body = JSON.parse(options.body);
                        
                        if (!attendanceRecords[userId]) {
                            return new Response(JSON.stringify({ error: 'not_found' }), {
                                status: 404,
                                headers: { 'Content-Type': 'application/json' }
                            });
                        }
                        
                        const recordIndex = attendanceRecords[userId].findIndex(r => r.id === id);
                        if (recordIndex === -1) {
                            return new Response(JSON.stringify({ error: 'not_found' }), {
                                status: 404,
                                headers: { 'Content-Type': 'application/json' }
                            });
                        }
                        
                        // 更新记录
                        attendanceRecords[userId][recordIndex] = {
                            ...attendanceRecords[userId][recordIndex],
                            record_date: body.record_date,
                            employee_name: body.employee_name,
                            employee_count: body.employee_count,
                            site_name: body.site_name,
                            room_type: body.room_type || '',
                            room_number: body.room_number || '',
                            parking_fee: body.parking_fee || 0,
                            highway_fee: body.highway_fee || 0
                        };
                        
                        return new Response(JSON.stringify(attendanceRecords[userId][recordIndex]), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    
                    // 删除记录
                    if (path.startsWith('/records/') && method === 'DELETE') {
                        const id = path.split('/').pop();
                        
                        if (!attendanceRecords[userId]) {
                            return new Response(JSON.stringify({ error: 'not_found' }), {
                                status: 404,
                                headers: { 'Content-Type': 'application/json' }
                            });
                        }
                        
                        const recordIndex = attendanceRecords[userId].findIndex(r => r.id === id);
                        if (recordIndex === -1) {
                            return new Response(JSON.stringify({ error: 'not_found' }), {
                                status: 404,
                                headers: { 'Content-Type': 'application/json' }
                            });
                        }
                        
                        attendanceRecords[userId].splice(recordIndex, 1);
                        
                        return new Response(JSON.stringify({ ok: true }), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
                
                // 其他API请求返回404
                console.log('API endpoint not implemented:', path, method);
                return new Response(JSON.stringify({ error: 'not_implemented' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('Mock API Error:', error);
                return new Response(JSON.stringify({ error: 'server_error' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        // 非API请求使用原始fetch
        return originalFetch.apply(this, arguments);
    };
    
    console.log('Mock API initialized successfully');
} else {
    console.log('Not initializing mock API (not on localhost)');
}