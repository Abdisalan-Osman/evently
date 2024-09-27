"use server";

import { CreateCategoryParams } from "@/types";
import Category from "../mongodb/models/category.models";
import { handleError } from "../utils";
import { connectDB } from "../mongodb";

//create category
export async function createCategory({ categoryName }: CreateCategoryParams) {
  try {
    connectDB();

    const newCategory = await Category.create({ name: categoryName });

    return JSON.parse(JSON.stringify(newCategory));
  } catch (error) {
    handleError(error);
  }
}

// Featch all category
export async function getCategory() {
  try {
    await connectDB();

    const categories = await Category.find();

    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error);
  }
}
