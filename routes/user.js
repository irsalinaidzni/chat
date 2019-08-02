const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router
      .get('/', userController.getAllUsers)
      .post('/', userController.addUser)
      .post('/login', userController.login)
      // .put('/', userController.editUser)

module.exports = router