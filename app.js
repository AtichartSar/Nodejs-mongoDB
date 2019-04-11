//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
//https://www.npmjs.com/package/mongoose
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});
//สร้าง schema
const itemsSchema ={
  name: String,
}

const Item=mongoose.model("ItemName",itemsSchema)

const item1=new Item({
  name:"Welcome to your todolist"
});

const item2=new Item({
 name:"Hit the + button to add a new item."
});

const item3=new Item({
  name:"<-- Hit this to delete an item."
});

// **************** listSchema ******************
const listSchema={
  name:String,
  items:[itemsSchema]
}
const List = mongoose.model("ListTB",listSchema);
// **************** listSchema ******************

const defaultItems=[item1,item2,item3];
//https://mongoosejs.com/docs/api.html#model_Model.insertMany

// Item.insertMany(defaultItems,function (err) {
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Successfully saved default items");
//   }
// });


app.get("/", function(req, res) {

  // https://mongoosejs.com/docs/api.html#model_Model.find 
  Item.find({},function (err,foundItems) {

    if(foundItems.length==0){
      Item.insertMany(defaultItems,function (err) {
        if(err){
          console.log(err);
        }else{
      console.log("Successfully saved default items");
        }
      });
      res.redirect("/")
    }else{
      console.log(foundItems);
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});
//check from url******************
app.get("/:customListName",function (req,res) {
  console.log(req.params.customListName);
  //https://lodash.com/docs/4.17.11#capitalize เปลี่ยนตัวอักษร
  const customListName=_.capitalize(req.params.customListName)

  List.findOne({name: customListName},function (err,foundList) {
    if(!err){
      if(!foundList){
        //Create a new list
        console.log("Doesn,t exists");//ไม่มีอยู่
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName)
      }else{
        //Show an existing list โชวลิสที่มีอยู่
        console.log("exists");//มีอยู่
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });

  
});

//ทำงานเมื่อมีการส่งค่าผ่าน post(ปุ่มกด) แล้วเซฟลง MongoDB
app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

//***********MonGo Save***************//
  const item = new Item({
    name:itemName
  }); 
// item.save()
//***********MonGo Save***************//

if(listName=="Today"){
  item.save()
  res.redirect("/");
}else{
//https://mongoosejs.com/docs/api.html#model_Model.findOne  
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item)
    foundList.save();
    res.redirect("/"+listName)
  })
}


});

app.post("/delete",function (req,res) {
  console.log(req.body.checkbox); 
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName=="Today"){
    //***********MonGo Delete***************//
    //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
    Item.findByIdAndRemove(checkedId,function(err) {
      if (!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
    //***********MonGo Delete***************//
  } else {
    //https://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

});

app.get("/work", function(req,res){
  res.render("h");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
//https://devahoy.com/posts/getting-started-with-mongodb/#step3
//MongoDB shell
//show dbs แสดงดาตาเบส
//use test
//show collections
//db.[collectionName].find()
//db.dropDatabase()
//db.[collectionName].drop()
//db.collectionName.remove({name: 'Lionel Messi'});