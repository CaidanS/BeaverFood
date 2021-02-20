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

// const admin = require('firebase-admin');
// admin.initializeApp();
// database = admin.database().ref();


function charge(req, res) {
    const body = JSON.parse(req.body);
    const token = body.token.id;
    const amount = body.charge.amount;
    const currency = body.charge.currency;

    // Charge card
    stripe.charges.create({
        amount,
        currency,
        description: 'Firebase Example',
        source: token,
    }).then(charge => {
        send(res, 200, {
            message: 'Success',
            charge,
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




// Get a reference to the database service
// var database = admin.database();

// I know this is a bad idea to query the whole db, but I'm lazy

// function charge(req, res) {
//     const body = JSON.parse(req.body);
//     const token = body.token.id;
//     const amount = body.charge.amount;
//     const currency = body.charge.currency;

//     // Charge card
//     stripe.charges.create({
//         amount,
//         currency,
//         description: 'Firebase Example',
//         source: token,
//     }).then(charge => {
//         send(res, 200, {
//             message: 'Success',
//             charge,
//         });
//         return null;
//     }).catch(err => {
//         console.log(err);
//         send(res, 500, {
//             error: err.message,
//         });
//     });
// }

// function send(res, code, body) {
//     res.send({
//         statusCode: code,
//         headers: {'Access-Control-Allow-Origin': '*'},
//         body: JSON.stringify(body),
//     });
// }

// app.use(cors);
// app.post('/', (req, res) => {

//     // Catch any unexpected errors to prevent crashing
//     try {
//         charge(req, res);
//     } catch(e) {
//         console.log(e);
//         send(res, 500, {
//             error: `The server received an unexpected error. Please try again and contact the site admin if the error persists.`,
//         });
//     }
// });

// exports.charge = functions.https.onRequest(app);

// TODO: Remember to set token using >> firebase functions:config:set stripe.token="SECRET_STRIPE_TOKEN_HERE"
// const stripe = require('stripe')(functions.config().stripe.token);
// console.log("TEST0-")
// async function stripePaymentHandler(token, amount, currency){
//     stripe.charges.create({
//         amount,
//         currency,
//         description: 'beavereats--test',
//         source: token,
//     }).then(charge => {
//         send(res, 200, {
//             message: 'Success',
//             charge,
//         });
//         //  Update current orders
//         // var orders_ref = admin.database().ref('/current_orders/');
//         // const order = {
//         //   status:"open",
//         //   cart:cart,
//         //   courier_phone:"none",
//         // };
//         // var new_order_ref = orders_ref.push();
//         // new_order_ref.set({
//         //   name:"test"
//         // });
//         return null;
//     }).catch(err => {
//         console.log(err);
//         send(res, 500, {
//             error: err.message,
//         });
//     });
// }



// // app.listen(4242, () => console.log(`Listening on port ${4242}!`));
// // exports.charge = functions.https.onRequest(app);


// // app.use(cors);
// // app.post('/', (req, res) => {

// //     // Catch any unexpected errors to prevent crashing
// //     try {
// //         charge(req, res);
// //     } catch(e) {
// //         console.log(e);
// //         send(res, 500, {
// //             error: `The server received an unexpected error. Please try again and contact the site admin if the error persists.`,
// //         });
// //     }
// // });






// // // const functions = require('firebase-functions');
// // // // const express = require('express');
// // // // // Create and Deploy Your First Cloud Functions
// // // // // https://firebase.google.com/docs/functions/write-firebase-functions

// // // // const app = express();


// // // // exports.helloWorld = functions.https.onRequest((request, response) => {
// // // //   // functions.logger.info("Hello logs!", {structuredData: true});
// // // //   response.send("Hello from Firebase!");
// // // // });


// // // const express = require("express");
// // // const app = express();
// // // const { resolve } = require("path");


// // // // STRIPE STUFF
// // // // This is your real test secret API key.
// // // const stripe = require("stripe")("sk_test_51HelX0EDvQ8GmoM0aB7xY6ragvxhH656AoVAywUn9EGG5SGpE3OcsaBNWoJKl0Ao21akoPuB1mzvkStDC8uwSG5D00VcgUrIX7");
// // // app.use(express.static("."));
// // // app.use(express.json());
// // // const calculateOrderAmount = items => {
// // //   // Replace this constant with a calculation of the order's amount
// // //   // Calculate the order total on the server to prevent
// // //   // people from directly manipulating the amount on the client
// // //   return 1400;
// // // };


// // // app.post("/create-payment-intent", async (req, res) => {
// // //   const { items } = req.body;
// // //   // Create a PaymentIntent with the order amount and currency
// // //   const paymentIntent = await stripe.paymentIntents.create({
// // //     amount: calculateOrderAmount(items),
// // //     currency: "usd"
// // //   });
// // //   res.send({
// // //     clientSecret: paymentIntent.client_secret
// // //   });
// // // });


// // 'use strict';

// // const functions = require('firebase-functions');
// // const admin = require('firebase-admin');
// // admin.initializeApp();

// // const stripe = require('stripe')('sk_test_51HelX0EDvQ8GmoM0aB7xY6ragvxhH656AoVAywUn9EGG5SGpE3OcsaBNWoJKl0Ao21akoPuB1mzvkStDC8uwSG5D00VcgUrIX7');


// // /**
// //  * When a user is created, create a Stripe customer object for them.
// //  *
// //  * @see https://stripe.com/docs/payments/save-and-reuse#web-create-customer
// //  */
// // exports.createStripeCustomer = functions.auth.user().onCreate(async (user) => {
// //   const customer = await stripe.customers.create({ email: user.email });
// //   const intent = await stripe.setupIntents.create({
// //     customer: customer.id,
// //   });
// //   await admin.firestore().collection('stripe_customers').doc(user.uid).set({
// //     customer_id: customer.id,
// //     setup_secret: intent.client_secret,
// //   });
// //   return;
// // });

// // const stripe = require('stripe')('sk_test_51HelX0EDvQ8GmoM0aB7xY6ragvxhH656AoVAywUn9EGG5SGpE3OcsaBNWoJKl0Ao21akoPuB1mzvkStDC8uwSG5D00VcgUrIX7');

// // const account = await stripe.accounts.create({
// //   type: 'custom',
// //   country: 'US',
// //   email: 'jenny.rosen@example.com',
// //   capabilities: {
// //     card_payments: {requested: true},
// //     transfers: {requested: true},
// //   },
// // });


// // /**
// //  * When adding the payment method ID on the client,
// //  * this function is triggered to retrieve the payment method details.
// //  */
// // exports.addPaymentMethodDetails = functions.firestore
// //   .document('/stripe_customers/{userId}/payment_methods/{pushId}')
// //   .onCreate(async (snap, context) => {
// //     try {
// //       const paymentMethodId = snap.data().id;
// //       const paymentMethod = await stripe.paymentMethods.retrieve(
// //         paymentMethodId
// //       );
// //       await snap.ref.set(paymentMethod);
// //       // Create a new SetupIntent so the customer can add a new method next time.
// //       const intent = await stripe.setupIntents.create({
// //         customer: paymentMethod.customer,
// //       });
// //       await snap.ref.parent.parent.set(
// //         {
// //           setup_secret: intent.client_secret,
// //         },
// //         { merge: true }
// //       );
// //       return;
// //     } catch (error) {
// //       await snap.ref.set({ error: userFacingMessage(error) }, { merge: true });
// //       await reportError(error, { user: context.params.userId });
// //     }
// //   });

// // /**
// //  * When a payment document is written on the client,
// //  * this function is triggered to create the payment in Stripe.
// //  *
// //  * @see https://stripe.com/docs/payments/save-and-reuse#web-create-payment-intent-off-session
// //  */

// // // [START chargecustomer]

// // exports.createStripePayment = functions.firestore
// //   .document('stripe_customers/{userId}/payments/{pushId}')
// //   .onCreate(async (snap, context) => {
// //     const { amount, currency, payment_method } = snap.data();
// //     try {
// //       // Look up the Stripe customer id.
// //       const customer = (await snap.ref.parent.parent.get()).data().customer_id;
// //       // Create a charge using the pushId as the idempotency key
// //       // to protect against double charges.
// //       const idempotencyKey = context.params.pushId;
// //       const payment = await stripe.paymentIntents.create(
// //         {
// //           amount,
// //           currency,
// //           customer,
// //           payment_method,
// //           off_session: false,
// //           confirm: true,
// //           confirmation_method: 'manual',
// //         },
// //         { idempotencyKey }
// //       );
// //       // If the result is successful, write it back to the database.
// //       await snap.ref.set(payment);
// //     } catch (error) {
// //       // We want to capture errors and render them in a user-friendly way, while
// //       // still logging an exception with StackDriver
// //       console.log(error);
// //       await snap.ref.set({ error: userFacingMessage(error) }, { merge: true });
// //       await reportError(error, { user: context.params.userId });
// //     }
// //   });

// // // [END chargecustomer]

// // /**
// //  * When 3D Secure is performed, we need to reconfirm the payment
// //  * after authentication has been performed.
// //  *
// //  * @see https://stripe.com/docs/payments/accept-a-payment-synchronously#web-confirm-payment
// //  */
// // exports.confirmStripePayment = functions.firestore
// //   .document('stripe_customers/{userId}/payments/{pushId}')
// //   .onUpdate(async (change, context) => {
// //     if (change.after.data().status === 'requires_confirmation') {
// //       const payment = await stripe.paymentIntents.confirm(
// //         change.after.data().id
// //       );
// //       change.after.ref.set(payment);
// //     }
// //   });

// // /**
// //  * When a user deletes their account, clean up after them
// //  */
// // exports.cleanupUser = functions.auth.user().onDelete(async (user) => {
// //   const dbRef = admin.firestore().collection('stripe_customers');
// //   const customer = (await dbRef.doc(user.uid).get()).data();
// //   await stripe.customers.del(customer.customer_id);
// //   // Delete the customers payments & payment methods in firestore.
// //   const snapshot = await dbRef
// //     .doc(user.uid)
// //     .collection('payment_methods')
// //     .get();
// //   snapshot.forEach((snap) => snap.ref.delete());
// //   await dbRef.doc(user.uid).delete();
// //   return;
// // });

// // /**
// //  * To keep on top of errors, we should raise a verbose error report with Stackdriver rather
// //  * than simply relying on console.error. This will calculate users affected + send you email
// //  * alerts, if you've opted into receiving them.
// //  */

// // // [START reporterror]

// // function reportError(err, context = {}) {
// //   // This is the name of the StackDriver log stream that will receive the log
// //   // entry. This name can be any valid log stream name, but must contain "err"
// //   // in order for the error to be picked up by StackDriver Error Reporting.
// //   const logName = 'errors';
// //   const log = logging.log(logName);

// //   // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
// //   const metadata = {
// //     resource: {
// //       type: 'cloud_function',
// //       labels: { function_name: process.env.FUNCTION_NAME },
// //     },
// //   };

// //   // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
// //   const errorEvent = {
// //     message: err.stack,
// //     serviceContext: {
// //       service: process.env.FUNCTION_NAME,
// //       resourceType: 'cloud_function',
// //     },
// //     context: context,
// //   };

// //   // Write the error log entry
// //   return new Promise((resolve, reject) => {
// //     log.write(log.entry(metadata, errorEvent), (error) => {
// //       if (error) {
// //         return reject(error);
// //       }
// //       return resolve();
// //     });
// //   });
// // }

// // // [END reporterror]

// // /**
// //  * Sanitize the error message for the user.
// //  */
// // function userFacingMessage(error) {
// //   return error.type
// //     ? error.message
// //     : 'An error occurred, developers have been alerted';
// // }