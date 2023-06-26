const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Name is required",
  },
  email: {
    type: String,
    trim: true,
    unique: "Email already exists",
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
    required: "Email is required",
  },
  role: {
    type: String,
    enum: ["developer", "admin", "tester"],
    default: "developer",
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
  hashed_password: {
    type: String,
    required: "Password is required",
  },
  salt: String,
});

//UserSchema.virtual is a Mongoose getter function that allows us to define a virtual field on our schema.
//
UserSchema.virtual("password")
  .set(function (password) {
    // create a temporary variable called _password
    this._password = password; //_password is a temporary variable is used to store the password in plain text for encryption and deletion after encryption.
    // generate salt
    this.salt = this.makeSalt();
    // encrypt password
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

//TODO: change the password validation to be more secure with regex example; "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"

//UserSchema.path is a Mongoose schema property for defining custom validations for our schema paths.
UserSchema.path("hashed_password").validate(function (v) {
  if (this._password && this._password.length < 8) {
    this.invalidate("password", "Password must be at least 8 characters.");
  }
  if (this.isNew && !this._password) {
    //this.isNew is a Mongoose property that returns true if the document is new.
    this.invalidate("password", "Password is required");
  }
}, null);

module.exports = mongoose.model("User", UserSchema);