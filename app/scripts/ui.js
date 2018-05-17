export default class UI {
    constructor(){
        this.selectors = {
            calendarContainer: '[data-calendar="container"]',
            todayBtn: '[data-calendar="today"]',
            nextMonthBtn: '[data-calendar="next"]',
            previousMonthBtn: '[data-calendar="back"]',
            quickAddBtn: '[data-calendar="addEvent"]',
            dateLabel: '[data-calendar="label"]',     
            dayId: '[data-calendar-id]',
            haveId: (id) => `[data-calendar-id="${id}"]`,
            editEventForm: '[data-calendar="editEventForm"]',
            createEventForm: '[data-calendar="newEventForm"]',
            quickEventForm: '[data-calendar="quickForm"]',
            search: '[data-calendar="search"]',
            searchResult: '[data-calendar="searchList"]'
        }
        this.state = {
            openForm: false,
            // openId: null
        }

    }
    getOpenForm(){
        return this.state.openForm
    }

    getSelectors(){
        return this.selectors
    }
    updateLabel(label) {
        document.querySelector(this.selectors.dateLabel).innerHTML = label
    }    

    hideSearchResults = () =>{
        const listEl = document.querySelector(this.selectors.searchResult)
        listEl.parentNode.classList.add('hide')
    }

    showSearchResults = () =>{
        const listEl = document.querySelector(this.selectors.searchResult)
        listEl.parentNode.classList.remove('hide')
    }

    

    openEditEventForm({dayEl,event,genitiveDate}){
        const formEl = document.querySelector(this.selectors.editEventForm)
        const whatEl = formEl.querySelector('[data-calendar*="What"]')
        const whenEl = formEl.querySelector('[data-calendar*="When"]')
        const whoEl = formEl.querySelector('[data-calendar*="Who"]')
        const descEl = formEl.querySelector('[data-calendar*="InputDesc"]')
        // console.log(event)

        whatEl.innerHTML = event.title
        whenEl.innerHTML = genitiveDate
        whoEl.innerHTML = event.people
        descEl.value = event.description
        
        this.positionAndShowForm(dayEl,formEl)
        
        this.state = {...this.state,openForm: 'editEventForm'}
    }

    openQuickForm(){
        const formEl = document.querySelector(this.selectors.quickEventForm)
        const btnEl = document.querySelector(this.selectors.quickAddBtn)
        function getCoords(elem) {
            const box = elem.getBoundingClientRect()
            return {
                top: box.top + pageYOffset,
                left: box.left + pageXOffset
            }
        }    
        const coords = getCoords(btnEl)
        let left = coords.left
        if (left < 0) left = 0
        const top = coords.top + 50
        formEl.style.left = left + 'px'
        formEl.style.top = top + 'px'
        formEl.classList.remove('hide')

        this.state = {...this.state,openForm: 'quickEventForm'}
    }

    openCreateEventForm(dayEl){
        const formEl = document.querySelector(this.selectors.createEventForm)

        // console.log(event)
        
        this.positionAndShowForm(dayEl,formEl)
        
        this.state = {...this.state,openForm: 'createEventForm'}
    }    

    closeOpenForm = () => {
        // console.log('in close form',this.selectors[this.state.openForm])
        const formEl = document.querySelector(this.selectors[this.state.openForm])
        if(formEl){
            formEl.classList.add('hide')
            this.resetForm(this.state.openForm)
            // this.setDayInActive(this.state.openId)
            this.state = {...this.state,openForm: false}
        }

    }

    setDayActive(id){
        const container = document.querySelector(this.selectors.calendarContainer)
        const day = container.querySelector(`[data-calendar-id="${id}"]`)
        if (day){
            // console.log('day active',day)
            day.classList.add('calendar__day-wrapper_active')
            console.log('day active',day)
        }
    }

    setDayInactive(id){
        const container = document.querySelector(this.selectors.calendarContainer)
        const day = container.querySelector(`[data-calendar-id="${id}"]`)
        if (day){
            day.classList.remove('calendar__day-wrapper_active')
            console.log('set inactive',day)
        } 
    }    

    resetForm = (form) => {
        const formEl = document.querySelector(this.selectors[form])
        const inputEls = formEl.querySelectorAll(`[data-calendar*="Input"]`)
        const labelEls = formEl.querySelectorAll(`[data-calendar*="Label"]`)
        if (inputEls.length > 0) {
            inputEls.forEach(element => {
                element.value = ''
                element.classList.remove('error')
            })
        }
        if (labelEls) {
            labelEls.forEach(element => {
                element.classList.remove('success')
                element.classList.add('hide')
                element.innerHTML = ''
            })
        }
    }    

    positionAndShowForm(day, formEl) {
        const pointerEl = formEl.querySelector('.modal__pointer')

        function getCoords(elem) {
            const box = elem.getBoundingClientRect()
            return {
                top: box.top + pageYOffset,
                left: box.left + pageXOffset
            }
        }

        const coords = getCoords(day)
        const clientWidth = document.documentElement.clientWidth
        if (clientWidth <= 750) {
            const top = coords.top + day.offsetHeight
            formEl.style.top = top + 'px'
            formEl.style.left = 15 + 'px'
            formEl.style.right = null
            formEl.classList.remove('hide')
            pointerEl.style.right = null
            pointerEl.style.left = coords.left + day.offsetWidth / 2 - pointerEl.offsetWidth + 'px'
            return
        }
        if (day.offsetLeft < clientWidth - day.offsetWidth - day.offsetLeft) {
            let left = coords.left
            if (left < 0) left = 0
            const top = coords.top + day.offsetHeight
            formEl.style.right = null
            formEl.style.left = left + 'px'
            formEl.style.top = top + 'px'
            pointerEl.style.right = null
            formEl.classList.remove('hide')
            pointerEl.style.left = day.offsetWidth / 2 + 'px'

        } else {
            let right = clientWidth - coords.left - day.offsetWidth
            if (right < 0) right = 0
            const top = coords.top + day.offsetHeight
            formEl.style.left = null
            formEl.style.right = right + 'px'
            formEl.style.top = top + 'px'
            pointerEl.style.left = null
            formEl.classList.remove('hide')
            pointerEl.style.right = day.offsetWidth / 2 - pointerEl.offsetWidth + 'px'
        }
    }

    renderSearchResults(events){
        let html = ''
        if (events.length > 0) {
            html = events.reduce((sum, cur) => (sum + `
            <div class="calendar-search__item" data-calendar-id="${cur.id}">
            <div class="search-item__title">${cur.title}</div>
                <div class="search-item__date">${cur.date}</div>
            </div>`), '')
        } else {
            html = `
        <div class="calendar-search__item" >
            <div class="search-item__date">Ничего не нашлось</div>
        </div>`
        }
        const listEl = document.querySelector(this.selectors.searchResult)
        listEl.innerHTML = html
    }

    renderMonth(days){
        
        const container = document.querySelector(this.selectors.calendarContainer)
        let html = '';
        days.forEach((element,i) => {
            const tabindex = i + 100
            const id = element.id
            const when = i < 7 ? `${element.dayName}, ${element.day}` : element.day
            const whenShort = i < 7 ? `${element.dayNameShort}, ${element.day}` : element.day
            const hasEventClass = element.event ? 'calendar-day_has-event' : ''
            const eventTitle = element.event ? `<div class="calendar-day__what">${element.event.title}</div>` : ''
            const eventPeople = element.event ? `<div class="calendar-day__who">${element.event.people}</div>` : ''

            html += `
            <div class="calendar__day-wrapper" tabindex="${tabindex}" role="button" data-calendar-id="${id}">
            <div class="calendar-day ${hasEventClass}"  >
                <div class="calendar-day__when">${when}</div>
                <div class="calendar-day__when_short">${whenShort}</div>
                ${eventTitle}
                ${eventPeople}
            </div>
            </div>
            `        
        })
        container.innerHTML = html


    }
}