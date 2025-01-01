// 3rd-party Model
const mongoose = require("mongoose");

const ServiceCategoryModel = require("../model/category.model");
const ServiceModel = require("../model/service.model");

// Define Service Repository
class ServiceRepositories {
  //for new service category
  async save(data) {
    try {
      const result = await ServiceModel.create(data);
      return result;
    } catch (error) {
      return error;
    }
  }

  async find() {
    try {
      const result = await ServiceModel.find();
      return result;
    } catch (error) {
      return error;
    }
  }

  // Define Get all Service category list repo method
  async getServiceCategoryList() {
    try {
      const categoryRecords = await ServiceCategoryModel.find();
      return categoryRecords;
    } catch (error) {
      throw new Error("Failed to retrieve service category list");
    }
  }

  // Define getServiceCategoryById repo method
  async getServiceCategoryById(id) {
    try {
      const serviceCategoryRecords = await ServiceCategoryModel.findById(id);

      return serviceCategoryRecords;
    } catch (error) {
      return error;
    }
  }

  // Define updateServiceCategoryById repo method
  async updateServiceCategoryRepo(id, categoryData) {
    try {
      const serviceCategoryRecords =
        await ServiceCategoryModel.findByIdAndUpdate(id, categoryData, {
          new: true,
        });

      return serviceCategoryRecords;
    } catch (error) {
      return error;
    }
  }

  // Define deleteServiceCategory repo method
  async deleteServiceCategory(id) {
    try {
      await ServiceCategoryModel.findByIdAndDelete(id);
    } catch (error) {
      return error;
    }
  }

  //for new service category creation
  async create(serviceCategorydata) {
    try {
      const result = await ServiceCategoryModel.create(serviceCategorydata);
      return result;
    } catch (error) {
      return error;
    }
  }

  // for all service categories
  async findServiceCategory() {
    try {
      const result = await ServiceCategoryModel.find();
      return result;
    } catch (error) {
      return error;
    }
  }

  // Define create service repo method
  async createService(serviceData) {
    try {
      const result = await ServiceModel.create(serviceData);
      return result;
    } catch (error) {
      return error;
    }
  }

  // Get single servide repo method
  async singleService(id) {
    try {
      const result = await ServiceModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "service_categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category_details",
          },
        },
      ]);
      return result;
    } catch (error) {
      return error;
    }
  }

  // Define Get all Service sub-category list repo method
  async getServiceSubCategoryList(categoryId) {
    try {
      const categoryRecords = await ServiceModel.find(categoryId);
      return categoryRecords;
    } catch (error) {
      throw new Error("Failed to retrieve service category list");
    }
  }

  // Define get all services list repo method
  async getAllServiceList(page = 1, limit = 6) {
    try {
      // find teh service list from the database
      const agdata = ServiceModel.aggregate([
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: "service_categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category_details",
          },
        },
        {
          $unwind: {
            path: "$category_details",
          },
        },
      ]);
      const options = {
        page,
        limit,
      };
      const serviceRecords = await ServiceModel.aggregatePaginate(
        agdata,
        options
      );

      // Return the response
      return serviceRecords;
    } catch (error) {
      return error;
    }
  }

  // Define get category wise service repo method
  async findCategoryWiseServices(categoryId) {
    try {
      const serviceRecords = await ServiceCategoryModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(categoryId),
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "_id",
            foreignField: "categoryId",
            as: "categoryWiseServiceDetails",
          },
        },
        {
          $project: {
            _id: 1,
            categoryName: 1,
            categoryImage: 1,
            isDeleted: 1,
            serviceDetails: {
              $map: {
                input: "$categoryWiseServiceDetails",
                as: "service",
                in: {
                  _id: "$$service._id",
                  categoryName: "$$service.title",
                  description: "$$service.description",
                  serviceImage: "$$service.serviceImage",
                  isDeleted: "$$service.isDeleted",
                },
              },
            },
          },
        },
      ]);

      return serviceRecords[0];
    } catch (error) {
      return error;
    }
  }

  // Define get service sub-category by id
  async getServiceSubCategoryById(id) {
    try {
      const subCategoryRecords = await ServiceModel.findById(id);

      return subCategoryRecords;
    } catch (error) {
      return error;
    }
  }

  // Define update service sub-category by id
  async updateServiceSubCategoryById(id, userData) {
    try {
      const serviceSubCategoryRecords = await ServiceModel.findByIdAndUpdate(
        id,
        userData,
        { new: true }
      );

      return serviceSubCategoryRecords;
    } catch (error) {
      return error;
    }
  }

  // Delete service sub-category
  async deleteServiceSubCategory(id) {
    try {
      const serviceSubCategoryRecords = await ServiceModel.findByIdAndDelete(
        id
      );
    } catch (error) {
      //
    }
  }
}

module.exports = new ServiceRepositories();
