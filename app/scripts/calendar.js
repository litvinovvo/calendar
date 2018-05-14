import {
    arrToMapJs,
    mapToArrJs,
    formatDateDMY,
    formatDMYDate
} from './tools.js'
export class Calendar {
    constructor(props) {
        this.props = props
    }
    init() {
        if (localStorage.getItem('calendar')) this.events = JSON.parse(localStorage.getItem('calendar'))
        else {
            this.events = arrToMapJs(this.props.events)
            localStorage.setItem('calendar', JSON.stringify(this.events))
        }
        this.containerEl = document.querySelector(`[data-calendar="${this.props.container}"]`)
        this.nextEl = document.querySelector(`[data-calendar="${this.props.next}"]`)
        this.backEl = document.querySelector(`[data-calendar="${this.props.back}"]`)
        this.todayEl = document.querySelector(`[data-calendar="${this.props.today}"]`)
        this.labelEl = document.querySelector(`[data-calendar="${this.props.label}"]`)
        this.addEl = document.querySelector(`[data-calendar="${this.props.add}"]`)
        this.search = document.querySelector(`[data-calendar="${this.props.search}"]`)
        this.currentDate = new Date()
        this.openForm = false
        this.wasInit = false
        this.quickFormWasInit = false
        this.editEventFormWasInit = false
        this.newEventFormWasInit = false
        this.searchWasInit = false
        if (this.nextEl) this.nextEl.addEventListener('click', this.renderNextMonth)
        if (this.backEl) this.backEl.addEventListener('click', this.renderPreviousMonth)
        if (this.todayEl) this.todayEl.addEventListener('click', this.renderCurrentMonth)
        if (this.addEl) this.addEl.addEventListener('click', this.renderQuickForm)
        if (this.search) {
            this.search.addEventListener('input', this.renderSearch)
            this.search.addEventListener('focus', (e) => {
                const listEl = document.querySelector(`[data-calendar="${this.props.search}List"]`)
                listEl.parentNode.classList.remove('hide')
                this.renderSearch(e)
            })
        }
        this.containerEl.addEventListener('click', this.renderEventForm)
        this.containerEl.addEventListener('keydown', (e) => {
            const code = e.which
            if (code === 9 && this.openForm) this.closeForm(this.openForm)
            if (code === 13 || code === 32) this.renderEventForm(e)
        })
        this.wasInit = true
    }
    renderSearch = (e) => {
        e.preventDefault()
        if (!this.searchWasInit) this.initSearch()
        const events = this.searchEvent(e.target.value)
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
        const listEl = document.querySelector(`[data-calendar="${this.props.search}List"]`)
        listEl.innerHTML = html
    }
    searchEvent(val) {
        const str = val.toLowerCase()
        const eventsArr = mapToArrJs(this.events)
        const result = []
        eventsArr.forEach((event) => {
            if (~(event.title).toLowerCase().indexOf(str) || ~(event.people).toLowerCase().indexOf(str) || ~(event.description.toLowerCase()).indexOf(str)) {
                result.push({
                    id: event.date,
                    date: formatDMYDate(event.date).toLocaleString('ru', {
                        month: 'long',
                        day: 'numeric'
                    }),
                    title: event.title
                })
            }
        })
        return result
    }
    initSearch() {
        const inputEl = document.querySelector(`[data-calendar="${this.props.search}"]`)
        inputEl.addEventListener('blur', () => {
            const listEl = document.querySelector(`[data-calendar="${this.props.search}List"]`)
            listEl.parentNode.classList.add('hide')
        })
        const listEl = document.querySelector(`[data-calendar="${this.props.search}List"]`)
        listEl.addEventListener('mousedown', (e) => {
            e.preventDefault()
        })
        listEl.addEventListener('click', (e) => {
            e.stopPropagation()
            inputEl.blur()
            const itemEl = e.target.closest('[data-calendar-id]')
            if (!itemEl) return
            const id = itemEl.dataset.calendarId
            this.editDay(id)
        })
        this.searchWasInit = true
    }
    toggleDayActive = (id) => {
        const day = this.containerEl.querySelector(`[data-calendar-id="${id}"]`)
        if (day) day.parentNode.classList.toggle('calendar__day-wrapper_active')
    }
    editDay = (id) => {
        if (this.openForm) this.closeForm(this.openForm)
        const dayObj = formatDMYDate(id)
        this.currentDate = dayObj
        this.renderMonth(dayObj)
        const day = this.containerEl.querySelector(`[data-calendar-id="${id}"]`)
        if (!day) return
        this.toggleDayActive(id)
        if (this.events[id]) this.renderEditEventForm(day)
        else this.renderNewEventForm(day)
    }
    renderEventForm = (e) => {
        let day = null
        if (e.type === 'click') day = e.target.closest('[data-calendar-id]')
        if (e.type === 'keydown') day = e.target.querySelector('[data-calendar-id]')
        if (!day) return

        e.stopPropagation()
        if (this.openForm) this.closeForm(this.openForm)
        this.toggleDayActive(day.dataset.calendarId)
        if (this.events[day.dataset.calendarId]) this.renderEditEventForm(day)
        else this.renderNewEventForm(day)
    }
    processEventForm = (e) => {
        const formEl = document.querySelector(`[data-calendar="${this.openForm}"]`)
        const whatEl = formEl.querySelector(`[data-calendar="${this.openForm}InputWhat"]`)
        const whoEl = formEl.querySelector(`[data-calendar="${this.openForm}InputWho"]`)
        const descEl = formEl.querySelector(`[data-calendar="${this.openForm}InputDesc"]`)
        const whatLabelEl = formEl.querySelector(`[data-calendar="${this.openForm}LabelWhat"]`)
        if (e.target.dataset.calendar === `${this.openForm}Save`) {
            if (whatEl && whatEl.value === '') {
                whatLabelEl.classList.remove('hide')
                whatEl.classList.add('error')
                whatLabelEl.innerHTML = 'Введите название события'
                return
            }
            const event = this.events[formEl.dataset.calendarId]
            this.createEvent({
                id: event ? event.id : formEl.dataset.calendarId,
                date: event ? event.date : formEl.dataset.calendarId,
                description: descEl ? descEl.value : '',
                people: event ? event.people : whoEl.value,
                title: event ? event.title : whatEl.value
            })
            this.closeForm(this.openForm)
            this.renderMonth(this.currentDate)
        }
        if (e.target.dataset.calendar === `${this.openForm}Delete`) {
            this.deleteEvent(formEl.dataset.calendarId)
            this.closeForm(this.openForm)
            this.renderMonth(this.currentDate)
        }
    }
    deleteEvent(id) {
        delete this.events[id]
        localStorage.setItem('calendar', JSON.stringify(this.events))
    }
    createEvent(event) {
        this.events[event.id] = event
        localStorage.setItem('calendar', JSON.stringify(this.events))
    }
    renderEditEventForm(day) {
        if (!this.editEventFormWasInit) this.initForm(this.props.editEventForm)
        const formEl = document.querySelector(`[data-calendar="${this.props.editEventForm}"]`)
        const whatEl = formEl.querySelector(`[data-calendar="${this.props.editEventForm}What"]`)
        const whenEl = formEl.querySelector(`[data-calendar="${this.props.editEventForm}When"]`)
        const whoEl = formEl.querySelector(`[data-calendar="${this.props.editEventForm}Who"]`)
        const descEl = formEl.querySelector(`[data-calendar="${this.props.editEventForm}InputDesc"]`)
        const event = this.events[day.dataset.calendarId]
        const dateObj = formatDMYDate(day.dataset.calendarId)
        formEl.dataset.calendarId = day.dataset.calendarId
        whatEl.innerHTML = event.title
        whenEl.innerHTML = dateObj.toLocaleString('ru', {
            month: 'long',
            day: 'numeric'
        })
        whoEl.innerHTML = event.people
        descEl.value = event.description
        this.positionAndShowForm(day, formEl)
        this.addWatch(this.props.editEventForm)
    }
    renderNewEventForm(day) {
        if (!this.newEventFormWasInit) this.initForm(this.props.newEventForm)
        const formEl = document.querySelector(`[data-calendar="${this.props.newEventForm}"]`)
        formEl.dataset.calendarId = day.dataset.calendarId
        this.positionAndShowForm(day, formEl)
        this.addWatch(this.props.newEventForm)
    }
    positionAndShowForm(day, formEl) {
        const pointerEl = formEl.querySelector('.modal__pointer')
        const coords = day.getBoundingClientRect()
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
        if (day.offsetParent.offsetLeft < clientWidth - day.offsetWidth - day.offsetParent.offsetLeft) {
            let left = coords.left
            if (left < 0) left = 0
            const top = coords.top + day.offsetHeight
            formEl.style.right = null
            formEl.style.left = left + 'px'
            formEl.style.top = top + 'px'
            pointerEl.style.right = null
            pointerEl.style.left = day.offsetWidth / 2 + 'px'
            formEl.classList.remove('hide')
        } else {
            let right = clientWidth - coords.right
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
    initForm(form) {
        const formEl = document.querySelector(`[data-calendar="${form}"]`)
        const closeBtn = formEl.querySelector(`[data-calendar="${form}Close"]`)
        const createBtn = formEl.querySelector(`[data-calendar="${form}Create"]`)
        const saveBtn = formEl.querySelector(`[data-calendar="${form}Save"]`)
        const deleteBtn = formEl.querySelector(`[data-calendar="${form}Delete"]`)
        const inputs = formEl.querySelectorAll('[data-calendar-validate]')

        inputs.forEach((input) => input.addEventListener('focus', () => this.clearError(form)))
        if (saveBtn) saveBtn.addEventListener('click', this.processEventForm)
        if (deleteBtn) deleteBtn.addEventListener('click', this.processEventForm)
        if (createBtn) createBtn.addEventListener('click', this.processQuickForm)
        closeBtn.addEventListener('click', () => this.closeForm(form))
        this[form + 'WasInit'] = true
    }
    addWatch(form) {
        document.addEventListener('click', this.watchClick)
        this.openForm = form
    }
    removeWatch() {
        document.removeEventListener('click', this.watchClick)
        this.openForm = false
    }
    watchClick = (e) => {
        if (!this.openForm) return
        const form = this.openForm
        const target = e.target
        const formEl = document.querySelector(`[data-calendar="${form}"]`)
        if (!target.closest(`[data-calendar="${this.props[form]}"]`) && !formEl.classList.contains('hide')) this.closeForm(form)
    }
    closeForm(form) {
        const formEl = document.querySelector(`[data-calendar="${form}"]`)
        const id = formEl.dataset.calendarId
        this.toggleDayActive(id)
        formEl.classList.add('hide')
        this.removeWatch(form)
        this.resetForm(form)
    }
    processQuickForm = () => {
        const form = document.querySelector(`[data-calendar="${this.props.quickForm}"]`)
        const inputEl = form.querySelector(`[data-calendar="${this.props.quickForm}Input"]`)
        const labelEl = form.querySelector(`[data-calendar="${this.props.quickForm}Label"]`)
        const result = inputEl.value.match(/\s*(\d{1,2})\s+([а-яА-Я]+)\s*,\s*(.+)/i)

        function setError(error) {
            labelEl.innerHTML = error
            inputEl.classList.add('error')
            labelEl.classList.remove('success', 'hide')
            labelEl.classList.add('error')
        }
        if (inputEl.value === '') {
            setError('Опишите событие')
            return
        }
        if (!result || !this.parseMonth(result[2])) {
            setError('Введите событие в правильном формате')
            return
        }
        const date = new Date(this.currentDate.getFullYear(), this.parseMonth(result[2]), Number(result[1]))
        if (date.getDate() !== Number(result[1])) {
            setError('Такой даты не существует')
            return
        }
        if (this.events[formatDateDMY(date)]) {
            setError('На этот день уже что-то запланировано')
            return
        }
        this.resetForm(this.props.quickForm)
        this.createEvent({
            id: formatDateDMY(date),
            date: formatDateDMY(date),
            title: result[3],
            people: '',
            description: ''
        })
        if (this.currentDate.getMonth() === this.parseMonth(result[2])) this.renderMonth(this.currentDate)
        labelEl.innerHTML = 'Событие успешно создано'
        labelEl.classList.remove('error', 'hide')
        labelEl.classList.add('success')

    }
    clearError(form) {
        const formEl = document.querySelector(`[data-calendar="${form}"]`)
        const inputEls = formEl.querySelectorAll(`[data-calendar*="${form}Input"]`)
        const labelEls = formEl.querySelectorAll(`[data-calendar*="${form}Label"]`)
        if (inputEls.length > 0) {
            inputEls.forEach(element => {
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
    resetForm(form) {
        const formEl = document.querySelector(`[data-calendar="${form}"]`)
        const inputEls = formEl.querySelectorAll(`[data-calendar*="${form}Input"]`)
        const labelEls = formEl.querySelectorAll(`[data-calendar*="${form}Label"]`)
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
    parseMonth(str) {
        const month = {
            января: 0,
            февраля: 1,
            марта: 2,
            апреля: 3,
            мая: 4,
            июня: 5,
            июля: 6,
            августа: 7,
            сентября: 8,
            октября: 9,
            ноября: 10,
            декабря: 11
        }
        if (month[str]) return month[str]
        return false
    }
    renderQuickForm = (e) => {
        e.stopPropagation()
        if (this.openForm) this.closeForm(this.openForm)
        if (!this.quickFormWasInit) this.initForm(this.props.quickForm)
        const formEl = document.querySelector(`[data-calendar="${this.props.quickForm}"]`)
        const target = e.target
        const coords = target.getBoundingClientRect()
        let left = coords.left
        if (left < 0) left = 0
        const top = coords.top + 50
        formEl.style.left = left + 'px'
        formEl.style.top = top + 'px'
        formEl.classList.remove('hide')
        this.addWatch(this.props.quickForm)
    }
    getMonthName(num) {
        const month = {
            0: 'Январь',
            1: 'Февраль',
            2: 'Март',
            3: 'Апрель',
            4: 'Май',
            5: 'Июнь',
            6: 'Июль',
            7: 'Aвгуст',
            8: 'Cентябрь',
            9: 'Октябрь',
            10: 'Ноябрь',
            11: 'Декабрь'
        }
        return month[num] ? month[num] : false
    }

    getDayName(num){
        const days = {
            0: 'Воскресенье',
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
            0: 'Вс',
            1: 'Пн',
            2: 'Вт',
            3: 'Ср',
            4: 'Чт',
            5: 'Пт',
            6: 'Сб'
        }
        return days[num] ? days[num] : false
    }

    updateLabel() {
        const day = this.currentDate
        this.labelEl.innerHTML = `${this.getMonthName(day.getMonth())} ${day.getFullYear()}`
    }
    getLastDayOfMonth(year, month) {
        const date = new Date(year, month + 1, 0)
        return date.getDate()
    }
    getLocalDay(date) {
        let day = date.getDay()
        if (day === 0) day = 7
        return day
    }
    renderNextMonth = () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1)
        this.renderMonth(this.currentDate)
    }
    renderPreviousMonth = () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1)
        this.renderMonth(this.currentDate)
    }
    renderCurrentMonth = () => {
        this.currentDate = new Date()
        this.renderMonth(this.currentDate)
    }
    renderDay({
        date,
        printLocal,
        active,
        event,
        tabindex
    }) {
        const dayNum = date.getDay()
        const dateNum = date.getDate()
        const localDay = this.getDayName(dayNum)
        const shortLocalDay = this.getShortDayName(dayNum)
        const whenShort = printLocal ? shortLocalDay + ', ' + dateNum : dateNum
        const when = printLocal ? localDay + ', ' + dateNum : dateNum
        const todayClass = active ? 'calendar-day_today' : ''
        const hasEventClass = event ? 'calendar-day_has-event' : ''
        const eventTitle = event ? event.title : ''
        const eventPeople = event ? event.people : ''
        const id = `data-calendar-id='${formatDateDMY(date)}'`
        const html = `
    <div class="calendar__day-wrapper" tabindex="${tabindex}" role="button">
      <div class="calendar-day ${todayClass} ${hasEventClass}"  ${id} >
        <div class="calendar-day__when">${when}</div>
        <div class="calendar-day__when_short">${whenShort}</div>
        <div class="calendar-day__what">${eventTitle}</div>
        <div class="calendar-day__who">${eventPeople}</div>
      </div>
    </div>
    `
        return html
    }
    renderMonth(date) {
        if (!this.wasInit) this.init()
        this.updateLabel()

        const day = new Date(Number(date))
        day.setDate(1)
        const dayCount = this.getLastDayOfMonth(day.getFullYear(), day.getMonth())
        const dayOfWeek = this.getLocalDay(day)
        const dayToFill = dayOfWeek > 1 ? dayOfWeek - 1 : 0
        day.setDate(day.getDate() - dayToFill)
        let html = ''
        let tabindex = 10
        for (let i = 0; i < dayToFill; i++) {
            html += this.renderDay({
                date: day,
                printLocal: true,
                tabindex
            })
            day.setDate(day.getDate() + 1)
            tabindex++
        }
        for (let i = 1; i <= dayCount; i++) {
            const dmy = formatDateDMY(day)
            html += this.renderDay({
                date: day,
                printLocal: day.getDate() + dayToFill <= 7,
                active: dmy === formatDateDMY(new Date()),
                event: this.events[dmy] ? this.events[dmy] : false,
                tabindex
            })
            day.setDate(day.getDate() + 1)
            tabindex++
        }
        this.containerEl.innerHTML = html
    }
}
