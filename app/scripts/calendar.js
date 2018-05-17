import {arrToMapJs,mapToArrJs} from './tools.js'
export default class Calendar {
    constructor(store = {}){

        this.state = {
            events: {...store}
        }

    }

    createEvent(event){

        this.state.events[event.id] = event

    }

    removeEvent(id){

        delete this.state.events[id]

    }    

    searchEvent(val){

        const str = val.toLowerCase()
        const eventsArr = mapToArrJs(this.state.events)
        const result = []
        eventsArr.forEach((event) => {
            if (~(event.title).toLowerCase().indexOf(str) || ~(event.people).toLowerCase().indexOf(str) || ~(event.description.toLowerCase()).indexOf(str)) {
                const dateObj = this.stringToDate(event.id)
                result.push({
                    id: event.id,
                    date: dateObj.day + ' ' + this.getMonthGenitiveName(dateObj.month),
                    title: event.title
                })
            }
        })
        return result        
    }

    getCurrentYearMonth(){
        return {year: new Date().getFullYear(), month: new Date().getMonth() + 1}
    }

    getNextYearMonth({year,month}){
        const nextDate = new Date(year,month)
        return {year: nextDate.getFullYear(), month: nextDate.getMonth() + 1}
    }

    getPreviousYearMonth({year,month}){
        const prevDate = new Date(year,month - 2)
        return {year: prevDate.getFullYear(), month: prevDate.getMonth() + 1}
    }    

    validDate(year,month,day = 1){
        const date = new Date(year,month - 1,day)

        if(date.getFullYear() !== Number(year) || date.getMonth()+1 !== Number(month) || date.getDate() !== Number(day))return false
        return true
    }

    getCalendar({year,month}){
        if(!this.validDate(year,month)){
            console.error('incorrect date')
            return false
        }

        const daysInMonth = this.getLastDayOfMonth(year,month)
        const daysInPrevMonth = this.getLastDayOfMonth(year,month + 1)

        const daysToFillBefore = this.getDayOfWeek(year,month,1) - 1
        const daysToFillAfter = 7 - this.getDayOfWeek(year,month,daysInMonth)

        const calendar = []
        for(let i=daysInPrevMonth;i+daysToFillBefore > daysInPrevMonth;i--){
            const dayOfWeek = this.getDayOfWeek(year,month-1,i)
            const dateStr = this.dateToString(year,month-1,i) 
            const event = this.state.events[dateStr] ? this.state.events[dateStr] : null      

            calendar.push({
                day: i,
                id: dateStr,
                dayName: this.getDayName(dayOfWeek),
                dayNameShort: this.getShortDayName(dayOfWeek),
                dayOfWeek: dayOfWeek,
                event: event
            })
        }
        for(let i=1;i<=daysInMonth;i++){
            const dayOfWeek = this.getDayOfWeek(year,month,i)
            const dateStr = this.dateToString(year,month,i) 
            const event = this.state.events[dateStr] ? this.state.events[dateStr] : null
            calendar.push({
                day: i,
                id: dateStr,
                dayName: this.getDayName(dayOfWeek),
                dayNameShort: this.getShortDayName(dayOfWeek),                
                dayOfWeek: dayOfWeek,
                event: event
            })
        }
        for(let i=1;i<=daysToFillAfter;i++){
            const dayOfWeek = this.getDayOfWeek(year,month+1,i)
            const dateStr = this.dateToString(year,month+1,i) 
            const event = this.state.events[dateStr] ? this.state.events[dateStr] : null            
            calendar.push({
                day: i,
                id: dateStr,
                dayName: this.getDayName(dayOfWeek),
                dayNameShort: this.getShortDayName(dayOfWeek),
                dayOfWeek: dayOfWeek,
                event: event
            })
        }        
        return calendar

    }

    getMonthGenitiveName(num){
        const month = {
            1: 'января',
            2: 'февраля',
            3: 'марта',
            4: 'апреля',
            5: 'мая',
            6: 'июня',
            7: 'июля',
            8: 'августа',
            9: 'сентября',
            10: 'октября',
            11: 'ноября',
            12: 'декабря'
        }
        return month[num] ? month[num] : false        
    }

    getEventById(id){
        return this.state.events[id] ? this.state.events[id] : null
    }

    getAllEvents(){
        return this.state.events
    }

    dateToString(y,m,d){
        y = y.toString()
        m = m.toString()
        d = d.toString()
        return `${ y }-${ m.length > 1 ? m : '0' + m }-${ d.length > 1 ? d : '0' + d }`
    }

    stringToDate(str){
        const ymd = str.split('-')
        return {
            year: ymd[0],
            month: ymd[1][0] == '0' > 1 ? ymd[1][1] : ymd[1],
            day: ymd[2][0] == '0' > 1 ? ymd[2][1] : ymd[2],
        }
    }    

    getLastDayOfMonth(year, month) {
        const date = new Date(year, month, 0)
        return date.getDate()
    }    
    getDayOfWeek(year,month,day){
        const date = new Date(year,month - 1,day)
        let dayOfWeek = date.getDay()
        if (dayOfWeek === 0) dayOfWeek = 7
        return dayOfWeek    
    }
    getDayName(num){
        const days = {
            7: 'Воскресенье',
            1: 'Понедельник',
            2: 'Вторник',
            3: 'Среда',
            4: 'Четверг',
            5: 'Пятница',
            6: 'Суббота'
        }
        return days[num] ? days[num] : false
    }

    getShortDayName(num){
        const days = {
            7: 'Вс',
            1: 'Пн',
            2: 'Вт',
            3: 'Ср',
            4: 'Чт',
            5: 'Пт',
            6: 'Сб'
        }
        return days[num] ? days[num] : false
    }

    getMonthName(num) {
        const month = {
            1: 'Январь',
            2: 'Февраль',
            3: 'Март',
            4: 'Апрель',
            5: 'Май',
            6: 'Июнь',
            7: 'Июль',
            8: 'Aвгуст',
            9: 'Cентябрь',
            10: 'Октябрь',
            11: 'Ноябрь',
            12: 'Декабрь'
        }
        return month[num] ? month[num] : false
    }        
    
}