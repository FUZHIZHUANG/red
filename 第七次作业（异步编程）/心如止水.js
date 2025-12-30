const water = document.getElementsByClassName("water");
const jiaocheng = document.getElementsByClassName("jiaocheng");
const content = document.getElementsByClassName("content");
const start = document.getElementById("start");


function printText(element, text) {
  return new Promise((resolve) => {
    let index = 0;
    element.innerHTML = '';
    element.style.display = 'block';

    const interval = setInterval(() => {
      if (index < text.length) {
        element.innerHTML += text[index];
        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

start.addEventListener('click', async function () {
  await printText(water[0], water[0].textContent);
  await printText(jiaocheng[0], jiaocheng[0].textContent);
});
