import {testEvents} from './testEvents.js'
import {Calendar} from './calendar.js'

const options = {
    events: testEvents,
    container: 'container',
    back: 'back',
    next: 'next',
    today: 'today',
    label: 'label',
    add: 'addEvent',
    search: 'search',
    quickForm: 'quickForm',
    newEventForm: 'newEventForm',
    editEventForm: 'editEventForm'
}
const calendar = new Calendar(options)

calendar.renderMonth(new Date())
