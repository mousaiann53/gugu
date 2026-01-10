const GUGU_DB = {
    // --- 1. 日常任务 (保持不变) ---
    routine: { 
        daily: [
            { id: 'r01', name: '码字', reward: 30, exp: 20, link: 'code' }, 
            { id: 'r02', name: '日记', reward: 30, exp: 20, link: 'diary' }, 
            { id: 'r03', name: '早睡', reward: 30, exp: 20, link: 'sleep' }, 
            { id: 'r04', name: '运动', reward: 30, exp: 20, link: 'sport' }, 
            { id: 'r05', name: '冥想', reward: 30, exp: 20, link: 'meditation' }, 
            { id: 'r06', name: '阅读', reward: 30, exp: 20, link: 'read' }
        ], 
        weekly: [
            { id: 'z01', name: '泡脚/艾灸', reward: 30, exp: 30, link: 'yangsheng' }, 
            { id: 'z02', name: '读完一整本书', reward: 60, exp: 60, link: 'book' }, 
            { id: 'z03', name: '面膜/小排灯', reward: 30, exp: 30, link: 'hufu' }, 
            { id: 'z04', name: '手工/游戏', reward: 30, exp: 30, link: 'game' }, 
            { id: 'z05', name: '公开课/技能课', reward: 30, exp: 50, link: 'learning' }, 
            { id: 'z06', name: '电影/纪录片', reward: 30, exp: 30, link: 'movie' }, 
            { id: 'z07', name: '水彩月历', reward: 30, exp: 40, link: 'watercolors' }, 
            { id: 'z08', name: '水彩画', reward: 60, exp: 80, link: 'watercolorm' }
        ] 
    },

    // --- 2. 抽奖池 (保持不变) ---
    gachaPool: { 
        limited: [
            { id: 'g01', name: '新笔记本电脑', star: 6, weight: 0.2, type: 'item' }, 
            { id: 'g02', name: '新手机', star: 6, weight: 0.3, type: 'item' }, 
            { id: 'g03', name: 'PS5', star: 5, weight: 0.5, type: 'item' }, 
            { id: 'g04', name: '光子嫩肤', star: 5, weight: 0.5, type: 'item' }, 
            { id: 'g05', name: '丰饶之金*100', star: 4, weight: 8.5, type: 'gold', val: 100 }, 
            { id: 'g06', name: '丰饶之金*30', star: 3, weight: 40, type: 'gold', val: 30 }, 
            { id: 'g07', name: '丰饶之金*10', star: 2, weight: 45, type: 'gold', val: 10 }, 
            { id: 'g08', name: '丰饶之金*5', star: 1, weight: 5, type: 'gold', val: 5 }
        ], 
        standard: [
            { id: 'g09', name: '丰饶之金*500', star: 6, weight: 0.5, type: 'gold', val: 500 }, 
            { id: 'g10', name: '丰饶之金*300', star: 5, weight: 1.0, type: 'gold', val: 300 }, 
            { id: 'g11', name: '丰饶之金*100', star: 4, weight: 8.5, type: 'gold', val: 100 }, 
            { id: 'g12', name: '丰饶之金*30', star: 3, weight: 40, type: 'gold', val: 30 }, 
            { id: 'g13', name: '丰饶之金*10', star: 2, weight: 45, type: 'gold', val: 10 }, 
            { id: 'g14', name: '丰饶之金*5', star: 1, weight: 5, type: 'gold', val: 5 }
        ] 
    },

    // --- 3. 纪行任务 (保持不变) ---
    bp: { 
        tasks: { 
            daily: [
                { id: 'bd01', name: '登录游戏', exp: 150, auto: true }, 
                { id: 'bd02', name: '消耗树之眼*2', exp: 200 }, 
                { id: 'bd03', name: '制定日计划', exp: 150 }, 
                { id: 'bd04', name: '日总结', exp: 200 }, 
                { id: 'bd05', name: '完成每日任务', exp: 200 }
            ], 
            weekly: [
                { id: 'bw01', name: '下周展望', exp: 200 }, 
                { id: 'bw02', name: '深度回顾', exp: 1000 }, 
                { id: 'bw03', name: '家园净化', exp: 500 }, 
                { id: 'bw04', name: '累计运动*3', exp: 350, req: 3, type: 'sport' }, 
                { id: 'bw05', name: '累计阅读*3', exp: 350, req: 3, type: 'read' }, 
                { id: 'bw06', name: '累计码字*3', exp: 350, req: 3, type: 'code' }, 
                { id: 'bw07', name: '累计冥想*3', exp: 350, req: 3, type: 'meditation' }, 
                { id: 'bw08', name: '累计早睡*3', exp: 350, req: 3, type: 'sleep' }, 
                { id: 'bw09', name: '消耗树之眼*10', exp: 350 }, 
                { id: 'bw10', name: '读书+读后感', exp: 1000 }
            ], 
            monthly: [
                { id: 'bm01', name: '21天阅读习惯', exp: 1000, req: 21, type: 'read' }, 
                { id: 'bm02', name: '21天码字习惯', exp: 1000, req: 21, type: 'code' }, 
                { id: 'bm03', name: '21天运动习惯', exp: 1000, req: 21, type: 'sport' }, 
                { id: 'bm04', name: '21天冥想习惯', exp: 1000, req: 21, type: 'meditation' }, 
                { id: 'bm05', name: '21天日记习惯', exp: 500, req: 21, type: 'diary' }, 
                { id: 'bm06', name: '21天早睡习惯', exp: 500, req: 21, type: 'sleep' }, 
                { id: 'bm07', name: '积累丰饶之金2000', exp: 2000 }, 
                { id: 'bm08', name: '研习之旅(树之眼*10)', exp: 1500 }, 
                { id: 'bm09', name: '完成手工/游戏*3', exp: 1000, req: 3, type: 'game' }, 
                { id: 'bm10', name: '完成泡脚/艾灸*4', exp: 1000, req: 4, type: 'yangsheng' }, 
                { id: 'bm11', name: '完成面膜/小排灯*4', exp: 500, req: 4, type: 'hufu' }, 
                { id: 'bm12', name: '完成公开课/技能*3', exp: 1000, req: 3, type: 'learning' }, 
                { id: 'bm13', name: '完成电影/纪录片*4', exp: 500, req: 4, type: 'movie' }, 
                { id: 'bm14', name: '完成水彩月历*4', exp: 1000, req: 4, type: 'watercolors' }, 
                { id: 'bm15', name: '完成水彩画*2', exp: 1000, req: 2, type: 'watercolorm' }, 
                { id: 'bm16', name: '展览/演出/活动*1', exp: 1000 }, 
                { id: 'bm17', name: '家人活动*1', exp: 1000 }, 
                { id: 'bm18', name: '月度总结', exp: 1000 }, 
                { id: 'bm19', name: '月度计划', exp: 1000 }, 
                { id: 'bm20', name: '音乐剧*1', exp: 500 }, 
                { id: 'bm21', name: '读完2本书', exp: 1000, req: 2, type: 'book' }, 
                { id: 'bm22', name: '全勤奖(无漏签)', exp: 2000 }
            ] 
        } 
    },

    // --- 4. 道具 (保持不变) ---
    items: { 
        'i01': { name: '回溯之叶', desc: '补签道具。', icon: 'ico-leaf' }, 
        'i02': { name: '树之眼', desc: '体力 +1。', icon: 'ico-eye-item' }, 
        'i03': { name: '维度链接', desc: '小月卡：每日签到获得90原石。', icon: 'ico-card-sml' }, 
        'i04': { name: '丰饶之月', desc: '大月卡：纪行任务经验翻倍。', icon: 'ico-card-big' }, 
        'i05': { name: '正印', desc: '稀有物：用于许愿池单次抽取。', icon: 'ico-sigil-item' }, 
        'i06': { name: '微型丰饶金矿', desc: '丰饶之金 +30。', icon: 'ico-mine-mini' }, 
        'i07': { name: '小型丰饶金矿', desc: '丰饶之金 +50。', icon: 'ico-mine-med' }, 
        'i08': { name: '中型丰饶金矿', desc: '丰饶之金 +100。', icon: 'ico-mine-sml' }, 
        'i09': { name: '大型丰饶金矿', desc: '丰饶之金 +500。', icon: 'ico-mine-lrg' } 
    },

    // --- 5. 商店 (保持不变) ---
    shop: [ 
        { id: 's01', itemId: 'i01', price: 500, limit: 3, limitType: 'month' }, 
        { id: 's02', itemId: 'i02', price: 100, limit: 2, limitType: 'day' }, 
        { id: 's03', itemId: 'i03', price: 3000, limit: 1, limitType: 'month' }, 
        { id: 's04', itemId: 'i04', price: 6800, limit: 1, limitType: 'month' }, 
        { id: 's05', itemId: 'i05', price: 1600, limit: 10, limitType: 'month' }, 
        { id: 's06', itemId: 'i06', price: 3000, limit: 999, limitType: 'none' }, 
        { id: 's07', itemId: 'i07', price: 5000, limit: 999, limitType: 'none' }, 
        { id: 's08', itemId: 'i08', price: 10000, limit: 999, limitType: 'none' }, 
        { id: 's09', itemId: 'i09', price: 50000, limit: 999, limitType: 'none' } 
    ],
    vouchers: { 'g05': 300, 'g06': 300, 'g07': 300, 'g08': 300, 'g09': 50, 'g10': 30, 'g11': 10, 'i06': 30, 'i07': 50, 'i08': 100, 'i09': 500 },

    // --- 6. 主线数据 (修改版：增加锁定状态) ---
    mainline: { 
        obelisk: { 
            title: '方尖碑 - 2026', 
            chapters: [ 
                // 前3章：解锁状态
                { id: 'ml01', name: '《沙之书》', en: 'The Book of Sand', theme: 'Chapter I · Learning' }, 
                { id: 'ml02', name: '《小径分岔的花园》', en: 'The Garden of Forking Paths', theme: 'Chapter II · Creation' }, 
                { id: 'ml03', name: '《看不见的城市》', en: 'Invisible Cities', theme: 'Chapter Ⅲ · Travel' }, 
                
                // 后5章：锁定状态 (locked: true)
                { id: 'ml04', name: '《筑塔者》', en: 'The Master Builder', theme: 'Chapter IV · Career', locked: true }, 
                { id: 'ml05', name: '《追忆似水年华》', en: 'In Search of Lost Time', theme: 'Chapter V · Family', locked: true }, 
                { id: 'ml06', name: '《生命中不能承受之轻》', en: 'The Unbearable Lightness of Being', theme: 'Chapter VI · Health', locked: true }, 
                { id: 'ml07', name: '《黄金时代》', en: 'The Golden Age', theme: 'Chapter VII · Finance', locked: true }, 
                { id: 'ml08', name: '《美丽新世界》', en: 'Brave New World', theme: 'Chapter VIII · Social', locked: true } 
            ] 
        } 
    },

    // --- 7. ★★★ 新增：关卡与剧本数据库 (Text Adventure DB) ★★★ ---
    // 这是你要的“光团”页面配置
    storyLevels: {
        'ml01': [ // 属于第一章的5个关卡
            { id: 's1_01', name: '序章', x: 50, y: 50, status: 'unlocked' }, // x,y 是光团的位置(百分比)
            { id: 's1_02', name: '缪塞花园', x: 20, y: 30, status: 'locked' },
            { id: 's1_03', name: '缄默双塔', x: 80, y: 30, status: 'locked' },
            { id: 's1_04', name: '透视监牢', x: 20, y: 70, status: 'locked' },
            { id: 's1_05', name: '尾声', x: 80, y: 70, status: 'locked' }
        ]
    },


    // --- 7. 博物馆成就 (保持不变) ---
    museum: [ 
        { id: 'a01', name: '初入世界', desc: '累计登录 1 天', check: 'totalLogin', val: 1, reward: {t:'gem', v:100}, category: 'permanent' }, 
        { id: 'a02', name: '习惯养成', desc: '累计登录 7 天', check: 'totalLogin', val: 7, reward: {t:'gem', v:300}, category: 'permanent' }, 
        { id: 'a03', name: '坚持不懈', desc: '累计登录 30 天', check: 'totalLogin', val: 30, reward: {t:'sigil', v:1}, category: 'permanent' }, 
        { id: 'a04', name: '行动派', desc: '累计完成 10 次任务', check: 'totalTasks', val: 10, reward: {t:'gem', v:200}, category: 'journey' }, 
        { id: 'a05', name: '执行者', desc: '累计完成 50 次任务', check: 'totalTasks', val: 50, reward: {t:'star', v:2000}, category: 'journey' }, 
        { id: 'a06', name: '命运的召唤', desc: '进行 10 次祈愿', check: 'totalGacha', val: 10, reward: {t:'gem', v:180}, category: 'brilliant' }, 
        { id: 'a07', name: '第一桶金', desc: '丰饶之海积攒 100 金', check: 'totalSavings', val: 100, reward: {t:'eye', v:2}, category: 'brilliant' }, 
        { id: 'a08', name: '小金库', desc: '丰饶之海积攒 1000 金', check: 'totalSavings', val: 1000, reward: {t:'sigil', v:2}, category: 'brilliant' }, 
        { id: 'a09', name: '诞生之日', desc: '在生日当天登录', check: 'special', val: 1, reward: {t:'sigil', v:10}, category: 'commemorative' } 
    ]
};