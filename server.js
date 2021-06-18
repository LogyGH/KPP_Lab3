const express = require("express") // "движок" API сервера
const mongodb = require("mongodb") // mongodb библиотека. Чтобы взаимодействовать с базой MongoDB
const bodyParser = require("body-parser") // body-parser; Библиотека "парсит" параметры запросов

const cors = require('cors') // Нужная библиотека для VUE (разрешения на доступ к выбранным ресурсам с сервера на источнике)

const app = express()

const ObjectID = mongodb.ObjectID // Чтобы преображать строку ID в объект, нужно для mongodb

app.use(bodyParser.urlencoded({ extended: false })) // Подключаем body-parser
app.use(bodyParser.json())  // Подключаем body-parser
app.use(cors()); // Включаем cors


let db
function isValidValue(value) { // Чтобы блокировать запросы с пустыми именами
    return value && value != ""
}

app.get("/group", (req, res) => {
    db.collection("groups").aggregate([{
        $lookup: { from: "students", as: "students", localField: "_id", foreignField: "groupID" }
    }]).toArray().then(data => {
        data.forEach(group => {
            group.students.forEach(student => {
                student.groupID = undefined
            })
        });
        res.send(data)
    })
})
app.post("/group", (req, res) => {
    if (!isValidValue(req.body.name)) {
        res.status(400).send()
        return;
    }

    db.collection('groups').insertOne({
        name: req.body.name
    }).then(data => {
        res.status(200).send(data.insertedId)
    })
})
app.delete("/group/:id", (req, res) => {
    db.collection('groups').deleteOne({
        _id: ObjectID(req.params.id)
    }).then((() => {
        res.status(200).send()

        db.collection('students').deleteMany({
            groupID: ObjectID(req.params.id)
        })
    }))

})


app.post("/student", (req, res) => {
    if (!isValidValue(req.body.name) || !isValidValue(req.body.groupID)) {
        res.status(400).send("Invalid groupID")
        return;
    }

    db.collection('groups').findOne({
        _id: ObjectID(req.body.groupID)
    }).then(response => {
        if (response) {
            db.collection('students').insertOne({
                groupID: ObjectID(req.body.groupID),
                name: req.body.name,
            }).then((data => {
                res.status(200).send(data.insertedId)
            }))
        }
    })
})
app.delete("/student/:id", (req, res) => {
    if (!isValidValue(req.params.id)) {
        res.status(400).send("Invalid id")
        return;
    }
    db.collection('students').deleteOne({
        _id: ObjectID(req.params.id)
    }).then((() => {
        res.status(200).send()
    }))
})


app.use(express.static(__dirname + '/dist')) // Чтобы сервер отправлял билд от VUE (npm run build)
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/dist/index.html")
})


// Подключение к MongoDB
mongodb.MongoClient
    .connect('mongodb://localhost:27017/groups')
    .then(function (client) {
        db = client.db()

        app.listen(5000) // Включает сервер
    });