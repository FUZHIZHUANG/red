import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

function App() {
  const [date, setDate] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const listdate = date.map(item => (
    <li key={item.id}>
      <label>
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => toggleSelect(item.id)}
        />
        {item.name}
      </label>
    </li>
  ));

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  function add() {
    const value = inputValue.trim();
    if (!value) return;
    const newDate = { id: date.length + 1, name: value, selected: false };
    setDate([...date, newDate]);
    setInputValue('');
  };

  function del() {
    setDate(prev => prev.filter(item => !item.selected));
  };

  const toggleSelect = (id) => {
    setDate(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const selectAll = () => {
    setDate(prev => prev.map(item => ({ ...item, selected: true })));
  };

  const deselectAll = () => {
    setDate(prev => prev.map(item => ({ ...item, selected: false })));
  };

  const invertSelection = () => {
    setDate(prev => prev.map(item => ({ ...item, selected: !item.selected })));
  };

  return (
    <>
      <div className='list'>
        <h1 className='biaoti'>daily list</h1>
        <ul className='ld'>{listdate}</ul>
      </div>
      <div>
        <input type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder='请输入内容'
          className='input'
        />
        <button className='btn1' onClick={add}>添加</button>
        <button className='btn2' onClick={del}>删除</button>
        <button type="button" className="qx" onClick={selectAll} >全选</button>
        <button type="button" className="qbx" onClick={deselectAll} >全不选</button>
        <button type="button" className="fx" onClick={invertSelection} >反选</button>
      </div>
    </>
  );
}

export default App;
