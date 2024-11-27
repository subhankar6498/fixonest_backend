const contactRepositories = require("../modules/contact/repositories/contact.repositories");

class ContactApiController {
  async CreateNewContact(req, res) {
    try {
      const { name, email, phone, message } = req.body;
      const contactdata = {
        name,
        email,
        phone,
        message,
      };
      const savedContactData = await contactRepositories.createContact(
        contactdata
      );
      if (savedContactData) {
        res.status(201).json({
          status: 200,
          message: "Your Message is sent Successfully",
          data: savedContactData,
        });
      } else {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    } catch (error) {
      console.log(`Error in creating contact ${error}`);
    }
  }
}

module.exports = new ContactApiController();
