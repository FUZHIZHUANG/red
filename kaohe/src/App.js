import './move.css';
import './App.css';
import { useState, useEffect, useCallback, useRef } from 'react'
import { generateSchedule } from './mockData.js';
import CourseDetail from './components/CourseDetail';
import ActivityDetail from './components/ActivityDetail';
import AddActivityModal from './components/AddActivityModal';
import ScheduleTable from './components/ScheduleTable';

function App() {
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);          // 所有手动添加的活动

  const periods = Array.from({ length: 18 }, (_, i) => i + 1);  // 1~18节
  const weekdays = [1, 2, 3, 4, 5, 6, 7];

  const [activity, setActivity] = useState(false);
  const [step, setStep] = useState(1);
  const [activityTitle, setActivityTitle] = useState('')
  const [activityContent, setActivityContent] = useState('')
  const [activityTime, setActivityTime] = useState('')
  const [currentCell, setCurrentCell] = useState(null);

  const [weekOffset, setWeekOffset] = useState(0);// 周偏移量

  const [dragActivityId, setDragActivityId] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);

  //周次选择
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [weeksPickerVisible, setWeeksPickerVisible] = useState(false);
  //时间选择
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [timesPickerVisible, setTimesPickerVisible] = useState(false);

  //修改
  const [editingActivity, setEditingActivity] = useState(null);

  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef(null);

  const [animationDirection, setAnimationDirection] = useState('');

  // 请求数据
  useEffect(() => {
    fetch("/mockSchedule.json")
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("请求失败，使用默认课程", err);
        // 如果请求失败，生成一次固定课程（不再随时间变化）
        const fixedCourses = generateSchedule(12);
        setCourses(fixedCourses);
        setLoading(false);
      });
  }, []);

  const currentWeek = 21 + weekOffset;


  // 拖动
  useEffect(() => {
    const handleDragEnd = () => { setDragActivityId(null); setDragOverCell(null); };
    window.addEventListener('dragend', handleDragEnd);
    return () => window.removeEventListener('dragend', handleDragEnd);
  }, []);


  // 日期计算
  const BASE_MONDAY = new Date(2026, 6, 20);
  const currentMonday = new Date(BASE_MONDAY);
  currentMonday.setDate(BASE_MONDAY.getDate() + weekOffset * 7);
  const weekdayNames = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentMonday);
    date.setDate(currentMonday.getDate() + i);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return `${weekdays[i]}  ${day}日`;
  });
  const today = new Date();
  const weekdaysChinese = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const todayWeekday = weekdaysChinese[today.getDay()];
  const weekRangeStr = `第二十一周   ${todayWeekday}`;
  const weekEnd = new Date(currentMonday);
  weekEnd.setDate(currentMonday.getDate() + 6);
  const startMonth = currentMonday.getMonth() + 1;
  const endMonth = weekEnd.getMonth() + 1;
  const monthStr = startMonth === endMonth ? `${startMonth}月` : `${startMonth}-${endMonth}月`;

  // 构建课程快速查找映射
  const scheduleMap = {};
  courses.forEach(c => {
    if (!scheduleMap[c.weekday]) scheduleMap[c.weekday] = {};
    scheduleMap[c.weekday][c.startPeriod] = c;
  });

  // 确认按钮的处理函数
  const handleFinish = () => {
    if (!activityTitle.trim()) {
      setActivity(false);
      setStep(1);
      setActivityTitle('');
      setActivityContent('');
      setActivityTime('');
      setSelectedWeeks([]);
      setSelectedTimes([]);
      setWeeksPickerVisible(false);
      setTimesPickerVisible(false);
      setEditingActivity(null);
      return;
    }

    const finalWeeks = selectedWeeks.includes('__all__') ? [] : selectedWeeks;
    const slots = selectedTimes.length > 0 ? selectedTimes : [{ weekday: currentCell.weekday, period: currentCell.period }];
    // 冲突检测（遍历每一个待添加的时间段）
    for (let slot of slots) {
      // 检查是否与课程冲突
      if (scheduleMap[slot.weekday]?.[slot.period]) {
        alert(`周${slot.weekday} 第${slot.period}节已有课程，无法添加活动`);
        return;
      }
      const conflictActivity = activities.find(a => {
        if (a.weekday !== slot.weekday || a.startPeriod !== slot.period) return false;
        // 排除正在编辑的自身（修改模式）
        if (editingActivity && a.id === editingActivity.id) return false;
        // 检查周次交集
        const aWeeks = a.weeks   // 空数组视为全无
        const newWeeks = finalWeeks;
        if (aWeeks.length === 0 || newWeeks.length === 0) return true;   // 有一方无周次则不冲突（或可根据需求调整）
        return aWeeks.some(w => newWeeks.includes(w));
      });
      if (conflictActivity) {
        alert(
          `周${slot.weekday} 第${slot.period}节已有活动“${conflictActivity.title}”，无法添加`
        );
        return;
      }
    }
    if (editingActivity) {
      // 更新已有活动
      // 优先使用用户选择的时间段，否则用原位置
      const targetSlot = selectedTimes.length > 0 ? selectedTimes[0] : { weekday: currentCell.weekday, period: currentCell.period };
      const updatedActivities = activities.map(a => {
        if (a.id === editingActivity.id) {
          return {
            ...a,
            title: activityTitle,
            content: activityContent,
            time: activityTime,
            weeks: selectedWeeks,
            weekday: targetSlot.weekday,
            startPeriod: targetSlot.period
          };
        }
        return a;
      });
      setActivities(updatedActivities);
    } else {
      const newActivities = slots.map(slot => ({
        id: Date.now() + Math.floor(Math.random() * 1000000), // 加个随机数，避免 id 重复
        weekday: slot.weekday,          // 使用 slot 的星期
        startPeriod: slot.period,
        duration: 1,            // 占1节课
        title: activityTitle,
        content: activityContent,
        time: activityTime,
        weeks: finalWeeks,
      }));
      setActivities(prev => [...prev, ...newActivities]);
    }

    setActivity(false);
    setStep(1);
    setActivityTitle('');
    setActivityContent('');
    setActivityTime('');
    setSelectedWeeks([]);
    setSelectedTimes([])
    setWeeksPickerVisible(false);
    setTimesPickerVisible(false);
    setSelectedActivity(null);
    setEditingActivity(null);
  };
  // 删除函数
  const handleDeleteActivity = (id) => {
    setActivities(activities.filter(a => a.id !== id));
  };



  const handleMoveActivity = useCallback((activityId, targetWeekday, targetPeriod) => {
    //从所有活动中找到被拖拽的那个活动对象
    const activity = activities.find(a => a.id === activityId);
    // 未发生移动
    if (!activity) {
      return;
    }
    // 如果拖拽到原地（同一个格子），不做任何事。
    if (activity.weekday === targetWeekday && activity.startPeriod === targetPeriod) {
      return;
    }
    // 如果目标格子已经有一门课程开始，则不能放活动，直接返回。
    if (scheduleMap[targetWeekday]?.[targetPeriod]) {
      alert(`周${targetWeekday} 第${targetPeriod}节已有课程，无法添加活动`);
      return;
    }
    //如果目标格子已经被另一个活动占据，则不能放，直接返回。
    const conflict = activities.some(a => a.weekday === targetWeekday && a.startPeriod === targetPeriod);
    if (conflict) {
      alert(
        `周${targetWeekday} 第${targetPeriod}节已有活动，无法添加`
      );
      return;
    }
    //改成目标位置
    const updated = activities.map(a => {
      if (a.id === activityId) {
        return { ...a, weekday: targetWeekday, startPeriod: targetPeriod };
      }
      return a;
    });
    //更新状态
    setActivities(updated);
  }, [activities, scheduleMap]);

  // 拖拽事件处理
  //开始拖拽
  const onDragStart = (e, activityId) => {
    e.dataTransfer.setData('text/plain', activityId.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDragActivityId(activityId);
  };
  //在空单元格上移动
  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  //拖入空单元格
  const onDragEnter = (e, weekday, period) => { e.preventDefault(); setDragOverCell({ weekday, period }); };
  //离开空单元格
  const onDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCell(null); };
  // 松手放置
  const onDrop = (e, weekday, period) => {
    e.preventDefault();
    const activityId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    handleMoveActivity(activityId, weekday, period);
    setDragOverCell(null);
    setDragActivityId(null);
  };


  // 切换周次选中
  const handleWeekToggle = (week) => {
    setSelectedWeeks(prev =>
      prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]
    );
  };


  // 打开/关闭周次选择面板
  const handleOpenWeeksPicker = () => setWeeksPickerVisible(true);
  const handleCloseWeeksPicker = () => setWeeksPickerVisible(false);

  // 打开添加活动时重置周次选择
  const handleOpenAddActivity = (weekday, period) => {
    setActivity(true);
    setStep(1);
    setCurrentCell({ weekday, period });
    setActivityTitle('');
    setActivityContent('');
    setActivityTime('');
    setSelectedWeeks([]);
    setWeeksPickerVisible(false);
    setSelectedTimes([]);
    setTimesPickerVisible(false);
    setEditingActivity(null);
  };

  // 切换时间方法
  const handleAddTimeSlot = (weekday, period) => {
    if (selectedTimes.some(s => s.weekday === weekday && s.period === period)) return;
    setSelectedTimes(prev => [...prev, { weekday, period }]);
  };

  const handleRemoveTimeSlot = (index) => {
    setSelectedTimes(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenTimesPicker = () => setTimesPickerVisible(true);
  const handleCloseTimesPicker = () => setTimesPickerVisible(false);

  // 打开编辑活动（填入现有数据）
  const handleEditActivity = (activity) => {
    setActivity(true);               // 打开弹窗
    setStep(1);                     // 从第1步开始
    setEditingActivity(activity);   // 记录正在编辑的活动
    setActivityTitle(activity.title);
    setActivityContent(activity.content);
    setActivityTime(activity.time || '');
    setSelectedWeeks(activity.weeks || []);
    // 如果之前有时间槽，则还原（需要 extra 存储，这里暂略）
    setSelectedTimes([{ weekday: activity.weekday, period: activity.startPeriod }]);
    setCurrentCell({ weekday: activity.weekday, period: activity.startPeriod });
  };


  // 触摸开始：记录活动 ID 并启动长按计时器
  const onDragStartTouch = (e, activityId) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDragActivityId(activityId);

    // 清除之前的定时器，重新计时
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setIsDraggingTouch(true);
      document.body.style.touchAction = 'none';   // 禁止页面滚动
    }, 500);
  };

  // 触摸移动：仅拖拽模式时更新目标高亮
  const onDragMoveTouch = (e) => {
    if (!isDraggingTouch) return;  // 未进入拖拽模式则不处理，允许页面正常滚动

    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!target) return;
    const cell = target.closest('td');
    if (!cell) return;
    const weekday = parseInt(cell.getAttribute('data-weekday'), 10);
    const period = parseInt(cell.getAttribute('data-period'), 10);
    if (weekday && period) {
      setDragOverCell({ weekday, period });
    } else {
      setDragOverCell(null);
    }
  };

  // 触摸结束：根据是否长按决定操作
  const onDragEndTouch = (e) => {
    e.preventDefault();  // 阻止后续 click 事件
    e.stopPropagation();

    // 清除长按计时器
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isDraggingTouch) {
      // 长按拖拽模式 → 移动活动
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target) {
        const cell = target.closest('td');
        if (cell) {
          const weekday = parseInt(cell.getAttribute('data-weekday'), 10);
          const period = parseInt(cell.getAttribute('data-period'), 10);
          if (weekday && period && dragActivityId) {
            handleMoveActivity(dragActivityId, weekday, period);
          }
        }
      }
      setIsDraggingTouch(false);
      document.body.style.touchAction = '';  // 恢复页面滚动
    } else {
      // 短按 → 打开活动详情
      if (dragActivityId) {
        const activity = activities.find(a => a.id === dragActivityId);
        if (activity) setSelectedActivity(activity);
      }
    }

    // 重置拖拽状态
    setDragOverCell(null);
    setDragActivityId(null);
    setTouchStartPos({ x: 0, y: 0 });
  };

  const handleSelectAllWeeks = () => {
    if (selectedWeeks.includes('__all__')) {
      setSelectedWeeks([]);                // 取消整学期
    } else {
      setSelectedWeeks(['__all__']);       // 设为整学期
    }
  };

  return (
    <div className="App">
      <h3>{weekRangeStr}</h3>
      {/* 控制课表开关 */}
      <div className="toggle-button">
        <button onClick={() => {
          if (open) {
            setSelectedCourse(null);
            setActivity(false);
            setSelectedActivity(null);
          }
          setOpen(!open);
        }} >
          {open ? "关闭课表" : "查看课表"}
        </button>
      </div>

      {/* 课程表 */}
      <div className={`drawer ${open ? "open" : ""}`}>
        <h3>{`第${currentWeek}周   ${monthStr}`}</h3>
        <button onClick={() => {
          if (weekOffset < 0) { setAnimationDirection('left'); }
          else { setAnimationDirection('right'); }
          setWeekOffset(0);
        }} className="current">
          回到本周
        </button>
        <div className={`weekday-header ${animationDirection}`}
          onAnimationEnd={() => setAnimationDirection('')}>
          <ScheduleTable
            periods={periods} weekdays={weekdays} weekdayNames={weekdayNames}
            courses={courses} activities={activities}
            dragActivityId={dragActivityId} dragOverCell={dragOverCell}
            setSelectedCourse={setSelectedCourse}
            setSelectedActivity={setSelectedActivity}
            handleDeleteActivity={handleDeleteActivity}
            onCellClick={handleOpenAddActivity}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            scheduleMap={scheduleMap}
            currentWeek={currentWeek}
            onDragStartTouch={onDragStartTouch}
            onDragMoveTouch={onDragMoveTouch}
            onDragEndTouch={onDragEndTouch}
          />
        </div>
      </div>


      {/* 详情页 */}
      <CourseDetail course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      <ActivityDetail activity={selectedActivity} onClose={() => setSelectedActivity(null)}
        onEdit={handleEditActivity} />
      <AddActivityModal
        visible={activity}
        step={step}
        title={activityTitle}
        content={activityContent}
        time={activityTime}
        selectedWeeks={selectedWeeks}
        selectedTimes={selectedTimes}
        timesPickerVisible={timesPickerVisible}
        weeksPickerVisible={weeksPickerVisible}
        setActivityTitle={setActivityTitle}
        setActivityContent={setActivityContent}
        setActivityTime={setActivityTime}
        onNext={() => setStep(step + 1)}
        onFinish={handleFinish}
        onWeekToggle={handleWeekToggle}
        onOpenWeeksPicker={handleOpenWeeksPicker}
        onCloseWeeksPicker={handleCloseWeeksPicker}
        onAddSlot={handleAddTimeSlot}
        onRemoveSlot={handleRemoveTimeSlot}
        onOpenTimesPicker={handleOpenTimesPicker}
        onCloseTimesPicker={handleCloseTimesPicker}
        onSelectAll={handleSelectAllWeeks}
      />


      {/* 课表切换  */}
      <div className="schedule-switch">
        <button onClick={() => {
          setAnimationDirection('right');
          setWeekOffset(prev => prev - 1);
        }} className={`last ${open ? "open" : ""}`}>
          {'<'}
        </button>
        <button onClick={() => {
          setAnimationDirection('left');
          setWeekOffset(prev => prev + 1);
        }} className={`next ${open ? "open" : ""}`}>
          {'>'}
        </button>
      </div>

    </div >
  );
}

export default App;


