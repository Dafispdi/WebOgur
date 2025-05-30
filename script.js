// Konfigurasi GitHub
const REPO_OWNER = "ACTVTEAM";
const REPO_NAME = "Hajji";
const FILE_PATH = "user_data.json";
const GITHUB_TOKEN = "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"; // Jangan gunakan token publik di klien

async function checkLogin() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("loginMessage");

    if (username === "admin" && password === "cpanelreseller") {
        document.getElementById("loginContainer").classList.add("hidden");
        document.getElementById("dataContainer").classList.remove("hidden");
        loginMessage.innerText = "";
        return;
    } else {
        loginMessage.innerText = "❌ Username atau password salah!";
        return;
    }
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("loginMessage");

    loginMessage.innerText = "⏳ Sedang memproses...";

    try {
        const response = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}`);

        if (!response.ok) throw new Error(`Gagal mengambil data! Status: ${response.status}`);

        const users = await response.json();

        if (typeof users !== 'object') throw new Error("Format user_data.json harus berupa objek!");

        const user = Object.entries(users).find(
            ([, data]) => data.username === username && data.password === password
        );

        if (user) {
            document.getElementById("loginContainer").classList.add("hidden");
            document.getElementById("dataContainer").classList.remove("hidden");
            loginMessage.innerText = "";
        } else {
            loginMessage.innerText = "❌ Username atau password salah!";
        }
    } catch (error) {
        console.error("🚨 Error saat autentikasi:", error);
        loginMessage.innerText = "❌ Terjadi kesalahan saat mengautentikasi.";
    }
}

async function addUser() {
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const fullName = document.getElementById("fullName").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const userMessage = document.getElementById("userMessage");

    if (!phoneNumber || !fullName || !newPassword) {
        userMessage.innerText = "❌ Harap isi semua field!";
        return;
    }

    userMessage.innerText = "⏳ Menambahkan pengguna...";

    try {
        const response = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}`);
        const jsonData = await response.json();

        if (jsonData[phoneNumber]) {
            userMessage.innerText = "❌ Nomor sudah terdaftar!";
            return;
        }

        jsonData[phoneNumber] = {
            name: fullName,
            password: newPassword
        };

        const updatedData = JSON.stringify(jsonData, null, 2);
        const base64Content = btoa(unescape(encodeURIComponent(updatedData)));

        const shaResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`);
        const shaData = await shaResponse.json();
        const currentSHA = shaData.sha;

        const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: `Menambahkan user ${fullName} ke database`,
                content: base64Content,
                sha: currentSHA,
            }),
        });

        if (updateResponse.ok) {
            userMessage.innerText = "✅ Pengguna berhasil ditambahkan ke database!";
        } else {
            throw new Error("Gagal menambahkan user ke GitHub.");
        }
    } catch (error) {
        console.error(error);
        userMessage.innerText = "❌ Terjadi kesalahan saat menambahkan pengguna.";
    }
}
