module.exports = class Utils {
    chunk(array, size) {
        // To avoid sending too much data to firebase during tests
        if (process.env.NODE_ENV === 'test') {
            return [array.slice(0, 10)]
        }

        const chunked_arr = [];
        let index = 0;
        while (index < array.length) {
            chunked_arr.push(array.slice(index, size + index));
            index += size;
        }

        return chunked_arr;
    }

    async deleteQueryBatch(db, query, batchSize) {
        let snapshot = await query.get();
        if (!snapshot.size || snapshot.size === 0) {
            return 0;
        }

        let batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        snapshot = await batch.commit();

        let numDeleted = snapshot.size;
        if (numDeleted === 0) {
            return;
        }

        process.nextTick(async () => {
            await this.deleteQueryBatch(db, query, batchSize);
        })
    }
}