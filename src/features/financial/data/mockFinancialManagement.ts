export type FinancialTransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED'

export type FinancialTransaction = {
  id: string
  transactionId: string
  student: string
  course: string
  amount: string
  status: FinancialTransactionStatus
  date: string
}

export type FinancialPayoutStatus = 'PAID' | 'PROCESSING' | 'PENDING' | 'FAILED'

export type FinancialPayout = {
  id: string
  payoutId: string
  faculty: string
  course: string
  amount: string
  status: FinancialPayoutStatus
  date: string
}

export const financialTransactions: FinancialTransaction[] = [
  {
    id: 'txn-101',
    transactionId: 'TXN101',
    student: 'Ali Khan',
    course: 'Cost Accounting',
    amount: '₹2,999',
    status: 'SUCCESS',
    date: 'Apr 20, 2024',
  },
  {
    id: 'txn-102',
    transactionId: 'TXN102',
    student: 'Sara Jain',
    course: 'Advanced Audit',
    amount: '₹4,499',
    status: 'SUCCESS',
    date: 'Apr 19, 2024',
  },
  {
    id: 'txn-103',
    transactionId: 'TXN103',
    student: 'David Miller',
    course: 'Taxation Law',
    amount: '₹3,200',
    status: 'FAILED',
    date: 'Apr 19, 2024',
  },
  {
    id: 'txn-104',
    transactionId: 'TXN104',
    student: 'Priya Sharma',
    course: 'Corporate Law',
    amount: '₹2,999',
    status: 'SUCCESS',
    date: 'Apr 18, 2024',
  },
  {
    id: 'txn-105',
    transactionId: 'TXN105',
    student: 'Rahul Verma',
    course: 'Financial Reporting',
    amount: '₹5,499',
    status: 'PENDING',
    date: 'Apr 18, 2024',
  },
  {
    id: 'txn-106',
    transactionId: 'TXN106',
    student: 'Neha Gupta',
    course: 'Cost Accounting',
    amount: '₹2,999',
    status: 'SUCCESS',
    date: 'Apr 17, 2024',
  },
]

export const financialPayouts: FinancialPayout[] = [
  {
    id: 'pay-201',
    payoutId: 'PYT201',
    faculty: 'Dr. Anil Mehta',
    course: 'Cost Accounting',
    amount: '₹48,000',
    status: 'PAID',
    date: 'Apr 20, 2024',
  },
  {
    id: 'pay-202',
    payoutId: 'PYT202',
    faculty: 'Prof. Kavita Rao',
    course: 'Advanced Audit',
    amount: '₹72,500',
    status: 'PROCESSING',
    date: 'Apr 19, 2024',
  },
  {
    id: 'pay-203',
    payoutId: 'PYT203',
    faculty: 'Dr. Sandeep Nair',
    course: 'Taxation Law',
    amount: '₹35,200',
    status: 'PENDING',
    date: 'Apr 19, 2024',
  },
  {
    id: 'pay-204',
    payoutId: 'PYT204',
    faculty: 'Prof. Meera Iyer',
    course: 'Corporate Law',
    amount: '₹58,900',
    status: 'PAID',
    date: 'Apr 18, 2024',
  },
  {
    id: 'pay-205',
    payoutId: 'PYT205',
    faculty: 'Dr. Rohit Sen',
    course: 'Financial Reporting',
    amount: '₹41,300',
    status: 'FAILED',
    date: 'Apr 17, 2024',
  },
]
