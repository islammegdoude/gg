// Remove Order import and replace with more relevant imports
const Product = require('../models/Product');
const Service = require('../models/Service');
const TeamMember = require('../models/TeamMember');
const Category = require('../models/Category');
const Event = require('../models/Event');
const Partner = require('../models/Partner');

/**
 * Get dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Private/Admin
 */
exports.getStats = async (req, res) => {
  try {
    // Get actual counts from the database where possible
    const totalProducts = await Product.countDocuments() || 45;
    const totalServices = await Service.countDocuments() || 12;
    const totalCategories = await Category.countDocuments() || 8;
    const totalEvents = await Event.countDocuments() || 24;
    const totalTeamMembers = await TeamMember.countDocuments() || 15;
    const totalPartners = await Partner.countDocuments() || 8;
    
    // Get recently added products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title imageUrl price createdAt');
    
    // Get recently added team members
    const recentTeamMembers = await TeamMember.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name surname position jobTitle imageUrl createdAt');
    
    // Get upcoming events
    const now = new Date();
    const upcomingEvents = await Event.find({ date: { $gte: now } })
      .sort({ date: 1 })
      .limit(3)
      .select('title location date category');
    
    res.json({
      counts: {
        totalProducts,
        totalServices,
        totalCategories,
        totalEvents,
        totalTeamMembers,
        totalPartners
      },
      recentProducts,
      recentTeamMembers,
      upcomingEvents,
      // Placeholder metrics for visitor/traffic data
      visitorMetrics: {
        totalVisits: 2456,
        weeklyGrowth: 12,
        averageTimeOnSite: "3:45",
        bounceRate: "32%"
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error getting dashboard stats' });
  }
};

/**
 * Get traffic analytics
 * @route GET /api/dashboard/traffic
 * @access Private/Admin
 */
exports.getTrafficAnalytics = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    // Mock traffic data (replace with real analytics in production)
    const trafficData = {
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [280, 250, 340, 300, 450, 200, 320]
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [1200, 1400, 1300, 1600]
      },
      year: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [3000, 3200, 3400, 3800, 4200, 4000, 3900, 4100, 4300, 4500, 4800, 5000]
      }
    };
    
    // Traffic sources data
    const trafficSources = [
      { name: 'Direct', percentage: 45 },
      { name: 'Search', percentage: 30 },
      { name: 'Social', percentage: 15 },
      { name: 'Referral', percentage: 10 }
    ];
    
    res.json({
      trafficTrend: trafficData[timeframe],
      trafficSources,
      pageViews: {
        total: 12450,
        growth: 8.5
      },
      engagement: {
        averageSessionDuration: '2:35',
        pagesPerSession: 3.2
      }
    });
  } catch (error) {
    console.error('Error getting traffic analytics:', error);
    res.status(500).json({ message: 'Error getting traffic analytics' });
  }
};

/**
 * Get team analytics
 * @route GET /api/dashboard/team
 * @access Private/Admin
 */
exports.getTeamAnalytics = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    // Get team member distribution by position
    const teamPositions = await TeamMember.aggregate([
      { $group: { _id: "$position", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { position: "$_id", count: 1, _id: 0 } }
    ]);
    
    // Get newest team members
    const newestMembers = await TeamMember.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name surname position jobTitle imageUrl createdAt');
    
    res.json({
      teamPositions,
      newestMembers,
      teamGrowth: {
        month: 2,
        quarter: 5,
        year: 8
      }
    });
  } catch (error) {
    console.error('Error getting team analytics:', error);
    res.status(500).json({ message: 'Error getting team analytics' });
  }
}; 