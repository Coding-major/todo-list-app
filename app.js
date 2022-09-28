const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { schema } = require("joi/lib/types/object");
const date = require(__dirname + "/date.js");
const _ = require("lodash")


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-mustapha:52604399@cluster0.9ybqmis.mongodb.net/todolistDB", {useNewUrlParser: true});



const itemsSchema = new mongoose.Schema(
  {
    name: String
  } 
);

const items = mongoose.model("items", itemsSchema);

const item1 = new items(
  {
    name: "sugar"
  }
)

const item2 = new items(
  {
    name: "butter"
  }
)

const item3 = new items(
  {
    name: "bread"
  }
)




// const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

const defaultItems = [item1, item2, item3]

const newRouteSchema = new mongoose.Schema({
  name: String,
  itemsList: [itemsSchema]
})

const List = mongoose.model("List", newRouteSchema);



app.get("/", function(req, res) {

  //const day = date.getDate();
  items.find({}, (err, founditem) => {

    if (founditem.length === 0) {
      items.insertMany(defaultItems, (err) => {
        if (err) {
          console.log("ogbeni! error dey oh");
        } else {
          console.log("succesfully save all to the collections");
        }
      })
      res.redirect("/");
    } else {
      res.render("list", { 
        listTitle: "Current", 
        newListItems: founditem,
        testingme: "deleteHome"
      });
    }
  });

}); 


app.post("/", function(req, res){ 

  if (req.body.list === "Current") {
    const itemName = req.body.newItem;
    const newAddedItem = new items(
      {
        name: itemName
      }
    )
    newAddedItem.save();
    res.redirect("/")
  } else {
    const customizeNew = req.body.customizeNew;
    res.redirect("/" + customizeNew)
  }


});


app.post("/deleteHome", (req, res) => {
  const checkedItemId = req.body.checkedDelete
  items.deleteOne({_id: checkedItemId}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("delete successful");
      res.redirect("/")
    }
  })
})



app.post("/delete", function(req, res) {
  const nameTitle = req.body.nameTitle
  const checkedItemId = req.body.checkedDelete
  List.findOneAndUpdate({name: nameTitle}, {$pull: {itemsList: {_id: checkedItemId}}}, (err) => {
    if (!err) {
      res.redirect("/" + nameTitle)
    }
  })

})



app.get("/:postLink", (req, res) => {

  const postLink = _.capitalize(req.params.postLink)
  
  List.findOne({name: postLink}, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List(
          {
            name: postLink,
            itemsList: []   
          }
        )
        list.save();
        res.redirect("/" + postLink);
      } else {
        res.render("newlist", {
          listTitle: foundList.name,
          newListItems: foundList.itemsList
        })
      } 
    }
  })
})


app.post("/:postLink", (req, res) => {
  const nameTitle = req.body.nameTitle
  const checkedItemId = req.body.checkedDelete
  const theListTitle = req.body.list;
  const addNewItem = req.body.newItem;
  const newItem = new items(
    {
      name: addNewItem
    }
  ) 

  List.findOne({name: theListTitle}, (err, foundList) => {
    if (!err) {
      foundList.itemsList.push(newItem);
      foundList.save();
      res.redirect("/" + theListTitle)
    }
  })

  
})





app.get("/about", function(req, res){
  res.render("about");
});



app.listen(3000, function() {
console.log("Server started on port 3000");
});
