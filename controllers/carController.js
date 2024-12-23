const Car = require("../models/Car");
const redis = require("../utils/redis");
const { createError } = require("../utils/errorHandler");

const CACHE_EXPIRATION = 3600;

const setCache = async (key, value) => {
    try {
        await redis.set(key, JSON.stringify(value), "EX", CACHE_EXPIRATION);
    } catch (err) {
        console.error(`Redis cache set failed for key: ${key}`, err);
    }
};

const createCar = async (req, res, next) => {
    try {
        const newCar = new Car(req.body);
        const savedCar = await newCar.save();

        await redis.del("cars");

        res.status(201).json({
            status: "success",
            message: "Car created successfully.",
            data: savedCar,
        });
    } catch (err) {
        next(err);
    }
};

const getCars = async (req, res, next) => {
    try {
        const cacheKey = "cars";

        const cachedCars = await redis.get(cacheKey);
        if (cachedCars) {
            return res.status(200).json({
                status: "success",
                message: "Cars fetched from cache successfully.",
                data: JSON.parse(cachedCars),
            });
        }

        const cars = await Car.find();
        await setCache(cacheKey, cars);

        res.status(200).json({
            status: "success",
            message: "Cars fetched successfully.",
            data: cars,
        });
    } catch (err) {
        next(err);
    }
};

const getCar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cacheKey = `car:${id}`;

        const cachedCar = await redis.get(cacheKey);
        if (cachedCar) {
            return res.status(200).json({
                status: "success",
                message: "Car fetched from cache successfully.",
                data: JSON.parse(cachedCar),
            });
        }

        const car = await Car.findById(id);
        if (!car) return next(createError(404, "Car not found."));

        await setCache(cacheKey, car);

        res.status(200).json({
            status: "success",
            message: "Car fetched successfully.",
            data: car,
        });
    } catch (err) {
        next(err);
    }
};

const updateCar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedCar = await Car.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedCar) return next(createError(404, "Car not found."));

        await redis.set(`car:${id}`, JSON.stringify(updatedCar), "EX", CACHE_EXPIRATION);
        await redis.del("cars");

        res.status(200).json({
            status: "success",
            message: "Car updated successfully.",
            data: updatedCar,
        });
    } catch (err) {
        next(err);
    }
};

const deleteCar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedCar = await Car.findByIdAndDelete(id);

        if (!deletedCar) return next(createError(404, "Car not found."));

        await redis.del(`car:${id}`);
        await redis.del("cars");

        res.status(200).json({
            status: "success",
            message: "Car deleted successfully.",
            data: null,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { createCar, getCars, getCar, updateCar, deleteCar };
