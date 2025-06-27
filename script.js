
document.getElementById("newentrybtn").addEventListener("click", () => {
  showSection("new-entry-section");
});
document.getElementById("viewentriesbtn").addEventListener("click", () => {
  showSection("viewentriessection");
});
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}
