
 // REP+ - Main application logic
const startBtn = document.getElementById("startBtn");
const workoutForm = document.getElementById("workoutForm");
const formResult = document.getElementById("formResult");

// Scroll to questionnaire
startBtn.addEventListener("click", () => {
    document.getElementById("planner").scrollIntoView({
        behavior: "smooth"
    });
});

// Generate a new workout plan
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

    // New plan starts with no completed workouts
    resetProgress();

    localStorage.setItem(
        "repPlusPlan",
        JSON.stringify(plan)
    );

    formResult.hidden = false;
    formResult.innerHTML = renderPlan(plan);

    formResult.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Swap exercises or switch weeks
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
    } else {
        plan.currentWeek = Number(weekButton.dataset.week);
    }

    localStorage.setItem(
        "repPlusPlan",
        JSON.stringify(plan)
    );

    formResult.innerHTML = renderPlan(plan);
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

    formResult.innerHTML = renderPlan(plan);
});

// Restore saved workout plan after refreshing
const savedPlan = localStorage.getItem("repPlusPlan");

if (savedPlan) {
    formResult.hidden = false;
    formResult.innerHTML = renderPlan(JSON.parse(savedPlan));
}
