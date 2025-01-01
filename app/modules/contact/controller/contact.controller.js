const contactRepositories = require("../repositories/contact.repositories");
// import others
const {
    removeUploadedFile,
    getRelativePath,
  } = require("../../../middleware/multer");


class ContactController{

    async getAllContacts(req, res){
        const allcontactdata=await contactRepositories.getAllContacts()
        try {
            
            res.render('contact/views/contactTable',{
                title: "Contact",
                path: {
                    home: "/admin" + generateUrl("admin-dashboard-page"),
                    logout: "/admin" + generateUrl("admin.logout"),
                  },
                  content: {
                    firstName: req.admin.firstName,
                    role: req.admin.role,
                    profileImageUrl: req.admin.profileImage,
                  },
                  data: {
                    allcontactdata,
                  },
            })
        } catch (error) {
            console.log(`Error in getting all contacts ${error}`);
            
        }
        
    }

}

module.exports=new ContactController()