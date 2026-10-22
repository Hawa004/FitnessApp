document.getElementById("startBtn").addEventListener("click", () => {
    alert("Coming next: Your personalized workout planner!");
});

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

    // Save preferences for the workout generator
    const preferences = {
        goal: goal,
        level: level,
        days: Number(days)
    };

    localStorage.setItem(
        "repPlusPreferences",
        JSON.stringify(preferences)
    );

    // Show confirmation
    const goalNames = {
        muscle: "Build Muscle",
        strength: "Get Stronger",
        fitness: "Improve Fitness"
    };

    formResult.hidden = false;
    formResult.textContent =
        `Your preferences are saved! Goal: ${goalNames[goal]}, ` +
        `Level: ${level}, Training days: ${days}. ` +
        `Your workout plan will be generated in the next step.`;

    formResult.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});