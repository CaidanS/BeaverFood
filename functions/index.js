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


// admin.initializeApp();

var config = {
    projectId: 'beavereats',
    apiKey: "AIzaSyB5ZVLbni8ERY-IknnVnN2uKjmJUIqAkZA",
    authDomain: "beavereats.firebaseapp.com",
    databaseURL: "https://beavereats.firebaseio.com/",
    storageBucket: "beavereats.appspot.com/"
};

const admin = require('firebase-admin');
admin.initializeApp();
database = admin.database().ref();



async function charge(req, res) {
    console.log("TEST");
    const body = JSON.parse(req.body);
    const token = body.token.id;
    var amount = body.charge.amount;
    console.log(amount);
    const currency = body.charge.currency;
    const cart = body.cart;
    // Calculate Charge
    var resturants_ref = admin.database().ref('/restaurants');
    var price_sum = 0;

    resturants_ref.once('value').then( (snap) => {
        restaurants = snap.val();
        master_menu = {};
        console.log("restaurants: ");
        console.log(restaurants);
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
            console.log("_price_sum: ");
            console.log(_price_sum*100);
            // var amount = _price_sum;
            console.log("amount: --");
            console.log(amount);
            _charge = stripe.charges.create({
                amount: (_price_sum*100),
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

        const order = {
            status: "open",
            cart: cart,
            total: price_sum,
            courier_phone: "none",
        };

        var new_order_ref = orders_ref.push();
        // current_time = Date.now();
        // delivery_window = "delivery_window--";
        // time_created: current_time,
        //     window_to_deliver: delivery_window,
        //             courier_id: "none",

        new_order_ref.set({
            status: "open",
            cart: cart,
            courier_phone: "none",
            courier_id: "none"
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
app.post('/', (req, res) => {
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
const accountSid = "AC3045fe88e0d9327c49cf1607148f04fd";
const authToken = "088a4cfd72315278c7ba495728825ea3";
const client = require('twilio')(accountSid, authToken);

// function handle_courier_text (message) {
//     client.messages.create({
//         body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
//         from: '+13345601937',
//         to: '+15033093646' 
//     }).then(message => {
//         console.log(message.sid)
//         return null;
//     }).catch (err => {
//         console.log(err);
//     });
// }

admin.database().ref('/current_orders/')


exports.sms = functions.database.ref("/current_orders/").onWrite( (snap, context) => {
    client.messages.create({
        body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
        from: '+13345601937',
        to: '+15033093646' 
    }).then(message => {
        console.log(message.sid)
        return null;
    }).catch (err => {
        console.log(err);
    });
    return null
});