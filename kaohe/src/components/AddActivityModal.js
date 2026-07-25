import React from 'react';
import TimePicker from './TimePicker';
const WeekPicker = ({ visible, selectedWeeks, onToggle, onClose, onSelectAll }) => {
  if (!visible) return null;
  return (
    <div className="week-picker-overlay" onClick={onClose}>
      <div className="week-picker-drawer" onClick={e => e.stopPropagation()}>
        <h3>选择周次</h3>
        <div className="week-tags">
          <span
            className={`week-tag ${selectedWeeks.includes('__all__') ? 'selected' : ''}`}
            onClick={onSelectAll}
          >
            整学期
          </span>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(week => (
            <span
              key={week}
              className={`week-tag ${selectedWeeks.includes(week) ? 'selected' : ''}`}
              onClick={() => onToggle(week)}
            >
              第{week}周
            </span>
          ))}
        </div>
        <button className="confirm-btn" onClick={onClose}>确认</button>
      </div>
    </div>
  );
};


function AddActivityModal({
  visible, step, title, content, time,
  selectedWeeks, selectedTimes,
  weeksPickerVisible, timesPickerVisible,
  setActivityTitle, setActivityContent, setActivityTime,
  onNext, onFinish,
  onWeekToggle, onOpenWeeksPicker, onCloseWeeksPicker,
  onAddSlot, onRemoveSlot, onOpenTimesPicker, onCloseTimesPicker, onSelectAll
}) {
  if (!visible) return null;
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const presetTitles = ['自习', '值班', '考试', '开会', '作业', '补课', '实验', '复习', '学习', '外出'];
  return (
    <div className="activity-change open">
      {step === 1 && (
        <div className="step-content">
          <h3>为你的行程添加一个标题</h3>
          <input type="text" placeholder="请输入活动标题" value={title} onChange={e => setActivityTitle(e.target.value)} />
          <div className="preset-tags">
            {presetTitles.map(tag => (
              <span
                key={tag}
                className="preset-tag"
                onClick={() => setActivityTitle(prev => prev.trim() ? `${prev}${tag}` : tag)}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )
      }
      {
        step === 2 && (
          <div className="step-content">
            <p>标题:{title}</p>
            <h3>为你的行程添加具体内容</h3>
            <input type="text" placeholder="请输入活动内容" value={content} onChange={e => setActivityContent(e.target.value)} />
          </div>
        )
      }
      {
        step === 3 && (
          <div className="step-content">
            <p>标题:{title}</p>
            <h3>选择时间段</h3>
            <input type="text" placeholder="请输入活动时间" value={time} onChange={e => setActivityTime(e.target.value)} />
            <div style={{ position: 'relative', right: 'auto' }}>
              <span style={{ fontSize: '16px' }}>选择周次</span>
              <button className='add-time-btn' onClick={onOpenWeeksPicker}> {"+"} </button>
            </div>
            {selectedWeeks.includes('__all__') ? (
              <div className="selected-weeks">
                <span className="selected-week-tag">整学期</span>
              </div>
            ) : selectedWeeks.length > 0 ? (
              <div className="selected-weeks">
                {selectedWeeks.map(week => (
                  <span key={week} className="selected-week-tag">第{week}周</span>
                ))}
              </div>
            ) : null}
            <div style={{ position: 'relative', right: 'auto' }}>
              <span style={{ fontSize: '16px' }}>选择时间</span>
              <button className='add-time-btn' onClick={onOpenTimesPicker}> {"+"} </button>
            </div>
            {selectedTimes.length > 0 && (
              <div className="selected-times-preview">
                {selectedTimes.map((slot, idx) => (
                  <span key={idx} className="selected-time-tag">
                    {weekdays[slot.weekday - 1]} 第{slot.period}节
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      }
      <button onClick={step < 3 ? onNext : onFinish} className='nextBtn'>
        {step < 3 ? '→' : '确定'}
      </button>
      {/* 周次选择面板 */}
      <WeekPicker
        visible={weeksPickerVisible}
        selectedWeeks={selectedWeeks}
        onToggle={onWeekToggle}
        onClose={onCloseWeeksPicker}
        onSelectAll={onSelectAll}
      />
      <TimePicker
        visible={timesPickerVisible}
        selectedTimes={selectedTimes}
        onAddSlot={onAddSlot}
        onRemoveSlot={onRemoveSlot}
        onClose={onCloseTimesPicker}
      />
    </div >
  );
}

export default AddActivityModal;