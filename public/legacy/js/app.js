/**
 * app.js - Main application controller
 * Handles: view routing, lesson rendering, terminal tabs, progress tracking
 *
 * Architecture:
 * - LAB (guided lessons): Uses LabCLI (restricted commands) + fresh devices per lesson
 * - SANDBOX (CLI view): Uses full CLI (all commands) + persistent devices
 * Both environments have completely separate state to avoid conflicts.
 */

class NetLabApp {
  constructor() {
    // ============================================================
    // STATE
    // ============================================================
    this.currentView = "dashboard";
    this.progress = loadProgress() || { completed: [] };
    this.profile = loadProfile() || null;
    this.profileModal = document.getElementById("profile-modal");
    this.loginScreen = document.getElementById("login-screen");
    this.profileScreen = document.getElementById("profile-screen");

    // ============================================================
    // LAB ENVIRONMENT (guided lessons, restricted CLI)
    // ============================================================
    this.lab = {
      currentLessonId: 1,
      currentDeviceId: "cli",
      commandHistory: [],
      historyIndex: -1,
      pendingPassword: false,
      devices: null, // created fresh per lesson
      activeSwitch: null,
      activeCLI: null, // LabCLI instance
    };

    // ============================================================
    // SANDBOX ENVIRONMENT (CLI view, full unrestricted CLI)
    // ============================================================
    this.sandbox = {
      currentDeviceId: "cli",
      commandHistory: [],
      historyIndex: -1,
      pendingPassword: false,
      devices: {
        sw1: new Switch("SW1"),
        sw2: new Switch("SW2"),
        "pc-a": new PC("PC-A"),
        "pc-b": new PC("PC-B"),
      },
      activeSwitch: null,
      activeCLI: null, // full CLI instance
    };
    this.sandbox.activeSwitch = this.sandbox.devices["sw1"];
    this.sandbox.activeCLI = new CLI(this.sandbox.activeSwitch);

    // ============================================================
    // DOM REFS
    // ============================================================
    this.navLinks = document.querySelectorAll(".nav-link");
    this.viewDashboard = document.getElementById("view-dashboard");
    this.viewLesson = document.getElementById("view-lesson");
    this.viewLabs = document.getElementById("view-labs");
    this.viewLab = document.getElementById("view-lab");
    this.viewCCNA = document.getElementById("view-ccna");
    this.viewTopic = document.getElementById("view-topic");
    this.labCurriculum = document.getElementById("lab-curriculum");
    this.ccnaCurriculum = document.getElementById("ccna-curriculum");
    this.profileBtn = document.getElementById("profile-btn");

    // Lab terminal DOM
    this.termBody = document.getElementById("term-body");
    this.termOutput = document.getElementById("term-output");
    this.termInput = document.getElementById("term-input");
    this.termPrompt = document.getElementById("term-prompt");
    this.devTabs = document.querySelectorAll("#device-tabs .dev-tab");

    // Sandbox terminal DOM
    this.labsTermBody = document.getElementById("labs-term-body");
    this.labsTermOutput = document.getElementById("labs-term-output");
    this.labsTermInput = document.getElementById("labs-term-input");
    this.labsTermPrompt = document.getElementById("labs-term-prompt");
    this.labsDevTabs = document.querySelectorAll("#labs-device-tabs .dev-tab");

    // Lesson DOM
    this.stageCards = document.querySelectorAll(".stage-card");
    this.dropdownItems = document.querySelectorAll(
      ".dropdown-item[data-lesson]",
    );
    this.btnBack = document.getElementById("btn-back");
    this.btnResetLesson = document.getElementById("btn-reset-lesson");
    this.btnNextLesson = document.getElementById("btn-next-lesson");
    this.objList = document.getElementById("obj-list");
    this.objCount = document.getElementById("obj-count");
    this.conceptList = document.getElementById("concept-list");
    this.topoSvg = document.getElementById("topo-svg");
    this.topoTable = document.getElementById("topo-table");
    this.lessonProgress = document.getElementById("lesson-progress");

    this.init();
  }

  init() {
    this.bindNav();
    this.bindSideNav();
    this.bindStageCards();
    this.bindDropdownItems();
    this.bindBackBtn();
    this.bindResetLesson();
    this.bindNextLesson();
    this.bindLabTerminal();
    this.bindSandboxTerminal();
    this.bindProfileModal();
    this.bindTopicPage();
    this.renderDashboard();
    this.updateProfileUI();
  }

  // ============================================================
  // PROFILE / AUTH
  // ============================================================
  bindProfileModal() {
    if (!this.profileModal) return;

    // Open modal on profile button click
    if (this.profileBtn) {
      this.profileBtn.addEventListener("click", () => this.openProfileModal());
    }

    // Close modal
    const closeBtn = document.getElementById("profile-modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeProfileModal());
    }
    this.profileModal.addEventListener("click", (e) => {
      if (e.target === this.profileModal) this.closeProfileModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.profileModal.classList.contains("show")) {
        this.closeProfileModal();
      }
    });

    // Login buttons
    const googleBtn = document.getElementById("btn-google-login");
    if (googleBtn) {
      googleBtn.addEventListener("click", () => this.loginWithGoogle());
    }
    const guestBtn = document.getElementById("btn-guest-login");
    if (guestBtn) {
      guestBtn.addEventListener("click", () => this.loginAsGuest());
    }

    // Logout button
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout());
    }

    // Upgrade button
    const upgradeBtn = document.getElementById("btn-upgrade");
    if (upgradeBtn) {
      upgradeBtn.addEventListener("click", () => this.upgradeToPremium());
    }
  }

  openProfileModal() {
    if (!this.profileModal) return;
    this.profileModal.classList.add("show");
    this.updateProfileUI();
  }

  closeProfileModal() {
    if (!this.profileModal) return;
    this.profileModal.classList.remove("show");
  }

  loginAsGuest() {
    this.profile = {
      type: "guest",
      name: "Guest User",
      email: "guest@ccnapath.local",
      dob: "—",
      joined: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      subscription: "Free",
      dp: "👤",
    };
    saveProfile(this.profile);
    this.updateProfileUI();
    this.showToast("👤 Logged in as Guest");
  }

  loginWithGoogle() {
    // Demo Google login — simulates OAuth flow
    this.profile = {
      type: "google",
      name: "Shubham Kumar",
      email: "shubham.kumar@gmail.com",
      dob: "15 Aug 1998",
      joined: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      subscription: "Free",
      dp: "https://ui-avatars.com/api/?name=Shubham+Kumar&background=58a6ff&color=fff&size=128",
    };
    saveProfile(this.profile);
    this.updateProfileUI();
    this.showToast("✅ Signed in with Google (Demo)");
  }

  logout() {
    this.profile = null;
    saveProfile(null);
    this.updateProfileUI();
    this.showToast("👋 Logged out");
  }

  upgradeToPremium() {
    if (!this.profile) return;
    this.profile.subscription = "Premium";
    this.profile.dp =
      this.profile.type === "google"
        ? "https://ui-avatars.com/api/?name=Shubham+Kumar&background=d29922&color=fff&size=128"
        : "👤";
    saveProfile(this.profile);
    this.updateProfileUI();
    this.showToast("⚡ Upgraded to Premium!");
  }

  updateProfileUI() {
    if (!this.profileModal) return;

    const isLoggedIn = !!this.profile;

    // Toggle screens
    if (this.loginScreen)
      this.loginScreen.style.display = isLoggedIn ? "none" : "block";
    if (this.profileScreen)
      this.profileScreen.style.display = isLoggedIn ? "block" : "none";

    // Update navbar profile button
    if (this.profileBtn) {
      this.profileBtn.textContent = isLoggedIn
        ? this.profile.type === "google"
          ? "👤"
          : "👤"
        : "👤";
      this.profileBtn.title = isLoggedIn ? this.profile.name : "Sign in";
    }

    // Update sidebar profile cards
    document.querySelectorAll(".profile-card").forEach((card) => {
      const avatar = card.querySelector(".profile-avatar");
      const info = card.querySelector(".profile-info");
      if (avatar)
        avatar.textContent = isLoggedIn
          ? this.profile.type === "google"
            ? "👤"
            : "👤"
          : "👤";
      if (info) {
        const h4 = info.querySelector("h4");
        const p = info.querySelector("p");
        if (h4) h4.textContent = isLoggedIn ? this.profile.name : "Guest User";
        if (p)
          p.textContent = isLoggedIn
            ? this.profile.subscription === "Premium"
              ? "Premium Member"
              : "CCNA Learner"
            : "Sign in to start";
      }
    });

    if (!isLoggedIn) return;

    // Fill profile screen
    const dp = document.getElementById("profile-dp");
    if (dp) {
      if (this.profile.type === "google" && this.profile.dp) {
        dp.innerHTML = `<img src="${this.profile.dp}" alt="Profile">`;
      } else {
        dp.textContent = this.profile.dp || "👤";
        dp.innerHTML = this.profile.dp || "👤";
      }
    }

    const nameEl = document.getElementById("profile-name");
    if (nameEl) nameEl.textContent = this.profile.name;

    const badge = document.getElementById("profile-badge");
    if (badge) {
      badge.textContent = this.profile.type === "google" ? "Google" : "Guest";
      badge.className =
        "profile-badge " +
        (this.profile.type === "google" ? "google" : "guest");
      if (this.profile.subscription === "Premium") {
        badge.textContent = "Premium";
        badge.className = "profile-badge premium";
      }
    }

    const emailEl = document.getElementById("profile-email");
    if (emailEl) emailEl.textContent = this.profile.email;

    const dobEl = document.getElementById("profile-dob");
    if (dobEl) dobEl.textContent = this.profile.dob || "—";

    const joinedEl = document.getElementById("profile-joined");
    if (joinedEl) joinedEl.textContent = this.profile.joined || "—";

    const subEl = document.getElementById("profile-subscription");
    if (subEl) subEl.textContent = this.profile.subscription || "Free";

    // Stats
    const doneCount = this.progress.completed.length;
    const statLessons = document.getElementById("stat-lessons");
    if (statLessons) statLessons.textContent = doneCount;

    const statLevel = document.getElementById("stat-level");
    if (statLevel) statLevel.textContent = Math.floor(doneCount / 3) + 1;

    const statStreak = document.getElementById("stat-streak");
    if (statStreak) statStreak.textContent = calcStreak();
  }

  // ============================================================
  // DASHBOARD SIDEBAR (Dashboard / Lab / Material / Settings / Support)
  // ============================================================
  bindSideNav() {
    document.querySelectorAll(".side-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.dataset.side;
        if (target === "dashboard") this.showDashboard();
        else if (target === "lab") this.showLab();
        else if (target === "cli") this.showSandbox();
        else if (target === "ccna") this.showCCNA();
        else if (target === "settings")
          this.showToast("⚙️ Settings coming soon");
        else if (target === "support") this.showToast("💬 Support coming soon");
      });
    });
    document.querySelectorAll(".btn-premium").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.showToast("⚡ Premium coming soon"),
      );
    });
  }

  setSideActive(name) {
    document.querySelectorAll(".side-link").forEach((l) => {
      l.classList.toggle("active", l.dataset.side === name);
    });
  }

  // ============================================================
  // ENVIRONMENT HELPERS
  // ============================================================
  getEnv() {
    return this.currentView === "labs" ? this.sandbox : this.lab;
  }

  getActiveDevice() {
    const env = this.getEnv();
    if (env.currentDeviceId === "cli") return env.activeSwitch;
    return env.devices[env.currentDeviceId];
  }

  getActiveCLI() {
    const env = this.getEnv();
    if (env.currentDeviceId === "cli") return env.activeCLI;
    const dev = env.devices[env.currentDeviceId];
    if (!dev._cli) {
      if (this.currentView === "lesson") {
        // Lab environment: restricted CLI
        const lesson = getLesson(this.lab.currentLessonId);
        dev._cli = new LabCLI(dev);
        dev._cli.setAllowedCommands(lesson ? lesson.allowedCommands : []);
      } else {
        // Sandbox environment: full CLI
        dev._cli = new CLI(dev);
      }
    }
    return dev._cli;
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  bindNav() {
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        if (view === "dashboard") this.showDashboard();
        else if (view === "lab") this.showLab();
        else if (view === "labs") this.showSandbox();
      });
    });
    const brand = document.querySelector(".navbar-title");
    if (brand) {
      brand.addEventListener("click", (e) => {
        e.preventDefault();
        this.showDashboard();
      });
    }
  }

  showDashboard() {
    this.currentView = "dashboard";
    this.viewLesson.classList.remove("active");
    if (this.viewLabs) this.viewLabs.classList.remove("active");
    if (this.viewLab) this.viewLab.classList.remove("active");
    if (this.viewCCNA) this.viewCCNA.classList.remove("active");
    if (this.viewTopic) this.viewTopic.classList.remove("active");
    this.viewDashboard.classList.add("active");
    this.navLinks.forEach((l) =>
      l.classList.toggle("active", l.dataset.view === "dashboard"),
    );
    this.setSideActive("dashboard");
    this.renderDashboard();
  }

  showLab() {
    this.currentView = "lab";
    this.viewLesson.classList.remove("active");
    this.viewDashboard.classList.remove("active");
    if (this.viewLabs) this.viewLabs.classList.remove("active");
    if (this.viewCCNA) this.viewCCNA.classList.remove("active");
    if (this.viewTopic) this.viewTopic.classList.remove("active");
    if (this.viewLab) this.viewLab.classList.add("active");
    this.navLinks.forEach((l) =>
      l.classList.toggle("active", l.dataset.view === "lab"),
    );
    this.setSideActive("lab");
    this.renderLabCurriculum();
  }

  showSandbox() {
    this.currentView = "labs";
    this.viewLesson.classList.remove("active");
    this.viewDashboard.classList.remove("active");
    if (this.viewLab) this.viewLab.classList.remove("active");
    if (this.viewCCNA) this.viewCCNA.classList.remove("active");
    if (this.viewTopic) this.viewTopic.classList.remove("active");
    if (this.viewLabs) this.viewLabs.classList.add("active");
    this.navLinks.forEach((l) =>
      l.classList.toggle("active", l.dataset.view === "labs"),
    );
    this.setSideActive("cli");
  }

  showCCNA() {
    this.currentView = "ccna";
    this.viewLesson.classList.remove("active");
    this.viewDashboard.classList.remove("active");
    if (this.viewLab) this.viewLab.classList.remove("active");
    if (this.viewLabs) this.viewLabs.classList.remove("active");
    if (this.viewTopic) this.viewTopic.classList.remove("active");
    if (this.viewCCNA) this.viewCCNA.classList.add("active");
    this.setSideActive("ccna");
    this.renderCCNACurriculum();
  }

  // ============================================================
  // STAGE CARDS & DROPDOWN
  // ============================================================
  bindStageCards() {
    this.stageCards.forEach((card) => {
      card.addEventListener("click", () => {
        const stage = parseInt(card.dataset.stage, 10);
        const stageData = getStages().find((s) => s.stage === stage);
        if (stageData) {
          const firstLesson = Object.values(stageData.lessons)[0];
          if (firstLesson) this.openLesson(firstLesson.id);
        }
      });
    });
    document.querySelectorAll(".stage-lesson[data-lesson]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.openLesson(parseInt(el.dataset.lesson, 10));
      });
    });
  }

  bindDropdownItems() {
    this.dropdownItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        this.openLesson(parseInt(item.dataset.lesson, 10));
      });
    });
  }

  openLesson(id) {
    this.currentView = "lesson";
    this.lab.currentLessonId = id;
    this.viewDashboard.classList.remove("active");
    if (this.viewLabs) this.viewLabs.classList.remove("active");
    if (this.viewLab) this.viewLab.classList.remove("active");
    if (this.viewCCNA) this.viewCCNA.classList.remove("active");
    if (this.viewTopic) this.viewTopic.classList.remove("active");
    this.viewLesson.classList.add("active");
    this.navLinks.forEach((l) =>
      l.classList.toggle("active", l.dataset.view === "lab"),
    );
    this.renderLesson(id);
  }

  bindBackBtn() {
    this.btnBack.addEventListener("click", () => this.showLab());
  }

  bindResetLesson() {
    if (!this.btnResetLesson) return;
    this.btnResetLesson.addEventListener("click", () => {
      const id = this.lab.currentLessonId;
      if (this.currentView !== "lesson" || !id) return;
      // Reset only this lesson: fresh devices + cleared terminal/objectives.
      this.renderLesson(id);
      // Also un-mark this lesson as complete so it can be re-done.
      if (this.progress.completed.includes(id)) {
        this.progress.completed = this.progress.completed.filter((x) => x !== id);
        saveProgress(this.progress);
        this.renderDashboard();
      }
      this.showToast("↺ Lesson reset — start over");
    });
  }

  bindNextLesson() {
    if (!this.btnNextLesson) return;
    this.btnNextLesson.addEventListener("click", () => {
      const nextId = getNextLessonId(this.lab.currentLessonId);
      if (nextId == null) return;
      this.openLesson(nextId);
    });
  }

  // ============================================================
  // LESSON RENDERING (LAB)
  // ============================================================
  renderLesson(id) {
    const lesson = getLesson(id);
    if (!lesson) return;

    const stageInfo = getLessonStage(id);
    document.getElementById("lesson-stage-badge").textContent =
      `Stage ${stageInfo ? stageInfo.stage : "?"} · ${stageInfo ? stageInfo.stageName : ""}`;
    document.getElementById("lesson-title-text").textContent = lesson.title;
    document.getElementById("lesson-scenario").textContent = lesson.scenario;

    // Objectives — show only the command
    this.objList.innerHTML = "";
    lesson.objectives.forEach((obj, i) => {
      const div = document.createElement("div");
      div.className = "obj-item";
      div.dataset.obj = i;
      div.innerHTML = `
                <span class="obj-check">○</span>
                <code>${escapeHtml(obj.cmd)}</code>
            `;
      this.objList.appendChild(div);
    });
    this.objCount.textContent = `0/${lesson.objectives.length}`;
    this.updateLessonProgress();

    // Concepts — no numbering
    this.conceptList.innerHTML = "";
    lesson.concepts.forEach((concept, i) => {
      const div = document.createElement("div");
      div.className = "concept-block";
      div.innerHTML = `
                <div class="concept-body">
                    <h4>${escapeHtml(concept.title)}</h4>
                    <p>${escapeHtml(concept.body)}</p>
                    <pre><code>${escapeHtml(concept.code)}</code></pre>
                </div>
            `;
      this.conceptList.appendChild(div);
    });

    // ============================================================
    // Create FRESH lab devices + restricted LabCLI for this lesson
    // ============================================================
    const env = this.lab;
    env.devices = {
      sw1: new Switch("SW1"),
      sw2: new Switch("SW2"),
      "pc-a": new PC("PC-A"),
      "pc-b": new PC("PC-B"),
    };
    env.activeSwitch = env.devices["sw1"];
    env.activeCLI = new LabCLI(env.activeSwitch);
    env.activeCLI.setAllowedCommands(lesson.allowedCommands || []);

    // Reset lab terminal state
    env.currentDeviceId = "sw1";
    env.commandHistory = [];
    env.historyIndex = -1;
    env.pendingPassword = false;

    this.devTabs.forEach((t) =>
      t.classList.toggle("active", t.dataset.device === "sw1"),
    );
    this.termOutput.innerHTML = "";
    this.appendTermLine("Cisco IOS Simulator — Guided Lab");
    this.appendTermLine(
      `Commands available: ${(lesson.allowedCommands || []).join(", ")}`,
    );
    this.appendTermLine("");
    this.updateLabPrompt();
    this.termInput.value = "";
    this.termInput.disabled = false;
    this.termInput.focus();

    // Render topology
    this.renderTopology(lesson.topology);
  }

  // ============================================================
  // LAB TERMINAL (restricted CLI)
  // ============================================================
  bindLabTerminal() {
    this.devTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.devTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const env = this.lab;
        env.currentDeviceId = tab.dataset.device;
        env.commandHistory = [];
        env.historyIndex = -1;
        env.pendingPassword = false;
        this.termOutput.innerHTML = "";
        const dev = this.getActiveDevice();
        this.appendTermLine(
          `Connected to ${dev.hostname} (${dev.type === "pc" ? "PC" : "Switch"})`,
        );
        this.appendTermLine(`Type '?' for available commands.`);
        this.appendTermLine("");
        this.updateLabPrompt();
        this.termInput.focus();
      });
    });

    this.termInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleLabCommand();
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.handleLabTabComplete();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.labHistoryBack();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.labHistoryForward();
      } else if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        this.termOutput.innerHTML = "";
      }
    });
    this.termBody.addEventListener("click", () => this.termInput.focus());
  }

  handleLabCommand() {
    const env = this.lab;
    const input = this.termInput.value.trim();
    if (!input) return;
    this.termInput.value = "";

    env.commandHistory.push(input);
    env.historyIndex = -1;

    const prompt = this.getActiveDevice().getPrompt();
    this.appendTermCmd(prompt, input);

    // Handle pending password
    if (env.pendingPassword) {
      env.pendingPassword = false;
      const dev = this.getActiveDevice();
      const expected = dev.enableSecret || dev.enablePassword;
      const entered = input;
      if (entered === expected || entered === "cisco" || entered === "class") {
        dev.mode = "privileged";
        this.appendTermLine("");
        this.updateLabPrompt();
      } else {
        this.appendTermLine("% Bad secrets", "error");
        this.appendTermLine("");
        this.updateLabPrompt();
      }
      this.termBody.scrollTop = this.termBody.scrollHeight;
      return;
    }

    const cli = this.getActiveCLI();
    let result = null;
    try {
      result = cli.execute(input);
    } catch (e) {
      result = { type: "error", message: "% Unknown command or invalid input" };
    }

    this.handleResult(result, "lab");
    this.updateLabPrompt();
    this.termBody.scrollTop = this.termBody.scrollHeight;

    // Check objectives
    if (env.currentDeviceId === "cli" || env.currentDeviceId === "sw1") {
      this.checkObjectives(input, cli);
    }
  }

  handleLabTabComplete() {
    const env = this.lab;
    const input = this.termInput.value.trim();
    if (!input) return;
    const cli = this.getActiveCLI();
    const completions = cli.getCompletions(input);
    if (completions.length === 1) {
      const parts = input.split(/\s+/);
      parts[parts.length - 1] = completions[0];
      this.termInput.value = parts.join(" ") + " ";
    } else if (completions.length > 1) {
      this.appendTermLine(completions.join("  "), "muted");
      this.updateLabPrompt();
      this.termBody.scrollTop = this.termBody.scrollHeight;
    }
  }

  labHistoryBack() {
    const env = this.lab;
    if (env.historyIndex < env.commandHistory.length - 1) {
      env.historyIndex++;
      this.termInput.value =
        env.commandHistory[env.commandHistory.length - 1 - env.historyIndex];
    }
  }

  labHistoryForward() {
    const env = this.lab;
    if (env.historyIndex > 0) {
      env.historyIndex--;
      this.termInput.value =
        env.commandHistory[env.commandHistory.length - 1 - env.historyIndex];
    } else {
      env.historyIndex = -1;
      this.termInput.value = "";
    }
  }

  updateLabPrompt() {
    const dev = this.getActiveDevice();
    this.termPrompt.textContent = dev ? dev.getPrompt() : "Switch>";
  }

  appendTermCmd(prompt, cmd) {
    const div = document.createElement("div");
    div.className = "term-line term-cmd";
    const p = document.createElement("span");
    p.className = "term-prompt-text";
    p.textContent = prompt;
    div.appendChild(p);
    div.appendChild(document.createTextNode(" " + cmd));
    this.termOutput.appendChild(div);
  }

  appendTermLine(text, className) {
    const div = document.createElement("div");
    div.className = "term-line " + (className || "");
    div.textContent = text;
    this.termOutput.appendChild(div);
  }

  // ============================================================
  // SANDBOX TERMINAL (FULL CLI)
  // ============================================================
  bindSandboxTerminal() {
    if (!this.labsTermInput) return;

    this.labsDevTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.labsDevTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const env = this.sandbox;
        env.currentDeviceId = tab.dataset.device;
        env.commandHistory = [];
        env.historyIndex = -1;
        env.pendingPassword = false;
        this.labsTermOutput.innerHTML = "";
        const dev = this.getActiveDevice();
        this.appendLabsLine(
          `Connected to ${dev.hostname} (${dev.type === "pc" ? "PC" : "Switch"})`,
        );
        this.appendLabsLine(`Type '?' for available commands.`);
        this.appendLabsLine("");
        this.updateSandboxPrompt();
        this.labsTermInput.focus();
      });
    });

    this.labsTermInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleSandboxCommand();
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.handleSandboxTabComplete();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.sandboxHistoryBack();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.sandboxHistoryForward();
      } else if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        this.labsTermOutput.innerHTML = "";
      }
    });
    if (this.labsTermBody) {
      this.labsTermBody.addEventListener("click", () =>
        this.labsTermInput.focus(),
      );
    }

    // Initial banner
    this.appendLabsLine("Cisco IOS Simulator — Free Sandbox");
    this.appendLabsLine(
      "All commands available. Try: enable, configure terminal, show version, or ?",
    );
    this.appendLabsLine("");
    this.updateSandboxPrompt();
  }

  handleSandboxCommand() {
    const env = this.sandbox;
    const input = this.labsTermInput.value.trim();
    if (!input) return;
    this.labsTermInput.value = "";

    env.commandHistory.push(input);
    env.historyIndex = -1;

    const prompt = this.getActiveDevice().getPrompt();
    this.appendLabsCmd(prompt, input);

    // Handle pending password
    if (env.pendingPassword) {
      env.pendingPassword = false;
      const dev = this.getActiveDevice();
      const expected = dev.enableSecret || dev.enablePassword;
      const entered = input;
      if (entered === expected || entered === "cisco" || entered === "class") {
        dev.mode = "privileged";
        this.appendLabsLine("");
        this.updateSandboxPrompt();
      } else {
        this.appendLabsLine("% Bad secrets", "error");
        this.appendLabsLine("");
        this.updateSandboxPrompt();
      }
      this.labsTermBody.scrollTop = this.labsTermBody.scrollHeight;
      return;
    }

    const cli = this.getActiveCLI();
    let result = null;
    try {
      result = cli.execute(input);
    } catch (e) {
      result = { type: "error", message: "% Unknown command or invalid input" };
    }

    this.handleResult(result, "sandbox");
    this.updateSandboxPrompt();
    this.labsTermBody.scrollTop = this.labsTermBody.scrollHeight;
  }

  handleSandboxTabComplete() {
    const env = this.sandbox;
    const input = this.labsTermInput.value.trim();
    if (!input) return;
    const cli = this.getActiveCLI();
    const completions = cli.getCompletions(input);
    if (completions.length === 1) {
      const parts = input.split(/\s+/);
      parts[parts.length - 1] = completions[0];
      this.labsTermInput.value = parts.join(" ") + " ";
    } else if (completions.length > 1) {
      this.appendLabsLine(completions.join("  "), "muted");
      this.updateSandboxPrompt();
      this.labsTermBody.scrollTop = this.labsTermBody.scrollHeight;
    }
  }

  sandboxHistoryBack() {
    const env = this.sandbox;
    if (env.historyIndex < env.commandHistory.length - 1) {
      env.historyIndex++;
      this.labsTermInput.value =
        env.commandHistory[env.commandHistory.length - 1 - env.historyIndex];
    }
  }

  sandboxHistoryForward() {
    const env = this.sandbox;
    if (env.historyIndex > 0) {
      env.historyIndex--;
      this.labsTermInput.value =
        env.commandHistory[env.commandHistory.length - 1 - env.historyIndex];
    } else {
      env.historyIndex = -1;
      this.labsTermInput.value = "";
    }
  }

  updateSandboxPrompt() {
    const dev = this.getActiveDevice();
    this.labsTermPrompt.textContent = dev ? dev.getPrompt() : "Switch>";
  }

  appendLabsCmd(prompt, cmd) {
    const div = document.createElement("div");
    div.className = "term-line term-cmd";
    const p = document.createElement("span");
    p.className = "term-prompt-text";
    p.textContent = prompt;
    div.appendChild(p);
    div.appendChild(document.createTextNode(" " + cmd));
    this.labsTermOutput.appendChild(div);
  }

  appendLabsLine(text, className) {
    const div = document.createElement("div");
    div.className = "term-line " + (className || "");
    div.textContent = text;
    this.labsTermOutput.appendChild(div);
  }

  // ============================================================
  // SHARED RESULT HANDLER
  // ============================================================
  handleResult(result, target) {
    const isLab = target === "lab";
    const append = isLab
      ? (t, c) => this.appendTermLine(t, c)
      : (t, c) => this.appendLabsLine(t, c);

    if (result) {
      if (result.type === "output") {
        append(result.message);
      } else if (result.type === "success") {
        if (result.message) append(result.message, "success");
        append("");
      } else if (result.type === "error") {
        append(result.message, "error");
        append("");
      } else if (result.type === "info") {
        append(result.message, "info");
        append("");
      } else if (result.type === "password") {
        if (isLab) {
          this.lab.pendingPassword = true;
          this.appendTermLine("Password: ", "info");
        } else {
          this.sandbox.pendingPassword = true;
          this.appendLabsLine("Password: ", "info");
        }
      } else if (result.type === "config-output") {
        // no output needed; prompt changes
      }
    }
  }

  // ============================================================
  // OBJECTIVES
  // ============================================================
  checkObjectives(input, cli) {
    const lesson = getLesson(this.lab.currentLessonId);
    if (!lesson) return;
    const trimmed = input.trim().toLowerCase();

    let completedAny = false;
    lesson.objectives.forEach((obj, i) => {
      const item = this.objList.querySelector(`.obj-item[data-obj="${i}"]`);
      if (!item || item.classList.contains("done")) return;

      const expected = obj.cmd.toLowerCase();
      const matches = trimmed === expected;
      if (matches) {
        item.classList.add("done");
        item.querySelector(".obj-check").textContent = "✓";
        completedAny = true;
      }
    });

    if (completedAny) {
      this.appendTermLine("✓ Objective complete!", "success");
      this.appendTermLine("");
      this.updateLessonProgress();
    }
  }

  updateLessonProgress() {
    const lesson = getLesson(this.lab.currentLessonId);
    if (!lesson) return;
    const done = this.objList
      ? this.objList.querySelectorAll(".obj-item.done").length
      : 0;
    const total = lesson.objectives.length;
    this.objCount.textContent = `${done}/${total}`;
    this.lessonProgress.textContent = `${done}/${total} objectives`;

    if (done === total) {
      if (!this.progress.completed.includes(this.lab.currentLessonId)) {
        this.progress.completed.push(this.lab.currentLessonId);
        saveProgress(this.progress);
        recordActivity();
        this.renderDashboard();
        this.showToast("🎉 Lesson completed!");
      }
    }
    this.updateNextLessonBtn();
  }

  updateNextLessonBtn() {
    if (!this.btnNextLesson) return;
    const lesson = getLesson(this.lab.currentLessonId);
    const doneCount = this.objList
      ? this.objList.querySelectorAll(".obj-item.done").length
      : 0;
    const isComplete = lesson && doneCount === lesson.objectives.length;
    const hasNext = getNextLessonId(this.lab.currentLessonId) != null;
    this.btnNextLesson.style.display =
      this.currentView === "lesson" && isComplete && hasNext
        ? "inline-flex"
        : "none";
  }

  // ============================================================
  // TOPOLOGY (static SVG, non-interactive)
  // ============================================================
  renderTopology(topology) {
    const svg = this.topoSvg;
    if (!svg) return;
    svg.innerHTML = "";

    const W = 400,
      H = 130;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "130");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    const ns = "http://www.w3.org/2000/svg";

    topology.links.forEach((link) => {
      const a = topology.devices.find((d) => d.id === link.from);
      const b = topology.devices.find((d) => d.id === link.to);
      if (!a || !b) return;

      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", a.x);
      line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x);
      line.setAttribute("y2", b.y);
      line.setAttribute("stroke", "#30363d");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("stroke-dasharray", "5 3");
      svg.appendChild(line);

      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 - 10;
      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", mx);
      label.setAttribute("y", my);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "#8b949e");
      label.setAttribute("font-size", "8");
      label.setAttribute("font-family", "Consolas, monospace");
      label.textContent = link.label;
      svg.appendChild(label);
    });

    topology.devices.forEach((dev) => {
      const g = document.createElementNS(ns, "g");
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", dev.x - 24);
      rect.setAttribute("y", dev.y - 14);
      rect.setAttribute("width", "48");
      rect.setAttribute("height", "28");
      rect.setAttribute("rx", "5");
      rect.setAttribute("fill", dev.type === "switch" ? "#161b22" : "#1c2128");
      rect.setAttribute(
        "stroke",
        dev.type === "switch" ? "#58a6ff" : "#3fb950",
      );
      rect.setAttribute("stroke-width", "1.5");
      g.appendChild(rect);

      const icon = document.createElementNS(ns, "text");
      icon.setAttribute("x", dev.x);
      icon.setAttribute("y", dev.y + 4);
      icon.setAttribute("text-anchor", "middle");
      icon.setAttribute("font-size", "12");
      icon.textContent = dev.type === "switch" ? "🟨" : "🖥️";
      g.appendChild(icon);

      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", dev.x);
      label.setAttribute("y", dev.y + 30);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "#e6edf3");
      label.setAttribute("font-size", "9");
      label.setAttribute("font-weight", "bold");
      label.textContent = dev.label;
      g.appendChild(label);

      svg.appendChild(g);
    });

    if (topology.table && this.topoTable) {
      let html = `
                <table class="topo-table">
                    <thead><tr><th>Port</th><th>Mode</th><th>VLAN</th><th>Peer</th></tr></thead>
                    <tbody>
            `;
      topology.table.forEach((row) => {
        html += `
                    <tr>
                        <td>${escapeHtml(row.port)}</td>
                        <td>${escapeHtml(row.mode)}</td>
                        <td>${escapeHtml(row.vlan)}</td>
                        <td>${escapeHtml(row.peer)}</td>
                    </tr>
                `;
      });
      html += `</tbody></table>`;
      this.topoTable.innerHTML = html;
    }
  }

  // ============================================================
// CURRICULUM (reusable — used by both Lab and CCNA views)
// Renders stage accordions from any data source shaped like LABS.
// ============================================================
renderCurriculum(containerEl, stages, opts = {}) {
    if (!containerEl) return;

    const openStage = opts.openStage || 1;
    const unit = opts.unit || "labs"; // "labs" | "lessons"

    containerEl.innerHTML = "";

    stages.forEach((stage) => {
      const stageDiv = document.createElement("div");
      stageDiv.className =
        "curriculum-stage" + (stage.stage === openStage ? " open" : "");

      const stageLessonList = Object.values(stage.lessons || {});
      const stageLessonsDone = stageLessonList.filter((l) =>
        this.progress.completed.includes(l.id),
      ).length;
      const stageTotal = stageLessonList.length;

      const head = document.createElement("div");
      head.className = "curriculum-stage-head";
      head.innerHTML = `
                <div class="curriculum-stage-left">
                    <span class="stage-badge s${stage.stage}">Stage ${stage.stage}</span>
                    <h3>${escapeHtml(stage.stageName)}</h3>
                </div>
                <div class="curriculum-stage-right">
                    <span class="curriculum-stage-count">${stageLessonsDone}/${stageTotal} ${unit}</span>
                    <span class="curriculum-stage-chevron">▾</span>
                </div>
            `;
      // Dropdown toggle: click header to show/hide lessons
      head.addEventListener("click", () => {
        stageDiv.classList.toggle("open");
      });
      stageDiv.appendChild(head);

      const bar = document.createElement("div");
      bar.className = "curriculum-stage-bar";
      bar.innerHTML = `<div class="curriculum-stage-fill" style="width:${stageTotal ? (stageLessonsDone / stageTotal) * 100 : 0}%"></div>`;
      stageDiv.appendChild(bar);

      const list = document.createElement("div");
      list.className = "curriculum-lessons";

      if (!stageLessonList.length) {
        // No lessons yet for this stage
        const ph = document.createElement("p");
        ph.className = "curriculum-empty";
        ph.textContent = opts.emptyText || "Lessons coming soon";
        list.appendChild(ph);
      }

      stageLessonList.forEach((lesson) => {
        const done = this.progress.completed.includes(lesson.id);
        const item = document.createElement(opts.lessonTag || "a");
        if (opts.lessonTag === "a") item.href = "#";
        item.className = "curriculum-lesson" + (done ? " done" : "");
        item.dataset.lesson = lesson.id;
        item.innerHTML = `
                    <span class="curriculum-lesson-check">${done ? "✓" : "○"}</span>
                    <span class="curriculum-lesson-num">${String(lesson.id).padStart(2, "0")}</span>
                    <span class="curriculum-lesson-title">${escapeHtml(lesson.title)}</span>
                    ${opts.showDuration === false ? "" : `<span class="curriculum-lesson-duration">${escapeHtml(lesson.duration)}</span>`}
                `;
        item.addEventListener("click", (e) => {
          e.preventDefault();
          if (opts.onOpenLesson) opts.onOpenLesson(lesson);
        });
        list.appendChild(item);
      });

      stageDiv.appendChild(list);
      containerEl.appendChild(stageDiv);
    });
  }

  renderLabCurriculum() {
    // Use isolated LABS structure
    this.renderCurriculum(this.labCurriculum, getStages(), {
      openStage: 1,
      unit: "labs",
      onOpenLesson: (lesson) => this.openLesson(lesson.id),
    });
  }

  renderCCNACurriculum() {
    // CCNA theory stages — same renderer, different data source
    this.renderCurriculum(this.ccnaCurriculum, getMaterialStages(), {
      openStage: 1,
      unit: "topics",
      emptyText: "Topics coming soon — check back shortly",
      onOpenLesson: (lesson) => this.showTopic(lesson),
    });
  }

  // ============================================================
  // CCNA MATERIAL READER (theory topics)
  // ============================================================
  bindTopicPage() {
    if (!this.viewTopic) return;

    // Back button → return to CCNA stages
    const backBtn = document.getElementById("topic-back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => this.showCCNA());
    }

    // Mark as read
    document.getElementById("btn-mark-read").addEventListener("click", () => {
      const id = Number(this.currentTopicId);
      if (!id) return;
      const btn = document.getElementById("btn-mark-read");
      if (!this.progress.completed.includes(id)) {
        this.progress.completed.push(id);
        saveProgress(this.progress);
        this.showToast("✅ Topic completed!");
        this.renderDashboard();
      }
      btn.textContent = "✅ Read";
      btn.disabled = true;
    });
  }

  showTopic(lesson) {
    if (!this.viewTopic || !lesson) return;
    this.currentView = "topic";
    this.currentTopicId = lesson.id;

    this.viewDashboard.classList.remove("active");
    this.viewLesson.classList.remove("active");
    if (this.viewLab) this.viewLab.classList.remove("active");
    if (this.viewLabs) this.viewLabs.classList.remove("active");
    if (this.viewCCNA) this.viewCCNA.classList.remove("active");
    this.viewTopic.classList.add("active");
    this.setSideActive("ccna");

    const stageInfo = getMaterialStages().find((s) =>
      Object.values(s.lessons).some((l) => l.id === lesson.id),
    );
    if (!stageInfo) return;

    const badge = document.getElementById("reader-stage-badge");
    badge.textContent = `Stage ${stageInfo.stage} · ${stageInfo.stageName}`;
    badge.className = "stage-badge s" + stageInfo.stage;

    const titleEl = document.getElementById("reader-title");
    titleEl.textContent = `${lesson.icon ? lesson.icon + " " : ""}${lesson.title}`;
    document.getElementById("reader-tagline").textContent =
      lesson.tagline ? "— " + lesson.tagline : "";
    document.getElementById("reader-duration").textContent =
      `⏱ ${lesson.duration || ""}`;

    // Mark-as-read button state
    const doneBtn = document.getElementById("btn-mark-read");
    const alreadyDone = this.progress.completed.includes(lesson.id);
    doneBtn.textContent = alreadyDone ? "✅ Read" : "✅ Mark as Read";
    doneBtn.disabled = alreadyDone;

    const body = document.getElementById("reader-body");
    body.innerHTML = "";
    lesson.sections.forEach((sec, i) => {
      const card = document.createElement("div");
      card.className = "reader-section";

      // Title with icon
      const head = document.createElement("div");
      head.className = "reader-section-title";
      head.innerHTML = `<span class="sec-icon">${sec.icon || "📌"}</span><span>${i + 1}. ${escapeHtml(sec.title)}</span>`;
      card.appendChild(head);

      // Body paragraph
      if (sec.body) {
        const p = document.createElement("p");
        p.textContent = sec.body;
        card.appendChild(p);
      }

      // Bullet points
      if (sec.points && sec.points.length) {
        const ul = document.createElement("ul");
        ul.className = "sec-points";
        sec.points.forEach((pt) => {
          const li = document.createElement("li");
          li.textContent = pt;
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      // Data table
      if (sec.table && sec.table.head && sec.table.rows) {
        const wrap = document.createElement("div");
        wrap.className = "sec-table-wrap";
        let html = '<table class="sec-table"><thead><tr>';
        sec.table.head.forEach((h) => (html += `<th>${escapeHtml(h)}</th>`));
        html += "</tr></thead><tbody>";
        sec.table.rows.forEach((row) => {
          html += "<tr>";
          row.forEach((cell) => (html += `<td>${escapeHtml(cell)}</td>`));
          html += "</tr>";
        });
        html += "</tbody></table>";
        wrap.innerHTML = html;
        card.appendChild(wrap);
      }

      // Code / diagram block
      if (sec.code) {
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = sec.code;
        pre.appendChild(code);
        card.appendChild(pre);
      }

      // Tip box
      if (sec.tip) {
        const tip = document.createElement("div");
        tip.className = "sec-tip";
        tip.textContent = sec.tip;
        card.appendChild(tip);
      }

      body.appendChild(card);
    });

    window.scrollTo({ top: 0 });
    body.scrollTop = 0;
  }

  // ============================================================
  // DASHBOARD
  // ============================================================
  renderDashboard() {
    const allLessons = getAllLessons();
    Object.values(allLessons).forEach((lesson) => {
      const stage = lesson.stage;
      const done = this.progress.completed.includes(lesson.id);
      const fill = document.getElementById(`stage${stage}-fill`);
      const count = document.getElementById(`stage${stage}-count`);
      const check = document.getElementById(`sl-check-${lesson.id}`);
      if (fill) fill.style.width = done ? "100%" : "0%";
      if (count) count.textContent = done ? "1/1" : "0/1";
      if (check) check.textContent = done ? "✓" : "○";
    });

    const pill = document.getElementById("stage-pill");
    if (pill) {
      const totalStages = getStages().length;
      const totalDone = this.progress.completed.length;
      pill.textContent = `${totalDone === totalStages ? "Complete" : "Stage " + (totalDone + 1)} · ${totalDone}/${totalStages}`;
    }

    this.dropdownItems.forEach((item) => {
      const id = parseInt(item.dataset.lesson, 10);
      const done = this.progress.completed.includes(id);
      item.classList.toggle("done", done);
      const status = item.querySelector(".lesson-status");
      if (status) status.textContent = done ? "✓" : "";
    });

    this.renderDashboardWidgets();
  }

  // ============================================================
  // DASHBOARD WIDGETS (profile level / streak / activity)
  // ============================================================
  renderDashboardWidgets() {
    const doneCount = this.progress.completed.length;

    // Profile level: 1 per 3 completed lessons (updates every view: dashboard, lab, cli)
    document.querySelectorAll(".profile-level").forEach((el) => {
      el.textContent = `Level ${Math.floor(doneCount / 3) + 1}`;
    });

    // Streak card — consecutive-day streak based on actual activity dates
    const streak = calcStreak();
    const hasStreakToday = loadStreak().dates.includes(todayStr());
    document.querySelectorAll(".streak-days").forEach((el) => {
      el.textContent = `${streak} Day${streak === 1 ? "" : "s"} Streak!`;
    });
    document.querySelectorAll(".streak-week").forEach((week) => {
      const weekActivity = getWeekActivity();
      week.innerHTML = "";
      weekActivity.forEach((day) => {
        const d = document.createElement("div");
        let cls = "streak-day";
        if (day.active) cls += " done";
        else if (day.isToday) cls += " today";
        d.className = cls;
        // Day-of-week label
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = dayNames[new Date(day.date + "T12:00:00").getDay()];
        d.innerHTML = `<span class="streak-dot"></span><span>${dayName}</span>`;
        week.appendChild(d);
      });
    });

    // Activity list — recent completed lessons (updates every view)
    document.querySelectorAll(".activity-list").forEach((act) => {
      act.innerHTML = "";
      const all = getAllLessons();
      const recent = this.progress.completed.slice(-5).reverse();
      if (!recent.length) {
        const p = document.createElement("p");
        p.className = "activity-empty";
        p.textContent = "Complete your first lab to see activity here.";
        act.appendChild(p);
      } else {
        recent.forEach((id) => {
          const l = all[id];
          if (!l) return;
          const div = document.createElement("div");
          div.className = "activity-item";
          div.innerHTML = `<span class="act-check">✓</span><span class="act-title">${escapeHtml(l.title)}</span>`;
          act.appendChild(div);
        });
      }
    });
  }

  showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(this.showToast._timer);
    this.showToast._timer = setTimeout(
      () => toast.classList.remove("show"),
      2500,
    );
  }
}

// ============================================================
// HELPERS (global)
// ============================================================
function escapeHtml(str) {
  const amp = String.fromCharCode(38) + "amp;";
  const lt = String.fromCharCode(38) + "lt;";
  const gt = String.fromCharCode(38) + "gt;";
  const quot = String.fromCharCode(38) + "quot;";
  const apos = String.fromCharCode(38) + "#39;";
  const map = { "&": amp, "<": lt, ">": gt, '"': quot, "'": apos };
  return String(str).replace(/[&<>"']/g, (m) => map[m]);
}

// ============================================================
// BOOTSTRAP
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  window.netlab = new NetLabApp();
});
