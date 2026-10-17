/**
 * Adapter between backend Report/Expense models and Frontend UI shapes.
 */

// Format date safely as YYYY-MM-DD
const formatDateStr = (rawDate) => {
  if (!rawDate) return new Date().toISOString().slice(0, 10);
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch {}
  return String(rawDate);
};

export const toFrontendExpense = (raw) => {
  if (!raw) return null;

  return {
    id: raw._id || raw.expense_ref || raw.id,
    _id: raw._id,
    invoiceNo: raw.expense_ref || raw.invoiceNo || String(raw._id || "").slice(-6),
    date: formatDateStr(raw.date),
    expense: raw.description || raw.expense || "General Expense",
    expenseBy: raw.expense_by || raw.expenseBy || "Admin",
    amount: Number(raw.amount) || 0,
    paymentMode: raw.payment_method || raw.paymentMode || "Cash",
    status: raw.status || "Paid",
    paidTo: raw.paid_to || raw.paidTo || "",
    category: raw.category || "General",
    currency: raw.currency || "USD",
    receiptUrl: raw.receipt_url || "",
    raw,
  };
};

export const toFrontendExpenseList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(toFrontendExpense).filter(Boolean);
};

export const toBackendExpensePayload = (uiItem) => {
  if (!uiItem) return {};

  return {
    expense_ref: uiItem.invoiceNo || uiItem.expense_ref,
    invoiceNo: uiItem.invoiceNo,
    description: (uiItem.expense || uiItem.description || "").trim(),
    expense: (uiItem.expense || uiItem.description || "").trim(),
    category: (uiItem.category || "General").trim(),
    amount: Number(uiItem.amount) || 0,
    currency: (uiItem.currency || "USD").trim(),
    date: uiItem.date ? new Date(uiItem.date).toISOString() : new Date().toISOString(),
    expense_by: (uiItem.expenseBy || uiItem.expense_by || "Admin").trim(),
    payment_method: (uiItem.paymentMode || uiItem.payment_method || "Cash").trim(),
    status: (uiItem.status || "Paid").trim(),
    paid_to: (uiItem.paidTo || uiItem.paid_to || "").trim(),
    receipt_url: uiItem.receiptUrl || uiItem.receipt_url || "",
  };
};

export const toFrontendRevenueReport = (data) => {
  if (!data) {
    return {
      kpi: { totalRevenue: 0, adr: 0, revPar: 0, grossMargin: 0 },
      trendData: [],
      donutData: [],
      sourceData: [],
    };
  }

  return {
    kpi: {
      totalRevenue: Number(data.kpi?.totalRevenue || 0),
      adr: Number(data.kpi?.adr || 0),
      revPar: Number(data.kpi?.revPar || 0),
      grossMargin: Number(data.kpi?.grossMargin || 0),
    },
    trendData: Array.isArray(data.trendData) ? data.trendData : [],
    donutData: Array.isArray(data.donutData) ? data.donutData : [],
    sourceData: Array.isArray(data.sourceData) ? data.sourceData : [],
  };
};

export const toFrontendOccupancyReport = (data) => {
  if (!data) {
    return {
      kpi: {
        averageOccupancyRate: 0,
        occupiedRooms: 0,
        availableRooms: 0,
        outOfOrderRooms: 0,
        totalRooms: 0,
      },
      trendData: [],
      donutData: [],
      roomTypeData: [],
    };
  }

  return {
    kpi: {
      averageOccupancyRate: Number(data.kpi?.averageOccupancyRate || 0),
      occupiedRooms: Number(data.kpi?.occupiedRooms || 0),
      availableRooms: Number(data.kpi?.availableRooms || 0),
      outOfOrderRooms: Number(data.kpi?.outOfOrderRooms || 0),
      totalRooms: Number(data.kpi?.totalRooms || 0),
    },
    trendData: Array.isArray(data.trendData) ? data.trendData : [],
    donutData: Array.isArray(data.donutData) ? data.donutData : [],
    roomTypeData: Array.isArray(data.roomTypeData) ? data.roomTypeData : [],
  };
};

export const toFrontendExpenseVsRevenueReport = (data) => {
  if (!data) {
    return {
      kpi: {
        totalRevenueYtd: 0,
        totalExpensesYtd: 0,
        netProfit: 0,
        profitMargin: 0,
      },
      monthlyTrendsData: [],
    };
  }

  return {
    kpi: {
      totalRevenueYtd: Number(data.kpi?.totalRevenueYtd || 0),
      totalExpensesYtd: Number(data.kpi?.totalExpensesYtd || 0),
      netProfit: Number(data.kpi?.netProfit || 0),
      profitMargin: Number(data.kpi?.profitMargin || 0),
    },
    monthlyTrendsData: Array.isArray(data.monthlyTrendsData) ? data.monthlyTrendsData : [],
  };
};
