const removeAfter = 20
const hilightLevel3 = 15
const hilightLevel2 = 10
const hilightLevel1 = 5
const maxCustomerLength = 25

var ToFirstTender = "--:--:--"
var DataArray = new Array()
var TendersTotal = 0
var TendersLeft = 0

class timeElement {
    constructor() {
        this.time = null
        this.timer = null
        this.items = new Array()

        this.diffHours = null
        this.diffMinutes = null
        this.diffSeconds = null
    }

    push(item) {
        this.items.push(item)
    }

    updateTimer() {
        var now = new Date()
        this.timer =  this.time - now

        var diff = this.timer
        
        this.diffHours = Math.trunc(diff / (1000 * 60 * 60))
        diff -= this.diffHours * (1000 * 60 * 60)
        
        this.diffMinutes = Math.trunc(diff / (1000 * 60))
        diff -= this.diffMinutes * (1000 * 60)
        
        this.diffSeconds = Math.trunc(diff / 1000)

    }
}

function ClearString(str) {
    var result = ""
    var posBR = str.indexOf("<br>")
    
    if(posBR > 0) {
        result = str.substring(0, posBR)
    }
    else {
        result = str
    }

    return result
}

function UpdateTimers() {
    TendersLeft = 0
    DataArray.forEach(element => {
        element.updateTimer()
        if(element.timer > 0) {
            TendersLeft += element.items.length
        }
        var strTime = element.diffHours.toString().padStart(2, "0") + ":" + element.diffMinutes.toString().padStart(2, "0") + ":" + element.diffSeconds.toString().padStart(2, "0")
    })
}

function UpdateHeader() {
    var now = new Date();

    var options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    }
    $("#date").text(now.toLocaleString("ru", options))

    options = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    }
    $("#time").text(now.toLocaleString("ru", options))

    $("#tenders").text(TendersLeft + "/" + TendersTotal)
    
    //Сюда дописать поиск ближайщих тендеров
    lastTender = (25 * 60 * 60 * 1000);
    DataArray.forEach(element => {
        if(element.timer > 0) {
            if(lastTender > element.timer) {
                lastTender = element.timer
                ToFirstTender = element.diffHours.toString().padStart(2, "0") + ":" + element.diffMinutes.toString().padStart(2, "0") + ":" + element.diffSeconds.toString().padStart(2, "0")
            }
        }
    })
    $("#timer").text(ToFirstTender)

    UpdateTimers()
    if(now.getSeconds() == 0) {
        UpdateScreen()
    }
    setTimeout(UpdateHeader, 1000)
}

function UpdateScreen() {
    $("#main").empty()

    DataArray.forEach(element => {
        //if(1) {
        if(element.timer > -(removeAfter * 60 * 1000)) {
            var strTime = element.time.getHours().toString().padStart(2, "0") + ":" + element.time.getMinutes().toString().padStart(2, "0")
            
            var className = ''
            if(element.timer > (hilightLevel3 * 60 * 1000)) {
                className = 'dataRow'
            }
            else {
                if(element.timer > (hilightLevel2 * 60 * 1000)) {
                    className = 'dataRowLevel3'
                }
                else {
                    if(element.timer > (hilightLevel1 * 60 * 1000)) {
                        className = 'dataRowLevel2'
                    }
                    else {
                        if(element.timer > 0) {
                            className = 'dataRowLevel1'
                        }
                        else {
                            className = 'dataRowLevel0'
                        }
                    }
                }
            }
            
            var timeRow = $('<tr>', { 'class': className })
            
            var timeCell = $('<td>', { 'class': 'timeCell', text: strTime })
            timeCell.append($('<div>', { text: '[ ' + element.items.length + ' ]' }))
            timeRow.append(timeCell)
            timeRowData = $('<td>', { 'class': 'dataCell' })
        
            element.items.forEach(item => {
                var tab = $("<table>", { 'class': 'dataTable' })
            
                var row1 = $('<tr>')
                row1.append($('<td>', { 'class': 'numberCell', text: item.get('number') }))
                var obj = $('<td>', { 'rowspan': 3, 'class': 'objectCell' })
                var marquee = $('<marquee>', { 'behavior': 'alternate', 'direction': 'left'})
                marquee.append(item.get('object'))
                obj.append(marquee)
                row1.append(obj)

                var row2 = $('<tr>')
                row2.append($('<td>', { 'class': 'tradingFloorCell', text: item.get('tradingFloor') }))

                var row3 = $('<tr>')
                var cellCustomer = $('<td>', { 'class': 'customerCell' })
                if(item.get('customer').length > maxCustomerLength) {
                    cellCustomer.append($('<marquee>', { 'behavior': 'alternate', 'direction': 'left', text: item.get('customer') }))
                }
                else {
                    cellCustomer.text(item.get('customer'))
                }
                row3.append(cellCustomer)

            
                tab.append(row1)
                tab.append(row2)
                tab.append(row3)

                timeRowData.append(tab)
            })
            timeRow.append(timeRowData)

            $("#main").append(timeRow)
        }
    })
}

function UpdateData() {
    $.getJSON("http://aaa23.ru/get_json.php", function(data) {  
        time = new Date(1900, 0, 1, 0, 0, 0)
        timeElements = null

        data.forEach(element => {
            var dateTimeStrings = element['time'].split(" ")
            var dateStrings = dateTimeStrings[0].split("-")
            var timeString = dateTimeStrings[1].split(":")
            var dt = new Date(dateStrings[0], dateStrings[1] - 1, dateStrings[2], timeString[0], timeString[1], timeString[2])
            
            if(time.getTime() != dt.getTime()) {
                console.log("Обработка...")
                time = dt
                if(timeElements != null) {
                    DataArray.push(timeElements)
                }
                timeElements = new timeElement()
                timeElements.time = time
            }

            var procElement = new Map()
            procElement.set('number', element['number'])
            procElement.set('tradingFloor', ClearString(element['name']))
            procElement.set('customer', element['customer'])
            procElement.set('object', element['object'])
            timeElements.push(procElement)
        })
        console.log(timeElements)
        if((timeElements != null) && (timeElements.items.length > 0)) {
            DataArray.push(timeElements)
        }

        TendersTotal = 0
        DataArray.forEach(element => {
            TendersTotal += element.items.length
        })
        UpdateTimers()
        UpdateScreen()
    })
}

$(document).ready(function() {
    UpdateHeader()
    UpdateData()
});