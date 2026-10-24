
 // REP+ Progress Tracking
// Tracks completed workouts across all weeks

const PROGRESS_KEY = "repPlusProgress";

// Load saved progress
function loadProgress() {
    try {
        return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch {
        return {};
    }
}

// Check if workout is completed
function isDone(week, dayIndex) {
    return loadProgress()[week + "-" + dayIndex] === true;
}

// Mark or unmark workout
function toggleDone(week, dayIndex) {
    const progress = loadProgress();
    const key = week + "-" + dayIndex;

    if (progress[key]) {
        delete progress[key];
    } else {
        progress[key] = true;
    }

    localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify(progress)
    );
}

// Reset progress for a new plan
function resetProgress() {
    localStorage.removeItem(PROGRESS_KEY);
}

// Render the new Progress Dashboard
function renderProgress(plan, week) {
    const progress = loadProgress();

    const totalWeeks = PROGRESSION.length;
    const total = plan.days * totalWeeks;

    const completed = Object.keys(progress).filter(key => {
        const [savedWeek, savedDay] = key.split("-").map(Number);

        return progress[key] === true &&
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

    const completedThisWeek = plan.week.filter((day, index) =>
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
                    ${completed} of ${total} workouts completed
                </p>
            </div>

            <p class="progress-week">
                Week ${week}: ${completedThisWeek}
                of ${plan.days} workouts completed
            </p>
        </section>
    `;
}

// REP+ Workout History

function renderWorkoutHistory(plan) {
    const progress = loadProgress();
    const completedWorkouts = [];

    const totalWeeks = PROGRESSION.length;

    for (let week = 1; week <= totalWeeks; week++) {
        plan.week.forEach((day, dayIndex) => {
            if (!day.rest && progress[week + "-" + dayIndex] === true) {
                completedWorkouts.push({
                    week: week,
                    day: dayIndex + 1
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
                    Week ${workout.week} – Day ${workout.day}
                </strong>
                <p>Workout completed</p>
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
