import { Request, Response } from 'express';
import * as financeService from '../services/finance.service';

export const createFee = async (req: any, res: any) => {
  try {
    const fee = await financeService.createFee(req.body);
    res.status(201).json(fee);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyFees = async (req: any, res: any) => {
  try {
    const fees = await financeService.getFeesByStudent(req.user._id);
    res.json(fees);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllFees = async (req: any, res: any) => {
  try {
    const fees = await financeService.getAllFees();
    res.json(fees);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const payFee = async (req: any, res: any) => {
  try {
    const { transactionId } = req.body;
    const fee = await financeService.payFee(req.params.id, transactionId || `TXN_${Date.now()}`);
    res.json(fee);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};