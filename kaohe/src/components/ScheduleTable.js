import React from 'react';

function ScheduleTable({
  periods, weekdays, weekdayNames, courses, activities,
  dragActivityId, dragOverCell,
  setSelectedCourse, setSelectedActivity, handleDeleteActivity, scheduleMap,
  onCellClick, onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, currentWeek
  , onDragStartTouch, onDragMoveTouch, onDragEndTouch
}) {

  // 只保留当前周应该显示的活动
  const visibleActivities = activities.filter(a => {
    if (a.weeks.length === 0) return true;   // 整学期，在所有周显示
    return a.weeks.includes(currentWeek);
  });


  const isCovered = (weekday, period) => {
    for (let prev = 1; prev < period; prev++) {
      const prevCourse = scheduleMap[weekday]?.[prev];
      if (prevCourse && prev + prevCourse.duration > period) {
        return true;
      }
    }
    return false;
  };

  const getPeriodColor = (startPeriod) => {
    if (startPeriod >= 1 && startPeriod <= 4) return '#e5cc97';
    if (startPeriod >= 5 && startPeriod <= 8) return '#f08175';
    if (startPeriod >= 9 && startPeriod <= 12) return '#4A90E2';
    return '#95A5A6';
  };

  return (
    <table className="schedule-table">
      <thead>
        <tr>
          <th>节次</th>
          {weekdayNames.map((name, idx) => <th key={idx}>{name}</th>)}
        </tr>
      </thead>
      <tbody>
        {periods.map(period => (
          <tr key={period}>
            <td className="period-cell">{period}</td>
            {weekdays.map(weekday => {
              const course = scheduleMap[weekday]?.[period];
              if (course) {
                return (
                  <td key={weekday} rowSpan={course.duration} className="course-cell"
                    style={{ backgroundColor: getPeriodColor(course.startPeriod) }}
                    onClick={() => setSelectedCourse(course)} data-weekday={weekday}
                    data-period={period}>
                    <div className="course-name">{course.courseName}</div>
                    <div className="course-info">{course.classroom}</div>
                  </td>
                );
              }
              if (isCovered(weekday, period)) return null;

              const existingActivity = visibleActivities.find(a => a.weekday === weekday && a.startPeriod === period);
              if (existingActivity) {
                return (
                  <td key={weekday}
                    className={`activity-cell ${dragActivityId === existingActivity.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => onDragStart(e, existingActivity.id)}
                    // 新增触摸事件
                    onTouchStart={(e) => {
                      // 通知父级开始拖拽，传入活动ID
                      onDragStartTouch(e, existingActivity.id);
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault(); // 防止页面滚动
                      onDragMoveTouch(e);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      onDragEndTouch(e);
                    }}
                    onClick={() => setSelectedActivity(existingActivity)}
                    data-weekday={weekday}
                    data-period={period}>
                    <div className="course-name">{existingActivity.title}</div>
                    <div className="course-info">{existingActivity.content}</div>
                    <div className="course-info">{existingActivity.time}</div>
                    <span className="delete-icon" onClick={(e) => { e.stopPropagation(); handleDeleteActivity(existingActivity.id); }}
                      onTouchStart={(e) => {
                        e.stopPropagation();                // 新增：阻止冒泡到 td，避免触发拖拽
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();   // 新增：阻止 touchend 冒泡
                      }}>x</span>
                  </td>
                );
              }

              return (
                <td key={weekday}
                  className={`empty-cell ${dragOverCell?.weekday === weekday && dragOverCell?.period === period ? 'drag-over' : ''}`}
                  onDragOver={onDragOver}
                  onDragEnter={(e) => onDragEnter(e, weekday, period)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, weekday, period)}
                  onClick={() => onCellClick(weekday, period)}
                  data-weekday={weekday}
                  data-period={period}>
                  <span className="add-btn">+</span>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table >
  );
}

export default ScheduleTable;
