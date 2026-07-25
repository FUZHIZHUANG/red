import React from 'react';

const weekNames = ['一', '二', '三', '四', '五', '六', '日'];

const formatWeeks = (weeks) => {
  return `第${weeks}周`;
};

function ActivityDetail({ activity, onClose, onEdit }) {
  if (!activity) return null;

  const weekStr = formatWeeks(activity.weeks);
  const timePart =
    activity.time ||
    `周${weekNames[activity.weekday - 1]} 第${activity.startPeriod}节`;
  const timeDisplay = weekStr ? `${weekStr} ${timePart}` : timePart;

  return (
    <>
      <div className="detail-drawer open">
        <div>
          <button onClick={() => onEdit(activity)}>修改</button>
          <ul>
            <li>标题 {activity.title}</li>
            <li>时间 {timeDisplay}</li>
            <li>活动内容 {activity.content}</li>
          </ul>
        </div>
      </div>
      <div className="detail-overlay" onClick={onClose} />
    </>
  );
}

export default ActivityDetail;