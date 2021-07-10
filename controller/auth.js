const fetch = require("node-fetch");

const baseurl = process.env.BASE_URL;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

var path = require("path");
var crypto = require("crypto");
var reqpost = require("request");

const Agent = require("../models/user-model");

let sess;

exports.agentRegister = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userExist = await Agent.findOne({
      where: {
        email,
      },
    });
    if (userExist) {
      const error = new Error("User with this email already exists");
      error.statusCode = 422;
      return next(error);
    }
    const hashedPwd = await bcrypt.hash(password, 12);
    await Agent.create({ email, password: hashedPwd });
    res.redirect("/login-agent");
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.agentLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let loadedUser;
    const user = await Agent.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      const err = new Error("User with this email doesn't exist");
      err.statusCode = 401;
      next(err);
    }
    loadedUser = user;
    const isPwdEqual = await bcrypt.compare(password, user.password);
    if (!isPwdEqual) {
      const err = new Error("Wrong Password");
      err.statusCode = 401;
      return next(err);
    }
    sess = req.session;
    sess.email = req.body.email;
    res.render("cabUser");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

var phone = "";

exports.home = (req, res) => {
  sess = req.session;
  if (sess.email) {
    return res.redirect("/agent");
  }
  res.render("welcomePage");
};

exports.loginPage = (req, res) => {
  sess=req.session;
  if (sess.email) {
    return res.redirect("/agent");
  }
  res.render("loginAgent");
};

exports.registerAgent = (req, res) => {
  var err = "";
  res.render("registerAgent", { message: err });
};

exports.cabUser = (req, res) => {
  sess = req.session;
  if (sess.email) {
    res.render("cabUser");
  } else {
    res.redirect("/login-agent");
  }
};

// exports.regUser = (req, res) => {
//   sess = req.session;
//   if (sess.email) {
//     res.render("regUser");
//   } else {
//     res.redirect("/login-agent");
//   }
// };

exports.postData = (req, res) => {
  phone = req.body.phone;

  async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }

  postData(`${baseurl}/auth/user-auth`, {
    phone: phone,
  })
    .then((data) => {
      res.render("userVer"); // JSON data parsed by `data.json()` call
    })
    .catch((e) => {
      console.log(e);
    });
};

exports.postOTP = (req, res) => {
  var otp = req.body.otp;

  async function postOTP(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }

  postOTP(`${baseurl}/auth/verify-user-otp`, {
    phone,
    otp,
  }).then((data) => {
    const token = data.token;
    res.render("newOrder", { token: token });
  });
};





var key = "gtKFFx"; //"Ez75cvF0";
var salt = "eCwWELxi"; //"FOIPnjPgYa";

exports.Payment= async (req,res) => {
   sess = req.session;
   if (sess.email) {
     return res.redirect("/agent");
   }
var ord = JSON.stringify(Math.random() * 1002);
var i = ord.indexOf(".");
ord = "ORD" + ord.substr(0, i);
res.render("checkout.ejs", { orderid: ord, key: key });
}

exports.calcHash= async (req,res) => {
  
    var data = req.body
    //generate hash with mandatory parameters and udf5
    var cryp = crypto.createHash("sha512");
    var text =
      key +
      "|" +
      data.txnid +
      "|" +
      data.amount +
      "|" +
      data.productinfo +
      "|" +
      data.firstname +
      "|" +
      data.email +
      "|||||" +
      data.udf5 +
      "||||||" +
      salt;
    
    cryp.update(text);
    var hash = cryp.digest("hex");

    // res.setHeader("Content-Type", "text/json");
    // res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(JSON.stringify(hash));
}

exports.responsePayment= async (req, res)=> {
    var verified = "No";
    var txnid = req.body.txnid;
    var amount = req.body.amount;
    var productinfo = req.body.productinfo;
    var firstname = req.body.firstname;
    var email = req.body.email;
    var udf5 = req.body.udf5;
    var mihpayid = req.body.mihpayid;
    var status = req.body.status;
    var resphash = req.body.hash;
    var additionalcharges = "";
    //Calculate response hash to verify
    var keyString =
      key +
      "|" +
      txnid +
      "|" +
      amount +
      "|" +
      productinfo +
      "|" +
      firstname +
      "|" +
      email +
      "|||||" +
      udf5 +
      "|||||";
    var keyArray = keyString.split("|");
    var reverseKeyArray = keyArray.reverse();
    var reverseKeyString =
      salt + "|" + status + "|" + reverseKeyArray.join("|");
    //check for presence of additionalcharges parameter in response.
    if (typeof req.body.additionalCharges !== "undefined") {
      additionalcharges = req.body.additionalCharges;
      //hash with additionalcharges
      reverseKeyString = additionalcharges + "|" + reverseKeyString;
    }
    //Generate Hash
    var cryp = crypto.createHash("sha512");
    cryp.update(reverseKeyString);
    var calchash = cryp.digest("hex");

    var msg =
      "Payment failed for Hash not verified...<br />Check Console Log for full response...";
    //Comapre status and hash. Hash verification is mandatory.
    if (calchash == resphash)
      msg =
        "Transaction Successful and Hash Verified...<br />Check Console Log for full response...";

    console.log(req.body);

    //Verify Payment routine to double check payment
    var command = "verify_payment";

    var hash_str = key + "|" + command + "|" + txnid + "|" + salt;
    var vcryp = crypto.createHash("sha512");
    vcryp.update(hash_str);
    var vhash = vcryp.digest("hex");

    var vdata = "";
    var details = "";

    var options = {
      method: "POST",
      uri: "https://test.payu.in/merchant/postservice.php?form=2",
      form: {
        key: key,
        hash: vhash,
        var1: txnid,
        command: command,
      },
      headers: {
        /* 'content-type': 'application/x-www-form-urlencoded' */
        // Is set automatically
      },
    };

    reqpost(options)
      .on("response", function (resp) {
        console.log("STATUS:" + resp.statusCode);
        resp.setEncoding("utf8");
        resp.on("data", function (chunk) {
          vdata = JSON.parse(chunk);
          if (vdata.status == "1") {
            details = vdata.transaction_details[txnid];
            console.log(details["status"] + "   " + details["mihpayid"]);
            if (
              details["status"] == "success" &&
              details["mihpayid"] == mihpayid
            )
              verified = "Yes";
            else verified = "No";

//i was here

            res.render("response.ejs", {
              txnid: txnid,
              amount: amount,
              productinfo: productinfo,
              additionalcharges: additionalcharges,
              firstname: firstname,
              email: email,
              mihpayid: mihpayid,
              status: status,
              resphash: resphash,
              msg: msg,
              verified: verified,
            });
          }
        });
      })
      .on("error", function (err) {
        console.log(err);
      });
}

exports.userOrder = async (req, res) => {
  const currentLocation = req.body.currentlocation;
  const lat = Number.parseFloat(req.body.latitude);
  const lng = Number.parseFloat(req.body.longitude);
  const toLat = Number.parseFloat(req.body.destlat);
  const toLng = Number.parseFloat(req.body.destlng);
  const finalLocation = req.body.Destination;
  const orderStatus = req.body.orderStatus;
  const token = req.body.token;
  const paymentType = req.body.payment;


  //  await function payLifecycle(){
  //  if (paymentType == "Online") {
  //   // res.redirect("/checkout");
  //  }
  //  }

  console.log(lat);
  console.log(lng);
  console.log(toLat);
  console.log(toLng);
  console.log(paymentType);
  console.log(token);

  var orderInfo = {
    currentLocation,
    lat,
    lng,
    toLat,
    toLng,
    finalLocation,
    orderStatus,
    paymentType,
  };
  async function getTimeDistance(lat, lng, toLat, toLng) {
    let insuranceCharge = 0.5,
      perKMCharge = 8,
      baseFare = 5,
      perMinuteCharge = 2;
    let url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${toLat},${toLng}&mode=driving&language=en-EN&sensor=false&key=AIzaSyDdRYb4_lHdLrOhsn-fLUPpBh4eKZ-8ZhA`;
    const response = await fetch(url);
    const responsedata = await response.json();
    const distance = (
      responsedata.rows[0].elements[0].distance.value / 1000
    ).toFixed(2);
    const time = (responsedata.rows[0].elements[0].duration.value / 60).toFixed(
      2
    );
    const amount = (
      insuranceCharge +
      distance * perKMCharge +
      (distance > 5 ? 5 * baseFare : baseFare * distance) +
      (time > 5
        ? (time - 5) * 0.75 + perMinuteCharge * 5
        : time * perMinuteCharge)
    ).toFixed(2);

    return { distance, time, amount };
  }
  const { distance, time, amount } = await getTimeDistance(
    lat,
    lng,
    toLat,
    toLng
  );
 
    

  

  async function createOrder(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    
    return await response.json(); // parses JSON response into native JavaScript objects
  }

  createOrder(`${baseurl}/user/create-order`, orderInfo).then((data) => {
    console.log(data, distance, time, amount);
  
    res.render("userOrder", {
      orderDetail: data,
      userDetail: orderInfo,
      distance,
      time,
      amount,
    });
  });
};



exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
};
