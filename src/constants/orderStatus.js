export const ORDER_STATUS = {
  placed: { label: "Order Placed", color: "#3b82f6", bg: "#eff6ff" },
  scheduled: { label: "Pickup Scheduled", color: "#6366f1", bg: "#eef2ff" },
  assigned: { label: "Partner Assigned", color: "#8b5cf6", bg: "#f5f3ff" },
  picked: { label: "Device Picked Up", color: "#f97316", bg: "#fff7ed" },
  verified: { label: "Device Verified", color: "#f59e0b", bg: "#fffbeb" },
  payment_initiated: {
    label: "Payment Initiated",
    color: "#14b8a6",
    bg: "#f0fdfa",
  },
  completed: { label: "Completed", color: "#0565E6", bg: "#E8F1FF" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "#fef2f2" },
};

export const ORDER_TIMELINE = [
  "placed",
  "scheduled",
  "assigned",
  "picked",
  "verified",
  "payment_initiated",
  "completed",
];
