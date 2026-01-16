const App = {
  data: {
    profile: {
      name: "咕咕菌",
      title: "初级时间管理者",
      level: 1,
      rank: "黑铁",
      skill: "时间暂停 (未解锁)",
      birthday: "未设置",
      avatar: null,
    },
    gems: 0,
    stars: 0,
    eyes: 0,
    sigils: 0,
    exp: 0,
    level: 1,
    bpExp: 0,
    tasksDone: {},
    bpTasksDone: {},
    bpClaimed: [],
    taskStats: {},
    inventory: {},
    shopLimits: {},
    gachaHistory: [],
    monthlySavings: 0,
    lastLogin: "",
    lastMonth: -1,
    birthdayClaimedYear: null,
    lifetimeStats: { totalLogin: 0, totalTasks: 0, totalGacha: 0, totalSavings: 0 },
        achievementsClaimed: [],
    // 人格/技能系统（v0.1）
    persona: {
      tokens: 0,              // 徽记：做任务获得，用于开盲盒/兑换材料
      lastFreeRoll: '',       // 每日免费盲盒日期（toDateString）
      mats: {                 // 技能材料
        watercolor: 0,
        illustration: 0,
        tarot: 0,
        bazi: 0,
        universal: 0,
      },
      skills: {
        watercolor: { lvl: 1, xp: 0 },
        illustration: { lvl: 1, xp: 0 },
        tarot: { lvl: 1, xp: 0 },
        bazi: { lvl: 1, xp: 0 },
      },
      unlocked: { painter: true, mystic: true }, // 先都开，后续再接主线解锁
      history: [], // 最近掉落记录（最多保留20条）
    },
  },

  init() {
    console.log("Game Init Start");
    this.load();
    this.ensurePersonaSystem();
    this.timeCheck();
    this.checkLoginTask();
    this.renderHUD();

    // 这行会尝试自动播放，失败也没关系（手机常见）
    const bgm = document.getElementById("bgm");
    if (bgm) bgm.play().catch(() => {});
  },

  // 修复：深度合并 load 数据，防止 profile 丢失
  load() {
    const s = localStorage.getItem("gugugu_gold_v7_9");
    const def = {
      profile: {
        name: "咕咕菌",
        title: "初级时间管理者",
        level: 1,
        rank: "黑铁",
        skill: "时间暂停 (未解锁)",
        birthday: "未设置",
        avatar: null,
      },
      gems: 0,
      stars: 0,
      eyes: 0,
      sigils: 0,
      exp: 0,
      level: 1,
      bpExp: 0,
      tasksDone: {},
      bpTasksDone: {},
      bpClaimed: [],
      taskStats: {},
      inventory: {},
      shopLimits: {},
      gachaHistory: [],
      monthlySavings: 0,
      lastLogin: "",
      lastMonth: -1,
      birthdayClaimedYear: null,
      lifetimeStats: { totalLogin: 0, totalTasks: 0, totalGacha: 0, totalSavings: 0 },
          achievementsClaimed: [],
    // 人格/技能系统（v0.1）
    persona: {
      tokens: 0,              // 徽记：做任务获得，用于开盲盒/兑换材料
      lastFreeRoll: '',       // 每日免费盲盒日期（toDateString）
      mats: {                 // 技能材料
        watercolor: 0,
        illustration: 0,
        tarot: 0,
        bazi: 0,
        universal: 0,
      },
      skills: {
        watercolor: { lvl: 1, xp: 0 },
        illustration: { lvl: 1, xp: 0 },
        tarot: { lvl: 1, xp: 0 },
        bazi: { lvl: 1, xp: 0 },
      },
      unlocked: { painter: true, mystic: true }, // 先都开，后续再接主线解锁
      history: [], // 最近掉落记录（最多保留20条）
    },
    };

    if (s) {
      const parsed = JSON.parse(s);
      this.data = { ...def, ...parsed };
      if (!this.data.profile) this.data.profile = def.profile;
    } else {
      // 如果没有存档，就用默认值（更稳）
      this.data = { ...def };
    }
  },

  save() {
    localStorage.setItem("gugugu_gold_v7_9", JSON.stringify(this.data));
    this.renderHUD();
  },

  hardReset() {
    if (confirm("⚠ RESET ALL?")) {
      localStorage.removeItem("gugugu_gold_v7_9");
      location.reload();
    }
  },

  timeCheck() {
    const now = new Date();
    const today = now.toDateString();
    const month = now.getMonth();
    const dayOfWeek = now.getDay();
    const currentYear = now.getFullYear();

    this.checkBirthday(now, currentYear);

    if (this.data.lastLogin !== today) {
      if (!this.data.lifetimeStats) {
        this.data.lifetimeStats = { totalLogin: 0, totalTasks: 0, totalGacha: 0, totalSavings: 0 };
      }
      this.data.lifetimeStats.totalLogin++;

      for (let sid in this.data.shopLimits) {
        const s = GUGU_DB.shop.find((x) => x.id === sid);
        if (s && s.limitType === "day") delete this.data.shopLimits[sid];
      }

      for (let k in this.data.tasksDone) if (k.startsWith("r")) this.data.tasksDone[k] = false;
      for (let k in this.data.bpTasksDone) if (k.startsWith("bd")) this.data.bpTasksDone[k] = false;

      if (dayOfWeek === 1) {
        this.data.taskStats = {};
        for (let k in this.data.tasksDone) if (k.startsWith("z")) this.data.tasksDone[k] = false;
        for (let k in this.data.bpTasksDone) if (k.startsWith("bw")) this.data.bpTasksDone[k] = false;
      }

      if (this.data.eyes < 99) {
        this.data.eyes = Math.min(99, this.data.eyes + 3);
      }

      this.data.lastLogin = today;
      this.save();
      this.checkLoginTask();
    }

    if (this.data.lastMonth !== -1 && this.data.lastMonth !== month) {
      alert("NEW SEASON STARTED");
      this.data.bpExp = 0;
      this.data.bpClaimed = [];
      this.data.bpTasksDone = {};
      this.data.taskStats = {};
      this.data.shopLimits = {};
      this.data.monthlySavings = 0;
    }

    this.data.lastMonth = month;
    this.save();
  },

  checkBirthday(now, currentYear) {
    if (this.data.profile && this.data.profile.birthday !== "未设置") {
      const [bMonth, bDay] = this.data.profile.birthday.split("-");
      if (now.getMonth() + 1 == bMonth && now.getDate() == bDay) {
        if (this.data.birthdayClaimedYear !== currentYear) {
          this.data.sigils += 10;
          this.data.birthdayClaimedYear = currentYear;
          alert("🎂 生日快乐！获得【正印 x10】");
          this.save();
        }
      }
    }
  },

  checkLoginTask() {
    if (!this.data.bpTasksDone["bd01"]) {
      this.data.bpTasksDone["bd01"] = true;
      this.data.bpExp += 150;
      this.save();
    }
  },

  renderHUD() {
    const d = this.data;
    if (d.profile) document.getElementById("ui-name").innerText = d.profile.name;

    document.getElementById("main-savings").innerText = d.monthlySavings;
    document.getElementById("res-star").innerText = d.stars;
    document.getElementById("res-eye").innerText = d.eyes;
    document.getElementById("res-gem").innerText = d.gems;
    document.getElementById("res-sigil").innerText = d.sigils;

    d.level = Math.floor(d.exp / 100) + 1;
    document.getElementById("ui-lvl").innerText = d.level;
    document.getElementById("ui-exp").innerText = `${d.exp % 100}/100`;
  },

  openView(viewId) {
    document.querySelectorAll(".fs-view").forEach((v) => v.classList.remove("active"));

    const view = document.getElementById(viewId);
    if (!view) {
      console.error("View not found:", viewId);
      return;
    }
    view.classList.add("active");

    if (viewId === "view-routine") {
      this.renderTabs(viewId, [{ cn: "每日", en: "DAILY" }, { cn: "每周", en: "WEEKLY" }], (idx) =>
        this.renderRoutineList(idx)
      );
      this.renderRoutineList(0);
    } else if (viewId === "view-shop") {
      this.renderShop();
    } else if (viewId === "view-inventory") {
      this.renderInventory();
    } else if (viewId === "view-wish") {
      this.renderTabs(
        viewId,
        [{ cn: "限定池", en: "LIMITED" }, { cn: "常驻池", en: "STANDARD" }],
        (idx) => this.renderWish(idx)
      );
      this.renderWish(0);
    } else if (viewId === "view-mainline") {
      if (typeof MainlineModule !== "undefined" && MainlineModule.renderChapters) {
        MainlineModule.renderChapters();
      } else {
        console.error("MainlineModule not ready");
      }
    } else if (viewId === "view-museum") {
      this.renderMuseumTabs();
      this.renderMuseum("permanent");
    } else if (viewId === "view-bp") {
      // 月度纪行：默认展示路书（路书里会提供“任务”按钮）
      this.renderBpPath();
    } else if (viewId === "view-profile") {
      this.renderProfile();
    }

    this.renderHUD();
  },

  // ✅ 关键：返回按钮依赖这个函数！之前你缺了它，所以返回没反应
  closeView() {
    document.querySelectorAll(".fs-view").forEach((v) => v.classList.remove("active"));
    const mask = document.getElementById("mask");
    if (mask) mask.style.display = "none";
    this.renderHUD();
  },

  renderTabs(viewId, items, cb) {
    const view = document.getElementById(viewId);
    let tabContainer = view.querySelector(".inner-tabs");
    if (!tabContainer) {
      tabContainer = document.createElement("div");
      tabContainer.className = "inner-tabs";
      const content = view.querySelector(".view-content");
      content.parentElement.insertBefore(tabContainer, content);
    }
    tabContainer.innerHTML = "";
    items.forEach((item, i) => {
      const btn = document.createElement("div");
      btn.className = `inner-tab ${i === 0 ? "active" : ""}`;
      btn.innerText = item.cn;
      btn.onclick = () => {
        tabContainer.querySelectorAll(".inner-tab").forEach((e) => e.classList.remove("active"));
        btn.classList.add("active");
        cb(i);
      };
      tabContainer.appendChild(btn);
    });
  },

  renderMuseumTabs() {
    const container = document.getElementById("museum-tabs");
    container.innerHTML = "";
    const tabs = [
      { id: "permanent", n: "常设展厅" },
      { id: "journey", n: "旅途特展" },
      { id: "brilliant", n: "璀璨馆藏" },
      { id: "commemorative", n: "纪念临展" },
    ];
    tabs.forEach((t, i) => {
      const btn = document.createElement("div");
      btn.className = `museum-side-tab ${i === 0 ? "active" : ""}`;
      btn.innerText = t.n;
      btn.onclick = () => {
        document.querySelectorAll(".museum-side-tab").forEach((e) => e.classList.remove("active"));
        btn.classList.add("active");
        this.renderMuseum(t.id);
      };
      container.appendChild(btn);
    });
  },

  renderMuseum(cat) {
    const container = document.getElementById("museum-content");
    container.innerHTML = `<div class="museum-grid"></div>`;
    const grid = container.firstChild;

    const stats = this.data.lifetimeStats || { totalLogin: 0, totalTasks: 0, totalGacha: 0, totalSavings: 0 };
    this.data.lifetimeStats.totalSavings = this.data.monthlySavings;

    const list = GUGU_DB.museum.filter((m) => m.category === cat);
    if (list.length === 0) {
      container.innerHTML = '<div style="text-align:center; color:#555; margin-top:50px;">暂无展品</div>';
      return;
    }

    list.forEach((ach) => {
      const claimed = this.data.achievementsClaimed && this.data.achievementsClaimed.includes(ach.id);
      const currentVal = stats[ach.check] || 0;
      const unlocked = currentVal >= ach.val;

      let statusClass = "locked";
      if (claimed) statusClass = "claimed";
      else if (unlocked) statusClass = "unlocked";

      const div = document.createElement("div");
      div.className = `museum-card ${statusClass}`;
      div.innerHTML = `<div class="ach-icon"></div>
        <div class="ach-title">${ach.name}</div>
        <div class="ach-desc">${ach.desc} (${currentVal}/${ach.val})</div>
        <div class="ach-stamp">CLAIMED</div>
        ${
          !claimed && unlocked
            ? `<button class="btn-act" onclick="App.claimAchievement('${ach.id}', '${cat}')"><span class="txt-cn">领取</span></button>`
            : ""
        }`;

      grid.appendChild(div);
    });
  },

  claimAchievement(id, cat) {
    const ach = GUGU_DB.museum.find((a) => a.id === id);
    if (!this.data.achievementsClaimed) this.data.achievementsClaimed = [];
    this.data.achievementsClaimed.push(id);

    if (ach.reward.t === "gem") this.data.gems += ach.reward.v;
    if (ach.reward.t === "star") this.data.stars += ach.reward.v;
    if (ach.reward.t === "sigil") this.data.sigils += ach.reward.v;
    if (ach.reward.t === "eye") this.data.eyes += ach.reward.v;

    alert(`成就达成！获得 ${ach.reward.v} ${ach.reward.t}`);
    this.save();
    this.renderMuseum(cat);
  },

  renderRoutineList(idx) {
    const list = idx === 0 ? GUGU_DB.routine.daily : GUGU_DB.routine.weekly;
    const container = document.getElementById("routine-content");
    container.innerHTML = `<div class="list-wrap"></div>`;
    const wrap = container.firstChild;

    list.forEach((item) => {
      const done = this.data.tasksDone[item.id];
      const el = document.createElement("div");
      el.className = "row";
      if (done) el.style.opacity = 0.5;

      el.innerHTML = `<div class="row-left">
          <span class="row-title">${item.name}</span>
          <span class="row-meta">原石: ${item.reward} | 经验: ${item.exp}</span>
        </div>
        <button class="btn-act" ${done ? "disabled" : ""} onclick="App.doRoutineTask('${item.id}', ${
        item.reward
      }, ${item.exp}, ${idx}, '${item.link || ""}')">
          <span class="txt-cn">${done ? "已完成" : "执行"}</span>
          <span class="txt-en">${done ? "COMPLETED" : "EXECUTE"}</span>
        </button>`;

      wrap.appendChild(el);
    });
  },

  doRoutineTask(id, r, e, tabIdx, linkType) {
    this.data.tasksDone[id] = true;
    this.data.gems += r;
    this.data.exp += e;

    if (!this.data.lifetimeStats) {
      this.data.lifetimeStats = { totalLogin: 0, totalTasks: 0, totalGacha: 0, totalSavings: 0 };
    }
    this.data.lifetimeStats.totalTasks++;

    if (linkType) {
      if (!this.data.taskStats[linkType]) this.data.taskStats[linkType] = 0;
      this.data.taskStats[linkType]++;

      // ✅ 修复潜在炸弹：确保 ++ 后不会把 [ 当索引
      [...GUGU_DB.bp.tasks.weekly, ...GUGU_DB.bp.tasks.monthly].forEach((t) => {
        if (t.type === linkType && !this.data.bpTasksDone[t.id]) {
          if (this.data.taskStats[linkType] >= t.req) {
            this.data.bpTasksDone[t.id] = true;
            this.data.bpExp += t.exp;
          }
        }
      });
    }

    this.save();
    this.renderRoutineList(tabIdx);
  },

  gacha(n, poolType) {
    let neededSigils = 0;
    if (this.data.sigils < n) neededSigils = n - this.data.sigils;

    if (neededSigils > 0) {
      const gemCost = neededSigils * 180;
      if (this.data.gems < gemCost) return alert("原石不足！");
      if (confirm(`正印不足，消耗 ${gemCost} 原石兑换？`)) {
        this.data.gems -= gemCost;
        this.data.sigils += neededSigils;
      } else return;
    }

    this.data.sigils -= n;

    if (!this.data.lifetimeStats) {
      this.data.lifetimeStats = { totalLogin: 0, totalTasks: 0, totalGacha: 0, totalSavings: 0 };
    }
    this.data.lifetimeStats.totalGacha += n;

    const box = document.getElementById("wish-res");
    box.innerHTML = "";
    const pool = GUGU_DB.gachaPool[poolType];

    for (let i = 0; i < n; i++) {
      this.data.pity5 = (this.data.pity5 || 0) + 1;

      let item = null;
      let roll = Math.random() * 100;
      let cumulative = 0;

      for (let pItem of pool) {
        cumulative += pItem.weight;
        if (roll <= cumulative) {
          item = pItem;
          break;
        }
      }
      if (!item) item = pool[pool.length - 1];
      if (item.star >= 5) this.data.pity5 = 0;

      if (item.type === "gold") {
        this.data.monthlySavings += item.val;
      } else if (item.type === "item") {
        if (!this.data.inventory[item.id]) this.data.inventory[item.id] = 0;
        this.data.inventory[item.id]++;
      }

      if (!this.data.gachaHistory) this.data.gachaHistory = [];
      this.data.gachaHistory.unshift({ name: item.name, star: item.star, date: new Date().toLocaleTimeString() });
      if (this.data.gachaHistory.length > 500) this.data.gachaHistory.pop();

      const div = document.createElement("div");
      div.className = "pull-line";
      div.style.color = item.star >= 5 ? "var(--gold-main)" : item.star === 4 ? "#fff" : "#777";
      div.innerText = `[${item.star}★] ${item.name}`;
      box.prepend(div);
    }

    this.save();
    this.renderWish(poolType === "limited" ? 0 : 1);
  },

  renderWish(poolIdx) {
    const container = document.getElementById("wish-content");
    const poolType = poolIdx === 0 ? "limited" : "standard";
    container.innerHTML = `<div style="padding:20px;">
        <button class="history-btn" onclick="App.renderHistory()">历史记录</button>
      </div>
      <div style="text-align:center; padding:20px;">
        <div style="font-family:'Cinzel'; color:#666; margin-bottom:30px;">
          <span style="color:var(--gold-main); font-size:16px;">180 原石 / 次 (优先消耗正印)</span><br><br>
          距离五星保底: <span style="color:#fff;">${70 - (this.data.pity5 || 0)}</span>
        </div>
        <div style="display:flex; justify-content:center; gap:20px;">
          <button class="btn-act" style="padding:5px 30px;" onclick="App.gacha(1, '${poolType}')">
            <span class="txt-cn">祈愿 x1</span><span class="txt-en">ONCE</span>
          </button>
          <button class="btn-act" style="padding:5px 30px;" onclick="App.gacha(10, '${poolType}')">
            <span class="txt-cn">祈愿 x10</span><span class="txt-en">TENFOLD</span>
          </button>
        </div>
        <div class="wish-res" id="wish-res"></div>
      </div>`;
  },

  renderHistory() {
    const container = document.getElementById("wish-content");
    container.innerHTML = `<div style="padding:20px;">
        <button class="btn-act" onclick="App.renderWish(0)" style="margin-bottom:20px;">BACK</button>
        <div style="max-height:400px; overflow-y:auto;">
          ${(this.data.gachaHistory || [])
            .map(
              (h) =>
                `<div style="border-bottom:1px dashed #333; padding:10px; color:${
                  h.star >= 5 ? "var(--gold-main)" : h.star === 4 ? "#fff" : "#777"
                }">[${h.star}★] ${h.name} <span style="float:right; font-size:10px; color:#555">${h.date}</span></div>`
            )
            .join("")}
        </div>
      </div>`;
  },

  renderShop() {
    const container = document.getElementById("shop-content");
    container.innerHTML = `<div class="shop-grid"></div>`;
    const grid = container.firstChild;

    GUGU_DB.shop.forEach((s) => {
      const item = GUGU_DB.items[s.itemId];
      const bought = this.data.shopLimits[s.id] || 0;
      const limitText = s.limitType === "none" ? "不限购" : `剩余: ${s.limit - bought}/${s.limit}`;
      const canBuy = (s.limitType === "none" || bought < s.limit) && this.data.stars >= s.price;

      const div = document.createElement("div");
      div.className = "shop-card";
      div.innerHTML = `<div class="item-icon ${item.icon}"></div>
        <span class="txt-cn" style="font-weight:bold">${item.name}</span>
        <span class="txt-en" style="color:#666; font-size:10px;">${item.desc}</span>
        <div style="margin-top:10px; font-size:12px; color:#888;">${limitText}</div>
        <button class="btn-act" ${canBuy ? "" : "disabled"} onclick="App.buyItem('${s.id}')">
          <span class="txt-cn">${s.price} 星币</span><span class="txt-en">BUY</span>
        </button>`;

      grid.appendChild(div);
    });
  },

  buyItem(shopId) {
    const s = GUGU_DB.shop.find((x) => x.id === shopId);
    const bought = this.data.shopLimits[shopId] || 0;

    if (s.limitType !== "none" && bought >= s.limit) return alert("限购已满");
    if (this.data.stars < s.price) return alert("星币不足");

    this.data.stars -= s.price;
    if (s.limitType !== "none") this.data.shopLimits[shopId] = bought + 1;

    if (s.itemId === "i02") {
      this.data.eyes++;
      alert("树之眼+1");
    } else if (s.itemId === "i05") {
      this.data.sigils++;
      alert("正印+1");
    } else if (GUGU_DB.vouchers[s.itemId]) {
      this.data.monthlySavings += GUGU_DB.vouchers[s.itemId];
      alert("丰饶资金增加");
    } else {
      if (!this.data.inventory[s.itemId]) this.data.inventory[s.itemId] = 0;
      this.data.inventory[s.itemId]++;
      alert("已存入仓库");
    }

    this.save();
    this.renderShop();
  },

  renderInventory() {
    const container = document.getElementById("inventory-content");
    const invKeys = Object.keys(this.data.inventory);

    if (invKeys.length === 0) {
      container.innerHTML = '<div style="padding:50px; text-align:center; color:#555">EMPTY</div>';
      return;
    }

    container.innerHTML = `<div class="list-wrap"></div>`;
    const wrap = container.firstChild;

    invKeys.forEach((id) => {
      const count = this.data.inventory[id];
      if (count > 0) {
        const item =
          GUGU_DB.items[id] ||
          GUGU_DB.gachaPool.limited.find((g) => g.id === id) ||
          GUGU_DB.gachaPool.standard.find((g) => g.id === id);

        if (item) {
          const div = document.createElement("div");
          div.className = "row";
          div.innerHTML = `<div class="row-left">
              <span class="row-title">${item.name} <span style="color:var(--gold-main)">x${count}</span></span>
              <span class="row-meta">${item.desc || "稀有物品"}</span>
            </div>
            <button class="btn-act" onclick="App.useItem('${id}')">
              <span class="txt-cn">使用</span><span class="txt-en">USE</span>
            </button>`;
          wrap.appendChild(div);
        }
      }
    });
  },

  useItem(id) {
    if (confirm("使用此道具吗？")) {
      this.data.inventory[id]--;
      if (id === "i02") {
        this.data.eyes++;
        alert("树之眼 +1");
      } else if (id === "i05") {
        this.data.sigils++;
        alert("正印 +1");
      } else if (GUGU_DB.vouchers[id]) {
        this.data.monthlySavings += GUGU_DB.vouchers[id];
        alert(`丰饶资金 +${GUGU_DB.vouchers[id]}`);
      } else {
        alert("道具已使用");
      }
      this.save();
      this.renderInventory();
    }
  },

  // ✅ 月度纪行：路书（带“路书/任务”切换）
  renderBpPath() {
    const container = document.getElementById("bp-content");
    if (!container) {
      console.error("bp-content not found");
      return;
    }

    const nav = `
      <div style="display:flex; justify-content:center; gap:10px; margin:16px 0 10px;">
        <button class="btn-act" disabled>
          <span class="txt-cn">路书</span><span class="txt-en">PATH</span>
        </button>
        <button class="btn-act" onclick="App.renderBpTasks()">
          <span class="txt-cn">任务</span><span class="txt-en">TASKS</span>
        </button>
      </div>
    `;

    const lvl = Math.floor(this.data.bpExp / 1000);
    const prog = ((this.data.bpExp % 1000) / 10).toFixed(2);

    const getR = (l) => {
      if (l === 1) return { t: "star", v: 1000, n: "星币" };
      if (l === 5 || l === 15) return { t: "eye", v: 5, n: "树之眼" };
      if (l === 10) return { t: "sigil", v: 1, n: "正印" };
      if (l === 50) return { t: "sigil", v: 2, n: "正印x2" };
      return { t: "star", v: 400, n: "星币" };
    };

    let html =
      nav +
      `<div class="bp-bar">
        <div style="display:flex; flex-direction:column; align-items:center;">
          <span style="font-family:'Cinzel'; font-size:30px; color:var(--gold-main); line-height:1;">LV.${lvl}</span>
          <span style="font-size:9px; color:#666; font-family:'Cinzel';">EXP ${this.data.bpExp % 1000}/1000</span>
        </div>
        <div class="bp-prog-line">
          <div class="bp-prog-fill" style="width:${prog}%"></div>
        </div>
        <button class="claim-all-btn" onclick="App.claimAllBp()">
          <span class="txt-cn" style="color:var(--gold-main)">一键领取</span><span class="txt-en">CLAIM ALL</span>
        </button>
      </div>
      <div class="list-wrap" id="bp-list">`;

    for (let i = 1; i <= 50; i++) {
      const r = getR(i);
      const reached = lvl >= i;
      const claimed = this.data.bpClaimed.includes(i);

      html += `<div class="bp-row ${reached ? "reached" : ""}">
        <div class="lvl-idx">${i}</div>
        <div style="flex:1; display:flex; align-items:center; gap:10px;">
          <span style="color:${reached ? "#ddd" : "#555"}; font-size:14px;">${r.n} x${r.v}</span>
        </div>
        <button class="btn-act" ${!reached || claimed ? "disabled" : ""} onclick="App.claimBp(${i}, '${r.t}', ${r.v})">
          <span class="txt-cn">${claimed ? "已领取" : reached ? "领取" : "锁定"}</span>
          <span class="txt-en">${claimed ? "OWNED" : reached ? "CLAIM" : "LOCKED"}</span>
        </button>
      </div>`;
    }

    html += `</div>`;
    container.innerHTML = html;

    setTimeout(() => {
      const l = document.getElementById("bp-list");
      if (!l) return;
      const r = l.querySelectorAll(".reached");
      if (r.length) r[r.length - 1].scrollIntoView({ block: "center" });
    }, 50);
  },

  claimBp(lvl, type, val) {
    if (this.data.bpClaimed.includes(lvl)) return;
    this.data.bpClaimed.push(lvl);

    if (type === "star") this.data.stars += val;
    else if (type === "eye") this.data.eyes += val;
    else if (type === "sigil") this.data.sigils += val;
    else if (type === "item") alert("获得实物奖励");

    this.save();
    this.renderBpPath();
  },

  claimAllBp() {
    const lvl = Math.floor(this.data.bpExp / 1000);
    let count = 0;

    const r = (l) => {
      if (l === 1) return { t: "star", v: 1000 };
      if (l === 5 || l === 15) return { t: "eye", v: 5 };
      if (l === 10) return { t: "sigil", v: 1 };
      if (l === 50) return { t: "sigil", v: 2 };
      return { t: "star", v: 400 };
    };

    for (let i = 1; i <= lvl; i++) {
      if (!this.data.bpClaimed.includes(i)) {
        this.data.bpClaimed.push(i);
        const rw = r(i);
        if (rw.t === "star") this.data.stars += rw.v;
        if (rw.t === "eye") this.data.eyes += rw.v;
        if (rw.t === "sigil") this.data.sigils += rw.v;
        count++;
      }
    }

    if (count > 0) {
      alert(`已一键领取 ${count} 个奖励`);
      this.save();
      this.renderBpPath();
    }
  },

  // ✅ 月度纪行：任务（带“路书/任务”切换）
  renderBpTasks() {
    const container = document.getElementById("bp-content");
    if (!container) {
      console.error("bp-content not found");
      return;
    }

    const nav = `
      <div style="display:flex; justify-content:center; gap:10px; margin:16px 0 10px;">
        <button class="btn-act" onclick="App.renderBpPath()">
          <span class="txt-cn">路书</span><span class="txt-en">PATH</span>
        </button>
        <button class="btn-act" disabled>
          <span class="txt-cn">任务</span><span class="txt-en">TASKS</span>
        </button>
      </div>
    `;

    container.innerHTML =
      nav +
      `<div style="display:flex; justify-content:center; gap:10px; margin-top:10px;">
        <button class="btn-act" onclick="App.renderBpSub('daily')"><span class="txt-cn">日记</span><span class="txt-en">DAILY</span></button>
        <button class="btn-act" onclick="App.renderBpSub('weekly')"><span class="txt-cn">周报</span><span class="txt-en">WEEKLY</span></button>
        <button class="btn-act" onclick="App.renderBpSub('monthly')"><span class="txt-cn">月度</span><span class="txt-en">MONTHLY</span></button>
      </div>
      <div class="list-wrap" id="bp-sub"></div>`;

    this.renderBpSub("daily");
  },

  renderBpSub(type) {
    const list = GUGU_DB.bp.tasks[type];
    const box = document.getElementById("bp-sub");
    if (!box) return;

    box.innerHTML = "";

    list.forEach((t) => {
      const done = this.data.bpTasksDone[t.id];
      let actionArea = "";

      if (t.req > 0) {
        const cur = this.data.taskStats[t.type] || 0;
        const target = t.req;
        const pct = Math.min((cur / target) * 100, 100);

        if (done) {
          actionArea = `<span style="font-size:12px; color:#555">已完成</span>`;
        } else {
          actionArea = `<div class="prog-container">
              <span class="prog-text">(${Math.min(cur, target)}/${target})</span>
              <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
            </div>`;
        }
      } else {
        actionArea = `<button class="btn-act" ${done ? "disabled" : ""} onclick="App.doBpTask('${t.id}', ${t.exp}, '${type}')">
            <span class="txt-cn">${done ? "已完成" : "完成"}</span>
            <span class="txt-en">${done ? "DONE" : "FINISH"}</span>
          </button>`;
      }

      const div = document.createElement("div");
      div.className = "row";
      div.innerHTML = `<div class="row-left">
          <span class="row-title">${t.name}</span>
          <span class="row-meta">纪行经验 +${t.exp}</span>
        </div>${actionArea}`;

      box.appendChild(div);
    });
  },

  doBpTask(id, exp, type) {
    this.data.bpTasksDone[id] = true;
    this.data.bpExp += exp;

    // 人格/技能：BP任务也给一点掉落（更温和的正反馈）
    this.personaOnTaskDone(type, "bp");

    this.save();
    this.renderBpSub(type);
  },



  /* =========================
   * 人格/技能系统（v0.1）
   * - 目标：让“努力”变成可视化成长，而不是堆外观素材
   * - 玩法：做任务/课程 -> 掉落材料+经验 -> 升级技能 -> 更容易掉落（轻度正反馈）
   * ========================= */
  ensurePersonaSystem() {
    const def = {
      tokens: 0,
      lastFreeRoll: '',
      mats: { watercolor: 0, illustration: 0, tarot: 0, bazi: 0, universal: 0 },
      skills: {
        watercolor: { lvl: 1, xp: 0 },
        illustration: { lvl: 1, xp: 0 },
        tarot: { lvl: 1, xp: 0 },
        bazi: { lvl: 1, xp: 0 },
      },
      unlocked: { painter: true, mystic: true },
      history: [],
    };

    if (!this.data.persona) this.data.persona = def;

    // 轻量“深合并”（只合 persona 这一块，避免你以后版本更新丢字段）
    const p = this.data.persona;
    p.tokens = Number.isFinite(p.tokens) ? p.tokens : def.tokens;
    p.lastFreeRoll = p.lastFreeRoll || def.lastFreeRoll;
    p.mats = { ...def.mats, ...(p.mats || {}) };

    p.skills = p.skills || {};
    for (const k of Object.keys(def.skills)) {
      p.skills[k] = { ...def.skills[k], ...(p.skills[k] || {}) };
      p.skills[k].lvl = Math.max(1, Math.min(10, parseInt(p.skills[k].lvl || 1, 10)));
      p.skills[k].xp = Math.max(0, parseInt(p.skills[k].xp || 0, 10));
    }

    p.unlocked = { ...def.unlocked, ...(p.unlocked || {}) };
    p.history = Array.isArray(p.history) ? p.history.slice(0, 20) : [];

    this.data.persona = p;
  },

  _todayKey() {
    return new Date().toDateString();
  },

  getSkillXpNeed(lvl) {
    // 1-10：越来越慢一点，但别太肝
    return 80 + (lvl - 1) * 40;
  },

  getSkillMatNeed(lvl) {
    // 升级材料需求（可改）：1->2 需要5，后面慢慢涨
    return 5 + (lvl - 1) * 2;
  },

  tagToSkill(tag) {
    const t = String(tag || '').toLowerCase();
    // 你现在还没给任务打标签，所以这里做“模糊匹配”，先跑起来再说
    if (t.includes('water') || t.includes('水彩') || t.includes('w0') || t.includes('w1') || t.includes('w2')) return 'watercolor';
    if (t.includes('illustr') || t.includes('插画') || t.includes('构成') || t.includes('composition') || t.includes('k0') || t.includes('k1')) return 'illustration';
    if (t.includes('tarot') || t.includes('塔罗') || t.startsWith('t')) return 'tarot';
    if (t.includes('bazi') || t.includes('八字') || t.startsWith('b')) return 'bazi';
    return null;
  },

  personaAddDrop(skillKey, mats = 0, xp = 0, note = '') {
    this.ensurePersonaSystem();
    const p = this.data.persona;

    if (skillKey === 'universal') {
      p.mats.universal += mats;
    } else if (p.mats[skillKey] != null) {
      p.mats[skillKey] += mats;
    }

    if (skillKey && p.skills[skillKey]) {
      p.skills[skillKey].xp += xp;
    }

    const ts = new Date().toLocaleTimeString();
    const line = `${ts}｜${note}`;
    if (note) {
      p.history.unshift(line);
      if (p.history.length > 20) p.history.pop();
    }
  },

  personaOnTaskDone(tag, source = 'task') {
    this.ensurePersonaSystem();
    const p = this.data.persona;

    // 每次任务：给一点徽记，给一点材料（温和，不惩罚断签）
    p.tokens += 1;

    const skill = this.tagToSkill(tag);
    if (!skill) {
      // 没标签时：掉一点通用材料，保证也有成长
      this.personaAddDrop('universal', 1, 0, `通用材料 +1（${source}）`);
      return;
    }

    const s = p.skills[skill];
    const lvl = s?.lvl || 1;
    const chance = Math.min(0.25 + (lvl - 1) * 0.05, 0.65);

    if (Math.random() < chance) {
      const xp = 6 + Math.floor(Math.random() * 5);
      this.personaAddDrop(skill, 1, xp, `${skill} 材料 +1，EXP +${xp}（${source}）`);
    } else {
      this.personaAddDrop('universal', 1, 0, `通用材料 +1（${source}）`);
    }
  },

  personaRoll(isPaid = false) {
    this.ensurePersonaSystem();
    const p = this.data.persona;
    const today = this._todayKey();

    if (!isPaid) {
      if (p.lastFreeRoll === today) {
        alert('今天的免费盲盒已经开过啦～明天再来。');
        return;
      }
      p.lastFreeRoll = today;
    } else {
      if (p.tokens < 10) {
        alert('徽记不足（需要 10）。去做点日常/纪行任务就有啦。');
        return;
      }
      p.tokens -= 10;
    }

    const pool = ['watercolor', 'illustration', 'tarot', 'bazi'];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const mats = 1 + Math.floor(Math.random() * 3);
    const xp = 12 + Math.floor(Math.random() * 12);

    this.personaAddDrop(pick, mats, xp, `盲盒：${pick} 材料 +${mats}，EXP +${xp}`);

    // 顺手给一点通用材料，降低“开出来不是我想要的”的挫败感
    this.personaAddDrop('universal', 1, 0, '盲盒：通用材料 +1');

    this.save();
    this.renderProfile('persona');

    alert(`✨盲盒结果
获得：${this.skillCn(pick)}材料 x${mats}
技能EXP +${xp}
另外：通用材料 +1`);
  },

  skillCn(key) {
    return (
      {
        watercolor: '水彩',
        illustration: '插画/构成',
        tarot: '塔罗',
        bazi: '八字',
      }[key] || key
    );
  },

  upgradeSkill(skillKey) {
    this.ensurePersonaSystem();
    const p = this.data.persona;
    const s = p.skills[skillKey];
    if (!s) return;

    if (s.lvl >= 10) {
      alert('这个技能已满级（Lv.10）。');
      return;
    }

    const needXp = this.getSkillXpNeed(s.lvl);
    const needM = this.getSkillMatNeed(s.lvl);

    // 材料允许用通用材料补齐
    const haveM = (p.mats[skillKey] || 0);
    const haveU = (p.mats.universal || 0);
    const miss = Math.max(0, needM - haveM);

    if (s.xp < needXp) {
      alert(`EXP 不够：需要 ${needXp}，当前 ${s.xp}。
去做点对应标签的任务/课程，或者开盲盒拿EXP。`);
      return;
    }

    if (haveM + haveU < needM) {
      alert(`材料不够：需要 ${needM}，你有 ${haveM}（专属）+ ${haveU}（通用）。
去做任务/开盲盒就能慢慢攒。`);
      return;
    }

    // 消耗材料
    if (haveM >= needM) {
      p.mats[skillKey] -= needM;
    } else {
      p.mats[skillKey] = 0;
      p.mats.universal -= miss;
    }

    s.lvl += 1;
    s.xp = 0;

    this.personaAddDrop(null, 0, 0, `升级：${this.skillCn(skillKey)} -> Lv.${s.lvl}`);
    this.save();
    this.renderProfile('persona');

    alert(`✅升级成功！
${this.skillCn(skillKey)} -> Lv.${s.lvl}`);
  },

  renderPersona() {
    this.ensurePersonaSystem();
    const p = this.data.persona;

    const body = document.getElementById('profile-tab-body');
    if (!body) return;

    const today = this._todayKey();
    const freeUsed = p.lastFreeRoll === today;

    const skillRow = (key, emoji) => {
      const s = p.skills[key];
      const needXp = this.getSkillXpNeed(s.lvl);
      const needM = this.getSkillMatNeed(s.lvl);
      const haveM = p.mats[key] || 0;
      const haveU = p.mats.universal || 0;
      const canUp = s.lvl < 10 && s.xp >= needXp && (haveM + haveU) >= needM;

      return `
        <div class="row" style="align-items:center;">
          <div class="row-left">
            <span class="row-title">${emoji} ${this.skillCn(key)} <span style="color:var(--gold-main)">Lv.${s.lvl}</span></span>
            <span class="row-meta">EXP ${s.xp}/${needXp} ｜ 材料 ${haveM}/${needM}（通用 ${haveU} 可补）</span>
          </div>
          <button class="btn-act" ${canUp ? '' : 'disabled'} onclick="App.upgradeSkill('${key}')">
            <span class="txt-cn">升级</span><span class="txt-en">UP</span>
          </button>
        </div>
      `;
    };

    const historyHtml = (p.history && p.history.length)
      ? `<div style="margin-top:12px; padding:12px; border:1px dashed #333; border-radius:12px;">
           <div style="font-size:12px; color:#888; margin-bottom:8px;">最近掉落（静默记录）</div>
           <div style="max-height:160px; overflow:auto; font-size:12px; color:#666; line-height:1.6;">
             ${p.history.map(x => `<div>${x}</div>`).join('')}
           </div>
         </div>`
      : `<div style="margin-top:12px; padding:12px; border:1px dashed #333; border-radius:12px; color:#666; font-size:12px;">还没有掉落记录：去完成一个日常/纪行任务试试。</div>`;

    body.innerHTML = `
      <div style="padding:10px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px;">
          <div>
            <div style="font-family:'Cinzel'; color:var(--gold-main); font-size:18px;">人格 · 技能成长</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">徽记：<span style="color:#ddd">${p.tokens}</span> ｜ 通用材料：<span style="color:#ddd">${p.mats.universal || 0}</span></div>
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
            <button class="btn-act" ${freeUsed ? 'disabled' : ''} onclick="App.personaRoll(false)">
              <span class="txt-cn">${freeUsed ? '今日已开' : '免费盲盒'}</span><span class="txt-en">FREE</span>
            </button>
            <button class="btn-act" ${(p.tokens < 10) ? 'disabled' : ''} onclick="App.personaRoll(true)">
              <span class="txt-cn">徽记×10</span><span class="txt-en">ROLL</span>
            </button>
          </div>
        </div>

        <div style="padding:12px; border:1px solid #222; border-radius:14px; margin-top:10px;">
          <div style="font-size:13px; color:#888; margin-bottom:8px;">画家人格（职业分支 = 技能）</div>
          ${skillRow('watercolor', '🎨')}
          ${skillRow('illustration', '🖋️')}
        </div>

        <div style="padding:12px; border:1px solid #222; border-radius:14px; margin-top:10px;">
          <div style="font-size:13px; color:#888; margin-bottom:8px;">玄学家人格（东玄/西玄 = 技能）</div>
          ${skillRow('tarot', '🃏')}
          ${skillRow('bazi', '🧭')}
        </div>

        <div style="margin-top:10px; padding:12px; border:1px dashed #333; border-radius:12px; color:#666; font-size:12px; line-height:1.6;">
          <div style="color:#888; margin-bottom:6px;">老师的话（很短但很关键）</div>
          <div>1）你想要的是“现实画像”，所以我们让“努力 -> 掉落 -> 升级”成立。</div>
          <div>2）断签不惩罚，只要你今天做了一点点，就会积累可见的成长。</div>
          <div>3）标签体系以后再精炼：先用模糊匹配跑起来，等你更熟了再把任务打标签做精确掉落。</div>
        </div>

        ${historyHtml}
      </div>
    `;
  },

  renderProfile(tab) {
    // tab: 'profile' | 'persona'
    if (tab) this._profileTab = tab;
    if (!this._profileTab) this._profileTab = 'profile';

    const container = document.getElementById('profile-content');
    container.innerHTML = `
      <div style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
        <button class="btn-act" onclick="App.renderProfile('profile')"><span class="txt-cn">档案</span><span class="txt-en">PROFILE</span></button>
        <button class="btn-act" onclick="App.renderProfile('persona')"><span class="txt-cn">人格</span><span class="txt-en">PERSONA</span></button>
      </div>
      <div id="profile-tab-body"></div>
    `;

    if (this._profileTab === 'persona') {
      this.renderPersona();
    } else {
      this.renderProfileCard();
    }
  },

  renderProfileCard() {
    const d = this.data.profile;
    const body = document.getElementById('profile-tab-body');
    body.innerHTML = `
      <div class="profile-card">
        <div class="avatar-box" onclick="document.getElementById('avatar-input').click()">
          ${d.avatar ? `<img src="${d.avatar}" class="avatar-img">` : `<div class="avatar-placeholder">?</div>`}
        </div>
        <div class="p-col">
          <div class="p-row"><span class="p-label">昵称 / NAME</span><span class="p-val">${d.name}<span class="edit-icon" onclick="App.editName()">✎</span></span></div>
          <div class="p-row"><span class="p-label">称号 / TITLE</span><span class="p-val">${d.title}</span></div>
          <div class="p-row"><span class="p-label">等级 / LEVEL</span><span class="p-val">Lv.${this.data.level}</span></div>
        </div>
        <div class="p-col">
          <div class="p-row"><span class="p-label">生日 / BIRTHDAY</span><span class="p-val">${d.birthday}<span class="edit-icon" onclick="App.editBirthday()">✎</span></span></div>
          <div class="p-row"><span class="p-label">段位 / RANK</span><span class="p-val">${d.rank}</span></div>
          <div class="p-row"><span class="p-label">能力 / ABILITY</span><span class="p-val">${d.skill}</span></div>
        </div>
      </div>
    `;
  },

  editName() {
    const n = prompt("请输入新名字:", this.data.profile.name);
    if (n) {
      this.data.profile.name = n;
      this.save();
      this.renderProfile();
    }
  },

  editBirthday() {
    const n = prompt("设置生日 (格式: MM-DD):", this.data.profile.birthday);
    if (n) {
      this.data.profile.birthday = n;
      this.save();
      this.renderProfile();
      alert("设置成功");
    }
  },

  handleAvatarUpload(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        if (e.total > 500000) {
          alert("图片太大，限500KB");
          return;
        }
        App.data.profile.avatar = e.target.result;
        App.save();
        App.renderProfile();
      };
      reader.readAsDataURL(input.files[0]);
    }
  },
};

// 独立的全局函数（更稳 + 可诊断）
function toggleMusic() {
  const a = document.getElementById("bgm");
  const btn = document.getElementById("music-btn");

  if (!a) {
    console.error("找不到 audio#bgm 元素");
    return;
  }

  a.muted = false;
  a.volume = 1;

  if (a.paused) {
    a
      .play()
      .then(() => btn && btn.classList.add("playing"))
      .catch((err) => {
        console.error("BGM 播放失败：", err);
        alert("浏览器阻止了音频播放（手机上很常见）。请先点一下页面空白处，再点一次 BGM。");
      });
  } else {
    a.pause();
    btn && btn.classList.remove("playing");
  }
}

window.toggleMusic = toggleMusic;
window.App = App;
