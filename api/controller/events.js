const calendarEventsModel = require('../model/calendar-events');

exports.fetchEvents = async (req, res, next) => {
    try{
       let eventsHandler = await calendarEventsModel.fetchCalendarEvents();
       return res.status(200).send({
           body:{
               eventsHandler
           }
       })
    }catch (e) {
        return res.status(500).send({
            message: 'Internal Server Error',
            error: e.message
        })
    }
}