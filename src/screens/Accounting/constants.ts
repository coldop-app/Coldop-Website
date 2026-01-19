export const CHART_OF_ACCOUNTS = {
  Asset: {
    "Fixed Assets": ["Property", "Plant", "Equipment", "Furniture", "Vehicles"],
    "Current Assets": ["Cash", "Bank Accounts", "Cash Equivalents", "Stock in Hand", "Debtors", "Prepaid Expenses", "Other Current Assets"]
  },
  Liability: {
    "Current Liabilities": ["Creditors", "Short-term Loans", "Outstanding Expenses"],
    "Long-term Liabilities": ["Long-term Loans", "Deferred Revenue"]
  },
  Income: {
    "Operating Income": ["Sales", "Service Revenue", "Rental Income"],
    "Non-Operating Income": ["Interest Received", "Dividends", "Other Income"]
  },
  Expense: {
    "Direct Expenses": ["Purchases"],
    "Operating Expenses": ["Rent", "Salaries", "Utilities", "Supplies", "Depreciation"],
    "Non-Operating Expenses": ["Interest Expense", "Loss on Sale", "Miscellaneous"],
    "Other Expense": ["Discount"]
  },
  Equity: {
    "Capital & Reserves": ["Capital", "Reserves & Surplus", "Retained Earnings"]
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
