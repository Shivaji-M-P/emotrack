// Toggle between Login & Signup
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

loginTab.addEventListener("click", () => showForm("login"));
signupTab.addEventListener("click", () => showForm("signup"));
document.getElementById("goToSignup").addEventListener("click", () => showForm("signup"));
document.getElementById("goToLogin").addEventListener("click", () => showForm("login"));

function showForm(type) {
  if (type === "login") {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
  }
}

// Password Toggle
function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

// Email Validation
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password Strength Check
const signupPassword = document.getElementById("signupPassword");
const strengthText = document.getElementById("passwordStrength");

signupPassword.addEventListener("input", () => {
  const val = signupPassword.value;
  let strength = "Weak";
  let color = "red";

  if (val.length >= 8 && /[A-Z]/.test(val) && /\d/.test(val)) {
    strength = "Strong";
    color = "#00ff99";
  } else if (val.length >= 6) {
    strength = "Medium";
    color = "orange";
  }

  strengthText.textContent = `Password Strength: ${strength}`;
  strengthText.style.color = color;
});

// Signup Form
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!validateEmail(email)) {
    alert("Enter a valid email.");
    return;
  }

  if (password.length < 6) {
    alert("Password should be at least 6 characters long.");
    return;
  }

  localStorage.setItem("user", JSON.stringify({ name, email, password }));
  alert("Signup successful! You can now log in.");
  showForm("login");
});

// Login Form (No Alert – Direct Redirect)
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && email === user.email && password === user.password) {
    // Redirect directly to dashboard
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid email or password.");
  }
});
