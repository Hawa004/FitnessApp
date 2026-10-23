const startBtn = document.getElementById("startBtn");
const workoutForm = document.getElementById("workoutForm");
const formResult = document.getElementById("formResult");

// Scroll to questionnaire
startBtn.addEventListener("click", () => {
    document.getElementById("planner").scrollIntoView({
        behavior: "smooth"
    });
});

// Handle questionnaire submission
workoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const goal = document.getElementById("goal").value;
    const level = document.getElementById("level").value;
    const days = document.getElementById("days").value;
    const location = document.getElementById("location").value;

    // Save preferences for the workout generator
    const preferences = {
        goal: goal,
        level: level,
        days: Number(days),
        location: location
    };

    localStorage.setItem(
        "repPlusPreferences",
        JSON.stringify(preferences)
    );

    localStorage.setItem(
        "repPlusPlan", JSON.stringify(plan));
    resetProgress(); // a new plan starts with no completed workouts
    
    const swapButton = event.target.closest(".swap-btn");
    const weekButton = event.target.closest(".week-btn");
    const doneBox = event.target.closest(".done-check");
    if (!swapButton && !weekButton && !doneBox) return;

    // Generate and show the workout plan (workouts.js)
    const plan = generatePlan(preferences);
    localStorage.setItem("repPlusPlan", JSON.stringify(plan));

    formResult.hidden = false;
    formResult.innerHTML = renderPlan(plan);

    formResult.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Swap an exercise (↻) or change week (Week 1-4) in the plan (workouts.js)
formResult.addEventListener("click", (event) => {
    const swapButton = event.target.closest(".swap-btn");
    const weekButton = event.target.closest(".week-btn");
    if (!swapButton && !weekButton) return;

    const plan = JSON.parse(localStorage.getItem("repPlusPlan"));
    if (swapButton) {
        swapExercise(plan, Number(swapButton.dataset.day), Number(swapButton.dataset.exercise));
    } else {
        plan.currentWeek = Number(weekButton.dataset.week);
    }
    localStorage.setItem("repPlusPlan", JSON.stringify(plan));
    formResult.innerHTML = renderPlan(plan);
});

// Show the saved plan again after a page refresh
const savedPlan = localStorage.getItem("repPlusPlan");
if (savedPlan) {
    formResult.hidden = false;
    formResult.innerHTML = renderPlan(JSON.parse(savedPlan));
}