function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const userDisplay = document.getElementById("user-display");

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    const storedAccount = localStorage.getItem(username);
    if (!storedAccount) {
        alert("No account found with that username.");
        return;
    }

    const account = JSON.parse(storedAccount);
    if (account.password !== password) {
        alert("Incorrect password.");
        return;
    }

    localStorage.setItem("loggedInUser", username);

    document.getElementById("user-display").innerText = `${username}`;
    const authBtn = document.getElementById("auth-button");
    authBtn.innerText = "Logout";
    authBtn.onclick = logout;

    alert("Login successful!");
    closeLogin();
}

// Close the login modal
function closeLogin() {
    document.getElementById("login-model").style.display = "none";
}

// Display username if already logged in (on page load)
function updateUserDisplay() {
    const username = localStorage.getItem("loggedInUser");
    const userDisplay = document.getElementById("user-display");
    const authBtn = document.getElementById("auth-button");

    if (username) {
        userDisplay.innerText = `${username}`;
        authBtn.innerText = "Logout";
        authBtn.onclick = logout;
    } else {
        userDisplay.innerText = "";
        authBtn.innerText = "Login / Signup";
        authBtn.onclick = showLogin;
    }
}

function logout() {
    localStorage.removeItem("loggedInUser");

    document.getElementById("user-display").innerText = "";
    const authBtn = document.getElementById("auth-button");
    authBtn.innerText = "Login / Signup";
    authBtn.onclick = showLogin;
}

document.addEventListener("DOMContentLoaded", function () {
    const authForm = document.getElementById("authForm");

    if (authForm) {
        authForm.addEventListener("submit", function (e) {
            e.preventDefault(); // prevent page reload

            const confirmPwd = document.getElementById("confirm-password");
            const isSignup = confirmPwd && confirmPwd.style.display !== "none";

            if (isSignup) {
                signup(); // If confirm password is showing, sign up
            } else {
                login(); // Otherwise, normal login
            }
        });
    }

    updateUserDisplay();
});

