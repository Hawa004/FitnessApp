// REP+ progress tracking
// Keeps track of which workouts the user has completed, per week.
// Saved in localStorage as { "1-0": true, "1-2": true } = "week-dayIndex"

const PROGRESS_KEY = "repPlusProgress";

// Read all saved progress (an empty object if nothing is saved yet)
function loadProgress() {
    try {
        return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch {
        return {};
    }
}

// Is this workout (week + day) marked as done?
function isDone(week, dayIndex) {
    return loadProgress()[week + "-" + dayIndex] === true;
}

// Check or uncheck a workout
function toggleDone(week, dayIndex) {
    const progress = loadProgress();
    const key = week + "-" + dayIndex;

    if (progress[key]) {
        delete progress[key];
    } else {
        progress[key] = true;
    }

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

// Start over (used when the user generates a new plan)
function resetProgress() {
    localStorage.removeItem(PROGRESS_KEY);
}

// HTML for the progress box shown above the week tabs
function renderProgress(plan, week) {
    const progress = loadProgress();
    const total = plan.days * PROGRESSION.length;      // workouts in all 4 weeks
    const done = Object.keys(progress).length;
    const doneThisWeek = Object.keys(progress).filter(key => key.startsWith(week + "-")).length;
    const percent = Math.round((done / total) * 100);

    return `<div class="progress-box">` +
           `<p><strong>${done} of ${total}</strong> workouts completed (${percent}%)</p>` +
           `<div class="progress-bar"><div class="progress-fill" style="width: ${percent}%"></div></div>` +
           `<p class="progress-week">Week ${week}: ${doneThisWeek} of ${plan.days} done</p>` +
           `</div>`;
}