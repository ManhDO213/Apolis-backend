document.addEventListener("DOMContentLoaded", function () {
  var emailInput = document.getElementById("accountEmail");
  var passwordInput = document.getElementById("accountPass");
  var rememberCheckbox = document.getElementById("remember");

  // Kiểm tra xem cookie có tồn tại không
  if (document.cookie && rememberCheckbox.checked) {
    var cookies = document.cookie.split(";");

    // Lặp qua từng cookie để tìm cookie chứa thông tin đăng nhập
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();

      // Kiểm tra xem cookie có bắt đầu bằng "loginInfo=" không
      if (cookie.indexOf("loginInfo=") === 0) {
        var loginInfo = cookie.substring("loginInfo=".length);

        // Giải mã cookie và đặt giá trị email và mật khẩu cho các trường nhập liệu
        var credentials = JSON.parse(decodeURIComponent(loginInfo));
        emailInput.value = credentials.email;
        passwordInput.value = credentials.password;
        break;
      }
    }
  }

  emailInput.addEventListener("input", function (event) {
    var email = event.target.value;

    // Kiểm tra xem cookie có tồn tại không
    if (document.cookie) {
      var cookies = document.cookie.split(";");

      // Lặp qua từng cookie để tìm cookie chứa thông tin đăng nhập
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();

        // Kiểm tra xem cookie có bắt đầu bằng "loginInfo=" không
        if (cookie.indexOf("loginInfo=") === 0) {
          var loginInfo = cookie.substring("loginInfo=".length);

          // Giải mã cookie và kiểm tra email đã nhập và lưu trước đó
          var credentials = JSON.parse(decodeURIComponent(loginInfo));
          if (credentials.email === email) {
            passwordInput.value = credentials.password;
            break;
          }
        }
      }
    }
  });

  document
    .querySelector(".sign-in-form")
    .addEventListener("submit", function (event) {
      // Kiểm tra xem người dùng đã chọn "Remember" chưa
      if (rememberCheckbox.checked) {
        var credentials = {
          email: emailInput.value,
          password: passwordInput.value,
        };

        // Mã hóa thông tin đăng nhập và lưu vào cookie
        var encodedCredentials = encodeURIComponent(
          JSON.stringify(credentials)
        );
        document.cookie =
          "loginInfo=" +
          encodedCredentials +
          "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
      }
    });
});
