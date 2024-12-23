const express = require("express");
const {
    createCar,
    getCars,
    getCar,
    updateCar,
    deleteCar,
} = require("../controllers/carController");

const router = express.Router();

router.post("/", createCar);
router.get("/", getCars);
router.get("/:id", getCar);
router.put("/:id", updateCar);
router.delete("/:id", deleteCar);

module.exports = router;
