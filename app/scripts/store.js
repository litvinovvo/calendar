export default class Store {

    getCalendar(){
        if (localStorage.getItem('calendar')) return JSON.parse(localStorage.getItem('calendar'))
        else return null        
    }

    saveCalendar(calendar){
        localStorage.setItem('calendar', JSON.stringify(calendar))
    } 

}