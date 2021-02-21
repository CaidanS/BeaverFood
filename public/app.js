// *** FIREBASE ***

var config = {
    apiKey: "AIzaSyB5ZVLbni8ERY-IknnVnN2uKjmJUIqAkZA",
    authDomain: "beavereats.firebaseapp.com",
    databaseURL: "https://beavereats.firebaseio.com/",
    storageBucket: "beavereats.appspot.com/"
};

if (!firebase.apps.length) {
   firebase.initializeApp(config);
}

// Get a reference to the database service
var database = firebase.database();


// var orders_ref = database.ref('/current_orders/');
//     // const order = {
//     //     status: "open",
//     //     cart: cart,
//     //     courier_phone: "none",
//     // };
// var new_order_ref = orders_ref.push();
// new_order_ref.set({
//     name: "test"
// });


// *** HELPER FUNCTIONS ***


getMenuItems = function(rest_ID){
  var value = 'aaa'
  var ref = firebase.app().database().ref('/restaurants/'+rest_ID+'/menu');
  value = ref.once('value').then(function (snap) {
   return snap.val();
   // console.log(value);
  });
}
faq_el = document.getElementById('faq');


faq_body =  document.getElementById('faq_body');
main_body = document.getElementById('main_wrapper');

block_toggle = {
  'visible':'hidden',
  'hidden':'visible',
  1:0,
  0:1
}

toggleFAQ = function() {
  faq_body.style.visibility = block_toggle[String(faq_body.style.visibility)];
  main_body.style.visibility = block_toggle[String(main_body.style.visibility)];
  main_body.style.opacity = block_toggle[main_body.style.opacity];
  faq_body.style.opacity = block_toggle[faq_body.style.opacity];

}

faq_el.onclick = toggleFAQ;

toggleDirect = function(current_state) {
  invert_dict = {
    
    "inactive":"active",
    "active":"inactive"
  }
  if(current_state == "inactive"){

    toggles = document.getElementsByClassName("direct_select");
    for(i = 0; i < toggles.length;  i++) {
      new_class = invert_dict[toggles[i].classList[1]]
      old_class = toggles[i].classList[1];
      toggles[i].classList.add(new_class);
      toggles[i].classList.remove(old_class);
      // console.log(toggles[i].classList)
    }
  }
}
// window.cart = {};

var fees = {
  // "Courier": {
  //   "amount":2
  // },
  // "Service": {
  //   "amount":3
  // }
}

var id_to_name = {
  "bananabread": "Banana Bread",
  "latte": "Latte",
  "espresso": "Espresso",
  "cookie":"Cookie"
}
var preview_prices = {
  "bananabread":2.00,
  "latte":3.00,
  "espresso":4.00,
  "cookie":1.00,
  "superbowl":2.00
};

adjustValue = function(direction, item_id) {
  if(direction == "+"){
    if(item_id in window.cart){
      window.cart[item_id] += 1;
    }
    else {
      window.cart[item_id] = 1;
    }
  } else if(direction == "-") {
    if(item_id in window.cart){
      window.cart[item_id] -= 1;
    }
    if(window.cart[item_id] == 0){
      delete window.cart[item_id];
    }
  }
  item_counter = document.getElementById(item_id + "_counter");
  if(item_id in window.cart) {
    item_counter.innerHTML = window.cart[item_id];
  } else {
    item_counter.innerHTML = "0"
  }
  updatePreviewTable();
}

updatePreviewTable = function(){
  // I know this is bad, but its also easy
  var table = document.getElementById("confirm_items_table");
  table.innerHTML = "";
  new_content = ""
  // console.log(table);
  var preview_price_sum = 0
  for (item_id in window.cart) {
    if (window.cart.hasOwnProperty(item_id)) {
      new_content += "<tr><td>" + item_id + "</td>" 
      new_content += "<td>" + "$ " + preview_prices[item_id] + "</td>"
      new_content += "<td>" + "x " + window.cart[item_id] + "</td></tr>"
      preview_price_sum += preview_prices[item_id]*window.cart[item_id];
    }
  }
  for (fee in fees) {
    if(fees.hasOwnProperty(fee)){
      new_content += "<tr><td>" + fee + "</td>" + "<td>" + "$ " +  fees[fee]["amount"] + "<td></td>"+ "</td></tr>";
      preview_price_sum += fees[fee]["amount"];

    }
  }
  table.innerHTML = new_content;
  var price = document.getElementById("price_preview_total_num");
  price.innerHTML = preview_price_sum;
}

showMenu = function (rest_ID){
  // Check if Menu has already been created
  if(document.getElementById(rest_ID+"_menu") == null){
    menu_items_div = document.getElementById('menu_items');

    menu_to_add = document.createElement('div');
    menu_to_add.setAttribute("id", rest_ID + '_menu');
    menu_to_add.setAttribute("class", 'menu');
    


    var ref = firebase.app().database().ref('/restaurants/'+rest_ID+'/menu');


    // Don't completly understand .then things, but it is done async, so everything has to be within .then
    ref.once('value').then(function (snap) {
      menu_content = "<table style='width:100%' >"
      menu_items = snap.val();
      for(item in menu_items){
        item_id = item;
        item_name = menu_items[item]['display_name'];
        item_price = menu_items[item]['price'];
        preview_prices[item] = item_price;
        console.log(item_price, item_id, item_name);
        menu_content += `
          <tr>
            <td>
              ` + item_name + `<br>
            </td>
            <td class="button_td">
              <button class="adjust_button" onclick="adjustValue('-', '`+item_id+`')">
                -
              </button>
            </td>
            <td class="counter" id="`+item_id+`_counter"> 0 </td>
            <td class="button_td">
              <button class="adjust_button" class="adjust_button" onclick="adjustValue('+', '`+item_id+`')">
                +
              </button>
            </td>
          </tr>`

      }
      menu_to_add.innerHTML = menu_content
      menu_items_div.appendChild(menu_to_add);
      selected_rest = document.getElementById(rest_ID+"_menu");
      other_rests = document.getElementsByClassName("menu");
      for(i = 0; i < other_rests.length;  i++) {
        other_rests[i].style.display = "none";
      }
      selected_rest.style.display = "block"; 

    });


  } else {
      selected_rest = document.getElementById(rest_ID+"_menu");
      console.log(selected_rest);

      other_rests = document.getElementsByClassName("menu");
      for(i = 0; i < other_rests.length;  i++) {
        other_rests[i].style.display = "none";
      }
      selected_rest.style.display = "block";

  }
}

setTimeDefaults = function() {

  default_window = 2;

  start = document.getElementsByName("time_range_start")[0];
  end = document.getElementsByName("time_range_end")[0];
  
  var date = new Date();
    hours = date.getHours();
    minutes = date.getMinutes();
    // seconds = date.getSeconds();
    
    //add extra zero if the minutes is less than 2 digits
    if(hours < 10){
      hours = '0' + hours;
    }

    //add extra zero if the minutes is less than 2 digits
    if(minutes < 10){
      minutes = '0' + minutes;
    }

  start.value = hours + ":" + minutes;
  end.value = hours + default_window + ":" + minutes;
}



// fun stuff

const canvasEl = document.querySelector('#_canvas');

const w = canvasEl.width = window.innerWidth;
const h = canvasEl.height = window.innerHeight * 2;

const time_out = 2000;
var num_frames = 0;

function confetti_loop() {
  num_frames += 1;

  if(num_frames < time_out){
    requestAnimationFrame(confetti_loop);
  }
  ctx.clearRect(0, 0, w, h);
  confs.forEach((conf) => {
    conf.update();
    conf.draw();
  })
}

function Confetti() {
  //construct confetti
  const colours = ['#fde132', '#009bde', '#ff6b00'];

  this.x = Math.round(Math.random() * w);
  this.y = -Math.round(Math.random() * h) - (h / 2);
  this.rotation = Math.random() * 360;

  const size = Math.random() * (w / 60);
  this.size = size < 15 ? 15 : size;

  this.color = colours[Math.floor(colours.length * Math.random())];

  this.speed = this.size / 4;

  this.opacity = Math.random();

  this.shiftDirection = Math.random() > 0.5 ? 1 : -1;
}

Confetti.prototype.border = function() {
  if (this.y >= h) {
    this.y = h;
  }
}

Confetti.prototype.update = function() {
  this.y += this.speed;

  if (this.y <= h) {
    this.x += this.shiftDirection / 3;
    this.rotation += this.shiftDirection * this.speed / 100;
  }

  if (this.y > h) this.border();
};

Confetti.prototype.draw = function() {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.size, this.rotation, this.rotation + (Math.PI / 2));
  ctx.lineTo(this.x, this.y);
  ctx.closePath();
  ctx.globalAlpha = this.opacity;
  ctx.fillStyle = this.color;
  ctx.fill();
};

const ctx = canvasEl.getContext('2d');
const confNum = 100;
const confs = new Array(confNum).fill().map(_ => new Confetti());

// confetti_loop();