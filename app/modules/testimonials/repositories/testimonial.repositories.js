const TestimonialModel = require("../model/testimonials.model");


class testimonialRepositories {
  async createTestimonial(data) {
    try {
      const result = await TestimonialModel.create(data);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllTestimonials() {
    try {
      const result = await TestimonialModel.aggregate([
        { $match: { isDeleted: false } },
      ]);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports=new testimonialRepositories()
