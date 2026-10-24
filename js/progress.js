
// REP+ Progress Tracking
// Tracks completed workouts and saves completion dates

const PROGRESS_KEY = "repPlusProgress";

// Load saved workout progress
function loadProgress() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(PROGRESS_KEY)
        );

        return saved && typeof saved === "object"
            && !Array.isArray(saved) ? saved : {};
    } catch {
        return {};
    }
}

// Check if a workout is completed
// Supports old records saved as true
function isDone(week, dayIndex) {
    const workout = loadProgress()[week + "-" + dayIndex];

    return workout === true ||
        (workout && workout.completed === true);
}

// Get today's local date as YYYY-MM-DD
function getLocalDate() {
    const now = new Date();

    return (
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0")
    );
}

// Mark or unmark a workout as completed
function toggleDone(week, dayIndex) {
    const progress = loadProgress();
    const key = week + "-" + dayIndex;

    if (isDone(week, dayIndex)) {
        // Remove completed workout
        delete progress[key];
    } else {
        // Automatically save completion date
        progress[key] = {
            completed: true,
            date: getLocalDate()
        };
    }

    localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify(progress)
    );
}

// Reset progress when generating a new plan
function resetProgress() {
    localStorage.removeItem(PROGRESS_KEY);
}

// Create the Progress Dashboard
function renderProgress(plan, week) {
    const progress = loadProgress();

    const totalWeeks = PROGRESSION.length;
    const total = plan.days * totalWeeks;

    // Count completed workouts
    const completed = Object.keys(progress).filter(key => {
        const [savedWeek, savedDay] =
            key.split("-").map(Number);

        const workout = progress[key];

        const isCompleted =
            workout === true ||
            (workout && workout.completed === true);

        return isCompleted &&
            savedWeek >= 1 &&
            savedWeek <= totalWeeks &&
            savedDay >= 0 &&
            savedDay < plan.week.length &&
            !plan.week[savedDay].rest;
    }).length;

    const remaining = Math.max(0, total - completed);

    const percent = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    // Count completed workouts in selected week
    const completedThisWeek = plan.week.filter(
        (day, index) =>
            !day.rest && isDone(week, index)
    ).length;

    return `
        <section class="progress-dashboard">

            <p class="progress-eyebrow">
                REP+ / YOUR PROGRESS
            </p>

            <h3>Your Fitness Journey</h3>

            <p class="progress-subtitle">
                Track your workouts and stay consistent.
            </p>

            <div class="progress-stats">

                <div class="progress-stat">
                    <span>Completed</span>
                    <strong>${completed}</strong>
                </div>

                <div class="progress-stat">
                    <span>Remaining</span>
                    <strong>${remaining}</strong>
                </div>

                <div class="progress-stat">
                    <span>Progress</span>
                    <strong>${percent}%</strong>
                </div>

                <div class="progress-stat">
                    <span>Total Weeks</span>
                    <strong>${totalWeeks}</strong>
                </div>

            </div>

            <div class="progress-summary">

                <div class="progress-summary-heading">
                    <span>Overall Progress</span>
                    <strong>${percent}%</strong>
                </div>

                <div class="progress-bar"
                     role="progressbar"
                     aria-label="Overall workout progress"
                     aria-valuemin="0"
                     aria-valuemax="100"
                     aria-valuenow="${percent}">

                    <div class="progress-fill"
                         style="width: ${percent}%">
                    </div>

                </div>

                <p>
                    ${completed} of ${total}
                    workouts completed
                </p>

            </div>

            <p class="progress-week">
                Week ${week}: ${completedThisWeek}
                of ${plan.days} workouts completed
            </p>

        </section>
    `;
}

// Workout History
// Old workouts without saved dates are still supported

function renderWorkoutHistory(plan) {
    const progress = loadProgress();
    const completedWorkouts = [];

    const totalWeeks = PROGRESSION.length;

    for (let week = 1; week <= totalWeeks; week++) {
        plan.week.forEach((day, dayIndex) => {
            if (day.rest) return;

            const workout = progress[week + "-" + dayIndex];

            const completed =
                workout === true ||
                (workout && workout.completed === true);

            if (completed) {
                completedWorkouts.push({
                    week: week,
                    day: dayIndex + 1,
                    date: workout === true
                        ? null
                        : workout.date || null
                });
            }
        });
    }

    if (completedWorkouts.length === 0) {
        return `
            <section class="workout-history">
                <h3>Workout History</h3>
                <p class="history-empty">
                    No completed workouts yet.
                    Finish your first workout to see it here!
                </p>
            </section>
        `;
    }

    const historyItems = completedWorkouts.map(workout => `
        <div class="history-item">
            <div>
                <strong>
                    Week ${workout.week} –
                    Day ${workout.day}
                </strong>
                <p>
                    ${workout.date || "Date not recorded"}
                </p>
            </div>
            <span class="history-check">✓ Done</span>
        </div>
    `).join("");

    return `
        <section class="workout-history">
            <p class="history-eyebrow">REP+ / ACTIVITY</p>
            <h3>Workout History</h3>
            <p class="history-subtitle">
                Your completed workout sessions
            </p>
            <div class="history-list">
                ${historyItems}
            </div>
        </section>
    `;
}

// REP+ Workout Calendar

let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

function renderWorkoutCalendar() {
    const progress = loadProgress();
    const completedDates = new Set();

    Object.values(progress).forEach(workout => {
        if (
            workout &&
            typeof workout === "object" &&
            workout.completed === true &&
            /^\d{4}-\d{2}-\d{2}$/.test(workout.date || "")
        ) {
            completedDates.add(workout.date);
        }
    });

    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const daysInMonth = new Date(
        calendarYear, calendarMonth + 1, 0
    ).getDate();

    // Monday is the first day of the week
    const startOffset = (firstDay.getDay() + 6) % 7;

    const monthName = firstDay.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric"
    });

    let calendarDays = "";

    for (let i = 0; i < startOffset; i++) {
        calendarDays += `<div class="calendar-empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date =
            calendarYear + "-" +
            String(calendarMonth + 1).padStart(2, "0") + "-" +
            String(day).padStart(2, "0");

        const done = completedDates.has(date);

        calendarDays += `
            <div class="calendar-day ${done ? "calendar-done" : ""}"
                 aria-label="${date}${done ? " - workout completed" : ""}">
                <span>${day}</span>
                ${done ? '<span class="calendar-check">✓</span>' : ""}
            </div>
        `;
    }

    return `
        <section class="workout-calendar">
            <p class="calendar-eyebrow">REP+ / ACTIVITY</p>
            <h3>Workout Calendar</h3>
            <p class="calendar-subtitle">
                Your completed workout days
            </p>

            <div class="calendar-navigation">
                <button type="button" class="calendar-prev"
                        aria-label="Previous month">‹</button>
                <strong>${monthName}</strong>
                <button type="button" class="calendar-next"
                        aria-label="Next month">›</button>
            </div>

            <div class="calendar-grid">
                ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                    .map(day => `<div class="calendar-weekday">${day}</div>`)
                    .join("")}
                ${calendarDays}
            </div>

            <p class="calendar-legend">
                <span class="calendar-legend-check">✓</span>
                Completed workout
            </p>
        </section>
    `;
}
