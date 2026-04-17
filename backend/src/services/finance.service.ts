import Fee from '../models/Fee';
import Student from '../models/Student';

export const createFee = async (data: any) => {
  return await Fee.create(data);
};

export const getFeesByStudent = async (userId: string) => {
  const student = await Student.findOne({ user: userId } as any);
  if (!student) throw new Error('Student not found');
  return await Fee.find({ student: student._id } as any).sort('-dueDate');
};

export const getAllFees = async () => {
  return await Fee.find().populate({
    path: 'student',
    populate: { path: 'user', select: 'name email' }
  });
};

export const payFee = async (feeId: string, transactionId: string) => {
  return await Fee.findByIdAndUpdate(feeId, {
    status: 'Paid',
    transactionId,
    paymentDate: new Date()
  }, { new: true });
};