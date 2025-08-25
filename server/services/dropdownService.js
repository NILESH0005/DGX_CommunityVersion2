import db from "../models/index.js";

const { TableDDReference } = db;
import { Op } from "sequelize";

export const getDropdownValuesService = async (category) => {
  if (!category) {
    return { success: false, message: "Category is required", data: [] };
  }

  const results = await TableDDReference.findAll({
    where: {
      ddCategory: category,
      delStatus: { [Op.or]: [0, null] },
    },
    attributes: ["idCode", "ddValue"],
    order: [["ddValue", "ASC"]],
  });

  if (!results || results.length === 0) {
    return {
      success: false,
      message: `No data found for ${category} category`,
      data: [],
    };
  }

  return {
    success: true,
    message: "Dropdown values fetched successfully",
    data: results,
  };
};
