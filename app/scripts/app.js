import Store from './store.js'
import Calendar from './calendar.js'
import UI from './ui.js'
import {testEvents} from './testEvents.js'
import {arrToMapJs,mapToArrJs} from './tools.js'

class App {
    constructor(){
        this.store = new Store()
        this.initStore()

        this.calendar = new Calendar(this.store.getCalendar())
        this.ui = new UI()
        this.setEventListeners()
        this.state = {
            activeId: null,
            year: null,
            month: null,
            calendar: null
        }
        this.renderCurrentMonth()
    }

    initStore(){
        if(!this.store.getCalendar()){
            this.store.saveCalendar(arrToMapJs(testEvents))
        } 
    }

    setEventListeners(){
        document.querySelector(this.ui.getSelectors().todayBtn).addEventListener('click',this.renderCurrentMonth)
        document.querySelector(this.ui.getSelectors().nextMonthBtn).addEventListener('click',this.renderNextMonth)
        document.querySelector(this.ui.getSelectors().previousMonthBtn).addEventListener('click',this.renderPreviousMonth)
        document.querySelector(this.ui.getSelectors().calendarContainer).addEventListener('click',this.editDay)
        document.querySelector(this.ui.getSelectors().calendarContainer).addEventListener('keydown',this.processKey)

        document.addEventListener('click',this.watchOutFormClick)

        //edit form
        document.querySelector(this.ui.getSelectors().editEventForm).querySelector('[data-calendar*="Close"]').addEventListener('click',this.processCloseForm)
        document.querySelector(this.ui.getSelectors().editEventForm).querySelector('[data-calendar*="Save"]').addEventListener('click',this.processSaveEditEventForm)
        document.querySelector(this.ui.getSelectors().editEventForm).querySelector('[data-calendar*="Delete"]').addEventListener('click',this.processRemoveEditEventForm)

        //create form
        document.querySelector(this.ui.getSelectors().createEventForm).querySelector('[data-calendar*="Close"]').addEventListener('click',this.processCloseForm)
        document.querySelector(this.ui.getSelectors().createEventForm).querySelector('[data-calendar*="Save"]').addEventListener('click',this.processSaveCreateEventForm)

        //quick form
        document.querySelector(this.ui.getSelectors().quickAddBtn).addEventListener('click',this.quickAddEvent)
        document.querySelector(this.ui.getSelectors().quickEventForm).querySelector('[data-calendar*="Close"]').addEventListener('click',this.processCloseForm)
        document.querySelector(this.ui.getSelectors().quickEventForm).querySelector('[data-calendar*="Create"]').addEventListener('click',this.processQuickForm)        

        //search
        document.querySelector(this.ui.getSelectors().search).addEventListener('input', this.startSearch)
        document.querySelector(this.ui.getSelectors().search).addEventListener('focus', this.processFocusInSearch)
        document.querySelector(this.ui.getSelectors().search).addEventListener('blur', this.ui.hideSearchResults)
        document.querySelector(this.ui.getSelectors().searchResult).addEventListener('mousedown', (e) => e.preventDefault())
        document.querySelector(this.ui.getSelectors().searchResult).addEventListener('click', this.selectSearchResult)


    }

    processCloseForm = () => {
        if(this.ui.getOpenForm()){
            console.log('close',this.ui.getOpenForm())
            this.ui.setDayInactive(this.state.activeId)
            this.ui.closeOpenForm()
        }

    }

    processKey = (e) => {
        const code = e.which
        if (code === 9 && this.ui.getOpenForm()) this.processCloseForm()
        if (code === 13 || code === 32) this.editDay(e)
    }

    selectSearchResult = (e) => {
        
        const inputEl = document.querySelector(this.ui.getSelectors().search)

        const itemEl = e.target.closest(this.ui.getSelectors().dayId)
        if(!itemEl) return
        e.stopPropagation()
        const id = itemEl.dataset.calendarId
        inputEl.blur()
        this.goToDay(id)
        
    }

    goToDay = (id) => {
        const dateObj = this.calendar.stringToDate(id)
        const nextYM = {year: dateObj.year, month: dateObj.month}
        const dateLabel = this.calendar.getMonthName(nextYM.month) + ' ' + nextYM.year

        const days = this.calendar.getCalendar(nextYM)
        this.ui.renderMonth(days)
        this.ui.updateLabel(dateLabel)
        this.state = {...this.state,...nextYM, calendar: days} 

        this.editDayById(id)
    }    

    processFocusInSearch = () => {
        this.ui.showSearchResults()
        this.startSearch()
    } 


    startSearch = ()  => {
        const searchInput = document.querySelector(this.ui.getSelectors().search)
        const events = this.calendar.searchEvent(searchInput.value)

        this.ui.renderSearchResults(events)
    }
  
    processQuickForm = () => {

        const formEl = document.querySelector(this.ui.getSelectors().quickEventForm)
        const inputEl = formEl.querySelector('[data-calendar*="Input"]')
        const labelEl = formEl.querySelector('[data-calendar*="Label"]')
        const result = inputEl.value.match(/^\s*(\d{1,2})\s+([а-яА-Я]+)\s*,\s*(.+)/i)

        function setError(error) {
            labelEl.innerHTML = error
            inputEl.classList.add('error')
            labelEl.classList.remove('success', 'hide')
            labelEl.classList.add('error')
        }
        function parseMonth(str) {
            const month = {
                января: 1,
                февраля: 2,
                марта: 3,
                апреля: 4,
                мая: 5,
                июня: 6,
                июля: 7,
                августа: 8,
                сентября: 9,
                октября: 10,
                ноября: 11,
                декабря: 12
            }
            if (month[str]) return month[str]
            return false
        }
        if (inputEl.value === '') {
            setError('Опишите событие')
            return
        }
        if (!result || !parseMonth(result[2])) {
            setError('Введите событие в правильном формате')
            return
        }
        const id = this.calendar.dateToString(this.state.year,parseMonth(result[2]),result[1])

        if (!this.calendar.validDate(this.state.year,parseMonth(result[2]),result[1])) {
            setError('Такой даты не существует')
            return
        }
        if (this.calendar.getEventById(id)) {
            setError('На этот день уже что-то запланировано')
            return
        }

        const newEvent = {
            id: id,
            date: id,
            title: inputEl.value,
            people: '',
            description: ''            
        }

        this.calendar.createEvent(newEvent)

        this.store.createEvent(newEvent)

        this.processCloseForm()
        const dateObj = this.calendar.stringToDate(id)
        if(this.state.calendar.some((day)=>day.id == id))this.updateMonth()    
    
    }

    processSaveEditEventForm = () => {
        
        const formEl = document.querySelector(this.ui.getSelectors().editEventForm)
        const inputDesc = formEl.querySelector('[data-calendar*="InputDesc"]')
        const id = this.state.activeId
        const event = this.calendar.getEventById(id)

        const newEvent = {...event,description: inputDesc.value}
        this.calendar.createEvent(newEvent)
        this.store.updateEvent(newEvent)
        this.processCloseForm()
    }

    processSaveCreateEventForm = () => {
        
        const formEl = document.querySelector(this.ui.getSelectors().createEventForm)
        const inputDesc = formEl.querySelector('[data-calendar*="InputDesc"]')
        const inputWhat = formEl.querySelector('[data-calendar*="InputWhat"]')
        const inputWho = formEl.querySelector('[data-calendar*="InputWho"]')
        const labelWhat = formEl.querySelector('[data-calendar*="LabelWhat"]')

        if(inputWhat.value === ''){
            labelWhat.classList.remove('hide')
            inputWhat.classList.add('error')
            labelWhat.innerHTML = 'Введите название события'
            return
        }

        const id = this.state.activeId

        const newEvent = {
            id: id,
            date: id,
            title: inputWhat.value,
            people: inputWho.value,
            description: inputDesc.value             
        }
        this.calendar.createEvent(newEvent)
        this.store.createEvent(newEvent)
        this.processCloseForm()
        const dateObj = this.calendar.stringToDate(id)
        if(this.state.calendar.some((day)=>day.id == id))this.updateMonth()  
    }    

    processRemoveEditEventForm = () => {
        
        const id = this.state.activeId
        this.calendar.removeEvent(id)
        this.store.removeEvent(id)
        this.processCloseForm()
        const dateObj = this.calendar.stringToDate(id)
        if(this.state.calendar.some((day)=>day.id == id))this.updateMonth()  
        
    }    

    watchOutFormClick = (e) => {
        
        if(this.ui.getOpenForm()){

            if(!e.target.closest(this.ui.getSelectors()[this.ui.getOpenForm()]))this.processCloseForm()
        }

    }

    quickAddEvent = (e) => {
        e.stopPropagation()
        this.processCloseForm()
        this.ui.openQuickForm()
  
    }

    editDayById = (id) => {
        const container = document.querySelector(this.ui.getSelectors().calendarContainer)
        const day = container.querySelector(this.ui.getSelectors().haveId(id))
        if(!day)return false
        
        this.state = {...this.state,activeId: id}
        this.processCloseForm()
        this.ui.setDayActive(id)

        const event = this.calendar.getEventById(id)
        if(event){
            const dateObj = this.calendar.stringToDate(id)
            const genitiveDate = dateObj.day + ' ' + this.calendar.getMonthGenitiveName(dateObj.month)
            this.ui.openEditEventForm({dayEl: day,event,genitiveDate})
        }
        else this.ui.openCreateEventForm(day)
    }

    editDay = (e) => {

        const day = e.target.closest(this.ui.getSelectors().dayId)

        if (!day) return
        this.processCloseForm()
        const id = day.dataset.calendarId
        const event = this.calendar.getEventById(id)
        this.state = {...this.state,activeId: id}
        this.ui.setDayActive(id)


        if(event){
            const dateObj = this.calendar.stringToDate(id)
            const genitiveDate = dateObj.day + ' ' + this.calendar.getMonthGenitiveName(dateObj.month)
            this.ui.openEditEventForm({dayEl: day,event,genitiveDate})
        }
        else this.ui.openCreateEventForm(day)

        e.stopPropagation()

    }


    updateMonth = () => {
        const YM = {year: this.state.year, month: this.state.month}
        const days = this.calendar.getCalendar(YM)
        this.ui.renderMonth(days)
      
    }

    renderCurrentMonth = () => {
        const currentYM = this.calendar.getCurrentYearMonth()
        const dateLabel = this.calendar.getMonthName(currentYM.month) + ' ' + currentYM.year
        const days = this.calendar.getCalendar(currentYM)
        this.ui.renderMonth(days)
        this.ui.updateLabel(dateLabel)
        this.state = {...this.state,...currentYM, calendar: days}

    }
    renderNextMonth = () => {        
        const nextYM = this.calendar.getNextYearMonth({year: this.state.year, month: this.state.month})
        const dateLabel = this.calendar.getMonthName(nextYM.month) + ' ' + nextYM.year
        const days = this.calendar.getCalendar(nextYM)
        this.ui.renderMonth(days)
        this.ui.updateLabel(dateLabel)
        this.state = {...this.state,...nextYM, calendar: days}        
    }
    renderPreviousMonth = () => {
        const prevYM = this.calendar.getPreviousYearMonth({year: this.state.year, month: this.state.month})
        const dateLabel = this.calendar.getMonthName(prevYM.month) + ' ' + prevYM.year
        const days = this.calendar.getCalendar(prevYM)
        this.ui.renderMonth(days)
        this.ui.updateLabel(dateLabel)
        this.state = {...this.state,...prevYM, calendar: days}    
    }  

}

const app = new App()