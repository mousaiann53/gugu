// persona.js —— 独立人格系统（最小可用版）
// 目标：一定能渲染、不污染全局、以后再慢慢加“洞悉/技能/心相/材料”。

(function () {
  const DB = [
    {
      id: "painter",
      cn: "画家",
      en: "PAINTER",
      title: "缪塞花园的记录者",
      desc: "把现实的学习与练习，变成可见的成长曲线。",
      stats: { level: 1, insight: 0, skillPts: 0 },
      skills: [
        { cn: "水彩·基础", desc: "完成水彩课程/作业时更容易获得成长材料。" },
        { cn: "构成·透视", desc: "完成构成练习时更容易获得成长材料。" },
      ],
    },
    {
      id: "mystic",
      cn: "玄学家",
      en: "MYSTIC",
      title: "缄默双塔的解读者",
      desc: "让笔记与复盘变成仪式感，而不是负担。",
      stats: { level: 1, insight: 0, skillPts: 0 },
      skills: [
        { cn: "塔罗·西玄", desc: "完成塔罗笔记时，获得额外技能点概率提升。" },
        { cn: "八字·东玄", desc: "完成八字笔记时，获得额外技能点概率提升。" },
      ],
    },
  ];

  const PersonaModule = {
    init() {
      // 1) 确保 App.data 有人格存档
      if (window.App && App.data) {
        if (!App.data.persona) {
          App.data.persona = {
            owned: ["painter", "mystic"], // 先给两个默认可用，后面再改成“解锁/抽取”
            current: "painter",
            stats: {
              painter: { level: 1, insight: 0, skillPts: 0 },
              mystic: { level: 1, insight: 0, skillPts: 0 },
            },
          };
          App.save && App.save();
        }
      }

      // 2) 把人格渲染挂到 App.openView（不改你 engine.js 也能用）
      if (window.App && typeof App.openView === "function" && !App.__personaPatched) {
        const _open = App.openView.bind(App);
        App.openView = function (viewId) {
          _open(viewId);
          if (viewId === "view-persona") {
            PersonaModule.render();
          }
        };
        App.__personaPatched = true;
      }
    },

    getState() {
      const st = (window.App && App.data && App.data.persona) || null;
      return st;
    },

    render() {
      const root = document.getElementById("persona-content");
      if (!root) return;

      const state = this.getState();
      const owned = state ? state.owned : DB.map(x => x.id);
      const current = state ? state.current : owned[0];

      root.innerHTML = `
        <div class="persona-view">
          <div class="persona-roster">
            <div class="roster-title">PERSONA ROSTER</div>
            <div class="roster-strip" id="persona-strip"></div>
          </div>

          <div class="persona-stage">
            <div class="silhouette" id="persona-silhouette">FIGURE</div>
          </div>

          <div class="persona-panel" id="persona-panel"></div>
        </div>
      `;

      const strip = document.getElementById("persona-strip");
      owned.forEach(id => {
        const p = DB.find(x => x.id === id);
        if (!p) return;
        const card = document.createElement("div");
        card.className = "persona-card" + (id === current ? " active" : "");
        card.onclick = () => this.select(id);
        card.innerHTML = `
          <div class="name-cn">${p.cn}</div>
          <div class="name-en">${p.en}</div>
          <div class="tagline">${p.title}</div>
        `;
        strip.appendChild(card);
      });

      this.renderDetail(current);
    },

    select(id) {
      const st = this.getState();
      if (st) {
        st.current = id;
        App.save && App.save();
      }
      this.render(); // 简单粗暴：重绘一次，稳定
    },

    renderDetail(id) {
      const p = DB.find(x => x.id === id);
      const panel = document.getElementById("persona-panel");
      const fig = document.getElementById("persona-silhouette");
      if (!p || !panel) return;

      const st = this.getState();
      const stats = (st && st.stats && st.stats[id]) ? st.stats[id] : p.stats;

      if (fig) fig.textContent = p.en;

      panel.innerHTML = `
        <div class="p-title">
          <div>
            <div class="big">${p.cn}</div>
            <div class="small">${p.title} · ${p.en}</div>
          </div>
          <div class="small" style="color:var(--gold-dim)">ID: ${p.id}</div>
        </div>

        <div style="color:#777; font-size:12px; line-height:1.5;">${p.desc}</div>

        <div class="stats">
          <div class="stat"><div class="k">等级 LV</div><div class="v">${stats.level}</div></div>
          <div class="stat"><div class="k">洞悉 INSIGHT</div><div class="v">${stats.insight}</div></div>
          <div class="stat"><div class="k">技能点 SKILL PTS</div><div class="v">${stats.skillPts}</div></div>
        </div>

        <div class="actions">
          <button class="btn-geo" onclick="PersonaModule.levelUp('${p.id}')">LEVEL</button>
          <button class="btn-geo" onclick="PersonaModule.insightUp('${p.id}')">INSIGHT</button>
        </div>

        <div class="skill-grid">
          ${p.skills.map(s => `
            <div class="skill-card">
              <div class="s-name">${s.cn}</div>
              <div class="s-desc">${s.desc}</div>
            </div>
          `).join("")}
        </div>

        <div class="heart-slot">HEART / 心相槽位（后续加入）</div>
      `;
    },

    levelUp(id) {
      const st = this.getState();
      if (!st || !st.stats || !st.stats[id]) return;
      st.stats[id].level += 1;
      st.stats[id].skillPts += 1;
      App.save && App.save();
      this.renderDetail(id);
      alert("等级 +1 / 技能点 +1");
    },

    insightUp(id) {
      const st = this.getState();
      if (!st || !st.stats || !st.stats[id]) return;
      st.stats[id].insight += 1;
      App.save && App.save();
      this.renderDetail(id);
      alert("洞悉 +1");
    },
  };

  window.PersonaModule = PersonaModule;

  // DOMContentLoaded 后初始化（即使你没手动调用也能生效）
  document.addEventListener("DOMContentLoaded", () => {
    PersonaModule.init();
  });
})();
