export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

export interface NewExpenseData {
  amount: number;
  description: string;
  category: string;
  date: string;
} 