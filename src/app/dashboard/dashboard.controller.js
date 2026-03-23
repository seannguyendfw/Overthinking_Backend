const dashboardService = require('./dashboard.service');
const { sendSuccess, sendError } = require('../../helpers/response');
const ERRORS = require('../../constants/errors');
const { CATEGORY } = require('../../constants/enums');

const overview = async (req, res, next) => {
  try {
    const data = await dashboardService.overview(req.user.id);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const challengeDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.challengeDashboard(req.params.id, req.user.id);
    if (!data) return sendError(res, ERRORS.CHALLENGE_NOT_FOUND);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const categoryDashboard = async (req, res, next) => {
  try {
    const cat = req.params.category;
    if (!Object.values(CATEGORY).includes(cat)) {
      return sendError(res, ERRORS.VALIDATION_ERROR, `Invalid category. Must be one of: ${Object.values(CATEGORY).join(', ')}`);
    }
    const data = await dashboardService.categoryDashboard(req.user.id, cat);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

module.exports = { overview, challengeDashboard, categoryDashboard };
