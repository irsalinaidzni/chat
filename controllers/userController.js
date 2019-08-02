const User = require('../models/User')
const { decrypt } = require('../helpers/bcrypt')
const jwt = require('jsonwebtoken')
const get = require('lodash/get')

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({...req.query})
      res.status(200).json({ users })
    } catch (err) {
      res.status(400).json({ message: JSON.stringify(err) })
    }
  },

  getOneUser: async function(req,res) {
    try {
      const users = await User.findOne({...req.query})
      res.status(200).json({ users })
    } catch (err) {
      res.status(400).json({ message: JSON.stringify(err) })
    }
  },

  addUser: async (req, res) => {
    const { name, email, password } = req.body
    const newUser = {
      name,
      email,
      password
    }
    
    try {
      const user = await User.create(newUser)
      res.status(201).json({user, message: 'success register'})
    } catch (error) {
      let message = 'error add user'
      let errors = get(error, 'errors', {})
      let warning = []
      if (errors.email) {
        const warningEmail = get(errors, 'email.properties.msg', '')
        if(warningEmail){
          warning.push(warningEmail)
        } else {
          warning.push(get(errors, 'email.properties.message', ''))
        }
      } 
      if (errors.password) {
        warning.push(get(errors, 'password.properties.message', ''))
      }
      res.status(400).json({message, warning })
    }
  },

  editUser: function(req, res) {
    // const { email } = req.body
    // User.findOneAndUpdate({ email: req.body.email }, )
  },

  deleteUser: function(req, res) {
    console.log(req.params.email);
    User.findOneAndDelete({ email: req.params.email })
      .then((user) => {
        console.log(user)
        if (user) {
          res.status(200).json({ message: 'sukses delete user' })
        } else {
          res.status(400).json({ message: 'user tidak ditemukan' })
        }
      })
      .catch(err => {
        res.status(400).json({ message: err.message })
      })
  },

  login: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email })
      if (user) {
        if (decrypt(req.body.password, user.password)) {
          jwt.sign({ name: user.name, email: user.email, age: user.age }, process.env.JWT, function (err, token) {
            if (!err) {
              res.status(200).json({ message: 'success login', token: token, email: user.email, name: user.name })
            } else {
              res.status(400).json(err)
            }
          })
        } else {
          res.status(401).json({ message: 'wrong email/password' })
        }
      } else {
        res.status(404).json({ message: 'user not found' })
      }
    } catch (err) {
      res.status(400).json({ error: err })
    }
  },
  joinGroup: (req, res) => {

  }
}