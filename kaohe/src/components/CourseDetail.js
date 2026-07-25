import React from 'react';

const weekdaysChinese = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function CourseDetail({ course, onClose }) {
  if (!course) return null;
  return (
    <>
      <div className="detail-drawer open">
        <div>
          <h3>{course.courseName}</h3>
          <p>{course.classroom}  {'>'}  {course.teacher}</p>
          <ul>
            <li>周期 1-18周</li>
            <li>时间 {weekdaysChinese[course.weekday - 1]} {course.time}</li>
            <li>课程类型 {course.courseType}</li>
          </ul>
        </div>
      </div>
      <div className="detail-overlay" onClick={onClose} />
    </>
  );
}

export default CourseDetail;