const buttons = document.querySelectorAll('input[type="button"]');
const quanxuan = buttons[0];
const quanbuxuan = buttons[1];
const fanxuan = buttons[2];
quanxuan.onclick = function () {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(kong => kong.checked = true);
};
quanbuxuan.onclick = function () {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(kong => kong.checked = false);
};
fanxuan.onclick = function () {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(kong => kong.checked = !kong.checked);
};
