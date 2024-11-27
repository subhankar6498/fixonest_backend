// import model
const ServiceBookingModel = require("../model/serviceBooking.model");

// Define Service Repository
class ServiceBookingRepositories {
  // Define create new bookings repo method
  async createBooking(newBooking) {
    try {
      // Create booking
      const bookingRecords = await ServiceBookingModel.create(newBooking);

      // Return the response
      return bookingRecords;
    } catch (error) {
      return error;
    }
  }
}

module.exports = new ServiceBookingRepositories();
