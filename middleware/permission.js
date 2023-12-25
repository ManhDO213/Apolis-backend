// const userService = require('../services/User');

// const requireLogin = async (req, res, next) => {
//     try {
//         if (req.session.userLogin && roles.includes(req.session.userLogin.role)) {
//             next();
//         } else {
//             return res.redirect('/login');
//         }
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: `${error.message}`,
//         });
//     }
// };

const checkRole = (roles) => {
    return (req, res, next) => {
      if (req.session.userLogin && roles.includes(req.session.userLogin.role)) {
        // Vai trò hợp lệ, cho phép truy cập
        next();
      } else {
        // Vai trò không hợp lệ, chuyển hướng người dùng về trang lỗi hoặc trang khác
        res.redirect("/login");
      }
    };
  };

module.exports = {
    // requireLogin,
    checkRole
};
