// ===============================
// USERS CORE SYSTEM
// ===============================

function getUsers() {
    return JSON.parse(localStorage.getItem("lnf_users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("lnf_users", JSON.stringify(users));
}

function getCurrentUser() {
    return localStorage.getItem("lnf_current_user");
}

// ===============================
// LOGIN / REGISTER
// ===============================

function createAccount() {

    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!username || !password) {
        alert("Completează toate câmpurile");
        return;
    }

    let users = getUsers();

    let user = users.find(u => u.username === username);

    if (user) {
        user.online = true;
        user.lastSeen = Date.now();

        saveUsers(users);
        localStorage.setItem("lnf_current_user", username);

        showApp();
        loadPanel();
        return;
    }

    const newUser = {
        username,
        password,
        online: true,
        lastSeen: Date.now(),
        avatar: "https://i.imgur.com/zYxDCQT.png"
    };

    users.push(newUser);

    saveUsers(users);
    localStorage.setItem("lnf_current_user", username);

    showApp();
    loadPanel();
}

// ===============================
// SHOW APP
// ===============================

function showApp() {

    const auth = document.getElementById("authScreen");
    const app = document.getElementById("app");

    const currentUser = getCurrentUser();

    if (!currentUser) {
        if (auth) auth.style.display = "flex";
        if (app) app.style.display = "none";
        return;
    }

    if (auth) auth.style.display = "none";
    if (app) app.style.display = "block";
}

// ===============================
// HEARTBEAT (ONLINE SYSTEM)
// ===============================

function heartbeat() {

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    let users = getUsers();

    users = users.map(u => {
        if (u.username === currentUser) {
            return {
                ...u,
                online: true,
                lastSeen: Date.now()
            };
        }
        return u;
    });

    saveUsers(users);
}

// ===============================
// CLEAN OFFLINE USERS
// ===============================

function cleanupOfflineUsers() {

    let users = getUsers();
    const now = Date.now();

    users = users.map(u => {

        if (u.lastSeen && now - u.lastSeen > 15000) {
            return { ...u, online: false };
        }

        return u;
    });

    saveUsers(users);
}

// ===============================
// LOAD MAIN PANEL
// ===============================

function loadPanel() {

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const users = getUsers();

    const current = users.find(u => u.username === currentUser);
    if (!current) return;

    const accountName = document.getElementById("accountName");
    if (accountName) accountName.innerText = current.username;

    const avatar = document.getElementById("profileAvatar");
    if (avatar) avatar.src = current.avatar;

    const memberCount = document.getElementById("memberCount");
    if (memberCount) memberCount.innerText = `${users.length}/50`;

    const now = Date.now();

    const onlineUsers = users.filter(u =>
        u.online && u.lastSeen && now - u.lastSeen < 15000
    );

    const onlineCount = document.getElementById("onlineCount");
    if (onlineCount) onlineCount.innerText = onlineUsers.length;

    const list = document.getElementById("onlineMembers");
    if (list) {
        list.innerHTML = "";
        onlineUsers.forEach(u => {
            list.innerHTML += `<li>🟢 ${u.username}</li>`;
        });
    }

    // PHONE
    const phone = localStorage.getItem(`phone_${currentUser}`);
    const phoneEl = document.getElementById("displayPhone");
    if (phoneEl) phoneEl.textContent = phone || "Nesetat";

    // TASKS
    const tasks = JSON.parse(localStorage.getItem("lnf_tasks")) || [];
    const userTasks = tasks.filter(t => t.user === currentUser).length;

    const taskEl = document.getElementById("displayTasks");
    if (taskEl) taskEl.textContent = userTasks;

    heartbeat();
}

// ===============================
// PHONE SAVE
// ===============================

function savePhone() {

    const currentUser = getCurrentUser();
    const phone = document.getElementById("phoneInput")?.value.trim();

    if (!phone) {
        alert("Introdu un număr!");
        return;
    }

    localStorage.setItem(`phone_${currentUser}`, phone);

    loadPhonePage();
}

// ===============================
// PHONE LOAD
// ===============================

function loadPhonePage() {

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const phone = localStorage.getItem(`phone_${currentUser}`);

    const form = document.getElementById("phoneFormBox");
    const info = document.getElementById("phoneInfo");

    if (phone) {
        if (form) form.style.display = "none";
        if (info) info.style.display = "grid";
    }
}

// ===============================
// GLOBAL REFRESH (IMPORTANT)
// ===============================

function refreshGlobalUI() {

    loadPanel();

    if (typeof renderMembers === "function") renderMembers();
    if (typeof loadMembers === "function") loadMembers();
}

// ===============================
// INTERVAL SYSTEM
// ===============================

setInterval(() => {

    heartbeat();
    cleanupOfflineUsers();
    refreshGlobalUI();

}, 3000);

// ===============================
// INIT
// ===============================

window.addEventListener("DOMContentLoaded", () => {

    setTimeout(() => {

        showApp();
        loadPanel();
        loadPhonePage();

    }, 100);

});
