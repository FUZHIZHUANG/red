let obj = {
  name: "萧炎", age: 18,
  address: { world: "斗气大陆", city: "乌坦城", family: "萧家" },
  title: ["炎帝", "无尽火域掌控者"]
};
let { name: newName } = obj;
console.log(newName);//变量重命名
let { name, age, title: [titleOne], address: { world } } = obj;
console.log(name, age, titleOne, world);
let { log } = console;
log("三十年河东，三十年河西，莫欺少年穷");


let copy = structuredClone(obj);
copy.name = "叶修";
copy.address.city = "巴黎世";
copy.title = "君莫笑";
console.log(copy.name);
console.log(copy.address.city);
console.log(copy.title);
console.log(obj.name);
console.log(obj.address.city);
console.log(obj.title);
