class ActivityType {
    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}

const activityTypes = [
    new ActivityType("pause", "#fff0"),
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
        new Activity(0, "00:00", "09:00"),
        new Activity(1, "09:00", "10:00"),
        new Activity(1, "10:15", "11:15"),
        new Activity(2, "12:00", "13:00"),
        new Activity(3, "14:05", "14:40"),
        new Activity(1, "14:40", "15:30"),
        new Activity(0, "15:30", "23:59"),
    ]),
    new DayData("14/12", [
        new Activity(0, "00:00", "09:00"),
        new Activity(1, "09:00", "11:00"),
        new Activity(0, "11:00", "23:59"),
    ]),
];

const days = document.getElementById("days");
const activities = document.getElementById("activities");

getDayInterval(60 * 6, 60 * 18);//MINUTES_IN_DAY);
// begin & end interval to show the activities
function getDayInterval(beginInterval, endInterval) {
    const intervalMinutes = endInterval - beginInterval;

    const daysDataInterval = JSON.parse(JSON.stringify(daysData));
    for (const dayData of daysDataInterval) {
        // remove everything before beginInterval
        let ended = false;
        while (!ended) {
            if (dayData.activities[0].endMinutes <= beginInterval) {
                dayData.activities.shift();
            } else {
                dayData.activities[0].beginMinutes = beginInterval;
                dayData.activities[0].durationMinutes
                    = dayData.activities[0].endMinutes
                    - dayData.activities[0].beginMinutes;
                ended = true;
            }
        }

        // remove everything after endInterval
        ended = false;
        while (!ended) {
            const len = dayData.activities.length;
            if (dayData.activities[len-1].beginMinutes >= endInterval) {
                dayData.activities.pop();
            } else {
                dayData.activities[len-1].endMinutes = endInterval;
                dayData.activities[len-1].durationMinutes
                    = dayData.activities[len-1].endMinutes
                    - dayData.activities[len-1].beginMinutes;
                ended = true;
            }
        }
    }

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

