const fconfig = {
  method: "get"
}
fetch('https://api.github.com/users/FUZHIZHUANG', fconfig)
  .then(res => res.json())
  .then(data => console.log(data))


const fconfig2 = {
  method: "get"
}
fetch('https://api.openweathermap.org/data/2.5/weather?q=$Chongqing&appid=$606a147bf45e455b6cd9eeb72d4e974a&units=metric&lang=zh_cn', fconfig2)
  .then(res => res.json())
  .then(data => console.log(data))


const fconfig3 = {
  method: "post",
  headers: {
    'Authorization': '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',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "My-New-Repo",
    description: "eight homework repo",
    private: false
  })
}
fetch('https://api.github.com/user/repos', fconfig3)
  .then(res => res.json())
  .then(data => console.log(data))