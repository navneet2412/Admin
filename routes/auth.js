var express = require("express");
var router = express.Router();

const {
  home,
  loginPage,
  agentLogin,
  registerAgent,
  logout,
  agentRegister,
  cabUser,
  regUser,
  postData,
  postOTP,
  userOrder,
  Payment,
  calcHash,
  responsePayment
} = require("../controller/auth");

router.get("/", home);

router.get("/agent", cabUser);

// router.get("/register-user", regUser);

router.get("/register-agent", registerAgent);

router.get("/logout", logout);

router.get("/login-agent", loginPage);

router.post("/register-user", postData);

router.post("/user-verification", postOTP);

router.post("/user-detail", userOrder);

router.post("/register-agent", agentRegister);

router.post("/login-agent", agentLogin);

router.get("/online-payment",Payment);

router.post("/online-payment", calcHash);

router.post("/payment-response", responsePayment);

module.exports = router;
 