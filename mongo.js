
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://alialsadadi:alooi999@sensors.if8yehy.mongodb.net/?retryWrites=true&w=majority";
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function mongo() {
    try {
        await client.connect();
        const database = client.db("door");
        const collection = database.collection('door');
        const d = new Date();
        const date = d.getUTCDate();
        const month = d.getUTCMonth();
        const last_opened = (await collection.find({ action: 'Open' }).sort({ _id: -1 }).limit(1).toArray());
        const time24Hour = last_opened[0].time;
        const [hours, minutes, seconds] = time24Hour.split(":");
        const convert = new Date();
        convert.setHours(hours);
        convert.setMinutes(minutes);
        convert.setSeconds(seconds);
        const time12Hour = convert.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true
        });
        const last_month = (await collection.find({ month: month, action: 'Open' }).toArray()).length;
        const this_month = (await collection.find({ month: month + 1, action: 'Open' }).toArray()).length;
        const yesterday = (await collection.find({ day: d.getUTCDate() - 1, action: 'Open' }).toArray()).length;
        const today = (await collection.find({ day: date, month: month + 1, action: 'Open' }).toArray()).length;
        return {
            'weekday': weekday[d.getUTCDay()], 'date': date, 'monthName': months[month], 'thisMonth': this_month
            , 'today': today, 'yesterday': yesterday, 'last_month': last_month, lastMonthName: months[month - 1], 'last_open': [last_opened[0].month, last_opened[0].day, time12Hour]
        };
    } finally {
        await client.close();
    }
}
module.exports = mongo;
