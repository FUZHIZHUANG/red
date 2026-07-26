import React, { useState } from 'react';
import Picker from 'react-mobile-picker';

const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function TimePicker({ visible, selectedTimes, onAddSlot, onRemoveSlot, onClose }) {
  const [pickerValue, setPickerValue] = useState({
    weekday: weekdays[0],
    period: periods[0],
  });

  if (!visible) return null;

  const selections = {
    weekday: weekdays,
    period: periods,
  };

  const handleAdd = () => {
    const weekdayIndex = weekdays.indexOf(pickerValue.weekday) + 1;
    const periodNum = pickerValue.period
    onAddSlot(weekdayIndex, periodNum);
  };

  return (
    <div className="time-picker-overlay" onClick={onClose}>
      <div className="time-picker-drawer" onClick={e => e.stopPropagation()}>
        <h3>选择时间</h3>
        {/* 已选时间段 */}
        <div className="selected-times">
          {selectedTimes.map((slot, idx) => (
            <span key={idx} className="selected-time-tag">
              {weekdays[slot.weekday - 1]} 第{slot.period}节
              <span className="remove-time" onClick={() => onRemoveSlot(idx)}> x</span>
            </span>
          ))}
        </div>
        <Picker value={pickerValue} onChange={setPickerValue} height={200}>
          {Object.keys(selections).map(name => (
            <Picker.Column key={name} name={name}>
              {selections[name].map(option => (
                <Picker.Item key={option} value={option}>
                  {name === 'period' ? `第${option}节` : option}
                </Picker.Item>
              ))}
            </Picker.Column>
          ))}
        </Picker>
        <button onClick={handleAdd} className="add-slot-btn">添加当前时间</button>
        <button className="confirm-btn" onClick={onClose}>确认</button>
      </div>
    </div>
  );
}

export default TimePicker;