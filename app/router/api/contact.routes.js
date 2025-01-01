const express=require('express');
const routeLabel = require("route-label");
const contactApiController = require('../../webservices/contact.apiController')
const router=express.Router()

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

namedRouter.post('contact.create','/customer/contact', contactApiController.CreateNewContact)

module.exports=router;