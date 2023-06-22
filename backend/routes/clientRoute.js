const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
  registerClient,
  getClients,
  getClient,
  deleteClient,
  updateClient,
} = require("../controllers/clientController");

router.post("/register", protect, registerClient);
router.get("/", protect, getClients);
router.get("/:id", protect, getClient);
router.delete("/:id", protect, deleteClient);
router.patch("/:id", protect, updateClient);

module.exports = router;
