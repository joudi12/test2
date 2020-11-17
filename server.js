const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');
const methodoverride = require('method-override');



require('dotenv').config();
const PORT = process.env.PORT


const app = express()
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
//---------------------------route------------------------------
app.get('/', alljoke);
app.post('/Fav', addtoFav);
app.get('/Fav', showtheFav);
app.get('/Fav/:id', showDetails);
app.put('/Fav/:id', handelupdating);
app.delete('/Fav/:id', handeldeleting);
app.get('/random', getRandomjoke)


//--------------------------Random---------------------------
function getRandomjoke(req, res) {
    let array = [];
    let url = `https://official-joke-api.appspot.com/jokes/programming/random`;
    superagent(url).then(val => {
        val.body.forEach(val => {
            array.push(new Joke(val))
        })

        res.render('random', { result: array[0] })
    })
}

//---------------------------deleting-------------------------------

function handeldeleting(req, res) {
    let query = 'DELETE FROM book WHERE id =$1;'
    let val = [req.params.id];
    client.query(query, val).then(() => {
        res.redirect('/Fav');
    })
}

//-------------------------updating--------------------------

function handelupdating(req, res) {
    let query = 'UPDATE book SET  type=$1, setup=$2,punchline=$3 WHERE id=$4; '
    let values = [req.body.type, req.body.setup, req.body.punchline, req.params.id]
    client.query(query, values).then(() => {
        res.redirect(`/Fav/${req.params.id}`)
    })
}

//------------------------------showDetails------------------------------------------

function showDetails(req, res) {
    let query = 'SELECT * FROM  book WHERE id=$1;'
    let value = [req.params.id];
    client.query(query, value).then(val => {

        res.render('details', { result: val.rows[0] })
    })
}

//-------------------------VIEWS Fav--------------------------------

function showtheFav(req, res) {
    let query = 'SELECT * FROM book;';
    client.query(query).then(val => {

        res.render('favorite', { result: val.rows })
    })
}

//----------------------------INSERT-------------------------------------------

function addtoFav(req, res) {
    let query = 'INSERT INTO book ( type, setup, punchline) VALUES ($1,$2,$3);'
    let value = [req.body.type, req.body.setup, req.body.punchline]

    client.query(query, value).then(val => {
        res.redirect('/Fav')
    }).catch(err => {
        console.log(err)
    })
}


//--------------------------------API-------------------------------------------

function alljoke(req, res) {
    let arr = [];
    let url = `https://official-joke-api.appspot.com/jokes/programming/ten`;
    superagent(url).then(val => {
        console.log(val.body)
        val.body.forEach(element => {
            arr.push(new Joke(element))
        })
        res.render('main', { result: arr })
    })
}


function Joke(value) {
    this.id = value.id;
    this.type = value.type;
    this.setup = value.setup;
    this.punchline = value.punchline;
}





//--------------------------listen---------------------------------





const client = new pg.Client(process.env.DATABASE_URL);
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('its work', PORT)
    })
})
