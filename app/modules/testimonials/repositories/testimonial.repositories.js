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

  async getSingleTestimonials(id) {
    try {
      const result = await TestimonialModel.findById(id);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async updateTestimonials(id, data) {
    try {
      const result = await TestimonialModel.findByIdAndUpdate(id, data);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteTestimonials(id, data) {
    try {
      const result = await TestimonialModel.findByIdAndUpdate(id, data);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new testimonialRepositories();
