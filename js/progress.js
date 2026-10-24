
// ==========================================
// REP+ PROGRESS TRACKING
// ==========================================

const PROGRESS_KEY = "repPlusProgress";

// Load saved progress
function loadProgress() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(PROGRESS_KEY)
        );

        return saved &&
            typeof saved === "object" &&
            !Array.isArray(saved)
            ? saved
            : {};
    } catch {
        return {};
    }
}

// Check completed records, including old data
function isCompletedRecord(workout) {
    return workout === true ||
        (workout && workout.completed === true);
}

// Is this workout completed?
function isDone(week, dayIndex) {
    const progress = loadProgress();

    return isCompletedRecord(
        progress[week + "-" + dayIndex]
    );
}

// Local date as YYYY-MM-DD
function getLocalDate() {
    const now = new Date();

    return formatLocalDate(now);
}

function formatLocalDate(date) {
    return (
        date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0")
    );
}

// Parse a date without UTC timezone problems
function parseLocalDate(value) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return null;
    }

    const [year, month, day] =
        value.split("-").map(Number);

    const parsed = new Date(
        year, month - 1, day, 12
    );

    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month - 1 ||
        parsed.getDate() !== day
    ) {
        return null;
    }

    return parsed;
}

// Get Monday of the week containing a date
function getWeekMonday(dateString) {
    const date = parseLocalDate(dateString);

    if (!date) return null;

    const weekday = (date.getDay() + 6) % 7;

    date.setDate(date.getDate() - weekday);

    return formatLocalDate(date);
}

// Calculate the scheduled date of a workout
function getScheduledWorkoutDate(plan, week, dayIndex) {
    if (!plan || !plan.startDate) return null;

    const start = parseLocalDate(plan.startDate);

    if (!start) return null;

    if (
        !Number.isInteger(week) ||
        !Number.isInteger(dayIndex) ||
        week < 1 ||
        week > PROGRESSION.length ||
        dayIndex < 0 ||
        dayIndex > 6
    ) {
        return null;
    }

    // Week 1 begins on the chosen Monday
    const daysToAdd =
        (week - 1) * 7 + dayIndex;

    start.setDate(start.getDate() + daysToAdd);

    return formatLocalDate(start);
}

// Mark or unmark a workout
function toggleDone(week, dayIndex) {
    const progress = loadProgress();
    const key = week + "-" + dayIndex;

    if (isCompletedRecord(progress[key])) {
        delete progress[key];
    } else {
        progress[key] = {
            completed: true,
            completedAt: new Date().toISOString()
        };
    }

    localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify(progress)
    );
}

// Register a workout without toggling it off
function registerWorkout(week, dayIndex) {
    const progress = loadProgress();

    progress[week + "-" + dayIndex] = {
        completed: true,
        completedAt: new Date().toISOString()
    };

    localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify(progress)
    );
}

// Remove a workout
function removeWorkout(week, dayIndex) {
    const progress = loadProgress();

    delete progress[week + "-" + dayIndex];

    localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify(progress)
    );
}

// Reset progress when generating a new plan
function resetProgress() {
    localStorage.removeItem(PROGRESS_KEY);
}

// ==========================================
// PROGRESS DASHBOARD
// ==========================================

function renderProgress(plan, week) {
    const progress = loadProgress();

    const totalWeeks = PROGRESSION.length;
    const total = plan.days * totalWeeks;

    const completed = Object.keys(progress).filter(key => {
        const [savedWeek, savedDay] =
            key.split("-").map(Number);

        return isCompletedRecord(progress[key]) &&
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

// ==========================================
// WORKOUT CALENDAR
// ==========================================

let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

let selectedWorkoutDate = null;

// Find completed workouts scheduled for a date
function getCompletedWorkoutsByDate(plan, date) {
    const progress = loadProgress();
    const workouts = [];

    Object.entries(progress).forEach(([key, record]) => {
        if (!isCompletedRecord(record)) return;

        const match = /^(\d+)-(\d+)$/.exec(key);
        if (!match) return;

        const week = Number(match[1]);
        const dayIndex = Number(match[2]);

        if (
            !plan.week ||
            !plan.week[dayIndex] ||
            plan.week[dayIndex].rest
        ) {
            return;
        }

        const scheduledDate =
            getScheduledWorkoutDate(
                plan, week, dayIndex
            );

        if (scheduledDate === date) {
            workouts.push({
                week,
                dayIndex
            });
        }
    });

    return workouts;
}

// Render the calendar
function renderWorkoutCalendar(plan) {
    if (!plan || !plan.startDate) {
        return `
            <section class="workout-calendar">
                <h3>Workout Calendar</h3>
                <p>
                    Choose a program start date
                    to see your workout calendar.
                </p>
            </section>
        `;
    }

    const firstDay = new Date(
        calendarYear, calendarMonth, 1
    );

    const daysInMonth = new Date(
        calendarYear, calendarMonth + 1, 0
    ).getDate();

    const startOffset =
        (firstDay.getDay() + 6) % 7;

    const monthName = firstDay.toLocaleDateString(
        "en-GB",
        {
            month: "long",
            year: "numeric"
        }
    );

    let calendarDays = "";

    for (let i = 0; i < startOffset; i++) {
        calendarDays += `
            <div class="calendar-empty"></div>
        `;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = formatLocalDate(
            new Date(
                calendarYear,
                calendarMonth,
                day,
                12
            )
        );

        const completed =
            getCompletedWorkoutsByDate(plan, date);

        const done = completed.length > 0;
        const selected =
            selectedWorkoutDate === date;

        calendarDays += `
            <div
                class="calendar-day
                    ${done ? "calendar-done" : ""}
                    ${selected ? "calendar-selected" : ""}"
                aria-label="${date}${done
                    ? " - workout completed"
                    : ""}"
            >
                <span>${day}</span>
                ${done
                    ? '<span class="calendar-check">✓</span>'
                    : ""}
            </div>
        `;
    }

    return `
        <section class="workout-calendar">

            <p class="calendar-eyebrow">
                REP+ / ACTIVITY
            </p>

            <h3>Workout Calendar</h3>

            <p class="calendar-subtitle">
                Your scheduled workout progress
            </p>

            <div class="calendar-navigation">
                <button type="button"
                        class="calendar-prev"
                        aria-label="Previous month">
                    ‹
                </button>

                <strong>${monthName}</strong>

                <button type="button"
                        class="calendar-next"
                        aria-label="Next month">
                    ›
                </button>
            </div>

            <div class="calendar-grid">
                ${[
                    "Mon", "Tue", "Wed", "Thu",
                    "Fri", "Sat", "Sun"
                ].map(day => `
                    <div class="calendar-weekday">
                        ${day}
                    </div>
                `).join("")}

                ${calendarDays}
            </div>

            <p class="calendar-legend">
                <span class="calendar-legend-check">✓</span>
                Completed workout
            </p>

            <p class="calendar-start-info">
                Program starts:
                <strong>${plan.startDate}</strong>
            </p>

        </section>
    `;
}
