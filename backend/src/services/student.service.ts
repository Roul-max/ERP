import Student from '../models/Student';
import User from '../models/User';

export const createStudent = async (data: any) => {
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: 'student'
  });

  const student = await Student.create({
    user: user._id as any,
    rollNumber: data.rollNumber,
    department: data.department,
    batch: data.batch,
    contactNumber: data.contactNumber,
    address: data.address
  });

  return student;
};

export const getAllStudents = async (query: any) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  const filter: any = {};

  if (query.department) {
    filter.department = { $regex: query.department, $options: 'i' };
  }
  
  if (query.batch) {
    filter.batch = { $regex: query.batch, $options: 'i' };
  }

  // Filter by name (requires querying User collection first)
  if (query.name) {
    const users = await User.find({ name: { $regex: query.name, $options: 'i' } }).select('_id');
    const userIds = users.map(u => u._id);
    filter.user = { $in: userIds };
  }

  // Note: Sorting by 'name' (populated field) requires aggregation, which is omitted here for simplicity.
  // Standard sorting works for fields directly on the Student model.
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder;

  const students = await Student.find(filter)
    .populate('user', 'name email isActive')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  const total = await Student.countDocuments(filter);

  return { students, total, page, pages: Math.ceil(total / limit) };
};

export const updateStudent = async (id: string, data: any) => {
  const student = await Student.findById(id);
  if (!student) throw new Error('Student not found');

  const userUpdates: any = {};
  if (data.name) userUpdates.name = data.name;
  if (data.email) userUpdates.email = data.email;

  if (Object.keys(userUpdates).length > 0) {
    await User.findByIdAndUpdate(student.user, userUpdates);
  }

  return await Student.findByIdAndUpdate(id, data, { new: true }).populate('user', 'name email');
};

export const deleteStudent = async (id: string) => {
  const student = await Student.findById(id);
  if (!student) throw new Error('Student not found');
  
  await User.findByIdAndDelete(student.user);
  await Student.findByIdAndDelete(id);
};