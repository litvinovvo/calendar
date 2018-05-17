export default class Store {

    getCalendar(){
        if (localStorage.getItem('calendar')) return JSON.parse(localStorage.getItem('calendar'))
        else return null        
    }

    saveCalendar(calendar){
        localStorage.setItem('calendar', JSON.stringify(calendar))
    }
    
    removeEvent(id){
        const calendar = JSON.parse(localStorage.getItem('calendar'))
        delete calendar[id]
        localStorage.setItem('calendar', JSON.stringify(calendar))
    }

    createEvent(event){
        const calendar = JSON.parse(localStorage.getItem('calendar'))
        calendar[event.id] = event
        localStorage.setItem('calendar', JSON.stringify(calendar))
    }

    updateEvent(event){
        const calendar = JSON.parse(localStorage.getItem('calendar'))
        calendar[event.id] = event
        localStorage.setItem('calendar', JSON.stringify(calendar))
    }      

}