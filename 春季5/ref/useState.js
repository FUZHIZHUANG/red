let states = []
let setters = []
let cursor = 0

function createSetter(cursor) {
  return function (newVal) {
    states[cursor] = newVal
    render()
  }
}

function useState(initVal) {
  if (states[cursor] === undefined) {
    states.push(initVal)
    setters.push(createSetter(cursor))
  }

  const state = states[cursor]
  const setter = setters[cursor]

  cursor++

  return [state, setter]
}

function render() {
  cursor = 0
  console.log("渲染：", states)
}