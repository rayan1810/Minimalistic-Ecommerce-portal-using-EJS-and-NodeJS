var app = require('express')();
var mysql = require('mysql');
var express=require('express');
var ejs = require('ejs');
app.set('view engine','ejs');

const bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'rohit0203',
    database:'ecom'
});
connection.connect(function(error){
    if(error){
        console.log('Error');

    }
    else{
        console.log('Connected');

    }
});
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var products=[];
app.post('/',(req,res)=>{
    if(req.body.status==='loggedin'){
        res.render('home',{data:products,status:'prod',username:req.body.username});
    }else
    res.render('home',{data:'',status:'loggedout'});
})
app.get('/',(req,res)=>{
    
    res.render('home',{data:'',status:'loggedout'});
})
app.get('/admin',(req,res)=>{
    res.render('admin',{status:'loggedout',data:products});
})
app.post('/addproduct',(req,res)=>{

    connection.query('insert into products values(?,?,?,?)',[req.body.title,req.body.description,req.body.quantity,req.body.price],(err,result,fields)=>{
        if(err){
            res.send("Error entering product!");
        }
    });

    connection.query('select * from products',(err,result,fields)=>{
        if(err){
            res.send("Error fetching the products!");
        }
        else{
            products=result;
            res.render('admin',{status:'in',data:result});
        }
    });
})
app.post('/updateproduct',(req,res)=>{
    if(req.body.action==='update'){
    connection.query('update products set title=?,description=?,price=?,quantity=? where title=?',[req.body.title,req.body.description,req.body.price,req.body.quantity,req.body.title],(err,result,fields)=>{
        if(err){
            res.send("Error Registering the user!");
        }
    });
    }else{
        connection.query('delete from products where title=?',[req.body.title],(err,result,fields)=>{
            if(err){
                res.send("error");
            }
        });
    }
    connection.query('select * from products',(err,result,fields)=>{
        if(err){
            res.send("Error Registering the user!");
        }
        else{
            products=result;
            res.render('admin',{status:'in',data:result});
        }
    });
})
app.post('/register',(req,res)=>{
    connection.query('insert into users values(?,?,?)',[req.body.username,req.body.email,req.body.password],(err,result,fields)=>{
        if(err){
            res.send("Error Registering the user!");
        }else{
            res.render('home',{status:'loggedout'});
        }
    });
})
app.post('/login',(req,res)=>{
    
    connection.query('select * from users where username=? and password=?',[req.body.username,req.body.password],(err,result,fields)=>{
        if(err){
            res.send('some error occured while loging in try again');
        }else{
            if(result.length>0){
                getProducts();
                if(req.body.user==='admin'){

                    res.render('admin',{status:'in',data:products})
                }else{
                res.render('home',{status:'prod',data:products,username:result[0].username});
                }
            }else{
                res.send("Invalid Credentials");
            }
        }
    })
})
app.get('/reg',(req,res)=>{
    res.render('home',{status:'register'});
})
var getProducts=()=>{
    connection.query('select * from products',(err,result)=>{
        products=result;
    })
}
app.post('/viewcart',(req,res)=>{
    connection.query('select * from carts where username =?',[req.body.username],(err,result,f)=>{
        if(err){
            res.send(err);
        }else{
            res.render('home',{status:'cart',carts:result,username:req.body.username})
        }
    })
})
app.post('/deletefromcart',(req,res)=>{
    connection.query('delete  from carts where username =? and title=?',[req.body.username,req.body.title],(err,result,f)=>{
        if(err){
            res.send(err);
        }
        else{
            connection.query('update products set quantity=quantity+? where title=?',[req.body.quantity,req.body.title],(err,result,fi)=>{
                if(err){
                    res.send(err);
                }
            })
        }
    })
    connection.query('select * from carts where username =? ',[req.body.username],(err,result,f)=>{
        if(err){

        }else{
            res.render('home',{status:'cart',carts:result,username:req.body.username})
        }
    });
})
var userproducts;
var username;

app.post('/addtocart',(req,res)=>{
    
    connection.query('insert into carts values(?,?,?,?)',[req.body.username,req.body.title,req.body.quantity,req.body.price],(err,result,fields)=>{
        if(err){
            res.send("error");
        }else{
            getProducts();
            username=req.body.username;
            console.log(req.body.title);
            connection.query('update products set quantity=quantity-? where title=?',[req.body.quantity,req.body.title],(err,result,fi)=>{
                if(err){
                    res.send(err);
                }else{
                    res.render('home',{status:'prod',data:products,username:username})
                }
            })
           
        }
    })
   
});
app.post('/buy',(req,res)=>{
    connection.query('delete from carts where username=?',[req.body.username],(err,result,f)=>{
        if(err){
            res.send(err);
        }else{
            res.render('home',{status:'bought',username:req.body.username})
        }
    })
})
app.listen(8000);

       