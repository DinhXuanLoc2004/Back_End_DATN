const { ConflictRequestError } = require("../core/error.reponse");
const { sizeModel } = require("../models/size.model");
const { selectFilesData } = require("../utils");

class SizeService {
  static addSize = async ({ body }) => {
    const { size } = body;

    const existingSize = await sizeModel.findOne({ size });
    if (existingSize) throw new ConflictRequestError("Size already exists!");

    const newSize = await sizeModel.create({ size });
    if (!newSize) throw new ConflictRequestError("Error creating size!");

    return {
      newSize: selectFilesData({ fileds: ["size"], object: newSize }),
    };
  };

  static updateSize = async ({ id, body }) => {
    const { size } = body;

    const existingSize = await sizeModel.findOne({ size, _id: { $ne: id } });
    if (existingSize) throw new ConflictRequestError("Size already exists!");

    const updatedSize = await sizeModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!updatedSize) throw new ConflictRequestError("Size not found!");

    return {
      updatedSize: selectFilesData({ fileds: ["size"], object: updatedSize }),
    };
  };

  static deleteSize = async ({ id }) => {
    const deletedSize = await sizeModel.findByIdAndUpdate(
      id,
      { is_delete: true },
      { new: true }
    );
    if (!deletedSize) throw new ConflictRequestError("Size not found!");
    return {
      message: "Size marked as deleted successfully!",
    };
  };

  static getAllSizes = async () => {
    const sizes = await sizeModel.find({ is_delete: false });
    return {
      sizes: sizes.map((size) =>
        selectFilesData({ fileds: ["size"], object: size })
      ),
    };
  };
}

module.exports = SizeService;
