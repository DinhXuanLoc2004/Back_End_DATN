const express = require("express");
const { asyncHandler } = require("../utils");
const BrandController = require("../controller/brand.controller");
const {
  upload,
  uploadSingleImageMiddleware,
} = require("../middlewares/uploadfile.middleware");
const router = express.Router();

router.post(
  "/add_brand",
  upload.single("image"),
  uploadSingleImageMiddleware,
  asyncHandler(BrandController.addBrand)
);
router.delete(
  "/toggle_delete_brand",
  asyncHandler(BrandController.toggleDeleteBrand)
);
router.get("/get_all_brands", asyncHandler(BrandController.getAllBrands));
router.put(
  "/update_brand",
  upload.single("image"),
  uploadSingleImageMiddleware,
  asyncHandler(BrandController.updateBrand)
);

module.exports = router;
