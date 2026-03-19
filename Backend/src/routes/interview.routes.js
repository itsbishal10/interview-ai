const express= require("express")


const  interviewRouter= express.Router()


/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self
 * @access Private
 */


interviewRouter.post("/")

module.exports= interviewRouter