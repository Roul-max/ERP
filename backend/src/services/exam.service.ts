import Exam from '../models/Exam';
import Result from '../models/Result';
import Student from '../models/Student';

const calculateGrade = (percentage: number) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'C+';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

export const createExam = async (data: any) => {
  return await Exam.create(data);
};

export const getExamsByFaculty = async (facultyId: string) => {
  // Simple implementation: getting all exams for simplicity, real app would filter by courses taught by faculty
  const exams = await Exam.find().populate('course').lean();
  
  // Attach result count to each exam
  const examsWithCounts = await Promise.all(exams.map(async (exam: any) => {
    const resultCount = await Result.countDocuments({ exam: exam._id });
    return { ...exam, resultCount };
  }));

  return examsWithCounts;
};

export const addResult = async (data: any) => {
  const exam = await Exam.findById(data.exam);
  if (!exam) throw new Error('Exam not found');

  const percentage = (data.marksObtained / exam.totalMarks) * 100;
  const grade = calculateGrade(percentage);

  // Check if result exists
  let result = await Result.findOne({ exam: data.exam, student: data.student });
  if (result) {
    result.marksObtained = data.marksObtained;
    result.grade = grade;
    await result.save();
  } else {
    result = await Result.create({ ...data, grade });
  }
  return result;
};

export const getStudentResults = async (userId: string) => {
  const student = await Student.findOne({ user: userId } as any);
  if (!student) throw new Error('Student not found');

  return await Result.find({ student: student._id } as any)
    .populate({
      path: 'exam',
      populate: { path: 'course' }
    });
};

export const getExamResults = async (examId: string) => {
  return await Result.find({ exam: examId }).populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' }
  });
};