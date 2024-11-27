const ContactModel = require("../model/contact.model");

class contactRepositories {
  async createContact(data) {
    try {
      const result = await ContactModel.create(data);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllContacts() {
    try {
      const result = await ContactModel.aggregate([
        { $match: { isDeleted: false } },
      ]);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports=new contactRepositories()
