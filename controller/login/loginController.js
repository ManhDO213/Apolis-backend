const mongoose = require("mongoose");
const accountService = require("../../service/user/accountService");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    res.render("./login/login.ejs");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const redirectLogin = async (req, res) => {
  try {
    res.redirect("/login");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const checkauth = async (req, res) => {
  if (req.method === "POST") {
    try {
      const email = req.body.accountEmail;
      console.log(`[checkauth] email ---> ${email}`);
      const password = req.body.accountPass;
      const remember = req.body.remember;
      const account = await accountService.findOneAccount({ email });
      console.log(`[checkauth] account ---> ${account}`);
      if (!account) {
        return res.render("./login/login.ejs", { error: "Email hoặc mật khẩu không chính xác!" });
      }
      const checkauth = await bcrypt.compare(password, account.password);
      console.log(`[checkauth] checkauth ---> ${checkauth}`);
      if (!checkauth) {
        return res.render("./login/login.ejs", {
          error: "Email hoặc mật khẩu không chính xác!",
        });
      }
      req.session.userLogin = account;
      console.log("req session -> ", req.session.userLogin);
      if (account.role !== "ADMIN" && account.role !== "TEACHER") {
        return res.render("./login/login.ejs", { error: "Email hoặc mật khẩu không chính xác!" });
      }
      if (account.role == "TEACHER") {
        return res.redirect("/teacher/course/list-course");
      }
      if (remember) {
        res.cookie("username", email, { maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.cookie("password", password, { maxAge: 30 * 24 * 60 * 60 * 1000 });
      }

      return res.redirect("/admin");
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `${error.message}`,
      });
    }
  }
};

const logout = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Expires", "0");
    res.setHeader('Content-Type', 'application/json');
    res.redirect(303,"/login");    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
  login,
  checkauth,
  redirectLogin,
  logout,
};
