import {Student} from '../models/Student.js';
import { Locker}  from '../models/Locker.js';
import { Rental} from '../models/Rental.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [lockerStats, rentalStats, studentStats] = await Promise.all([
      Locker.getStats(),
      Rental.getStats(),
      Student.findAll(1, 1) // Just to get total count
    ]);

    const stats = {
      totalLockers: lockerStats.total,
      availableLockers: lockerStats.available,
      rentedLockers: lockerStats.rented,
      maintenanceLockers: lockerStats.maintenance,
      overdueRentals: rentalStats.overdue,
      monthlyRevenue: parseFloat(rentalStats.total_revenue) || 0,
      totalStudents: studentStats.total,
      activeRentals: rentalStats.active
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar estatísticas do dashboard'
    });
  }
};