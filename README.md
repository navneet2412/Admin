# Lifecycle Admin Panel

This is Admin panel

> Change **BASE_URL=https://lifecycleapi.herokuapp.com** to the actual **API URL**

router.get("/", home);
router.get("/agent", cabUser);

router.get("/register-user", regUser);

router.post("/register-user", postData);

router.post("/user-verification", postOTP);

router.post("/user-detail", userOrder);

router.get("/register-agent", registerAgent);

router.get("/logout", logout);

router.post("/register-agent", agentRegister);

router.post("/login-agent", agentLogin);

