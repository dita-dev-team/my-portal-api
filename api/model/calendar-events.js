const database = require('./abstract.database');
let parentCollection = database.collection('calendar');

exports.fetchCalendarEvents = async () => {
    let references = parentCollection.doc('dCGAqIFz6LHNhpBcisqX');
    references.getCollections().then(collections => {
        collections.forEach(async collection => {
            console.log("Found subcollection: ",collection.id);

            let documents = await collection.get();
            console.log(documents);
            documents.forEach(doc=>{
                console.log(doc.data())
            })
        })
    })
}
