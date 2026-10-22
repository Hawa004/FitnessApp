// REP+ workout generator 
// Exercise database + logic that turns the user's preferences into a weekly plan.
//  The plan is built with using JavaScript rules.
 
// ---------- Exercise database ----------
// where: "gym" = needs gym equipment, "home" = bodyweight/minimal equipment, "any" = works in both
// level: 1 = basic exercise everyone can learn (beginners use light weight)
//        2 = needs some experience, 3 = hard (needs strength/skill)
const EXERCISES = [
    // Chest
    { name: "Bench Press", muscle: "chest", where: "gym", level: 1 },
    { name: "Incline Dumbbell Press", muscle: "chest", where: "gym", level: 1 },
    { name: "Cable Fly", muscle: "chest", where: "gym", level: 1 },
    { name: "Push-ups", muscle: "chest", where: "any", level: 1 },
    { name: "Incline Push-ups", muscle: "chest", where: "home", level: 1 },
    { name: "Wide Push-ups", muscle: "chest", where: "home", level: 2 },
 
    // Back
    { name: "Lat Pulldown", muscle: "back", where: "gym", level: 1 },
    { name: "Barbell Row", muscle: "back", where: "gym", level: 1 },
    { name: "Seated Cable Row", muscle: "back", where: "gym", level: 1 },
    { name: "Pull-ups", muscle: "back", where: "any", level: 3 },
    { name: "Inverted Table Row", muscle: "back", where: "home", level: 2 },
    { name: "Superman Hold", muscle: "back", where: "home", level: 1 },
    { name: "Reverse Snow Angels", muscle: "back", where: "home", level: 1 },
 
    // Legs
    { name: "Back Squat", muscle: "legs", where: "gym", level: 1 },
    { name: "Romanian Deadlift", muscle: "legs", where: "gym", level: 1 },
    { name: "Leg Press", muscle: "legs", where: "gym", level: 1 },
    { name: "Bodyweight Squat", muscle: "legs", where: "home", level: 1 },
    { name: "Walking Lunges", muscle: "legs", where: "any", level: 1 },
    { name: "Glute Bridge", muscle: "legs", where: "home", level: 1 },
    { name: "Bulgarian Split Squat", muscle: "legs", where: "any", level: 3 },
    { name: "Goblet Squat", muscle: "legs", where: "gym", level: 1 },
    { name: "Step-ups", muscle: "legs", where: "any", level: 1 },
 
    // Shoulders
    { name: "Overhead Press", muscle: "shoulders", where: "gym", level: 1 },
    { name: "Lateral Raise", muscle: "shoulders", where: "gym", level: 1 },
    { name: "Pike Push-ups", muscle: "shoulders", where: "home", level: 2 },
    { name: "Arm Circles", muscle: "shoulders", where: "home", level: 1 },
 
    // Arms
    { name: "Dumbbell Curl", muscle: "arms", where: "gym", level: 1 },
    { name: "Triceps Pushdown", muscle: "arms", where: "gym", level: 1 },
    { name: "Bench Dips", muscle: "arms", where: "any", level: 2 },
    { name: "Diamond Push-ups", muscle: "arms", where: "home", level: 3 },
    { name: "Chair Dips (feet close)", muscle: "arms", where: "home", level: 1 },
 
    // Core
    { name: "Plank", muscle: "core", where: "any", level: 1 },
    { name: "Hanging Leg Raise", muscle: "core", where: "gym", level: 3 },
    { name: "Dead Bug", muscle: "core", where: "home", level: 1 },
    { name: "Mountain Climbers", muscle: "core", where: "any", level: 2 },
 
    // Cardio
    { name: "Rowing Machine", muscle: "cardio", where: "gym", level: 1 },
    { name: "Treadmill Intervals", muscle: "cardio", where: "gym", level: 2 },
    { name: "Jumping Jacks", muscle: "cardio", where: "home", level: 1 },
    { name: "Burpees", muscle: "cardio", where: "any", level: 3 },
    { name: "High Knees", muscle: "cardio", where: "home", level: 2 },
    { name: "Stationary Bike", muscle: "cardio", where: "gym", level: 1 },
    { name: "Step Jacks", muscle: "cardio", where: "home", level: 1 }
];
 
// ---------- Rules ----------
// Sets, reps and rest depend on the goal
// smallReps is used for small isolation exercises (see SMALL_EXERCISES),
// because heavy low-rep sets don't suit them
const GOAL_SETTINGS = {
    muscle:   { sets: 3, reps: "8-12",  smallReps: "12-15", rest: "60-90 sec", label: "Build Muscle" },
    strength: { sets: 4, reps: "4-6",   smallReps: "8-12",  rest: "2-3 min",   label: "Get Stronger" },
    fitness:  { sets: 3, reps: "12-15", smallReps: "15-20", rest: "30-45 sec", label: "Improve Fitness" }
};
 
const SMALL_EXERCISES = [
    "Cable Fly", "Lateral Raise", "Arm Circles", "Dumbbell Curl", "Triceps Pushdown",
    "Superman Hold", "Reverse Snow Angels", "Glute Bridge", "Dead Bug", "Chair Dips (feet close)"
];
 
// Experience level decides how many exercises per workout, adjusts sets
// and sets the hardest exercise level the user gets
const LEVEL_SETTINGS = {
    beginner:     { exercises: 4, extraSets: -1, maxLevel: 1,
                    tip: "Use a light weight and focus on technique. Stop when you could still do 3-4 more reps. Add a little weight when it feels easy." },
    intermediate: { exercises: 5, extraSets: 0,  maxLevel: 2,
                    tip: "Pick a weight where the last reps are hard but your form stays good (about 2 reps left)." },
    advanced:     { exercises: 6, extraSets: 1,  maxLevel: 3,
                    tip: "Train close to failure (about 1 rep left) and increase the weight a little every week." }
};
 
// Which muscle groups each workout type trains (in priority order)
const WORKOUT_TYPES = {
    "Full Body": ["legs", "chest", "back", "shoulders", "core", "arms"],
    "Upper Body": ["chest", "back", "shoulders", "arms", "chest", "back"],
    "Lower Body": ["legs", "legs", "legs", "core", "legs", "core"],
    "Push": ["chest", "shoulders", "chest", "arms", "shoulders", "core"],
    "Pull": ["back", "back", "arms", "back", "core", "shoulders"],
    "Legs": ["legs", "legs", "legs", "core", "legs", "core"],
    "Conditioning": ["cardio", "legs", "core", "cardio", "chest", "back"]
};
 
// Which workouts to do for each number of training days
const SPLITS = {
    2: ["Full Body", "Full Body"],
    3: ["Full Body", "Full Body", "Full Body"],
    4: ["Upper Body", "Lower Body", "Upper Body", "Lower Body"],
    5: ["Push", "Pull", "Legs", "Upper Body", "Lower Body"],
    6: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"],
    7: ["Push", "Pull", "Legs", "Conditioning", "Push", "Pull", "Legs"]
};
 
// Which weekdays to train, spread out so there are rest days in between
const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TRAINING_DAYS = {
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 4],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5],
    7: [0, 1, 2, 3, 4, 5, 6]
};
 
// 4-week progression: same exercises every week, but the load changes.
// Week 4 is a lighter recovery week (deload) before starting over.
const PROGRESSION = [
    { extraSets: 0,  note: "Week 1: Learn the exercises and find a weight that matches the tip above." },
    { extraSets: 0,  note: "Week 2: Same exercises, but add a little weight (e.g. +2.5 kg) or 1-2 more reps." },
    { extraSets: 1,  note: "Week 3: Hardest week. One extra set on every exercise." },
    { extraSets: -1, note: "Week 4: Recovery week. Fewer sets and about 20% lighter weight, so your body can recover." }
];
 
// ---------- Logic ----------
 
// Exercises the user can do at the chosen location and experience level
function getAvailableExercises(location, maxLevel) {
    return EXERCISES.filter(ex =>
        (location === "both" || ex.where === location || ex.where === "any") &&
        ex.level <= maxLevel
    );
}
 
// Pick exercises for one workout. "variation" rotates the choices so
// two workouts of the same type in one week don't get identical exercises.
function pickExercises(type, count, available, variation) {
    const chosen = [];
    const slots = WORKOUT_TYPES[type];
 
    for (let i = 0; chosen.length < count && i < slots.length * 2; i++) {
        const muscle = slots[i % slots.length];
        const options = available.filter(ex => ex.muscle === muscle && !chosen.includes(ex));
        if (options.length === 0) continue;
        chosen.push(options[(variation + i) % options.length]);
    }
    return chosen;
}
 
// Reps for one exercise: timed for cardio/plank, higher reps for small exercises
function getReps(ex, goal) {
    if (ex.muscle === "cardio") return "30-45 sec";
    if (ex.name === "Plank") return "30-60 sec";
    if (SMALL_EXERCISES.includes(ex.name)) return goal.smallReps;
    return goal.reps;
}
 
// Main function: preferences -> weekly plan
// preferences = { goal, level, days, location }
function generatePlan(preferences) {
    const goal = GOAL_SETTINGS[preferences.goal];
    const level = LEVEL_SETTINGS[preferences.level];
    const days = Number(preferences.days);
    const location = preferences.location || "both";
 
    if (!goal || !level || !SPLITS[days]) {
        throw new Error("Invalid preferences: " + JSON.stringify(preferences));
    }
 
    const available = getAvailableExercises(location, level.maxLevel);
    const sets = Math.max(2, goal.sets + level.extraSets);
    const split = SPLITS[days];
    const trainingDays = TRAINING_DAYS[days];
    const timesSeen = {};
 
    const week = WEEK_DAYS.map((dayName, index) => {
        const position = trainingDays.indexOf(index);
        if (position === -1) {
            return { day: dayName, rest: true, title: "Rest Day", exercises: [] };
        }
 
        const type = split[position];
        timesSeen[type] = (timesSeen[type] || 0) + 1;
        const picked = pickExercises(type, level.exercises, available, timesSeen[type] - 1);
 
        const exercises = picked.map(ex => ({
            name: ex.name,
            muscle: ex.muscle,
            sets: sets,
            reps: getReps(ex, goal),
            rest: goal.rest
        }));
 
        // Fitness goal: finish every workout with a short cardio block
        if (preferences.goal === "fitness" && type !== "Conditioning") {
            const cardio = available.filter(ex => ex.muscle === "cardio");
            const finisher = cardio[position % cardio.length];
            exercises.push({ name: finisher.name, muscle: "cardio", sets: 3, reps: "40 sec", rest: "20 sec" });
        }
 
        return { day: dayName, rest: false, title: type, exercises: exercises };
    });
 
    return {
        goal: preferences.goal,
        goalLabel: goal.label,
        level: preferences.level,
        tip: level.tip,
        currentWeek: 1,
        days: days,
        location: location,
        week: week
    };
}
 
// Swap one exercise for another one that trains the same muscle,
// fits the user's location and level, and isn't already in that workout.
// Returns the updated plan (or the same plan if there is no alternative).
function swapExercise(plan, dayIndex, exerciseIndex) {
    const day = plan.week[dayIndex];
    const current = day.exercises[exerciseIndex];
    const goal = GOAL_SETTINGS[plan.goal];
    const level = LEVEL_SETTINGS[plan.level];
    const inWorkout = day.exercises.map(ex => ex.name);
 
    const options = getAvailableExercises(plan.location, level.maxLevel)
        .filter(ex => ex.muscle === current.muscle);
    if (options.length < 2) return plan;
 
    // Go to the next exercise in the list after the current one, skipping
    // exercises that are already in this workout
    const start = options.findIndex(ex => ex.name === current.name);
    for (let step = 1; step < options.length; step++) {
        const next = options[(start + step) % options.length];
        if (!inWorkout.includes(next.name)) {
            day.exercises[exerciseIndex] = { ...current, name: next.name, reps: current.muscle === "cardio" ? current.reps : getReps(next, goal) };
            return plan;
        }
    }
    return plan;
}
 
// Sets for a given week (1-4), never fewer than 2
function getWeekSets(sets, week) {
    return Math.max(2, sets + PROGRESSION[week - 1].extraSets);
}
 
// Turn a plan into HTML 
function renderPlan(plan) {
    const week = plan.currentWeek || 1;
    const weekButtons = PROGRESSION.map((_, i) =>
        `<button class="week-btn${i + 1 === week ? " active" : ""}" data-week="${i + 1}">Week ${i + 1}</button>`
    ).join("");
 
    const cards = plan.week.map((day, dayIndex) => {
        if (day.rest) {
            return `<div class="day-card rest"><h3>${day.day}</h3><p>Rest Day 😴</p></div>`;
        }
        const rows = day.exercises.map((ex, exIndex) =>
            `<li><strong>${ex.name}</strong><span>${getWeekSets(ex.sets, week)} × ${ex.reps} · rest ${ex.rest}</span>` +
            `<button class="swap-btn" data-day="${dayIndex}" data-exercise="${exIndex}" title="Swap exercise">↻</button></li>`
        ).join("");
        return `<div class="day-card"><h3>${day.day}</h3><p class="day-title">${day.title}</p><ul>${rows}</ul></div>`;
    }).join("");
 
    return `<h3 class="plan-heading">Your ${plan.days}-day plan: ${plan.goalLabel} (${plan.level})</h3>` +
           `<p class="plan-tip">💡 ${plan.tip || ""}</p>` +
           `<div class="week-tabs">${weekButtons}</div>` +
           `<p class="week-note">${PROGRESSION[week - 1].note}</p>` +
           `<div class="plan-grid">${cards}</div>`;
}