
// REP+ Main Application

const startBtn = document.getElementById("startBtn");
const workoutForm = document.getElementById("workoutForm");
const formResult = document.getElementById("formResult");

// Scroll to workout questionnaire
startBtn.addEventListener("click", () => {
    document.getElementById("planner").scrollIntoView({
        behavior: "smooth"
    });
});

// Generate workout plan
workoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const preferences = {
        goal: document.getElementById("goal").value,
        level: document.getElementById("level").value,
        days: Number(document.getElementById("days").value),
        location: document.getElementById("location").value
    };

    localStorage.setItem(
        "repPlusPreferences",
        JSON.stringify(preferences)
    );

    const plan = generatePlan(preferences);

    resetProgress();

    localStorage.setItem(
        "repPlusPlan",
        JSON.stringify(plan)
    );

    formResult.hidden = false;
    formResult.innerHTML =
    renderPlan(plan) + renderWorkoutHistory(plan);
    formResult.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Handle exercise swaps and week navigation
formResult.addEventListener("click", (event) => {
    const swapButton = event.target.closest(".swap-btn");
    const weekButton = event.target.closest(".week-btn");

    if (!swapButton && !weekButton) return;

    const savedPlan = localStorage.getItem("repPlusPlan");
    if (!savedPlan) return;

    const plan = JSON.parse(savedPlan);

    if (swapButton) {
        swapExercise(
            plan,
            Number(swapButton.dataset.day),
            Number(swapButton.dataset.exercise)
        );
    }

    if (weekButton) {
        plan.currentWeek = Number(weekButton.dataset.week);
    }

    localStorage.setItem(
        "repPlusPlan",
        JSON.stringify(plan)
    );

    formResult.innerHTML =
    renderPlan(plan) + renderWorkoutHistory(plan);
});

// Mark workouts as completed
formResult.addEventListener("change", (event) => {
    if (!event.target.matches(".done-check")) return;

    const savedPlan = localStorage.getItem("repPlusPlan");
    if (!savedPlan) return;

    const plan = JSON.parse(savedPlan);

    toggleDone(
        plan.currentWeek || 1,
        Number(event.target.dataset.day)
    );

    formResult.innerHTML =
    renderPlan(plan) + renderWorkoutHistory(plan);
});

// Restore saved plan
const savedPlan = localStorage.getItem("repPlusPlan");

if (savedPlan) {
    formResult.hidden = false;
    const restoredPlan = JSON.parse(savedPlan);

    formResult.innerHTML =
        renderPlan(restoredPlan) +
        renderWorkoutHistory(restoredPlan);
}
