const { validationResult } = require("express-validator");
const path=require('path')
const { getRelativePath, removeUploadedFile } = require("../middleware/multer");
const testimonialRepositories = require("../modules/testimonials/repositories/testimonial.repositories");

class TestimonialApiController {
  async createTestimonials(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 1. If validation is failed, then no uploaded file (which is coming from incoming request body) added in the upload directory
        if (req.file) {
          await removeUploadedFile(req.file);
        }
  
        // 2. Return the Error
        return res.status(400).json({
          status: 400,
          message: "Validation Errors",
          errors: errors.array(),
        });
      }
    try {
      const { clientName, talk } = req.body;
      const testimonialdata = {
        clientName,
        talk,
      };
      if (req.file) {
        testimonialdata.testimonialImage = getRelativePath(req.file.path);
      }
      const savedTestimonialData =
        await testimonialRepositories.createTestimonial(testimonialdata);
      if (savedTestimonialData) {
        res.status(201).json({
          status: 200,
          message: "Testimonials Data is created Successfully",
          data: savedTestimonialData,
        });
      } else {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    } catch (error) {
      console.log(`Error in creating new testimonial ${error}`);
    }
  }

  async getAllTestimonialsData(req,res){
    try {
       const alldata=await testimonialRepositories.getAllTestimonials()
       if(alldata){
        res.status(200).json({
            status: 200,
            message: "All testimonials data fetched successfully",
            testimonials: alldata
        })
       } 
    } catch (error) {
        console.log(`Error in getting testimonials data ${error}`);
        
    }
  }
}

module.exports = new TestimonialApiController();
