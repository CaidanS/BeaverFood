
// // Clean up after any stray timers
// function clearAll() {
//     for (var i = setTimeout(function() {}, 0); i > 0; i--) {
//       window.clearInterval(i);
//       window.clearTimeout(i);
//       if (window.cancelAnimationFrame) window.cancelAnimationFrame(i);
//     }
//   }

// clearAll();

// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.

// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51HelX0EDvQ8GmoM0aB7xY6ragvxhH656AoVAywUn9EGG5SGpE3OcsaBNWoJKl0Ao21akoPuB1mzvkStDC8uwSG5D00VcgUrIX7');

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors')({ origin: true });
const app = express();
const bodyParser = require('body-parser');

const FROM_SMS_NUM = '+13345601937'
const order_time_out = 120000; //milli

// admin.initializeApp();

var config = {
    projectId: 'beavereats',
    apiKey: "AIzaSyB5ZVLbni8ERY-IknnVnN2uKjmJUIqAkZA",
    authDomain: "beavereats.firebaseapp.com",
    databaseURL: "https://beavereats.firebaseio.com/",
    storageBucket: "beavereats.appspot.com/"
};

const admin = require('firebase-admin');
const { parse } = require('qs');
admin.initializeApp();
database = admin.database().ref();



async function charge(req, res) {
    // console.log("TEST");
    const body = JSON.parse(req.body);
    const token = body.token.id;
    var amount = body.charge.amount;
    // console.log(amount);
    const currency = body.charge.currency;
    const cart = body.cart;
    // Calculate Charge
    var resturants_ref = admin.database().ref('/restaurants');
    const dorm = body.dorm;
    const dorm_num = body.dorm_num;
    const cust_phone = body.phone;
    const notes = body.notes;
    var price_sum = 0;

    resturants_ref.once('value').then( (snap) => {
        restaurants = snap.val();
        master_menu = {};
        // console.log("restaurants: ");
        // console.log(restaurants);
        for (var restaurant in restaurants) {
            if (restaurants.hasOwnProperty(restaurant)) {
                menu = restaurants[restaurant]['menu'];
                master_menu = { ...master_menu, ...menu };
            }
        }
        var price_sum = 0;
        for (item_id in cart) {
            if (cart.hasOwnProperty(item_id)) {
                price_sum += master_menu[item_id]['price'] * cart[item_id];
            }
        }
        SURCHARGE_VAL = 0.0; // 20% charge for service
        price_sum = price_sum * (1+SURCHARGE_VAL);
        // console.log("price_sum: ");
        // console.log(price_sum);
        // amount = price_sum
        return price_sum;
    }).then((_price_sum) => {
            // Charge card
            // console.log("_price_sum: ");
            // console.log(_price_sum*100);
            // var amount = _price_sum;
            // console.log("amount: --");
            // console.log(amount);
            _charge = stripe.charges.create({
                amount: (Math.floor(_price_sum*100)),
                currency: currency,
                description: 'beavereats',
                source: token,
            });
            return _charge;
    }).then(_charge => {
        send(res, 200, {
            message: 'Success',
            _charge,
        });
        return null;
    }).then(_d => {

        var orders_ref = admin.database().ref('/current_orders/');

        var new_order_ref = orders_ref.push();
        current_time = Date.now();
        delivery_window = "delivery_window--";

        new_order_ref.set({
            status: "open",
            cart: cart,
            time_created: current_time,
            window_to_deliver: delivery_window,
            dorm_to_num: dorm_num,
            dorm: dorm,
            notes: notes,
            cust_phone: cust_phone,
            courier_id: "none",
        });
        return null;
    }).catch(err => {
        console.log(err);
        send(res, 500, {
            error: err.message,
        });
    });
}

function send(res, code, body) {
    res.send({
        statusCode: code,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(body),
    });
}

app.use(cors);
app.post('/charge', (req, res) => {
    // Catch any unexpected errors to prevent crashing
    try {
        charge(req, res);
    } catch(e) {
        console.log(e);
        send(res, 500, {
            error: `The server received an unexpected error. Please try again and contact the site admin if the error persists.`,
        });
    }
});

exports.charge = functions.https.onRequest(app);

// async function handle_new_order (order_id) {
//     // go through list of couriers
//         // if they have no assigned orders
//             // text them
//                 // items
//                 // cost
//                 // floor
//                 // dorm
//             // wait 1 minute for response
//             // if they say "yes"
//                 // text details of order to them 
//                 // assign their id to order
//             // if they say "no"
//                 // move to next courier
// }
exports.handle_sms_courier = functions.https.onRequest(app);

const accountSid = "AC3045fe88e0d9327c49cf1607148f04fd";
const authToken = "088a4cfd72315278c7ba495728825ea3";
const client = require('twilio')(accountSid, authToken);
// app.use('/handle_sms_courier', bodyParser.urlencoded({ extended: false }));

app.post('/handle_sms_courier', (req, res) => {
    try {
        console.log("RECIEVED TEXT");
        handle_sms_courier(req, res);
    } catch(e) {
        console.log(e);
        send(res, 500, {
            error: `The server received an unexpected error. Please try again and contact the site admin if the error persists.`,
        });
    }
}) 
// exports.handle_sms_courier = functions.https.onRequest(app);
function handle_sms_courier(req, res){
    console.log("RECIEVED TEXT -- firing function");
   
    // console.log('req: ');
    // console.log(req)

    const parsed = req.body;
    


    const body = parsed.Body;
    console.log('parsed body: ' + body);
    console.log(body);

    const from_num = parsed.From;
    console.log("from_num: ")
    console.log(from_num);
    // from_num = req.from;
    // send_sms('+15033093646', req.body.Body);

    orders_ref = admin.database().ref('/current_orders/');
    couriers = admin.database().ref('/couriers/');
    offered_orders_ref = admin.database().ref('/offered_orders/');
    
    if (body.toLowerCase() === "y"){                    
        Promise.all([offered_orders_ref.once('value'), orders_ref.once('value')]).then( (values) => {
            offers_snap = values[0];
            // console.log(offers_snap)
            console.log(offers_snap.val())
            orders_snap = values[1];
            console.log("checking if courier has pending offers")
            if (offers_snap.hasChild(from_num.toString())){
                order_id = Object.values(offers_snap.val()[from_num.toString()])[0]
                console.log("order_id!: ");
                console.log(order_id);
                courier_id = orders_snap.val()[order_id]["courier_id"]
                assign_courier(courier_id, order_id);
                clearInterval(order_intervals[order_id]);
                offered_orders_ref.child(from_num.toString()).child(Object.keys(offers_snap.val()[from_num.toString()])[0]).remove()
                return null;
            } else {
                send_sms(from_num, "sorry, all offers have expired.");
                return null;
            }
        }).catch (err => {
            console.log(err);
        })
    } else if (body.toLowerCase() === "n"){
        Promise.all([offered_orders_ref.once('value'), orders_ref.once('value')]).then( (values) => {
            offers_snap = values[0];
            // console.log(offers_snap)
            console.log(offers_snap.val())
            orders_snap = values[1];
            console.log("checking if courier has pending offers")
            if (offers_snap.hasChild(from_num.toString())){
                console.log("removing because of 'n'")
                order_id = Object.values(offers_snap.val()[from_num.toString()])[0]
                console.log("order_id!: ");
                console.log(order_id);
                courier_id = orders_snap.val()[order_id]["courier_id"]
                un_assign_courier(courier_id, order_id);
                offered_orders_ref.child(from_num.toString()).child(Object.keys(offers_snap.val()[from_num.toString()])[0]).remove();
                return null;
            } else {
                send_sms(from_num, "sorry, all offers have expired.");
                return null;
            }
        }).catch (err => {
            console.log(err);
        })
        return null;
        // assign to next courier, and update records
    }
    return null;
}

function send_sms (to_num, body_message) {
    client.messages.create({
        body: body_message,
        from: FROM_SMS_NUM,
        to: to_num
    }).then(message => {
        console.log(message.sid)
        return null;
    }).catch (err => {
        console.log(err);
    });
}

// admin.database().ref('/current_orders/')
couriers = admin.database().ref('/couriers/');
orders = admin.database().ref('/current_orders/');


order_intervals = {};


exports.cancel_interval_if_assigned = functions.database.ref("/current_orders/{order_id}/status").onUpdate( async (snap, context) => {
    order_ref = admin.database().ref('/current_orders/{order_id}/status');
    order_ref.once('value').then(__snap => {
        if (__snap.val() === 'assigned'){
            console.log("killing interval")
            clearInterval(order_intervals[order_id]);
        }
        return null;
    }).catch (err =>{
        console.log(err);
    }) 
});


// handle a new order being created
exports.sms = functions.database.ref("/current_orders/{order_id}").onCreate( async (snap, context) => {
    console.log("key: ");
    console.log(snap.key);    
    order_id = snap.key;
    // console.log(couriers);

    courier_db_ref = courier_order_ref = admin.database().ref('/couriers/');
    offered_orders_ref = admin.database().ref('/offered_orders/');
    courier_db_ref.once('value').then((_snap) => {
        num = '';
        couriers = _snap.val();
        var courier_interval_count = 0;
        order_intervals[order_id] = setInterval(() => {       
                if (Number((courier_interval_count) >= Number(_snap.numChildren()))){
                    console.log("killing interval of: " + courier_id)
                    clearInterval(order_intervals[order_id]);
                } else {
                    console.log('_snap.numChildren() ' + _snap.numChildren());
                    console.log('courier_interval_count ' + courier_interval_count);
                    console.log('order_id of annoying function: ' + order_id);
                    console.log(order_intervals[order_id]);
                    courier_id = Object.keys(couriers)[courier_interval_count]
                    last_num = num;    
                    num = couriers[courier_id]['phone'];
                    ask_courier (courier_id, order_id, num);
                    offered_orders_ref.child(last_num.toString()).child(order_id).remove()
                    courier_interval_count += 1;

                }
        }, order_time_out)
        return null;
    }).catch (err => {
        console.log(err);
    });
    // loop through couriers
        // text them to see if they want to accept
        // wait for 1 minute for response each
            // if yes
                // send details
                    // room
                    // exact order
                    // resturants
            // if no
                // move on to next courier
    
    // assign_courier("id_unique", snap.key);
    return null;
});

async function ask_courier (courier_id, order_id, courier_num){
    console.log("courier: " + courier_id)
    console.log("num: " + courier_num)
    send_ask_message(courier_num, order_id); 
    admin.database().ref("/current_orders/"+order_id).child("status").set("offered");
    admin.database().ref("/current_orders/"+order_id).child("courier_id").set(courier_id);
    new_offer_ref = admin.database().ref("/offered_orders/"+courier_num + '/' + order_id);
    new_offer_ref.set(order_id);
}



async function send_ask_message (num, order_id){
    order_ref = admin.database().ref("/current_orders/"+order_id)
    create_message_body_from_order_ref(order_ref).then(message_body => {
        send_sms(num, 'A new delivery is available!\n' + message_body);
        send_sms(num, 'This offer will expire in ' + (order_time_out/60000) + ' minutes.\n'+'Respond "Y" to accept, or "N" to reject');
        return null;
    }).catch(err =>{
        console.log(err);
    });
}




async function assign_courier (courier_id, order_id) {
    order_ref = admin.database().ref('/current_orders/'+order_id)
    order_ref.child("courier_id").set(courier_id);
    order_ref.child("status").set("assigned");
    courier_order_ref = admin.database().ref('/couriers/'+courier_id+"/current_orders/");
    courier_order_ref.child(order_id).set("assigned");

    
    Promise.all([get_courier_num(courier_id), create_message_body_from_order_ref(order_ref)]).then((values) => {
        console.log("num: " + values[0] + " \nbody: " + values[1]);
        send_sms(values[0], 'New order assigned: \n' + values[1]);
        return null
    }).catch (err =>{
        console.log(err);
    })

    return null;
    // order.status = "assigned";
}

async function un_assign_courier (courier_id, order_id) {
    console.log("Unassigning order (" + order_id + ") from courier (" + courier_id + ")")
    order_ref = admin.database().ref('/current_orders/'+order_id)
    order_ref.child("courier_id").remove();
    order_ref.child("status").set("none");
    courier_order_ref = admin.database().ref('/couriers/'+courier_id+"/current_orders/");
    courier_order_ref.child(order_id).remove();
}

async function get_courier_num (courier_id) {
    return admin.database().ref('/couriers/'+courier_id).once("value").then (snap =>{
        courier_object = snap.val();
        courier_num = courier_object["phone"];
        console.log("courier_phone: " + courier_num);
        return courier_num;
    }).catch(err =>{
        console.log(err);
    });
}

async function create_message_body_from_order_ref (order_ref) {
    return order_ref.once("value").then(snap => {
        order = snap.val();
        console.log("status: ");
        console.log(order["status"]);
        console.log("courier_id: ");
        console.log(order["courier_id"]);

        dorm_num = order["dorm_to_num"];
        // console.log("dorm_num: " + dorm_num);
        var sms_body = "\nRoom #: " + dorm_num + ", " + order["dorm"] + "\n";
        
        sms_body += "\nNotes: \n" + order["notes"] + "\n";
        sms_body += "\nItems: \n"
        temp_cart = order["cart"];

        for (item_id in temp_cart) {
            if (temp_cart.hasOwnProperty(item_id)){
                sms_body += item_id + " [x" + temp_cart[item_id] + ']\n';
            }
        }
        console.log("sms_body: " + sms_body);
        return sms_body;
    }).catch (err => {
        console.log(err);
    });
}
// to do 
// function: handle sms responses
// yes/no for assigning
// confirmation of drop-off

// handle payouts of couriers (keep track of what they are owed, and manually send venmo)
    // when a drop-off is confirmed, send a notification to me (via text), and make a log of the order in the courier's history