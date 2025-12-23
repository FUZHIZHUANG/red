const pinglunList = document.getElementById("pinglun-list");
const submitButton = document.querySelector(".submit-button");
const countElement = document.getElementById("comment-count");
const contextMenu = document.getElementById("context-menu");
const deleteBtn = document.getElementById("delete-btn");
const neirongInput = document.getElementById("neirong");
let commentCount = 0;
let currentItem = null;

console.log("pinglunList:", pinglunList);
console.log("submitButton:", submitButton);

document.addEventListener('click', function () {

  submitButton.addEventListener("click", submitpinglun);
  submitButton.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      submitpinglun();
    }
  });
  neirongInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      submitpinglun();
    }
  });

  function submitpinglun() {
    const neirong = neirongInput.value.trim();
    console.log("输入内容:", neirong);

    if (neirong !== "") {
      const shafaElement = document.querySelector('.shafa');
      if (shafaElement) {
        shafaElement.remove();
      }
      const pinglunItem = document.createElement("div");
      pinglunItem.className = "pinglun-item";
      pinglunItem.innerHTML = `
      <div class="header">
        <img class="touxiang" src="touxiang.jpg">
        <span class="name">双子星</span>
      </div>
      <div class="content">${neirong}</div>
    `;
      pinglunList.appendChild(pinglunItem);

      pinglunItem.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        currentItem = this;
        contextMenu.style.left = e.clientX + 'px';
        contextMenu.style.top = e.clientY + 'px';
        contextMenu.style.display = 'block';
      });
      //commentCount++;
      commentCount = document.querySelectorAll(".pinglun-item").length;
      countElement.textContent = `评论数：${commentCount}`;
      neirongInput.value = "";
      console.log("评论已添加:", neirong);
    } else {
      console.log("输入为空，未添加评论");

    }

  }
});



deleteBtn.addEventListener('click', function () {
  if (currentItem) {
    currentItem.remove();
    //commentCount--;
    commentCount = document.querySelectorAll(".pinglun-item").length;
    countElement.textContent = `评论数：${commentCount}`;
    contextMenu.style.display = 'none';
    currentItem = null;
  }
});
function submitpinglun() {
  const neirongInput = document.getElementById("neirong");
  const neirong = neirongInput.value.trim();
  console.log("输入内容:", neirong);

  if (neirong !== "") {
    const shafaElement = document.querySelector('.shafa');
    if (shafaElement) {
      shafaElement.remove();
    }
    const pinglunItem = document.createElement("div");
    pinglunItem.className = "pinglun-item";
    pinglunItem.innerHTML = `
      <div class="header">
        <img class="touxiang" src="touxiang.jpg">
        <span class="name">双子星</span>
      </div>
      <div class="content">${neirong}</div>
    `;
    pinglunList.appendChild(pinglunItem);

    pinglunItem.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      currentItem = this;
      contextMenu.style.left = e.clientX + 'px';
      contextMenu.style.top = e.clientY + 'px';
      contextMenu.style.display = 'block';
    });
    //commentCount++;
    commentCount = document.querySelectorAll(".pinglun-item").length;
    countElement.textContent = `评论数：${commentCount}`;
    neirongInput.value = "";
    console.log("评论已添加:", neirong);
  } else {
    console.log("输入为空，未添加评论");

  }

}