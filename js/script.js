
// ==========================================
// REP+ MAIN APPLICATION
// ==========================================

const startBtn = document.getElementById("startBtn");
const workoutForm = document.getElementById("workoutForm");
const formResult = document.getElementById("formResult");

// Scroll to questionnaire
if (startBtn) {
    startBtn.addEventListener("click", () => {
        document.getElementById("planner")
            .scrollIntoView({
                behavior: "smooth"
            });
    });
}

// Create start-date selector
function createStartDateSelector() {
    if (document.getElementById("programStartDate")) {
        return;
    }

    const container = document.createElement("div");
    container.className = "form-group start-date-group";

    container.innerHTML = `
        <label for="programStartDate">
            When does your workout program start?
        </label>

        <input
            type="date"
            id="programStartDate"
            required
        >

        <p class="start-date-help">
        Your first workout starts on your selected date.
        Each new training week starts 7 days later.
        </p>
    `;

    const submitButton = workoutForm.querySelector(
        'button[type="submit"], .generate-btn'
    );

    if (submitButton) {
        submitButton.before(container);
    } else {
        workoutForm.appendChild(container);
    }

    const dateInput = document.getElementById(
        "programStartDate"
    );

    dateInput.value = getLocalDate();
}

// Add selector to questionnaire
createStartDateSelector();

// Display plan and calendar
function displayWorkoutPlan(plan) {
    formResult.hidden = false;

    formResult.innerHTML =
        renderPlan(plan) +
        renderWorkoutCalendar(plan);
}

// Generate new plan
workoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedDate = document.getElementById(
        "programStartDate"
    ).value;

    const startDate = selectedDate;

    if (!startDate) {
        alert("Please choose a valid start date.");
        return;
    }

    const preferences = {
        goal: document.getElementById("goal").value,
        level: document.getElementById("level").value,
        days: Number(
            document.getElementById("days").value
        ),
        location: document.getElementById(
            "location"
        ).value
    };

    localStorage.setItem(
        "repPlusPreferences",
        JSON.stringify(preferences)
    );

    const plan = generatePlan(preferences);

    // Save the start of week 1
    plan.startDate = startDate;

    // Reset progress for a new plan
    resetProgress();

    localStorage.setItem(
        "repPlusPlan",
        JSON.stringify(plan)
    );

    // Show the start month
    const start = parseLocalDate(startDate);

    calendarMonth = start.getMonth();
    calendarYear = start.getFullYear();

    selectedWorkoutDate = null;

    displayWorkoutPlan(plan);

    formResult.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Handle buttons
formResult.addEventListener("click", (event) => {
    const previous = event.target.closest(
        ".calendar-prev"
    );

    const next = event.target.closest(
        ".calendar-next"
    );

    const savedPlan = localStorage.getItem(
        "repPlusPlan"
    );

    if (!savedPlan) return;

    const plan = JSON.parse(savedPlan);

    // Calendar navigation
    if (previous || next) {
        if (previous) {
            calendarMonth--;
        } else {
            calendarMonth++;
        }

        if (calendarMonth < 0) {
            calendarMonth = 11;
            calendarYear--;
        }

        if (calendarMonth > 11) {
            calendarMonth = 0;
            calendarYear++;
        }

        const calendar = formResult.querySelector(
            ".workout-calendar"
        );

        if (calendar) {
            calendar.outerHTML =
                renderWorkoutCalendar(plan);
        }

        return;
    }

    // Save start date for an older plan
    const saveStartButton = event.target.closest(
        ".save-plan-start"
    );

    if (saveStartButton) {
        const dateInput = formResult.querySelector(
            ".existing-plan-start"
        );

       const startDate = dateInput.value;
 
        if (!startDate) return;

        plan.startDate = startDate;

        localStorage.setItem(
            "repPlusPlan",
            JSON.stringify(plan)
        );

        const start = parseLocalDate(startDate);

        calendarMonth = start.getMonth();
        calendarYear = start.getFullYear();

        displayWorkoutPlan(plan);
        return;
    }

    // Exercise swaps and week tabs
    const swapButton = event.target.closest(
        ".swap-btn"
    );

    const weekButton = event.target.closest(
        ".week-btn"
    );

    if (!swapButton && !weekButton) return;

    if (swapButton) {
        swapExercise(
            plan,
            Number(swapButton.dataset.day),
            Number(swapButton.dataset.exercise)
        );
    }

    if (weekButton) {
        plan.currentWeek = Number(
            weekButton.dataset.week
        );
    }

    localStorage.setItem(
        "repPlusPlan",
        JSON.stringify(plan)
    );

    displayWorkoutPlan(plan);
});

// Mark completed workouts
formResult.addEventListener("change", (event) => {
    if (!event.target.matches(".done-check")) {
        return;
    }

    const savedPlan = localStorage.getItem(
        "repPlusPlan"
    );

    if (!savedPlan) return;

    const plan = JSON.parse(savedPlan);

    toggleDone(
        plan.currentWeek || 1,
        Number(event.target.dataset.day)
    );

    displayWorkoutPlan(plan);
});

// Restore saved plan
const savedPlan = localStorage.getItem(
    "repPlusPlan"
);

if (savedPlan) {
    try {
        const restoredPlan = JSON.parse(savedPlan);

        if (!restoredPlan.startDate) {
            formResult.hidden = false;

            formResult.innerHTML = `
                <section class="start-date-setup">
                    <h3>Set your program start date</h3>

                    <p>
                        Choose when week 1 began.
                        Your completed workouts
                        will be kept.
                    </p>

                    <label for="existingPlanStart">
                        Program start date
                    </label>

                    <input
                        type="date"
                        id="existingPlanStart"
                        class="existing-plan-start"
                        value="${getLocalDate()}"
                    >

                    <button
                        type="button"
                        class="save-plan-start">
                        Save Start Date
                    </button>
                </section>
            `;
        } else {
            const start = parseLocalDate(
                restoredPlan.startDate
            );

            if (start) {
                calendarMonth = start.getMonth();
                calendarYear = start.getFullYear();
            }

            displayWorkoutPlan(restoredPlan);
        }
    } catch (error) {
        console.error(
            "Could not restore workout plan:",
            error
        );
    }
}
