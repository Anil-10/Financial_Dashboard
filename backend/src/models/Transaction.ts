import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  date: Date;
  amount: number;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending';
  userId: mongoose.Types.ObjectId;
  userProfile?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Revenue', 'Expense'],
      message: 'Category must be either Revenue or Expense'
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Paid', 'Pending'],
      message: 'Status must be either Paid or Pending'
    }
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  userProfile: {
    type: String,
    default: 'https://thispersondoesnotexist.com/'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
transactionSchema.index({ userId: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ userId: 1, date: -1 });

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction; 