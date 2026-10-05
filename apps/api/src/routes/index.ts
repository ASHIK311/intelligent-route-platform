import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { mapController } from '../controllers/map.controller.js';
import { routesController } from '../controllers/routes.controller.js';
import { historyController } from '../controllers/history.controller.js';
import { personalBrainController } from '../controllers/personal-brain.controller.js';
import { analyticsController } from '../controllers/analytics.controller.js';
import { adminController } from '../controllers/admin.controller.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// --- Auth Routes ---
const authRouter = Router();
authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.get('/me', authenticateToken, authController.getMe);
router.use('/auth', authRouter);

// --- Map & Graph Routes ---
const mapRouter = Router();
mapRouter.get('/nodes', mapController.getNodes);
mapRouter.get('/edges', mapController.getEdges);
mapRouter.get('/graph', mapController.getGraph);
mapRouter.post('/traffic/:edgeId', mapController.updateTraffic);
router.use('/map', mapRouter);

// --- Route Search & Calculation Routes ---
const routeRouter = Router();
routeRouter.post('/search', optionalAuth, routesController.search);
routeRouter.get('/:id', routesController.getRouteById);
router.use('/routes', routeRouter);

// --- Journey History & Tracking Routes ---
const historyRouter = Router();
historyRouter.get('/', optionalAuth, historyController.getHistory);
historyRouter.post('/start', optionalAuth, historyController.startJourney);
historyRouter.post('/:id/complete', optionalAuth, historyController.completeJourney);
historyRouter.post('/:id/feedback', optionalAuth, historyController.submitFeedback);
router.use('/history', historyRouter);

// --- Personal Route Brain Routes ---
const brainRouter = Router();
brainRouter.get('/', optionalAuth, personalBrainController.getBrainSummary);
brainRouter.post('/analyze', optionalAuth, personalBrainController.triggerAnalysis);
router.use('/personal-brain', brainRouter);

// --- User Preferences Routes ---
const prefRouter = Router();
prefRouter.get('/', optionalAuth, personalBrainController.getPreferences);
prefRouter.put('/', optionalAuth, personalBrainController.updatePreferences);
router.use('/preferences', prefRouter);

// --- Analytics Routes ---
const analyticsRouter = Router();
analyticsRouter.get('/overview', analyticsController.getOverview);
router.use('/analytics', analyticsRouter);

// --- System Health ---
const systemRouter = Router();
systemRouter.get('/health', adminController.getHealth);
router.use('/system', systemRouter);

// --- Admin Management Routes ---
const adminRouter = Router();
adminRouter.get('/health', adminController.getHealth);
adminRouter.get('/users', adminController.getUsers);
adminRouter.get('/models', adminController.getModels);
adminRouter.post('/models/:versionId/promote', adminController.promoteModel);
adminRouter.post('/benchmark', adminController.runBenchmark);
router.use('/admin', adminRouter);

export default router;
