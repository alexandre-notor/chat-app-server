import { createServer } from 'http';
import { connect, model, Schema } from 'mongoose';

await connect(process.env.MONGODB_URl + "/chat_app");


const messageSchema = new Schema({
    texte: String,
    temps: {
        type: Number,
        default: () => parseInt(Date.now() / 1000)
    }
});

const message = model('messages', messageSchema);

//function pour la sauvegarde des Messages
function saveMessage(data) {
    let [key, value] = data.toString('utf-8').replace(/\+/g, ' ').split('=');
    if (key === 'message') value = decodeURIComponent(value);

    try {
        const m = new message({ texte: value });
        m.save();

    } catch (e) {
        console.log("Echec de l'enresgistrement du message");
    }
}

// funtion pour la lecture des messages
function readMessage(index) {
    try {
        const data = [];
        message.find().skip(index).forEach(el => data.push(el.texte));
        return JSON.stringify({ messages: data });

    } catch (e) {
        console.log(e);
        console.log("Echec de le lecture des message");
        return JSON.stringify({ messages: [] });
    }
}

const server = createServer();

server.on("request", (req, res) => {
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "*")
    res.setHeader("Access-Control-Allow-Origin", "*")
    if (req.url == '/put') {
        req.on('data', (data) => saveMessage(data));
        res.statusCode = 200
    } else if (req.url && req.url.split('?')[0] == '/get') {
        let params = req.url.match(/(?<=\?last=)\d+/);
        params = params ? parseInt(params) : 0;
        res.setHeader("Content-Type", "Application/json");
        res.statusCode = 200;
        res.write(readMessage(params));
    } else {
        res.statusCode = 400
    }
    res.end();
})


server.listen(process.env.PORT || 3010, () => console.log("Server start at port" + (process.env.PORT || 3010)));
