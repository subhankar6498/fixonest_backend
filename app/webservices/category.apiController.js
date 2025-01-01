const { getRelativePath } = require("../middleware/multer");
const serviceRepo = require("../modules/service/repositories/service.repositories");

class CategoryApiController {
  // Define get all category
  async allCategories(req, res) {
    try {
      const allCategories = await serviceRepo.findServiceCategory();
      if (allCategories) {
        res.status(200).json({
          message: "All service categories fetched Successfully",
          total: allCategories.length,
          data: allCategories,
        });
      } else {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    } catch (error) {
      console.log(`error in creating service category ${error}`);
    }
  }

  // Define get all service controller method
  async getAllServices(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;

      const allServices = await serviceRepo.getAllServiceList(page, limit);
      if (allServices) {
        res.status(200).json({
          message: "All services fetched Successfully",
          // total: allServices.docs.length,
          data: allServices.docs,
          currentPage: allServices.page,
          totalPages: allServices.pages,
          perPage: allServices.limit,
          totalRecords: allServices.total,
        });
      } else {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  // Define get single service controleller method
  async singleservicedata(req, res) {
    try {
      const id = req.params.id;
      const singlesdata = await serviceRepo.singleService(id);
      if (singlesdata) {
        res.status(200).json({
          message: "Single Service Data Fetched",
          singledata: singlesdata,
        });
      } else {
        res.status(500).json({
          message: "Internal Server error",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Define getCategoryWiseServices controller method
  async getCategoryWiseServices(req, res) {
    try {
      // Grab the category id from request params
      const categoryId = req.params.id;

      // Find category wise services
      const categoryWiseServices = await serviceRepo.findCategoryWiseServices(
        categoryId
      );

      if (categoryWiseServices) {
        res.status(200).json({
          status: 200,
          message: "Category wise Service fetched Successfully",
          total: categoryWiseServices.length,
          data: categoryWiseServices,
        });
      } else {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
}

module.exports = new CategoryApiController();
