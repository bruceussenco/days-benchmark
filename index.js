class ActivityType {
    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}

const activityTypes = [
    new ActivityType("study", "#07f"),
    new ActivityType("gym", "#f40"),
    new ActivityType("meditation", "#0f4"),
];

function isValidHour(hour) {
    if (typeof hour !== "string") return false;
    if (hour.length !== 5) return false;
    if (hour[0] !== "0" && hour[0] !== "1" && hour[0] !== "2") return false;
    if (hour[0] === "2" && parseInt(hour[1]) > 3) return false;
    if (isNaN(parseInt(hour[1]))) return false;
    if (hour[2] !== ":") return false;
    if (isNaN(parseInt(hour[3])) || parseInt(hour[3]) > 5) return false;
    if (isNaN(parseInt(hour[4]))) return false;
    return true;
}

function hourToMinutes(hour) {
    const h = 10 * parseInt(hour[0]) + parseInt(hour[1]);
    const m = 10 * parseInt(hour[3]) + parseInt(hour[4]);
    return 60 * h + m;
}

class Activity {
    /* id refers to an index in the activityTypes array */
    constructor(id, begin, end) {
        this.id = id;
        if (!isValidHour(begin)) throw new Error(`invalid hour ${begin}`);
        if (!isValidHour(end)) throw new Error(`invalid hour ${end}`);
        this.begin = begin;
        this.end = end;

        this.beginMinutes = hourToMinutes(begin);
        this.endMinutes = hourToMinutes(end);
        if (this.endMinutes <= this.beginMinutes)
            throw new Error("end hour need to be greater than begin hour");
        this.durationMinutes = this.endMinutes - this.beginMinutes;
    }
}

class DayData {
    constructor(date, activities) {
        this.date = date;
        this.activities = activities;
    }
}

const MINUTES_IN_DAY = 24 * 60;

const daysData = [
    new DayData("12/12", [
        new Activity(0, "09:00", "10:00"),
        new Activity(1, "11:00", "12:00"),
        new Activity(2, "13:00", "14:00"),
        new Activity(0, "15:00", "16:00"),
        new Activity(1, "17:00", "18:00"),
        new Activity(2, "19:00", "22:00"),
        new Activity(0, "23:00", "23:59"),
    ]),
    new DayData("14/12", [
        new Activity(1, "08:30", "09:30"),
        new Activity(2, "10:30", "11:30"),
        new Activity(0, "12:30", "13:30"),
        new Activity(1, "14:30", "15:30"),
        new Activity(2, "16:30", "17:30"),
        new Activity(0, "18:30", "19:30"),
        new Activity(1, "20:30", "21:30"),
        new Activity(2, "22:30", "23:30"),
    ]),
];

const days = document.getElementById("days");
const activities = document.getElementById("activities");

let currBeginInterval = 60 * 8;
let currEndInterval = 60 * 24;

showDayInterval(currBeginInterval, currEndInterval);
// begin & end interval to show the activities
function showDayInterval(beginInterval, endInterval) {
    const intervalMinutes = endInterval - beginInterval;

    const daysDataInterval = JSON.parse(JSON.stringify(daysData));
    for (const dayData of daysDataInterval) {
        // remove everything before beginInterval
        for (let i = 0; i < dayData.activities.length; i++) {
            if (dayData.activities[i].endMinutes <= beginInterval) {
                dayData.activities.splice(i, 1);
                i--;
                continue;
            } else if (dayData.activities[i].beginMinutes < beginInterval) {
                dayData.activities[0].beginMinutes = beginInterval;
                dayData.activities[0].durationMinutes
                    = dayData.activities[0].endMinutes
                    - dayData.activities[0].beginMinutes;
            }
        }

        // remove everything after endInterval
        for (let i = 0; i < dayData.activities.length; i++) {
            if (dayData.activities[i].beginMinutes >= endInterval) {
                dayData.activities.splice(i, 1);
                i--;
                continue;
            } else if (dayData.activities[i].endMinutes > endInterval) {
                dayData.activities[i].endMinutes = endInterval;
                dayData.activities[i].durationMinutes
                    = dayData.activities[i].endMinutes
                    - dayData.activities[i].beginMinutes;
            }
        }
    }

    days.innerHTML = "";
    activities.innerHTML = "";
    for (const dayData of daysDataInterval) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        dayDiv.innerText = dayData.date;

        const actsDiv = document.createElement("div");
        actsDiv.classList.add("activity");

        for (const activity of dayData.activities) {
            const actDiv = document.createElement("div");
            const w = activity.durationMinutes / intervalMinutes;
            const x = (activity.beginMinutes - beginInterval) / intervalMinutes;

            actDiv.innerHTML = `
            <div class="begin-point"></div>
            <div class="end-point"></div>
            <div class="dash"></div>
            `;

            actDiv.style = `
            left: ${100*x}%;
            background-color:${activityTypes[activity.id].color};
            width:${100*w}%;`;

            actsDiv.appendChild(actDiv);
        }

        days.appendChild(dayDiv);
        activities.appendChild(actsDiv);
    }
}

function isValidDay(dayStr, monthStr) {
    const day = parseInt(dayStr);
    const month = parseInt(monthStr);

    if (isNaN(day) || isNaN(month)) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    return true;
}

const dayInput = document.getElementById("day-input");
const monthInput = document.getElementById("month-input");
const addDayButton = document.getElementById("add-day-button");
addDayButton.addEventListener("click", () => {
    let dayStr = dayInput.value;
    let monthStr = monthInput.value;
    if (isValidDay(dayStr, monthStr)) {
        if (dayStr.length === 1) dayStr = "0" + dayStr;
        if (monthStr.length === 1) monthStr = "0" + monthStr;
        daysData.push(new DayData(dayStr + "/" + monthStr, []));
        showDayInterval(currBeginInterval, currEndInterval);
    }
});

