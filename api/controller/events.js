const calendarEventsModel = require('../model/calendar-events');
const moment = require('moment');
exports.fetchEvents = async (req, res, next) => {
    try {
        const fetchedEvents = await calendarEventsModel.fetchCalendarEvents();
        let fetched = [];
        if (fetchedEvents.empty) {
            return res.status(404).send({
                message: 'No Calendar events found in the Database'
            })
        }
        fetchedEvents.forEach(documents => {
            fetched.push(documents.data());
        });
        console.log(fetched);
        const parsedEvents = await fetched.map(event => {
            return {
                description: event.description,
                startDate: moment(event.start_date.startDate).format('DD/MM/YYYY HH:mm'),
                endDate: moment(event.end_date).format("DD/MM/YYYY HH:mm")
            }
        })
        return res.status(200).send({
            message: 'Fetched Calendar Events',
            events: parsedEvents
        })
    } catch (e) {
        return res.status(500).send({
            message: 'Internal Server Error',
            error: e.message
        })
    }
}