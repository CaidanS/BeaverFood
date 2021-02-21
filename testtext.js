
    const accountSid = "AC3045fe88e0d9327c49cf1607148f04fd";
    const authToken = "088a4cfd72315278c7ba495728825ea3";
    const client = require('twilio')(accountSid, authToken);
function test() {
    client.messages
    .create({
        body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
        from: '+13345601937',
        to: '+15033093646'
        
    })
    .then(message => {
        console.log(message.sid)
        return null;
    });
}
