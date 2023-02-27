// config/passport.js

// load tất cả những thứ ta cần
var LocalStrategy = require('passport-local').Strategy;

// Tạo hàm
var bcrypt = require('bcrypt-nodejs');

// Cơ sở dlieu
var database = require('../config/database');
var RunQuery = database.RunQuery;

// Hiển thị chúc năng = cách sử dụng mdule
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // được sử dụng để tuần tự hóa người dùng cho phiên
    passport.serializeUser(function (user, done) {
        done(null, user.UserID);
    });

    // được sử dụng để giải tuần tự hóa người dùng
    passport.deserializeUser(function (userId, done) {
        var sqlStr = '\
            SELECT *\
            FROM users\
            where UserID = \'' + userId + '\'';
        RunQuery(sqlStr, function (rows) {
            done(null, rows[0]);
        });
    });


    passport.use('sign-in', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // call back lại toàn bộ yêu cầu
        },
        function (req, username, password, done) { // callback với tên vs mk từ mẫu
            // kiểm tra xem người dùng có tồn tại hay không
            var sqlStr = 'SELECT * FROM users WHERE Username = \'' + username + '\'';
            RunQuery(sqlStr, function (rows) {
                // nếu không tìm thấy người dùng, hãy trả lại tin nhắn
                if (rows.length < 1)
                    return done(null, false, req.flash('Lỗi đăng nhập', 'Không tìm thấy người dùng.')); // req.flash is the way to set flashdata using connect-flash

                // nếu người dùng được tìm thấy nhưng mật khẩu sai
                if (!bcrypt.compareSync(password, rows[0].Password))
                    return done(null, false, req.flash('Lỗi đăng nhập', 'Sai mật khẩu')); // tạo loginMessage và lưu nó vào phiên dưới dạng flashdata

                // Tất cả ok thì trả lại thành công
                return done(null, rows[0]);
            });

        })
    );


    passport.use('sign-up', new LocalStrategy({
            // tên ngdung và mk theo mặc định
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true //cho phép gọi lại
        },
        function (req, username, password, done) {
            // tìm người dùng có email giống với email biểu mẫu
            // kiểm tra xem người dùng đang cố đăng nhập đã tồn tại chưa
            var email = req.body.email;

            if (password != req.body.rePassword) {
                return done(null, false, req.flash('Đăng ký lỗi', 'Mật khẩu không khớp'));
            }
            else {
                var selectQuery = 'SELECT *\
                    FROM users\
                    WHERE email = \'' + email + '\'';
                RunQuery(selectQuery, function (emailRows) {
                    if (emailRows.length > 0) {
                        return done(null, false, req.flash('Đăng ký lỗi', 'Địa chỉ email đã được sử dụng.'));
                    }
                    else {
                        selectQuery = '\
                        SELECT *\
                        FROM users\
                        WHERE username = \'' + username + '\'';
                        RunQuery(selectQuery, function (usernameRows) {
                            if (usernameRows.length > 0) {
                                return done(null, false, req.flash('Đăng ký lỗi', 'Tên người dùng đã được sử dụng.'));
                            }
                            else {
                                // if there is no user with that user and email
                                var fullName = req.body.fullName;
                                var phone = req.body.phone;
                                var address = req.body.streetAddress;
                                var postcode = req.body.postcode;
                                var city = req.body.city;
                                var country = req.body.country;
                                var passwordHash = bcrypt.hashSync(password, null, null);

                                var insertQuery = 'INSERT INTO Users\
                                    VALUES(null,\
                                    \'' + fullName + '\', \
                                    \'' + address + '\', \
                                    \'' + postcode + '\', \
                                    \'' + city + '\', \
                                    \'' + country + '\', \
                                    \'' + phone + '\', \
                                    \'' + email + '\', \
                                    \'' + username + '\', \
                                    \'' + passwordHash + '\', 0)';

                                RunQuery(insertQuery, function (insertResult) {
                                    //user
                                    var user = {
                                        UserID: insertResult.insertId
                                    };
                                    insertQuery = 'INSERT INTO Addresses\
                                    VALUES(null, ' +
                                        insertResult.insertId + ', \'' +
                                        fullName + '\', \'' +
                                        address + '\', \'' +
                                        postcode + '\', \'' +
                                        city + '\', \'' +
                                        country + '\', \'' +
                                        phone + '\')';
                                    RunQuery(insertQuery, function (addRow) {
                                        return done(null, user);
                                    });
                                });
                            }
                        });
                    }
                });
            }
        })
    );
};
