import { Request, Response } from 'express';
import * as libraryService from '../services/library.service';

export const createBook = async (req: any, res: any) => {
  try {
    const book = await libraryService.createBook(req.body);
    res.status(201).json(book);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllBooks = async (req: any, res: any) => {
  try {
    const books = await libraryService.getAllBooks();
    res.json(books);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBook = async (req: any, res: any) => {
  try {
    const book = await libraryService.updateBook(req.params.id, req.body);
    res.json(book);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBook = async (req: any, res: any) => {
  try {
    await libraryService.deleteBook(req.params.id);
    res.json({ message: 'Book removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};