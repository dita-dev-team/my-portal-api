const database = require('./abstract.database');
let parentCollection = database.collection('calendar');

exports.fetchCalendarEvents = async () => {
    /*   let documentArray = [];
       let eventsArray = [];
       let parentDocuments = await parentCollection.get();
       parentDocuments.forEach(documents =>{
           documentArray.push(documents.id); //Events id, found on the first id.
       })
       let references = parentCollection.doc(documentArray[0]);
       references.getCollections().then(collections => {
           collections.forEach(async collection => {
               console.log("Found subcollection: ",collection.id);
               let documents = await collection.get();
               console.log(documents);
               documents.forEach(doc=>{
                   console.log(doc.data())
                   return eventsArray.push(doc.data());
               })
           })
       })*/
    try {
        let documentsArray = [];
        let fetchedParentDocuments = await parentCollection.get();
        fetchedParentDocuments.forEach(documents => {
            documentsArray.push(documents.id);
        });
        let eventsParentDocument = parentCollection.doc(documentsArray[0]);
        let eventSubCollection = await eventsParentDocument.getCollections();
        /*let collection = await eventSubCollection.forEach(async subCollection => {
            let documents = await subCollection.get();
        });*/
        return await eventSubCollection[0].get();

    } catch (e) {
        console.error("Error Fetching Calendar Events", e.message);
    }
}
