const mongoose = require('mongoose');

const DOCUMENT_NAME_DASHBOARD = 'Dashboard';
const COLLECTION_NAME_DASHBOARD = 'Dashboards';

const dashboardSchema = new mongoose.Schema(
  {
    daily_statistics: [
      {
        date: { type: String, required: true },
        total_revenue: { type: Number, default: 0 },
      },
    ],
    weekly_statistics: [
      {
        week: { type: Number, required: true },
        total_orders: { type: Number, default: 0 },
        total_revenue: { type: Number, default: 0 },
      },
    ],
    monthly_statistics: [
      {
        year: { type: Number, required: true },
        month: { type: Number, required: true },
        total_orders: { type: Number, default: 0 },
        total_revenue: { type: Number, default: 0 },
      },
    ],
    user_phone_statistics: [
      {
        phone: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        province_name: { type: String, required: true },
        total_orders: { type: Number, default: 0 },
        total_spent: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME_DASHBOARD,
  }
);

const dashboardModel = mongoose.model(DOCUMENT_NAME_DASHBOARD, dashboardSchema);

module.exports = { dashboardModel, DOCUMENT_NAME_DASHBOARD, COLLECTION_NAME_DASHBOARD };
