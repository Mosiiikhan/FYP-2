const express = require('express');
const router = express.Router();
const { 
  uploadMiddleware, 
  uploadSeatingPlan, 
  getSeatingPlanByStudent 
} = require('../controllers/datacell/SeatingPlanController');

// Make sure all handlers exist
if (!uploadMiddleware || !uploadSeatingPlan || !getSeatingPlanByStudent) {
  console.error("❌ Missing controller exports! Check SeatingPlanController.js");
}

/* =========================
   📥 UPLOAD SEATING PLAN ROUTE
========================= */
router.post("/upload-seating-plan", uploadMiddleware, uploadSeatingPlan);

/* =========================
   📤 GET SEATING PLAN BY STUDENT ROUTE
========================= */
router.get("/seating-plan/:student_id", getSeatingPlanByStudent);

/* =========================
   📤 TEST ROUTE
========================= */
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Seating Plan routes are working!" });
});

module.exports = router;