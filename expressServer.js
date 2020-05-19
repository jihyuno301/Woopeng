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
  host     : '192.168.30.50',
  user     : 'woopeng',
  password : '1234',
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
      client_id :'vA2Oekt2EegR48QNOaYzwwy7Jh3u8izqXAntc0Di',
      client_secret :'1gy7WWY1EWenGJgks36gGEOHiEpzQh1OI4e7XPqu',
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

   // var userId = req.decoded.userId;
   // var sql = "SELECT * FROM user WHERE id = ? ";
  
   var option = {
    method : "POST",
    url : "https://testapi.openbanking.or.kr/v2.0/transfer/deposit/acnt_num",
    headers : {
        Authorization : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJUOTkxNjI4OTQwIiwic2NvcGUiOlsib29iIl0sImlzcyI6Imh0dHBzOi8vd3d3Lm9wZW5iYW5raW5nLm9yLmtyIiwiZXhwIjoxNTk3NjM5MDY1LCJqdGkiOiJjZmYwZjE1Ny01MGEyLTRmNjYtOTA5MS00NTEyZDc5YTM4NWQifQ.wUE4i4IIGJUwtr1PwGbtZw_4M5Mz8hd7poLGM6Di2PE',
        "Content-Type" : "application/json"
    },
    json : {
      "cntr_account_type": "N",
      "cntr_account_num": "9366449466",
      "wd_pass_phrase": "NONE",
      "wd_print_content": "환불금액", 
      "name_check_option": "on",
      "tran_dtime": "20200519140900",
      "req_cnt": "1",
      "req_list": [
        {
        "tran_no": "1",
        "bank_tran_id": "T991628940U000001213",
        "bank_code_std": "097",
        "account_num": "123456789123",
        "account_holder_name": "김보영",	
        "print_content": "쇼핑몰환불",
        "tran_amt": "10000",
        "req_client_name": "홍길동",
        "req_client_num": "HONGGILDONG1234",
        "req_client_fintech_use_num" : "199162894057883856821429",
        "transfer_purpose": "TR"
        }
      ]
    }
}
request(option, function(err, response, body){
    if(err){
        console.error(err);
        throw err;
    }
    else {
       // var accessRequestResult = JSON.parse(body);
        console.log(body);
        //console.log(accessRequestResult);
        //res.json(accessRequestResult)
    }
  })
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

app.listen(3000)