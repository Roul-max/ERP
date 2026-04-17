import Book from '../models/Book';

export const createBook = async (data: any) => {
  return await Book.create(data);
};

export const getAllBooks = async () => {
  return await Book.find();
};

export const updateBook = async (id: string, data: any) => {
  return await Book.findByIdAndUpdate(id, data, { new: true });
};

export const deleteBook = async (id: string) => {
  return await Book.findByIdAndDelete(id);
};