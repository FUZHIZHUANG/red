import Mock from 'mockjs';

const coursePool = [
  { name: '高等数学', color: '#4A90E2', courseType: '必修' },
  { name: '大学英语', color: '#E74C3C', courseType: '必修' },
  { name: '数据结构', color: '#2ECC71', courseType: '必修' },
  { name: 'Python程序设计', color: '#F39C12', courseType: '必修' },
  { name: '线性代数', color: '#9B59B6', courseType: '必修' },
  { name: '马克思主义原理', color: '#1ABC9C', courseType: '选修' },
  { name: '体育', color: '#3498DB', courseType: '必修' },
];

const teacherPool = ['张老师', '李老师', '王老师', '赵老师', '刘老师', '陈老师', '杨老师'];
const classroomPool = ['2201', '3506', '4416', '2408', '3306', '9501', '4317'];


export function generateSchedule(count = 18, teacherMap = {}, classroomMap = {}) {
  // 占用记录：星期 -> 节次集合
  const occupied = {};
  for (let w = 1; w <= 7; w++) {
    occupied[w] = new Set();
  }

  const courses = [];
  const courseTeacherMap = teacherMap;
  const courseClassroomMap = classroomMap;

  for (let i = 0; i < count; i++) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 200) {
      // 挑选课程、老师、教室
      const courseItem = coursePool[Math.floor(Math.random() * coursePool.length)];
      if (!courseTeacherMap[courseItem.name]) {
        courseTeacherMap[courseItem.name] = teacherPool[Math.floor(Math.random() * teacherPool.length)];
      }
      const teacher = courseTeacherMap[courseItem.name];

      if (!courseClassroomMap[courseItem.name]) {
        courseClassroomMap[courseItem.name] = classroomPool[Math.floor(Math.random() * classroomPool.length)];
      }
      const classroom = courseClassroomMap[courseItem.name];

      // 随机星期和开始节次
      const weekday = Math.floor(Math.random() * 7) + 1;      // 1~7
      const Periods = [
        { period: 1, time: '8:00-9:40' },
        { period: 3, time: '10:15-11:55' },
        { period: 5, time: '14:00-15:40' },
        { period: 7, time: '16:15-17:55' },
        { period: 9, time: '19:00-20:40' },
        { period: 11, time: '21:15-22:55' },
      ];
      const onetime = Periods[Math.floor(Math.random() * Periods.length)];
      const startPeriod = onetime.period;
      const duration = 2;
      const endPeriod = startPeriod + duration - 1;
      const time = onetime.time;
      if (endPeriod > 18) continue;

      // 检查冲突
      let conflict = false;
      for (let p = startPeriod; p <= endPeriod; p++) {
        if (occupied[weekday].has(p)) {
          conflict = true;
          break;
        }
      }

      if (!conflict) {
        // 标记占用
        for (let p = startPeriod; p <= endPeriod; p++) {
          occupied[weekday].add(p);
        }

        courses.push({
          id: i + 1,
          courseName: courseItem.name,
          teacher,
          classroom,
          weekday,
          startPeriod,
          duration,
          time,
          color: courseItem.color,
          courseType: courseItem.courseType,
        });
        placed = true;
      }
      attempts++;
    }

    // 如果尝试多次仍无法放置（课程太满），停止生成
    if (!placed) break;
  }

  return courses;
}

export const mockCourses = generateSchedule(18);

console.log(JSON.stringify(mockCourses, null, 2));