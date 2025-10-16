const loginB = document.getElementById("login");
const signUpB = document.getElementById("signUp");
const dummy = document.querySelector(".dummy");

loginB.addEventListener("click", () => {
  dummy.style.left = "50%";
  dummy.style.transition = "all 0.6s ease";
});

signUpB.addEventListener("click", () => {
  dummy.style.left = "0%";
  dummy.style.transition = "all 0.6s ease";
});

