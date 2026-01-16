/* persona.js - 人格系统独立模块（像 MainlineModule 一样独立）
   依赖：window.App（engine.js 定义）、页面存在 #persona-content、#view-persona
*/
(function () {
  const PersonaDB = {
    painter: {
      id: "painter",
      cn: "画家",
      en: "PAINTER",
      roleCn: "技能映射型 · 创作系",
      tag: "缪塞花园",
      desc:
        "把练习当作素材，把时间当作颜料。你每一次投入，都在把“会”变成“熟练”。\n（分支不做皮肤，做技能：水彩 / 插画）",
      base: { will: 72, focus: 68, craft: 80, order: 55 },
      skills: [
        {
          id: "watercolor",
          cn: "水彩技法",
          en: "WATERCOLOR",
          desc: "练习转化效率 +：完成带有【绘画】标签的任务时，更易掉落对应材料。",
          maxLv: 10,
          mat: "pigment",
        },
        {
          id: "illustration",
          cn: "插画构成",
          en: "ILLUSTRATION",
          desc: "复盘转化效率 +：提交作业/图稿时，额外获得少量人格经验。",
          maxLv: 10,
          mat: "frame",
        },
      ],
      mindSlot: true,
    },
    occultist: {
      id: "occultist",
      cn: "玄学家",
      en: "OCCULTIST",
      roleCn: "技能映射型 · 解读系",
      tag: "缄默双塔",
      desc:
        "用符号拆解命运的噪声。你不是在求神问卜，而是在训练“解释世界”的能力。\n（分支不做皮肤，做技能：塔罗 / 八字）",
      base: { will: 65, focus: 76, craft: 60, order: 74 },
      skills: [
        {
          id: "tarot",
          cn: "塔罗解读",
          en: "TAROT",
          desc: "洞察 +：完成带有【阅读/笔记】标签的任务时，提升材料掉落概率。",
          maxLv: 10,
          mat: "arcana",
        },
        {
          id: "bazi",
          cn: "八字体系",
          en: "BAZI",
          desc: "结构化 +：连续学习时（累计），获得少量额外人格经验。",
          maxLv: 10,
          mat: "stem",
        },
      ],
      mindSlot: true,
    },
  };

  const MatName = {
    pigment: "颜料碎片",
    frame: "构成碎片",
    arcana: "奥秘碎片",
    stem: "干支碎片",
    insight: "洞悉因子",
  };

  function getApp() {
    return window.App;
  }

  function ensurePersonaState() {
    const App = getApp();
    if (!App || !App.data) return null;

    if (!App.data.persona) {
      App.data.persona = {
        selectedId: "painter",
        // 你想要“温和”，先给两位人格都解锁，马上有成就感
        owned: { painter: true, occultist: true },
        personas: {},
        mats: { pigment: 0, frame: 0, arcana: 0, stem: 0, insight: 0 },
      };
    }

    // 深度补默认值（防止以后你改代码又丢字段）
    const st = App.data.persona;
    if (!st.owned) st.owned = { painter: true, occultist: true };
    if (!st.personas) st.personas = {};
    if (!st.mats) st.mats = { pigment: 0, frame: 0, arcana: 0, stem: 0, insight: 0 };

    // 初始化每个人格的成长记录
    Object.keys(PersonaDB).forEach((pid) => {
      if (!st.personas[pid]) {
        const def = PersonaDB[pid];
        st.personas[pid] = {
          exp: 0,
          insight: 0,
          // 每个技能各自等级与经验（你后续要做“分支=技能”就靠它）
          skills: Object.fromEntries(
            def.skills.map((s) => [s.id, { lv: 1, exp: 0 }])
          ),
          mind: null,
        };
      } else {
        // 保障字段完整
        if (typeof st.personas[pid].exp !== "number") st.personas[pid].exp = 0;
        if (typeof st.personas[pid].insight !== "number") st.personas[pid].insight = 0;
        if (!st.personas[pid].skills) st.personas[pid].skills = {};
        PersonaDB[pid].skills.forEach((s) => {
          if (!st.personas[pid].skills[s.id]) st.personas[pid].skills[s.id] = { lv: 1, exp: 0 };
        });
        if (!("mind" in st.personas[pid])) st.personas[pid].mind = null;
      }
    });

    // 默认选中合法人格
    if (!st.selectedId || !PersonaDB[st.selectedId]) st.selectedId = "painter";

    return st;
  }

  function calcLevel(exp) {
    // 你现有系统里大多是 exp/100 升一级，我们保持一致（利于心智模型）
    const lv = Math.floor(exp / 100) + 1;
    return Math.min(Math.max(lv, 1), 60);
  }

  function expToNext(exp) {
    const lv = calcLevel(exp);
    if (lv >= 60) return 0;
    const nextNeedTotal = lv * 100; // lv=1 -> 100 到2；lv=2 -> 200 到3
    return Math.max(nextNeedTotal - exp, 0);
  }

  function pctToNext(exp) {
    const need = expToNext(exp);
    if (need === 0) return 100;
    const lv = calcLevel(exp);
    const curFloor = (lv - 1) * 100;
    const inLv = exp - curFloor;
    return Math.max(0, Math.min(100, (inLv / 100) * 100));
  }

  function safeEl(id) {
    return document.getElementById(id);
  }

  function render() {
    const App = getApp();
    const st = ensurePersonaState();
    if (!App || !st) {
      console.error("PersonaModule：App 未就绪");
      return;
    }

    const container = safeEl("persona-content");
    if (!container) {
      console.error("PersonaModule：找不到 #persona-content（请检查 index.html 是否添加 view-persona）");
      return;
    }

    container.innerHTML = `
      <div class="persona-card-row" id="persona-card-row"></div>

      <div class="persona-panel">
        <div class="p-pane" id="persona-left">
          <div class="pane-head">
            <div>
              <div class="pane-title"><span class="gicon hex"></span><span id="p-left-title">人格</span></div>
              <div class="pane-sub" id="p-left-sub">PROFILE</div>
            </div>
          </div>
          <div class="pane-body" id="p-left-body"></div>
        </div>

        <div class="p-pane" id="persona-center">
          <div class="pane-head">
            <div>
              <div class="pane-title"><span class="gicon ring"></span><span>展示</span></div>
              <div class="pane-sub">SHOWCASE</div>
            </div>
          </div>
          <div class="pane-body" id="p-center-body"></div>
        </div>

        <div class="p-pane" id="persona-right">
          <div class="pane-head">
            <div>
              <div class="pane-title"><span class="gicon diamond"></span><span>养成</span></div>
              <div class="pane-sub">GROWTH</div>
            </div>
            <div style="font-size:10px;color:rgba(255,255,255,.65);">
              材料：<span id="mat-line"></span>
            </div>
          </div>
          <div class="pane-body" id="p-right-body"></div>
        </div>
      </div>
    `;

    renderCardRow();
    selectPersona(st.selectedId);
  }

  function renderCardRow() {
    const st = ensurePersonaState();
    const row = safeEl("persona-card-row");
    if (!st || !row) return;

    row.innerHTML = "";
    Object.keys(PersonaDB).forEach((pid) => {
      const def = PersonaDB[pid];
      const owned = !!st.owned[pid];
      const p = st.personas[pid];
      const lv = calcLevel(p.exp);

      const card = document.createElement("div");
      card.className = "p-card" + (st.selectedId === pid ? " active" : "");
      card.innerHTML = `
        <div class="p-name">${def.cn}</div>
        <div class="p-role">${def.roleCn}</div>
        <div class="p-stars">
          <span class="gicon slash"></span>
          <span style="font-size:11px;color:rgba(255,255,255,.75)">${owned ? `Lv.${lv}` : "未解锁"}</span>
        </div>
        <div class="p-tag">${def.tag}</div>
      `;
      card.onclick = () => selectPersona(pid);
      row.appendChild(card);
    });
  }

  function selectPersona(pid) {
    const App = getApp();
    const st = ensurePersonaState();
    if (!App || !st || !PersonaDB[pid]) return;

    st.selectedId = pid;
    App.save && App.save(); // 保存 + HUD刷新

    // 刷新卡牌选中态
    renderCardRow();

    // 渲染三栏
    renderLeft(pid);
    renderCenter(pid);
    renderRight(pid);
    renderMatLine();
  }

  function renderMatLine() {
    const st = ensurePersonaState();
    const el = safeEl("mat-line");
    if (!st || !el) return;
    const m = st.mats;
    el.textContent = `颜料${m.pigment} · 构成${m.frame} · 奥秘${m.arcana} · 干支${m.stem} · 洞悉${m.insight}`;
  }

  function renderLeft(pid) {
    const st = ensurePersonaState();
    const def = PersonaDB[pid];
    const p = st.personas[pid];
    const body = safeEl("p-left-body");
    if (!body) return;

    const lv = calcLevel(p.exp);

    body.innerHTML = `
      <div class="p-desc">${escapeHtml(def.desc).replace(/\n/g, "<br>")}</div>

      <div class="p-meta">
        <div class="meta-item">
          <div class="meta-k">人格 / PERSONA</div>
          <div class="meta-v">${def.cn} · ${def.en}</div>
        </div>
        <div class="meta-item">
          <div class="meta-k">等级 / LEVEL</div>
          <div class="meta-v">Lv.${lv}</div>
        </div>
        <div class="meta-item">
          <div class="meta-k">洞悉 / INSIGHT</div>
          <div class="meta-v">I-${p.insight}</div>
        </div>
        <div class="meta-item">
          <div class="meta-k">区域 / DOMAIN</div>
          <div class="meta-v">${def.tag}</div>
        </div>
      </div>

      <div class="p-section" style="margin-top:12px;">
        <div class="sec-head">
          <div class="sec-title">基础属性</div>
          <div class="sec-sub">BASE STATS</div>
        </div>
        <div class="sec-body">
          ${renderBaseStats(def.base)}
        </div>
      </div>
    `;
  }

  function renderBaseStats(base) {
    const items = [
      ["意志", base.will],
      ["专注", base.focus],
      ["技艺", base.craft],
      ["秩序", base.order],
    ];
    return items
      .map(([k, v]) => {
        const pct = Math.max(0, Math.min(100, v));
        return `
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font-weight:800">${k}</div>
              <div style="color:rgba(255,255,255,.75);font-size:12px;">${v}</div>
            </div>
            <div class="bar" style="margin-top:6px;"><i style="width:${pct}%"></i></div>
          </div>
        `;
      })
      .join("");
  }

  function renderCenter(pid) {
    const def = PersonaDB[pid];
    const body = safeEl("p-center-body");
    if (!body) return;

    body.innerHTML = `
      <div class="p-showcase">
        <div class="p-sigil-grid"></div>
        <div class="p-silhouette">
          <span class="gicon diamond" style="margin-right:10px;"></span>
          ${def.cn} · ${def.en}
        </div>
      </div>
      <div style="margin-top:10px;color:rgba(255,255,255,.65);font-size:11px;line-height:1.6;">
        这里以后可以放“立绘/半身像/动态构成”。现在先用构成框占位，保证你立刻有“角色页质感”。
      </div>
    `;
  }

  function renderRight(pid) {
    const App = getApp();
    const st = ensurePersonaState();
    const def = PersonaDB[pid];
    const p = st.personas[pid];
    const body = safeEl("p-right-body");
    if (!body) return;

    const lv = calcLevel(p.exp);
    const nextNeed = expToNext(p.exp);
    const pct = pctToNext(p.exp);

    body.innerHTML = `
      <div class="p-actions">
        <button class="p-btn primary" id="btn-train">
          <span class="gicon hex"></span>
          训练（消耗1树之眼）
        </button>

        <button class="p-btn" id="btn-levelup" ${nextNeed === 0 ? "disabled" : ""}>
          <span class="gicon ring"></span>
          升级
        </button>

        <button class="p-btn" id="btn-insight">
          <span class="gicon diamond"></span>
          洞悉
        </button>
      </div>

      <div class="p-section">
        <div class="sec-head">
          <div class="sec-title">等级进度</div>
          <div class="sec-sub">Lv.${lv} · ${nextNeed === 0 ? "MAX" : `距离下一级 ${nextNeed} EXP`}</div>
        </div>
        <div class="sec-body">
          <div class="bar"><i style="width:${pct}%"></i></div>
          <div style="margin-top:8px;color:rgba(255,255,255,.65);font-size:11px;">
            经验：${p.exp} / ${lv >= 60 ? "—" : lv * 100}
          </div>
        </div>
      </div>

      <div class="p-section">
        <div class="sec-head">
          <div class="sec-title">技能</div>
          <div class="sec-sub">SKILLS</div>
        </div>
        <div class="sec-body" id="skill-wrap"></div>
      </div>

      <div class="p-section">
        <div class="sec-head">
          <div class="sec-title">心相</div>
          <div class="sec-sub">MIND IMPRINT</div>
        </div>
        <div class="sec-body">
          <div style="border:1px dashed rgba(201,162,58,.25);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div style="font-weight:900;letter-spacing:.06em;">心相槽位</div>
              <div style="color:rgba(255,255,255,.65);font-size:11px;">${p.mind ? "已装备" : "未装备"}</div>
            </div>
            <div style="margin-top:8px;color:rgba(255,255,255,.7);font-size:12px;line-height:1.6;">
              ${p.mind ? escapeHtml(String(p.mind)) : "（以后你可以把“复盘/习惯/财务策略”等做成心相卡，装上去就是长期增益。）"}
            </div>
          </div>
        </div>
      </div>
    `;

    // 绑定按钮
    const btnTrain = safeEl("btn-train");
    const btnLv = safeEl("btn-levelup");
    const btnIns = safeEl("btn-insight");

    if (btnTrain) btnTrain.onclick = () => trainOnce(pid);
    if (btnLv) btnLv.onclick = () => levelUp(pid);
    if (btnIns) btnIns.onclick = () => insightUp(pid);

    // 渲染技能卡
    const skillWrap = safeEl("skill-wrap");
    if (skillWrap) {
      skillWrap.innerHTML = "";
      def.skills.forEach((s) => {
        const sp = p.skills[s.id];
        const matCnt = st.mats[s.mat] || 0;
        const canUp = sp.lv < s.maxLv && matCnt >= 1;

        const card = document.createElement("div");
        card.className = "skill-card";
        card.innerHTML = `
          <div class="skill-name">
            <span>${s.cn}</span>
            <span class="skill-lv">Lv.${sp.lv}/${s.maxLv}</span>
          </div>
          <div class="skill-desc">${escapeHtml(s.desc)}</div>
          <div class="skill-foot">
            <div style="color:rgba(255,255,255,.65);font-size:11px;">
              需要：${MatName[s.mat] || s.mat} ×1（现有 ${matCnt}）
            </div>
            <button class="p-btn ${canUp ? "primary" : ""}" ${canUp ? "" : "disabled"} data-sid="${s.id}">
              <span class="gicon slash"></span>
              强化
            </button>
          </div>
        `;
        card.querySelector("button")?.addEventListener("click", () => skillUp(pid, s.id));
        skillWrap.appendChild(card);
      });
    }

    renderMatLine();
  }

  function trainOnce(pid) {
    const App = getApp();
    const st = ensurePersonaState();
    if (!App || !st) return;

    // 训练：消耗 1 树之眼 -> 获得人格经验 + 随机材料
    if (typeof App.data.eyes !== "number") App.data.eyes = 0;
    if (App.data.eyes < 1) {
      alert("树之眼不足。你可以先去做一个任务/番茄钟，或者后续我们把任务标签接入掉落。");
      return;
    }

    App.data.eyes -= 1;

    const p = st.personas[pid];
    p.exp += 12; // 你可以按体感再调（先让成长明显一点）

    // 掉落：80%掉本人格的随机技能材料，20%掉洞悉因子
    const roll = Math.random();
    if (roll < 0.2) {
      st.mats.insight += 1;
    } else {
      const def = PersonaDB[pid];
      const mats = def.skills.map((s) => s.mat);
      const pick = mats[Math.floor(Math.random() * mats.length)];
      st.mats[pick] = (st.mats[pick] || 0) + 1;
    }

    App.save && App.save();
    selectPersona(pid);
  }

  function levelUp(pid) {
    const App = getApp();
    const st = ensurePersonaState();
    if (!App || !st) return;

    const p = st.personas[pid];
    const need = expToNext(p.exp);
    if (need === 0) return;

    // 升级不额外消耗资源：只要经验够就“自动升级”（更温和）
    // 经验模型本身已经决定等级了，这里只是做一个“反馈按钮”
    if (need > 0) {
      alert(`等级由经验自动决定：再获得 ${need} EXP 即可升级。你可以继续训练或完成任务。`);
    }
  }

  function insightUp(pid) {
    const App = getApp();
    const st = ensurePersonaState();
    if (!App || !st) return;

    const p = st.personas[pid];
    const next = p.insight + 1;
    if (next > 3) {
      alert("洞悉已达上限（I-3）。以后我们可以扩展更高阶。");
      return;
    }

    // 洞悉消耗：洞悉因子（温和、清晰）
    const cost = next * 2; // I-1=2, I-2=4, I-3=6
    if ((st.mats.insight || 0) < cost) {
      alert(`洞悉因子不足：需要 ${cost}，现有 ${st.mats.insight || 0}。\n你可以通过训练/活动代币兑换（后续接入）。`);
      return;
    }

    st.mats.insight -= cost;
    p.insight = next;

    App.save && App.save();
    selectPersona(pid);
  }

  function skillUp(pid, sid) {
    const App = getApp();
    const st = ensurePersonaState();
    if (!App || !st) return;

    const def = PersonaDB[pid];
    const skillDef = def.skills.find((x) => x.id === sid);
    if (!skillDef) return;

    const p = st.personas[pid];
    const sp = p.skills[sid];
    if (sp.lv >= skillDef.maxLv) return;

    const mat = skillDef.mat;
    if ((st.mats[mat] || 0) < 1) return;

    st.mats[mat] -= 1;
    sp.lv += 1;

    App.save && App.save();
    selectPersona(pid);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  const PersonaModule = {
    open() {
      // 每次打开都重渲染（稳定，避免你以后改UI造成“旧DOM残留”）
      render();
    },

    // 预留：以后把日常/主线任务标签接入掉落
    // 例如 App.doRoutineTask 完成后调用 PersonaModule.onTaggedTask("绘画")
    onTaggedTask(tag) {
      const App = getApp();
      const st = ensurePersonaState();
      if (!App || !st) return;

      // 示例：按标签给材料（你以后要的“概率掉材料”就从这里发展）
      // 现在先保守一点，不主动修改任务逻辑，等你说“要接任务”再做。
      console.log("PersonaModule.onTaggedTask:", tag);
    },
  };

  window.PersonaModule = PersonaModule;
})();
