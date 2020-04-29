const fs = require("fs");
const MongoClient = require("mongodb");

const renameProp = (oldProp, newProp, { [oldProp]: old, ...others }) => {
    return { [newProp]: old, ...others };
};

function importData() {
    // const categories = loadDataFromFile("db/files/categories.json");
    // const categoriesMongoDb = categories.map((cat) => renameProp("identifier", "_id", cat));
    // saveData(categoriesMongoDb, "categories");

    // const countries = loadDataFromFile("db/files/countries.json");
    // const countriesMongoDb = countries.map((country) => renameProp("iso", "_id", country));
    // saveData(countriesMongoDb, "countries");

    // const competitors = loadDataFromFile("db/files/competitors.json");
    // const competitorsMongoDb = competitors.map((competitor) => renameProp("identifier", "_id", competitor));
    // saveData(competitorsMongoDb, "competitors");

    const videos = loadDataFromFile("db/files/videos.json");
    const videosMongoDb = videos.map((video) => renameProp("identifier", "_id", video));
    saveData(videosMongoDb, "videos");

    // const currentNewsConfig = loadDataFromFile("db/files/currentNewsConfig.json");
    // saveData(currentNewsConfig, "currentNewsConfig");
    // const socialNewsConfig = loadDataFromFile("db/files/socialNewsConfig.json");
    // saveData(socialNewsConfig, "socialNewsConfig");
}

function saveData(data, collection) {
    const dbName = "karateStarsDB";

    // Create a new MongoClient
    const mongoClient = new MongoClient.MongoClient(
        "mongodb+srv://xurxodev:HQqRTif8jRDTFvNz@cluster0-lctpr.mongodb.net/test?retryWrites=true&w=majority",
        { useUnifiedTopology: true }
    );

    // Use connect method to connect to the Server
    mongoClient.connect((errCon, client) => {
        if (errCon) {
            reject(errCon);
        } else {
            const db = client.db(dbName);

            db.collection(collection).insert(data, (err, r) => {
                if (err) {
                    reject(err);
                }

                if (r) {
                    console.log({ r });
                }

                client.close();
            });
        }
    });
}

function loadDataFromFile(fileName) {
    try {
        const data = fs.readFileSync(fileName, "utf8");
        const obj = JSON.parse(data);

        return obj;
    } catch (err) {
        console.error(`An error has ocurred loading file ${fileName}: ${err}`);
    }
}

importData();
