const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express()

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-adarsh:test123@cluster0.e0dxt.mongodb.net/todolistDB");

const itemSchema = {
    name: String
};

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your to do list."
});

const item2 = new Item({
    name: "Hit the + button to add."
});

const item3 = new Item({
    name: "<-- Hit this to delete your item."
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Successfully inserted the items")
                }
            });
        } else {
            res.render("list", {listTitle: "Today", newListItem: foundItems});
        }
    });

});

app.post("/", function (req, res) {
    let itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save()
        res.redirect("/")
    } else {
        List.findOne({name: listName}, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function (req, res) {
    const checkedItem = req.body.checkbox;
    Item.findByIdAndRemove(checkedItem, function (err) {
        if (!err) {
            console.log("Deletion Successful");
        }
    });
    res.redirect("/");
})

app.get("/:customListName", function (req, res) {
    const customListName = req.params.customListName;

    List.findOne({name: customListName}, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {listTitle: foundList.name, newListItem: foundList.items})
            }
        }
    });
});

port = 3000;
app.listen(process.env.PORT||port, function () {
    console.log("Server has started.")
});