document.addEventListener("DOMContentLoaded", function() {
    const daysContainer = document.querySelector(".days");

    let currentMonth = 6; // July
    let currentYear = 2024;

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    function getDaysInMonth(month, year) {
        if (month === 1 && isLeapYear(year)) {
            return 29;
        }
        return daysInMonth[month];
    }

    function updateMonthYearHeader() {
        const monthYearElement = document.getElementById("month-year");
        monthYearElement.textContent = `My Calendar - ${monthNames[currentMonth]} ${currentYear}`;
    }

    updateMonthYearHeader();

    function generateRandomEvents() {
        const events = {};
        const eventDescriptions = ["Meeting with Bob", "Doctor's appointment", "Lunch with Alice", "Team meeting", "Project deadline", "Birthday party", "Grocery shopping", "Gym session", "Dinner date", "Concert"];
        const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            if (Math.random() > 0.7) {
                const randomEvent = eventDescriptions[Math.floor(Math.random() * eventDescriptions.length)];
                events[i] = randomEvent;
                localStorage.setItem(`events_${currentMonth}_${currentYear}_${i}`, JSON.stringify([randomEvent]));
            }
        }
        localStorage.setItem(`events_${currentMonth}_${currentYear}`, JSON.stringify(events));
    }

    function generateDays() {
        daysContainer.innerHTML = '';
        const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            const day = document.createElement("div");
            day.classList.add("day");
            day.textContent = i;
            day.addEventListener("click", function() {
                window.location.href = `day.html?month=${currentMonth}&year=${currentYear}&day=${i}`;
            });
            daysContainer.appendChild(day);

            if (localStorage.getItem(`events_${currentMonth}_${currentYear}_${i}`)) {
                const eventIndicator = document.createElement("div");
                eventIndicator.classList.add("event-indicator");
                day.appendChild(eventIndicator);
            }
        }
    }

    if (!localStorage.getItem(`events_${currentMonth}_${currentYear}`)) {
        generateRandomEvents();
    }

    generateDays();

    if (window.location.pathname.endsWith("day.html")) {
        const urlParams = new URLSearchParams(window.location.search);
        const day = urlParams.get('day');
        const month = urlParams.get('month');
        const year = urlParams.get('year');
        const dateElement = document.getElementById("date");
        const eventList = document.getElementById("event-list");
        const newEventInput = document.getElementById("new-event");

        dateElement.textContent = `Events for Day ${day}, ${monthNames[month]} ${year}`;

        const events = JSON.parse(localStorage.getItem(`events_${month}_${year}_${day}`)) || [];

        function renderEvents() {
            eventList.innerHTML = '';
            events.forEach((event, index) => {
                const li = document.createElement("li");
                li.textContent = event;

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.onclick = function() {
                    deleteEvent(index);
                };

                li.appendChild(deleteButton);
                eventList.appendChild(li);
            });

            if (events.length === 0) {
                localStorage.removeItem(`events_${month}_${year}_${day}`);
                removeEventIndicator(day, month, year);
            }
        }

        function addEvent() {
            const newEvent = newEventInput.value;
            if (newEvent) {
                events.push(newEvent);
                localStorage.setItem(`events_${month}_${year}_${day}`, JSON.stringify(events));
                renderEvents();
                newEventInput.value = '';
                addEventIndicator(day, month, year);
            }
        }

        function deleteEvent(index) {
            events.splice(index, 1);
            localStorage.setItem(`events_${month}_${year}_${day}`, JSON.stringify(events));
            renderEvents();
        }

        function addEventIndicator(day, month, year) {
            const dayElements = document.querySelectorAll(".day");
            dayElements.forEach(dayElement => {
                if (dayElement.textContent == day) {
                    if (!dayElement.querySelector('.event-indicator')) {
                        const eventIndicator = document.createElement("div");
                        eventIndicator.classList.add("event-indicator");
                        dayElement.appendChild(eventIndicator);
                    }
                }
            });
        }

        function removeEventIndicator(day, month, year) {
            const dayElements = document.querySelectorAll(".day");
            dayElements.forEach(dayElement => {
                if (dayElement.textContent == day) {
                    const eventIndicator = dayElement.querySelector('.event-indicator');
                    if (eventIndicator) {
                        dayElement.removeChild(eventIndicator);
                    }
                }
            });
        }

        window.addEvent = addEvent;
        window.goBack = function() {
            window.history.back();
        }

        renderEvents();
    }

    let currentDay = 1;
    const currentDayElement = document.getElementById("current-day");
    const currentEventElement = document.getElementById("current-event");
    let simulationInterval;
    let isSimulationRunning = false;

    function simulateDays() {
        if (isSimulationRunning) {
            return;
        }
        isSimulationRunning = true;
        runSimulation();
    }

    function runSimulation() {
        highlightCurrentDay();
        currentDayElement.textContent = `Current Day: ${currentDay}`;
        const events = JSON.parse(localStorage.getItem(`events_${currentMonth}_${currentYear}`)) || {};

        if (events[currentDay]) {
            currentEventElement.textContent = `Event: ${events[currentDay]}`;
        } else {
            currentEventElement.textContent = '';
        }

        simulationInterval = setTimeout(() => {
            const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
            if (currentDay < daysInCurrentMonth) {
                currentDay++;
            } else {
                currentDay = 1;
                if (currentMonth < 11) {
                    currentMonth++;
                } else {
                    currentMonth = 0;
                    currentYear++;
                }
                generateDays();
                updateMonthYearHeader();
            }
            runSimulation();
        }, 1000);
    }

    function stopSimulation() {
        clearTimeout(simulationInterval);
        isSimulationRunning = false;
    }

    function highlightCurrentDay() {
        const dayElements = document.querySelectorAll(".day");
        dayElements.forEach(dayElement => {
            dayElement.classList.remove("simulated-day");
            if (dayElement.textContent == currentDay) {
                dayElement.classList.add("simulated-day");
            }
        });
    }

    window.simulateDays = simulateDays;
    window.stopSimulation = stopSimulation;

    window.previousMonth = function() {
        if (currentMonth > 0) {
            currentMonth--;
        } else {
            currentMonth = 11;
            currentYear--;
        }
        currentDay = 1;
        generateDays();
        updateMonthYearHeader();
    }

    window.nextMonth = function() {
        if (currentMonth < 11) {
            currentMonth++;
        } else {
            currentMonth = 0;
            currentYear++;
        }
        currentDay = 1;
        generateDays();
        updateMonthYearHeader();
    }

    window.previousYear = function() {
        currentYear--;
        currentDay = 1;
        generateDays();
        updateMonthYearHeader();
    }

    window.nextYear = function() {
        currentYear++;
        currentDay = 1;
        generateDays();
        updateMonthYearHeader();
    }
});

