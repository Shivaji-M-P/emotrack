const form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email === "" || password === "") {
    alert("⚠️ Please fill all fields!");
    return;
  }

  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!email.match(emailPattern)) {
    alert("⚠️ Enter a valid email address");
    return;
  }

  if (password.length < 6) {
    alert("⚠️ Password must be at least 6 characters");
    return;
  }

  // Redirect to dashboard
  window.location.href = "dashboard.html";
});

function togglePassword() {
  const passwordInput = document.getElementById("password");
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
}
