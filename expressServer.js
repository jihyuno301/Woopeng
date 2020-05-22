const express = require('express');
const app = express();
const path = require('path');
var jwt = require('jsonwebtoken');
var request = require('request');
var mysql = require('mysql');
var auth = require('./lib/auth');

app.set('views', path.join(__dirname, 'views')); // ejs file location
app.set('view engine', 'ejs'); //select view templet engine

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'test123',
  database : 'woopeng'
});

connection.connect();


app.get('/signup', function(req, res){
  res.render('signup');
})

app.get('/login', function(req, res){
  res.render('login');
})

app.get('/mypage', function(req, res){
  res.render('myPage'); 
})

app.get('/withdrawList', function(req, res) {
  res.render('withdrawList');
})

app.get('/balance', function (req, res) {
  res.render('balance');
})
app.get('/authResult', function(req, res){
  var authCode = req.query.code;
  console.log(authCode);
  //res.json(authCode);

  //accesstoken get request
  var option = {
    method : "POST",
    url : " https://testapi.openbanking.or.kr/oauth/2.0/token",
    headers : {
      'Content-Type' : 'application/x-www-form-urlencoded'
    },
    form : {
      code : authCode,
      client_id :'D2Tqsa7sSmcDSEbncC711RznB1a4xBB1a4OhANyt',
      client_secret :'grIUxNmeyZhdo8sxIy6p1bJ7g972h2xJjuW0DFt9',
      redirect_uri : 'http://localhost:3000/authResult',
      grant_type : 'authorization_code'
    }
  }
  request(option, function(err, response, body){
    if(err){
      console.error(err);
      throw err;
    }
    else {
      var accessRequestResult = JSON.parse(body);
      console.log(accessRequestResult);
      res.render('resultChild', {data : accessRequestResult} )
    }
  })
})

app.post('/list',auth, function(req, res){
  var userId = req.decoded.userId;
  
  var sql = "select id, name, cash from account_list where id = ?"
  connection.query(sql, [userId], function (err, result) {
    if (err) {
        console.error(err);
        throw err
    } else {
        console.log(result);
        res.send(result[0]);
        console.log('success5');
    }
  })
   // var userId = req.decoded.userId;
   // var sql = "SELECT * FROM user WHERE id = ? ";
//    var countnum1 = Math.floor(Math.random() * 1000000000) + 1;
//    var countnum2 = Math.floor(Math.random() * 1000000000) + 1;
//    var option = {
//     method : "POST",
//     url : "https://testapi.openbanking.or.kr/v2.0/transfer/deposit/acnt_num",
//     headers : {
//         Authorization : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJUOTkxNjI4OTQwIiwic2NvcGUiOlsib29iIl0sImlzcyI6Imh0dHBzOi8vd3d3Lm9wZW5iYW5raW5nLm9yLmtyIiwiZXhwIjoxNTk3NjM5MDY1LCJqdGkiOiJjZmYwZjE1Ny01MGEyLTRmNjYtOTA5MS00NTEyZDc5YTM4NWQifQ.wUE4i4IIGJUwtr1PwGbtZw_4M5Mz8hd7poLGM6Di2PE',
//         "Content-Type" : "application/json"
//     },
//     json : {
//       "cntr_account_type": "N",
//       "cntr_account_num": "9366449466",
//       "wd_pass_phrase": "NONE",
//       "wd_print_content": "환불금액", 
//       "name_check_option": "on",
//       "tran_dtime": "20200519140900",
//       "req_cnt": "2",
//       "req_list": [
//         {
//         "tran_no": "1",
//         "bank_tran_id": "T991628940U" + countnum1,
//         "bank_code_std": "097",
//         "account_num": "123456789123",
//         "account_holder_name": "김보영",	
//         "print_content": "쇼핑몰환불",
//         "tran_amt": "3000",
//         "req_client_name": "랄랄라",
//         "req_client_num": "HONGGILDONG1234",
//         "req_client_fintech_use_num" : "199162894057883856821429",
//         "transfer_purpose": "TR"
//         },
//         {
//         "tran_no": "2",
//         "bank_tran_id": "T991628940U" + countnum2,
//         "bank_code_std": "097",
//         "account_num": "123456789123",
//         "account_holder_name": "김보영",	
//         "print_content": "쇼핑몰환불",
//         "tran_amt": "12000",
//         "req_client_name": "랄라",
//         "req_client_num": "HONGGILDONG1234",
//         "req_client_fintech_use_num" : "199162894057883856821429",
//         "transfer_purpose": "TR"
//         }
//       ]
//     }
// }
  
// request(option, function(err, response, body){
//     if(err){
//         console.error(err);
//         throw err;
//     }
//     else {
     
//         console.log(body);
//         res.json(body);

        // console.log(body.wd_account_holder_name);
        // var cnt = body.res_cnt;
        // console.log(cnt);

        // for(var i=0; i<cnt; i++){
        //   var userId = req.decoded.userId;
        //   var wd_account_holder_name = body.wd_account_holder_name;
        //   var wd_account_num_masked = body.wd_account_num_masked;
        //   var tran_amt = body.res_list[i].tran_amt;
        //   var account_holder_name = body.res_list[i].account_holder_name;
        //   var account_num = body.res_list[i].account_num;
  
        //   console.log(userId, wd_account_holder_name, wd_account_num_masked, tran_amt, account_holder_name, account_num);
  
        //   var sql = "INSERT INTO woopeng.intable (userId, wd_account_holder_name, wd_account_num_masked, tran_amt, account_holder_name, account_num) VALUES (?,?,?,?,?,?)"
        //   connection.query(
        //       sql, // excute sql
        //       [userId, wd_account_holder_name, wd_account_num_masked, tran_amt, account_holder_name, account_num], // ? <- value
        //       function(err, result){
        //           if(err){
        //               console.error(err);
        //               res.json(0)
        //               throw err;
        //           }
        //           else {
        //               // res.json(1)
        //           }
        //   })
        // }
        

  //   }
  // })
  

})
    // connection.query(sql, [userId], function(err, result){
    //   if(err){
    //     console.error(err);
    //     throw err;
    //   }
    //   else{
    //     console.log(result);
       
    // })
  

app.post('/signup', function(req, res){
  //data req get db store
  var userName = req.body.userName;
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var userAccessToken = req.body.userAccessToken;
  var userRefreshToken = req.body.userRefreshToken;
  var userSeqNo = req.body.userSeqNo;
  console.log(userName, userAccessToken, userSeqNo);
  var sql = "INSERT INTO woopeng.user (name, email, password, accesstoken, refreshtoken, userseqno) VALUES (?,?,?,?,?,?)"
  connection.query(
      sql, // excute sql
      [userName, userEmail, userPassword, userAccessToken, userRefreshToken, userSeqNo], // ? <- value
       function(err, result){
          if(err){
              console.error(err);
              res.json(0);
              throw err;
          }
          else {
              res.json(1)
          }
  })
})

app.post('/login', function(req, res){
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var sql = "SELECT * FROM user WHERE email = ?";
  connection.query(sql, [userEmail], function(err, result){
      if(err){
          console.error(err);
          res.json(0);
          throw err;
      }
      else {
          console.log(result);
          if(result.length == 0){
              res.json(3)
          }
          else {
              var dbPassword = result[0].password;
              if(dbPassword == userPassword){
                  var tokenKey = "f@i#n%tne#ckfhlafkd0102test!@#%"
                  jwt.sign(
                    {
                        userId : result[0].id,
                        userEmail : result[0].email
                    },
                    tokenKey,
                    {
                        expiresIn : '10d',
                        issuer : 'fintech.admin',
                        subject : 'user.login.info'
                    },
                    function(err, token){
                        console.log('로그인 성공', token)
                        res.json(token)
                    }
                  )            
              }
              else {
                  res.json(2);
              }
          }
      }
  })
})


app.post('/withdrawList', auth, function (req, res) {

  var userId = req.decoded.userId;
  var sql = "select A.cash from account_list A, user U where U.id = A.id and U.id = ?"
  connection.query(sql, [userId], function (err, result) {
      if (err) {
          console.error(err);
          throw err
      } else {
          console.log(result[0].cash);
          console.log('success1');
      
          var data = {
              "list" : [
                  {
                      "date" : "2020.05.20 15:30",
                      "content" : "이디야커피 신논현점",
                      "amount" : 20000
                  },
                  {
                      "date" : "2020.05.20 16:40",
                      "content" : "역전할머니맥주 신당점",
                      "amount" : 50000
                  },
                  {
                      "date" : "2020.05.20 18:30",
                      "content" : "교촌치킨 갈매점",
                      "amount" : 30000
                  },
                  {
                      "date" : "2020.05.20 20:00",
                      "content" : "올리브영 갈매점",
                      "amount" : 20000
                  }],
                  "cash" : result[0].cash

          }
          // result[0].cash
          console.log('success2');
          res.send(data);
      }
      
  })
})
app.post("/balance", auth, function(req, res){
  var a = req.body.n
  console.log(a);
  var userId = req.decoded.userId;
  

  var sql = "update account_list A inner join user B on A.id = B.id set cash = cash + (select count(id) from user where grade = 0)*"+a+" where grade = 1 and A.id = ?"
  connection.query(sql, [userId], function (err, result) {
    if (err) {
        console.error(err);
        throw err
    } else {
        console.log(result);
        console.log('success10');
    }
  })
  var sql2 = "update account_list A inner join user B on A.id = B.id set cash = cash -"+a+" where grade = 0 and A.id != ?"
  connection.query(sql2, [userId], function (err, result) {
    if (err) {
        console.error(err);
        throw err
    } else {
        console.log(result);
        console.log('success9');
    }
  })
})

app.listen(3000)