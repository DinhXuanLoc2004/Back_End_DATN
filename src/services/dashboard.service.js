const { orderModel } = require("../models/order.model");
const moment = require("moment");

class DashboardService {
    static getOrderStatistics = async ({ query }) => {
        const { startDate, endDate, phone } = query;

        const filter = {};
        if (startDate) filter.createdAt = { $gte: new Date(startDate) };
        if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
        if (phone) filter.phone = phone;

        const matchDeliveredStatus = {
            $lookup: {
                from: "Status_Orders",
                localField: "_id",
                foreignField: "order_id",
                as: "status_info",
            },
        };

        const filterDeliveredStatus = {
            $match: { "status_info.status": "Delivered Successfully" },
        };

        // Lấy thống kê ngày
        const dailyStatistics = await orderModel.aggregate([
            matchDeliveredStatus,
            filterDeliveredStatus,
            { $match: filter },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$total_amount" },
                },
            },
        ]);

        // Lấp đầy dữ liệu ngày tháng
        const dailyStatisticsWithMissing = [];
        for (let month = 1; month <= 12; month++) {
            const startOfMonth = moment(`${moment().year()}-${month}-01`);
            const endOfMonth = startOfMonth.clone().endOf("month");
            let currentDate = startOfMonth.clone();

            while (currentDate <= endOfMonth) {
                const dateStr = currentDate.format("YYYY-MM-DD");
                const data = dailyStatistics.find((d) => d._id === dateStr);

                dailyStatisticsWithMissing.push({
                    date: dateStr,
                    total_orders: data ? data.totalOrders : 0,
                    total_revenue: data ? data.totalRevenue : 0,
                });
                currentDate.add(1, "day");
            }
        }

        // Cấu trúc thống kê tháng, tuần, ngày
        const structuredStatistics = [];
        for (let month = 1; month <= 12; month++) {
            const startOfMonth = moment(`${moment().year()}-${month}-01`);
            const endOfMonth = startOfMonth.clone().endOf("month");
            let currentWeekStart = startOfMonth.clone().startOf("isoWeek");
            let monthWeeks = [];

            let monthTotalOrders = 0;
            let monthTotalRevenue = 0;

            while (currentWeekStart <= endOfMonth) {
                let weekDays = [];
                let weekTotalOrders = 0;
                let weekTotalRevenue = 0;

                for (let i = 0; i < 7; i++) {
                    const currentDate = currentWeekStart.clone().add(i, "days");
                    if (currentDate >= startOfMonth && currentDate <= endOfMonth) {
                        const dayData = dailyStatisticsWithMissing.find(
                            (d) => d.date === currentDate.format("YYYY-MM-DD")
                        );

                        const totalOrders = dayData ? dayData.total_orders : 0;
                        const totalRevenue = dayData ? dayData.total_revenue : 0;

                        weekDays.push({
                            date: currentDate.format("YYYY-MM-DD"),
                            total_orders: totalOrders,
                            total_revenue: totalRevenue,
                        });

                        weekTotalOrders += totalOrders;
                        weekTotalRevenue += totalRevenue;
                    }
                }

                if (weekDays.length > 0) {
                    monthWeeks.push({
                        week: currentWeekStart.isoWeek(),
                        total_orders: weekTotalOrders,
                        total_revenue: weekTotalRevenue,
                        days: weekDays,
                    });

                    monthTotalOrders += weekTotalOrders;
                    monthTotalRevenue += weekTotalRevenue;
                }

                currentWeekStart.add(1, "week");
            }

            structuredStatistics.push({
                month: month,
                year: moment().year(),
                total_orders: monthTotalOrders,
                total_revenue: monthTotalRevenue,
                weeks: monthWeeks,
            });
        }

        // Thống kê theo email
        const userEmailStatistics = await orderModel.aggregate([
            matchDeliveredStatus,
            filterDeliveredStatus,
            { $match: filter },
            {
                $lookup: {
                    from: "Users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_info",
                },
            },
            { $unwind: "$user_info" },
            {
                $group: {
                    _id: "$user_info.email",
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: "$total_amount" },
                    orderDetails: {
                        $addToSet: {
                            total_orders: 1,
                            total_spent: "$total_amount",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    email: "$_id",
                    total_orders: "$totalOrders",
                    total_spent: "$totalSpent",
                },
            },
            { $sort: { total_spent: -1 } },
        ]);

        // Kết quả trả về
        return {
            monthly_statistics: structuredStatistics,
            user_email_statistics: userEmailStatistics.map((item) => ({
                email: item.email,
                total_orders: item.total_orders,
                total_spent: item.total_spent,
            })),
        };
    };
}

module.exports = DashboardService;
