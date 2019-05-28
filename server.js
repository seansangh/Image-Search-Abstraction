// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const mongodb= require('mongodb');
const MongoClient= require('mongodb').MongoClient;
const bodyParser= require('body-parser');
const request= require('request');

const apiKey= process.env.API_KEY;
const apiCx= process.env.API_CX;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/search', function(req, res) {
  MongoClient.connect(process.env.DB, function(err,db){
    db.collection('search').find().toArray((err,docs)=>{
    res.send(docs)
    })
    
  })  
});

app.post('/', function(req,res){
  
  res.redirect('/api/search?search='+req.body.im)
})

app.get('/api/search', function(req,res){
  var search= req.query.search; var offset= 10;
  if(req.query.offset){
    var offset=req.query.offset;
  }
  
  if(req.query.search){
  
  MongoClient.connect(process.env.DB, function(err,db){
    db.collection('search').insertOne({url: search, when: new Date().toUTCString()},(err,docs)=>{
    })
  })
  
  request('https://www.googleapis.com/customsearch/v1?key='+apiKey+'&cx='+apiCx+'&q='+search+'&searchType=image&num='+offset, function(err,response,body){
    //console.log('response'+JSON.stringify(response))
    //console.log('body'+body)
        var data = JSON.parse(body);
        var items = [];
        if (data && data.items.length) {
            items = data.items.map(item => {
                return {
                    url: item.link ? item.link : "",
                    snippet: item.snippet ? item.snippet : "",
                    thumbnail: item.image && item.image.thumbnailLink ? item.image.thumbnailLink : "",
                    context: item.image && item.image.contextLink ? item.image.contextLink : ""
                };
            });
        }    
      res.send(items);

  })
    
  
    
  }
  else{
  res.send('Invalid Search Items')
  }
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
