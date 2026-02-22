function signup() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPasswordInput = document.getElementById("confirm-password");
    const confirmPassword = confirmPasswordInput.value.trim();
    const userDisplay = document.getElementById("user-display");
    const authBtn = document.getElementById("auth-button");

    // Show confirm password input if it's hidden
    if (confirmPasswordInput.style.display === "none") {
        confirmPasswordInput.style.display = "block";
        document.getElementById("login-message").innerText = "Please confirm your password.";
        return;
    }

    if (!username || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (localStorage.getItem(username)) {
        alert("Username already exists.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const account = { username, password };
    localStorage.setItem(username, JSON.stringify(account));
    localStorage.setItem("loggedInUser", username);

    userDisplay.innerText = `${username}`;
    authBtn.innerText = "Logout";
    authBtn.onclick = logout;

    alert("Account created successfully!");
    confirmPasswordInput.style.display = "none";
    confirmPasswordInput.value = "";

    closeLogin();
}
