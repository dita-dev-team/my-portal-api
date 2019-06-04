const calendarEventsModel = require('../model/calendar-events');

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
                startDate: process.env.NODE_ENV === 'test' ? event.start_date : event.start_date.toDate(),
                endDate: process.env.NODE_ENV === 'test' ? event.end_date: event.end_date.toDate()
            }
        });
        return res.status(200).send({
            message: 'Fetched Calendar Events',
            events: parsedEvents
        })
    } catch (e) {
        console.log(e.message);
        return res.status(500).send({
            message: 'Internal Server Error',
            error: e.message
        })
    }
};

exports.addCalendarEvents = async (req, res) => {
    try {
        let _this = req.body;
        if (!_this.startDate || !_this.endDate || !_this.description) {
            return res.status(400).send({
                message: 'Invalid Request Body',
                requestBody: {
                    startDate: '<Start Time of The Event>',
                    endDate: '<End Time of the Event>',
                    description: '<Description of the Event>'
                }
            });

        }
        let savedCalendarEvent = await calendarEventsModel.addCalendarEvents(_this.description, _this.startDate, _this.endDate);
        console.log(savedCalendarEvent);
        return res.status(200).send({
            message: 'Event Successfully Added',
            event: savedCalendarEvent
        })
    } catch (e) {
        return res.status(500).send({
            message: 'Internal Server Error<Saving Calendar Events>',
            error: e.message
        })
    }
}