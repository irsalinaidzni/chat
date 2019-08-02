const bcrypt = require('bcryptjs')

module.exports = {
  encrypt: (password) => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)
    return hash
  },
  decrypt: (password, hash) => {
    return bcrypt.compareSync(password, hash)
  }
}