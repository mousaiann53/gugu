const MainlineModule = {
    // 1. 界面模板 (已加入 History 界面)
    viewTemplate: `
        <div id="view-mainline" class="fs-view">
            
            <div class="nav-header">
                <div class="back-square-btn" onclick="MainlineModule.tryCloseView()">‹</div>
                <div class="header-title"><div class="header-cn">星环主线</div><div class="header-en">MAINLINE</div></div>
            </div>

            <div class="mainline-body">
                <div id="obelisk-view" class="obelisk-container active" style="display: flex;">
                    <div class="mainline-left">
                        <div class="album-wrapper" onclick="MainlineModule.toggleObeliskList()">
                            <div class="album-cover">
                                <div class="cover-line"></div>
                                <div class="cover-text-group"><div class="cover-title">OBELISK</div><div class="cover-sub">2026</div></div>
                                <div class="album-prog"><div class="album-prog-fill" id="mainline-total-prog" style="width:0%"></div></div>
                                <div class="album-prog-text">TOTAL PROGRESS</div>
                            </div>
                            <div class="vinyl-disk"></div>
                        </div>
                    </div>
                    <div class="mainline-right" id="mainline-list-container"></div>
                </div>
            </div>
            
            <div class="mainline-nav">
                <div class="nav-item active" onclick="MainlineModule.switchTab('obelisk', this)"><span class="nav-cn">方尖碑</span><span class="nav-en">OBELISK</span></div>
                <div class="nav-item" onclick="MainlineModule.switchTab('epic', this)"><span class="nav-cn">纯白史诗</span><span class="nav-en">EPIC</span></div>
            </div>

            <div id="level-view" class="level-map-container">
                <div class="nav-header">
                    <div class="back-square-btn" onclick="MainlineModule.backToChapters()">‹</div>
                    <div class="header-title"><div class="header-cn" id="map-title-cn">章节名</div><div class="header-en" id="map-title-en">THEME</div></div>
                </div>
                <div id="orb-container"></div>
            </div>

            <div id="story-view" class="story-container">
                <div class="nav-header">
                    <div class="back-square-btn" onclick="MainlineModule.backToLevels()">‹</div>
                    <div class="header-title"><div class="header-cn" id="story-title-cn">序章</div><div class="header-en">STORY MODE</div></div>
                </div>
                
                <div class="story-content-area">
                    <div class="avg-box">
                        <div class="avg-controls">
                            <button class="ctrl-btn" onclick="MainlineModule.handleSkip()">SKIP</button>
                            <button class="ctrl-btn" onclick="MainlineModule.showHistory()">HISTORY</button>
                        </div>
                        <div class="avg-speaker" id="avg-speaker">???</div>
                        <div class="avg-text" id="avg-text"></div>
                        <div class="avg-options" id="avg-options"></div>
                    </div>
                </div>
            </div>

            <div id="history-view" class="history-overlay">
                <div class="history-panel">
                    <div class="hist-header">
                        <div class="hist-title">LOGS / 历史记录</div>
                        <div class="hist-close" onclick="MainlineModule.closeHistory()">×</div>
                    </div>
                    <div class="hist-content" id="history-list">
                        </div>
                </div>
            </div>

            <div id="epic-view" class="epic-view" style="display: none;"><div class="epic-text">[ TO BE CONTINUED ]</div></div>
        </div>
    `,

    currentScriptId: null, 
    currentNodeId: null,
    typeTimer: null,
    isTyping: false,
    history: [],

    init() {
        const container = document.getElementById('game-container');
        if(container && !document.getElementById('view-mainline')) {
            container.insertAdjacentHTML('beforeend', this.viewTemplate);
        }
        this.renderChapters();
    },

    // ... renderChapters, enterChapter, backToChapters 代码保持不变 ...
    // (为了节省篇幅，这里省略重复代码，但你在复制时请确保之前的逻辑都在)
    // 务必确保你的 renderChapters, enterChapter, tryStartStory 都在这里面
    
    renderChapters() {
        if (typeof GUGU_DB === 'undefined') return;
        const list = GUGU_DB.mainline.obelisk.chapters;
        const container = document.getElementById('mainline-list-container');
        if(!container) return;
        container.innerHTML = '';
        list.forEach((c) => {
            const isLocked = c.locked === true;
            const div = document.createElement('div');
            div.className = `chapter-card ${isLocked ? 'locked' : ''}`;
            div.onclick = () => {
                if (isLocked) alert("该篇章将于下个季度解锁。");
                else if (c.id === 'ml01') this.enterChapter('ml01');
                else alert("篇章内容施工中...");
            };
            div.innerHTML = `
                <div class="gold-record"><div class="gold-record-label"></div></div>
                <div class="chap-info">
                    <div class="chap-name">${c.name}</div>
                    <div class="chap-en">${c.en}</div>
                    <div class="chap-theme">${c.theme || ''}</div>
                    <div class="chap-prog-track"><div class="chap-prog-fill"></div></div>
                    <div class="chap-prog-text">${isLocked ? 'LOCKED' : '0%'}</div>
                </div>`;
            container.appendChild(div);
        });
    },

    enterChapter(chapId) {
        const chapterData = GUGU_DB.mainline.obelisk.chapters.find(c => c.id === chapId);
        if (!chapterData) return;
        document.getElementById('map-title-cn').innerText = chapterData.name;
        document.getElementById('map-title-en').innerText = chapterData.theme;
        document.getElementById('level-view').style.display = 'flex';
        
        const levels = GUGU_DB.storyLevels[chapId];
        const container = document.getElementById('orb-container');
        container.innerHTML = '';
        
        let lastUnlockedIdx = 0;
        if(levels) levels.forEach((l, i) => { if(l.status !== 'locked') lastUnlockedIdx = i; });
        const progressPct = (levels && levels.length > 1) ? (lastUnlockedIdx / (levels.length - 1)) * 100 : 0;

        container.innerHTML = `
            <div class="timeline-track">
                <div class="timeline-progress" style="width: ${progressPct}%"></div>
                ${levels ? levels.map((lvl, idx) => `
                    <div class="timeline-orb ${lvl.status} ${idx === lastUnlockedIdx ? 'current' : ''}" 
                         onclick="MainlineModule.tryStartStory('${lvl.id}', '${lvl.status}', '${lvl.name}')">
                        <div class="t-orb-name">${lvl.name}</div>
                    </div>
                `).join('') : ''}
            </div>
        `;
    },
    
    tryStartStory(scriptId, status, levelName) {
        if (status === 'locked') return;
        this.startStory(scriptId, levelName);
    },

    startStory(scriptId, levelName) {
        if (typeof GUGU_SCRIPTS === 'undefined') return;
        this.history = []; // 清空历史
        document.getElementById('story-title-cn').innerText = levelName;
        document.getElementById('story-view').style.display = 'flex';
        this.currentScriptId = scriptId;
        this.renderNode('start'); 
    },

    renderNode(nodeId) {
        this.currentNodeId = nodeId;
        const script = GUGU_SCRIPTS[this.currentScriptId];
        const node = script[nodeId];
        if (!node) { this.endStory(); return; }

        // 记录历史 (去重处理：防止同一句话重复记)
        const lastHist = this.history[this.history.length - 1];
        if (!lastHist || lastHist.text !== node.text) {
            this.history.push({ speaker: node.speaker, text: node.text });
        }

        document.getElementById('avg-speaker').innerText = node.speaker;
        const textEl = document.getElementById('avg-text');
        const optBox = document.getElementById('avg-options');
        optBox.innerHTML = ''; 

        // 打字机
        this.isTyping = true;
        let i = 0;
        textEl.innerText = "";
        clearInterval(this.typeTimer);
        this.typeTimer = setInterval(() => {
            textEl.innerText += node.text.charAt(i);
            i++;
            if (i >= node.text.length) {
                this.finishTyping(node);
            }
        }, 40); // 打字速度

        textEl.onclick = () => {
            if (this.isTyping) {
                this.handleSkip();
            } else if (!node.options || node.options.length === 0) {
                this.renderNode(node.nextId || 'end');
            }
        };
    },

   // --- 智能 SKIP 逻辑：直接跳到下一个选项 ---
    handleSkip() {
        const script = GUGU_SCRIPTS[this.currentScriptId];
        // 获取当前节点对象
        let currNode = script[this.currentNodeId];

        if (!currNode) return;

        // 【情况 1】当前节点就是选项节点
        // 逻辑：不能跳过选择，只能帮玩家瞬间显示完文字
        if (currNode.options && currNode.options.length > 0) {
            if (this.isTyping) {
                // 停止打字，直接显示全文
                clearInterval(this.typeTimer);
                this.isTyping = false;
                document.getElementById('avg-text').innerText = currNode.text;
                // 立即把选项弹出来
                this.finishTyping(currNode);
            }
            return; // 停在这里等待玩家操作
        }

        // 【情况 2】当前是线性剧情（无选项）
        // 逻辑：开启“虫洞”，向后搜索直到找到有选项的节点或结局
        
        let nextId = currNode.nextId;
        let targetId = null;

        // 循环搜索：只要不是结局，且没有选项，就继续往下找
        while (nextId && nextId !== 'end') {
            const nextNode = script[nextId];
            if (!nextNode) break;

            // 找到了！这个节点有选项！
            if (nextNode.options && nextNode.options.length > 0) {
                targetId = nextId;
                break;
            }
            
            // 没找到，继续找下一个
            nextId = nextNode.nextId;
        }

        // --- 执行跳转 ---
        if (targetId) {
            // 找到了选项节点 -> 直接渲染那个节点
            this.renderNode(targetId);
        } else if (nextId === 'end') {
            // 找遍了后面全是废话直到结局 -> 直接结束
            this.endStory();
        } else {
            // 异常兜底：如果没有路了，就只显示当前文本
            if (this.isTyping) {
                clearInterval(this.typeTimer);
                this.isTyping = false;
                document.getElementById('avg-text').innerText = currNode.text;
                this.finishTyping(currNode);
            }
        }
    },

    finishTyping(node) {
        this.isTyping = false;
        clearInterval(this.typeTimer);
        const optBox = document.getElementById('avg-options');
        if (node.options && node.options.length > 0) {
            node.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'avg-btn';
                btn.innerText = opt.text;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if (opt.reward) this.giveReward(opt.reward);
                    this.renderNode(opt.nextId);
                };
                optBox.appendChild(btn);
            });
        }
    },

    // ★★★ 显示历史记录 (新界面) ★★★
    showHistory() {
        const histView = document.getElementById('history-view');
        const listContainer = document.getElementById('history-list');
        listContainer.innerHTML = ''; // 清空旧内容

        // 反转数组，让最新的在最下面？不，历史记录通常是从上往下读
        this.history.forEach(h => {
            const row = document.createElement('div');
            row.className = 'hist-row';
            row.innerHTML = `<div class="hist-name">${h.speaker}</div><div class="hist-text">${h.text}</div>`;
            listContainer.appendChild(row);
        });

        histView.style.display = 'flex';
        
        // 自动滚动到底部
        setTimeout(() => {
            listContainer.scrollTop = listContainer.scrollHeight;
        }, 50);
    },

    // ★★★ 关闭历史记录 ★★★
    closeHistory() {
        document.getElementById('history-view').style.display = 'none';
    },

    endStory() {
        if (this.currentScriptId === 's1_01') {
            const levels = GUGU_DB.storyLevels['ml01'];
            levels[0].status = 'completed';
            levels[1].status = 'unlocked';
            if(typeof App !== 'undefined') App.save();
        }
        document.getElementById('story-view').style.display = 'none';
        this.enterChapter('ml01');
    },

    giveReward(r) {
        if(r.type === 'gold' && typeof App !== 'undefined') {
            App.data.gold += r.val;
            App.updateUI();
            alert(`获得丰饶之金 x${r.val}`);
        }
    },

    backToLevels() { document.getElementById('story-view').style.display = 'none'; },
    backToChapters() { 
        document.getElementById('level-view').style.display = 'none';
        const nav = document.querySelector('.mainline-nav');
        if(nav) nav.style.display = 'flex';
    },
    tryCloseView() { App.closeView(); },
    toggleObeliskList() {
        document.querySelector('.album-wrapper').classList.toggle('open');
        document.getElementById('mainline-list-container').classList.toggle('show');
    },
    switchTab(viewName, btn) {
        document.querySelectorAll('.mainline-nav .nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const obelisk = document.getElementById('obelisk-view');
        const epic = document.getElementById('epic-view');
        obelisk.style.display = (viewName === 'obelisk') ? 'flex' : 'none';
        epic.style.display = (viewName === 'obelisk') ? 'none' : 'flex';
    }
};