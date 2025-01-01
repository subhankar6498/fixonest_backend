// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");
const contactController = require("../../modules/contact/controller/contact.controller");
const { adminAuth } = require("../../middleware/authCheck");


// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// Define Admin-contact Page
namedRouter.get('all-contacts','/all-contacts', adminAuth, contactController.getAllContacts)


module.exports = router;
