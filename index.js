//Packages
const express = require('express')
const path = require('path')
const ejs = require('ejs')
const mongoose = require ('mongoose')
const BlogPost = require('./models/BlogPost')
const User = require('./models/user');

//Initialise express app
const app= new express()

//View Templating engine
app.set('view engine', 'ejs')

//Setting folder for Static files
app.use(express.static('public'))

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Connection string   
mongoose.connect('mongodb+srv://Admin:Admin@cluster0.2cymg.mongodb.net/Blog_app?retryWrites=true&w=majority&appName=Cluster0')

//request Handlers
app.get('/', async (req,res)=>{
    try{
        const blogposts = await BlogPost.find({})
        res.render('dashboard',{
            blogposts
        }) //index.ejs

    }
    catch(error){
        console.log(error)

    }
})
   
//REQUEST: /about is the url
app.get('/G2', (req,res)=> {
    res.render('G2') //RESPONSE: about/ejs
})
app.get('/G', (req, res) => {
    // Initially, no user data is passed
    res.render('G', { user: null, message: null });
});

app.get('/login', (req,res)=> {
    res.render('login')  //Response: Contact/ejs
})


app.get('/posts/new', (req,res)=> {
    res.render('create') //create.ejs
})

app.post('/posts/store', async (req,res)=> {
    try {
        await BlogPost.create(req.body)
        res.redirect('/')
    }
        catch(error){
            console.log(error)
        }
})

app.post('/posts/store', async (req,res)=>{
    try{
        const image = req.files.image
        image.mv(path.resolve(__dirname, 'public/img', image.name))
        await BlogPost.create({
            ...req.body,
        image:'img/'+image.name
        })
        res.redirect('/')

    }
    catch(error){
        console.log(error)
    }

})

//Handles form submition and saves data to db
app.post('/saveUser', async (req, res) => {
    try {
        const { firstName, lastName, licenseNumber, age, carMake, carModel, carYear, plateNumber } = req.body;

        // Create a new User document
        const user = new User({
            firstName,
            lastName,
            licenseNumber,
            age: parseInt(age), // Ensure age is a number
            carDetails: {
                make: carMake,
                model: carModel,
                year: parseInt(carYear), // Ensure year is a number
                platno: plateNumber
            }
        });

        // Save the user to the database
        await user.save();

        // Redirect to the G page after saving
        res.redirect('/G');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error saving user data');
    }
});

//Handles fetching user's data
app.post('/fetchUser', async (req, res) => {
    try {
        const { licenseNumber } = req.body;
        const user = await User.findOne({ licenseNumber });
        if (!user) {
            return res.render('G', { user: null, message: 'No User Found' });
        }
        res.render('G', { user, message: null });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching user data');
    }
});

//Handles updating of car information
app.post('/updateCar', async (req, res) => {
    try {
        const { licenseNumber, carMake, carModel, carYear, plateNumber } = req.body;
        await User.updateOne(
            { licenseNumber },
            {
                $set: {
                    carDetails: {
                        make: carMake,
                        model: carModel,
                        year: carYear,
                        platno: plateNumber
                    }
                }
            }
        );
        res.redirect('/G');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error updating car information');
    }
});

//Set the port of server
app.listen(5000, ()=> {
console.log('App is listening on port 5000')

})