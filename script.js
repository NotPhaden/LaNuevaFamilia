// ===============================
// GLOBAL HELPERS (IMPORTANT)
// ===============================

function getUsers() {
    return JSON.parse(localStorage.getItem("lnf_users") || "[]");
}

function setUsers(users) {
    localStorage.setItem("lnf_users", JSON.stringify(users));
}

function getTasks() {
    return JSON.parse(localStorage.getItem("lnf_tasks") || "[]");
}

function setTasks(tasks) {
    localStorage.setItem("lnf_tasks", JSON.stringify(tasks));
}

// ===============================
// NAVIGATION
// ===============================

function showPage(id, el) {

    document.querySelectorAll(".page")
        .forEach(p => p.classList.remove("active"));

    const target = document.getElementById(id);
    if (target) target.classList.add("active");

    document.querySelectorAll("nav a")
        .forEach(a => a.classList.remove("active"));

    if (el) el.classList.add("active");
}

// ===============================
// AUTH SYSTEM
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

    // login existing
    if (user) {
        user.online = true;
        user.lastSeen = Date.now();

        setUsers(users);

        localStorage.setItem("lnf_current_user", username);

        heartbeat();
        showApp();
        loadPanel();
        return;
    }

    // create new
    const newUser = {
        username,
        password,
        online: true,
        lastSeen: Date.now(),
        avatar: "https://i.imgur.com/zYxDCQT.png"
    };

    users.push(newUser);

    setUsers(users);
    localStorage.setItem("lnf_current_user", username);

    heartbeat();
    showApp();
    loadPanel();
}

// ===============================
// APP DISPLAY CONTROL
// ===============================

function showApp() {

    const auth = document.getElementById("authScreen");
    const app = document.getElementById("app");

    const currentUser = localStorage.getItem("lnf_current_user");

    if (!currentUser) {
        if (auth) auth.style.display = "flex";
        if (app) app.style.display = "none";
        return;
    }

    let users = getUsers();

    const exists = users.find(u => u.username === currentUser);

    if (!exists) {
        localStorage.removeItem("lnf_current_user");
        return;
    }

    if (auth) auth.style.display = "none";
    if (app) app.style.display = "block";
}

// ===============================
// ONLINE SYSTEM
// ===============================

function heartbeat() {

    const currentUser = localStorage.getItem("lnf_current_user");
    if (!currentUser) return;

    let users = getUsers();

    users.forEach(u => {
        if (u.username === currentUser) {
            u.online = true;
            u.lastSeen = Date.now();
        }
    });

    setUsers(users);
}

function cleanupOfflineUsers() {

    let users = getUsers();
    const now = Date.now();

    users.forEach(u => {
        if (u.lastSeen && now - u.lastSeen > 30000) {
            u.online = false;
        }
    });

    setUsers(users);
}

// ===============================
// PANEL DASHBOARD
// ===============================

function loadPanel() {

    const currentUser = localStorage.getItem("lnf_current_user");
    if (!currentUser) return;

    let users = getUsers();

    const current = users.find(u => u.username === currentUser);
    if (!current) return;

    // NAME
    const accountName = document.getElementById("accountName");
    if (accountName) accountName.innerText = current.username;

    // AVATAR
    const avatar = document.getElementById("profileAvatar");
    if (avatar) avatar.src = current.avatar;

    // MEMBER COUNT
    const memberCount = document.getElementById("memberCount");
    if (memberCount) memberCount.innerText = `${users.length}/50`;

    // ONLINE USERS
    const onlineUsers = users.filter(u => u.online === true);

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
    const tasks = getTasks();
    const userTasks = tasks.filter(t => t.user === currentUser).length;

    const taskEl = document.getElementById("displayTasks");
    if (taskEl) taskEl.textContent = userTasks;

    heartbeat();
}

// ===============================
// AVATAR CHANGE
// ===============================

function changeAvatar(event) {

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        const currentUser = localStorage.getItem("lnf_current_user");

        let users = getUsers();

        const user = users.find(u => u.username === currentUser);
        if (!user) return;

        user.avatar = e.target.result;

        setUsers(users);

        const avatar = document.getElementById("profileAvatar");
        if (avatar) avatar.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

// ===============================
// PHONE SYSTEM
// ===============================

function loadPhonePage() {

    const currentUser = localStorage.getItem("lnf_current_user");
    if (!currentUser) return;

    const savedPhone = localStorage.getItem(`phone_${currentUser}`);

    const form = document.getElementById("phoneFormBox");
    const info = document.getElementById("phoneInfo");

    if (savedPhone) {
        if (form) form.style.display = "none";
        if (info) info.style.display = "grid";
    }
}

function savePhone() {

    const currentUser = localStorage.getItem("lnf_current_user");
    const phone = document.getElementById("phoneInput").value.trim();

    if (!phone) {
        alert("Introdu un număr!");
        return;
    }

    localStorage.setItem(`phone_${currentUser}`, phone);

    loadPhonePage();
}

// ===============================
// GLOBAL REFRESH SYSTEM
// ===============================

function refreshGlobalUI() {

    loadPanel();

    if (typeof loadMembersPage === "function") loadMembersPage();
    if (typeof loadTasksPage === "function") loadTasksPage();
    if (typeof loadPhonePage === "function") loadPhonePage();
}

// ===============================
// AUTO LOOP
// ===============================

setInterval(() => {
    heartbeat();
    cleanupOfflineUsers();
    refreshGlobalUI();
}, 4000);

// ===============================
// PAGE INIT
// ===============================

window.addEventListener("DOMContentLoaded", () => {

    setTimeout(() => {
        showApp();
        loadPanel();
        loadPhonePage();
    }, 100);
});

// ===============================
// LOGOUT SAFETY
// ===============================

window.addEventListener("beforeunload", () => {

    const currentUser = localStorage.getItem("lnf_current_user");
    if (!currentUser) return;

    let users = getUsers();

    users.forEach(u => {
        if (u.username === currentUser) {
            u.online = false;
        }
    });

    setUsers(users);
});
