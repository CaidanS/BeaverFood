
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
var cart = {};

var fees = {
	"Courier": {
		"amount":2
	},
	"Service": {
		"amount":3
	}
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
	"cookie":1.00
};

adjustValue = function(direction, item_id) {
	if(direction == "+"){
		if(item_id in cart){
			cart[item_id] += 1;
		}
		else {
			cart[item_id] = 1;
		}
	} else if(direction == "-") {
		if(item_id in cart){
			cart[item_id] -= 1;
		}
		if(cart[item_id] == 0){
			delete cart[item_id];
		}
	}
	item_counter = document.getElementById(item_id + "_counter");
	if(item_id in cart) {
		item_counter.innerHTML = cart[item_id];
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
	console.log(table);
	var preview_price_sum = 0
	for (item_id in cart) {
		if (cart.hasOwnProperty(item_id)) {
			new_content += "<tr><td>" + id_to_name[item_id] + "</td>" 
			new_content += "<td>" + "$ " + preview_prices[item_id] + "</td>"
			new_content += "<td>" + "x " + cart[item_id] + "</td></tr>"
			preview_price_sum += preview_prices[item_id]*cart[item_id];
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
	selected_rest = document.getElementById(rest_ID+"_menu");

	other_rests = document.getElementsByClassName("menu");
	console.log(other_rests);
	for(i = 0; i < other_rests.length;  i++) {
		other_rests[i].style.display = "none";
	}

	selected_rest.style.display = "block";
	// setTimeDefaults();
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
