var express = require('express');
var request = require('request');
var morgan = require('morgan');
var path = require('path');
var ejs = require('ejs');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: 'somerandomstringvalue',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30
    }
}));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(morgan('combined'));
app.get('/', function(req, res) {
    if (req.session && req.session.auth && req.session.auth.userId2) {
        res.redirect('/loginpage');
    } else {
        res.render('main');
    }
});
app.get('/logo.png', function(req, res) {
    res.sendFile(path.join(__dirname, '/logo.png'));
});
app.get('/logo1.png', function(req, res) {
    res.sendFile(path.join(__dirname, '/logo1.png'));
});
app.get('/second.css', function(req, res) {
    res.sendFile(path.join(__dirname, '/second.css'));
});
app.post('/status', function(req, res) {
    var result;
    var i = 0;
    var key = <your api key>;
    var tno = req.body.tno;
    var pnr = req.body.pnr;
    var date = req.body.date;
    var url = "https://api.railwayapi.com/v2/live/train/" + tno + "/date/" + date + "/apikey/" + key;
    request({
        url: url,
        json: true
    }, function(error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        var data = JSON.parse(JSON.stringify(body));
        var rt = data.current_station.name;
        if (res.statusCode === 200) {
            res.send({
                message: "current location is " + rt
            });
        } else {
            res.status(404).send({
                message: "something went wrong"
            });
        }
    });

});
app.post('/register', function(req, res) {
    var name = req.body.name;
    var phone = req.body.phone;
    var aadhar = req.body.aadhar;
    var email = req.body.email;
    var eme = req.body.eme;
    var password = req.body.password;
    request({
        url: "https://data.club87.hasura-app.io/v1/query",
        json: true,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": <admin token>
        },
        body: {
            "type": "insert",
            "args": {
                "table": "passenger",
                "objects": [{
                    "name": name,
                    "phone_no": phone,
                    "aadhar_no": aadhar,
                    "Email": email,
                    "password": password,
                    "emergency": eme,

                }]
            }
        }
    }, function(error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        if (response.statusCode === 200) {
            res.send(JSON.stringify({
                message: "Registered successfully"
            }));
        } else {
            res.status(404).send(JSON.stringify(body));
        }
    });
});
app.post('/login', function(req, res) {
    var aadhar = req.body.aadhar;
    var password = req.body.password;
    console.log(aadhar + password)
    request({
        url: "https://data.club87.hasura-app.io/v1/query",
        json: true,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": <admin token>
        },
        body: {
            "type": "select",
            "args": {
                "table": "passenger",
                "columns": [
                    "password"
                ],
                "where": {
                    "aadhar_no": {
                        "$eq": aadhar
                    }
                }
            }
        }
    }, function(error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        var dbstring = JSON.parse(JSON.stringify(body))[0];
        if (response.statusCode === 200) {
            if (dbstring.password === password) {
                res.send(JSON.stringify({
                    message: "logged in Successfully"
                }));
            } else {
                res.status(404).send(JSON.stringify({
                    message: "invalid username/password"
                }));
            }
        } else {
            res.status(404).send(JSON.stringify({
                message: "no data found"
            }));
        }
    });

});
app.get('/loginpage', function(req, res) {
    if (req.session && req.session.auth && req.session.auth.userId2) {
        request({
            url: "https://data.club87.hasura-app.io/v1/query",
            json: true,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": <admin token>
            },
            body: {
                "type": "select",
                "args": {
                    "table": "fir",
                    "columns": [
                        "*",
                        {
                            "name": "s",
                            "columns": [
                                "name",
                                "phone_no",
                                "emergency"
                            ]
                        }
                    ],
                    "where": {
                        "station": {
                            "$eq": req.session.auth.userId2
                        }
                    }
                }
            }
        }, function(error, response, body) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            if (response.statusCode === 200) {
                var out = `<html>
            <head>
              <title>
                Home | Suraksha Mitra
              </title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
              <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
              <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
              <link rel="stylesheet" type="text/css" href="/second.css"/>
            </head>
            <body>
              <div class="topnav">
                <span class="logo">Suraksha Mitra</span>
                <a href="/logout">Log Out</a>
              </div>
              <div class="container">
            <h2>FIR</h2>
            <p>List of FIR recieved:</p>
            <table class="table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Details</th>
                  <th>PNR</th>
                  <th>Train no.</th>
                  <th>Coach no.</th>
                  <th>Seat no.</th>
                  <th>Aadhar no.</th>
                  <th>Phone no.</th>
                  <th>Emergency</th>
                </tr>
              </thead>
              <tbody>`;
                for (var i = 0; i < body.length; i++) {
                    out = out + "<tr><td>" + body[i].id + "</td><td>" + body[i].s.name + "</td><td>" + body[i].subject + "</td><td>" +
                        body[i].details + "</td><td>" + body[i].pnr + "</td><td>" + body[i].train_no + "</td><td>" +
                        body[i].coach_no + "</td><td>" + body[i].seat + "</td><td>" + body[i].aadhar_no + "</td><td>" +
                        body[i].s.phone_no + "</td><td>" + body[i].s.emergency + "</td></tr>";
                }
                out = out + `</tbody>
        </table>
      </div>
        </body>
      </html>`;
                res.send(out);
            } else {
                res.status(404).send(JSON.stringify(body));
            }
        });
    } else {
        res.redirect('/');
    }
});
app.get('/logout', function(req, res) {
    delete req.session.auth;
    res.redirect('/');
});
app.post('/adminlogin', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    request({
        url: "https://data.club87.hasura-app.io/v1/query",
        json: true,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": <admin token>
        },
        body: {
            "type": "select",
            "args": {
                "table": "admin",
                "columns": [
                    "password"
                ],
                "where": {
                    "username": {
                        "$eq": username
                    }
                }
            }
        }
    }, function(error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        var dbstring = JSON.parse(JSON.stringify(body));
        if (response.statusCode === 200) {
            if (dbstring.length !== 0) {
                if (dbstring[0].password !== password) {
                    res.status(404).send("password incorrect");
                } else {
                    req.session.auth = {
                        userId2: username
                    };
                    res.send("logged in successfully");
                }
            } else {
                res.status(404).send("user not found");
            }
        } else {
            res.status(404).send("Something went wrong");
        }
    });

});
app.post('/registerfir', function(req, res) {
    var result;
    var i = 0;
    var key = <api key>;
    var aadhar = req.body.aadhar;
    var subject = req.body.subject;
    var details = req.body.details;
    var tno = req.body.tno;
    var pnr = req.body.pnr;
    var seat = req.body.seat;
    var coach = req.body.coach;
    var date = req.body.date;
    var url = "https://api.railwayapi.com/v2/live/train/" + tno + "/date/" + date + "/apikey/" + key;
    request({
        url: url,
        json: true
    }, function(error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        var data = JSON.parse(JSON.stringify(body));
        var rt = data.route;
        for (i = (rt.length - 1); i >= 0; i--) {
            if (rt[i].has_departed === true && rt[i].has_arrived === true) {
                break;
            }
        }
        if (rt.length !== 0 || i !== rt.length) {
            result = rt[i + 1].station.name;
            request({
                url: "https://data.club87.hasura-app.io/v1/query",
                json: true,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": <admin token>
                },
                body: {
                    "type": "insert",
                    "args": {
                        "table": "fir",
                        "objects": [{
                            "aadhar_no": aadhar,
                            "subject": subject,
                            "details": details,
                            "station": result,
                            "train_no": tno,
                            "coach_no": coach,
                            "seat": seat,
                            "pnr": pnr
                        }]
                    }
                }
            }, function(error, response, body) {
                console.log('error:', error);
                console.log('statusCode:', response && response.statusCode);
                if (Object.keys(body).length === 3) {
                    res.status(403).send(body);
                } else {
                    res.send({
                        message: "Fir Regisered Successfully"
                    });
                }
            });
        } else {
            res.status(403).send("not found");
        }
    });
});
app.post('/vehicle', function(req, res) {
    var i = 0;
    var type = req.body.type;
    var key = <api key>;
    var tno = req.body.tno;
    var date = req.body.date;
    var result;
    var url = "https://api.railwayapi.com/v2/live/train/" + tno + "/date/" + date + "/apikey/" + key;
    request({
        url: url,
        json: true
    }, function(error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        var data = JSON.parse(JSON.stringify(body));
        var rt = data.route;
        for (i = (rt.length - 1); i >= 0; i--) {
            if (rt[i].has_departed === true && rt[i].has_arrived === true) {
                break;
            }
        }
        if (rt.length !== 0 && i !== rt.length) {
            result = rt[i + 1].station.name;
            console.log(result);
            request({
                url: "https://data.club87.hasura-app.io/v1/query",
                json: true,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": <admin token>
                },
                body: {
                    "type": "select",
                    "args": {
                        "table": "vehicle",
                        "columns": [
                            "phone_no"
                        ],
                        "where": {
                            "$and": [{
                                    "address": {
                                        "$eq": result
                                    }
                                },
                                {
                                    "type": {
                                        "$eq": type
                                    }
                                }
                            ]
                        }
                    }
                }
            }, function(error, response, body) {
                console.log('error:', error);
                console.log('statusCode:', response && response.statusCode);
                console.log(body);
                if (body.length !== 0) {
                    res.send({
                        message: JSON.stringify(body[0].phone_no)
                    });
                } else {
                    res.send("data not available");
                }
            });
        }
    });
});

app.get('/emecontact', function(req, res) {
    request({
        url: "https://data.club87.hasura-app.io/v1/query",
        json: true,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": <admin token>
        },
        body: {
            "type": "select",
            "args": {
                "table": "passenger",
                "columns": [
                    "emergency"
                ],
                "where": {
                    "id": {
                        "$eq": "1"
                    }
                }
            }
        }
    }, function(error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        res.send({
            message: JSON.stringify(body[0].emergency)
        });
    });
});
app.get('/first.js', function(req, res) {
    res.sendFile(path.join(__dirname, '/first.js'));
});
app.get('/first.css', function(req, res) {
    res.sendFile(path.join(__dirname, '/first.css'))
});
var port = 8080;
app.listen(port, function() {
    console.log('web app is listening at port ' + port);
});
