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
    muscle:   { sets: 3, reps: "8-12",  smallReps: "12-15", rest: "60-90 sec", smallRest: "60-90 sec", label: "Build Muscle" },
    strength: { sets: 4, reps: "4-6",   smallReps: "8-12",  rest: "2-3 min",   smallRest: "60-90 sec", label: "Get Stronger" },
    fitness:  { sets: 3, reps: "12-15", smallReps: "15-20", rest: "30-45 sec", smallRest: "30-45 sec", label: "Improve Fitness" }
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
 
// Short technique tips shown when the user taps an exercise
const EXERCISE_TIPS = {
    "Bench Press": "Feet flat, shoulder blades squeezed together. Lower the bar to mid-chest and press up.",
    "Incline Dumbbell Press": "Bench at about 30°. Lower the dumbbells to the upper chest with elbows slightly in.",
    "Cable Fly": "Slight bend in the elbows. Bring your hands together in a wide hug and squeeze the chest.",
    "Push-ups": "Body in a straight line from head to heels. Chest close to the floor, elbows at about 45°. Easier option: do them on your knees.",
    "Incline Push-ups": "Hands on a bench or table. Easier than normal push-ups. Keep your body straight.",
    "Wide Push-ups": "Hands wider than shoulders. Lower slowly and keep your core tight.",
    "Lat Pulldown": "Pull the bar to your upper chest, elbows down and back. Don't swing your body.",
    "Barbell Row": "Hinge forward with a flat back. Pull the bar to your belly button and squeeze the back.",
    "Seated Cable Row": "Sit tall. Pull the handle to your stomach and squeeze your shoulder blades together.",
        "Pull-ups": "Start from a dead hang and pull your chin over the bar. Lower slowly with control. Easier option: use a resistance band for support.",
    "Inverted Table Row": "Lie under a sturdy table, grip the edge and pull your chest up. Keep your body straight.",
    "Superman Hold": "Lie on your stomach and lift arms and legs a little off the floor. Hold and breathe.",
    "Reverse Snow Angels": "Lie on your stomach, arms slightly lifted, and sweep them from your hips to over your head.",
    "Back Squat": "Bar on your upper back, chest up. Sit down until thighs are parallel and push through your heels.",
    "Romanian Deadlift": "Soft knees, push your hips back and lower the weight along your legs with a flat back.",
        "Leg Press": "Feet shoulder-width on the plate. Lower until knees are at 90° without lifting your hips. Don't lock your knees at the top.",
    "Bodyweight Squat": "Feet shoulder-width apart. Sit back like on a chair and keep your heels on the floor.",
    "Walking Lunges": "Long step forward, back knee almost touching the floor. Keep your upper body tall.",
    "Glute Bridge": "Lie on your back, feet flat. Push your hips up and squeeze your glutes at the top.",
    "Bulgarian Split Squat": "Back foot on a bench. Lower straight down on the front leg and keep your knee over the foot.",
    "Goblet Squat": "Hold a dumbbell at your chest. Squat down between your knees with your chest up.",
    "Step-ups": "Step onto a bench or stair with the whole foot and push up through the front heel.",
    "Overhead Press": "Squeeze glutes and core. Press the weight straight up until your arms are locked out.",
    "Lateral Raise": "Light weights. Lift your arms out to the sides to shoulder height with a slight elbow bend.",
    "Pike Push-ups": "Hips high in an upside-down V. Lower your head toward the floor between your hands.",
    "Arm Circles": "Arms straight out to the sides. Make small, controlled circles both ways.",
    "Dumbbell Curl": "Elbows close to your body. Curl the weights up without swinging.",
    "Triceps Pushdown": "Elbows locked at your sides. Push the rope or bar down until your arms are straight.",
    "Bench Dips": "Hands on a bench behind you. Lower until elbows are at 90° and push back up.",
    "Diamond Push-ups": "Hands close together under your chest in a diamond shape. Elbows stay close to the body.",
    "Chair Dips (feet close)": "Hands on a chair behind you, feet close to the chair. Lower slowly and push up.",
    "Plank": "Elbows under shoulders, body straight. Squeeze your stomach and don't let the hips drop.",
    "Hanging Leg Raise": "Hang from a bar and lift your legs with control. Avoid swinging.",
    "Dead Bug": "On your back, arms up. Lower the opposite arm and leg slowly while your lower back stays down.",
    "Mountain Climbers": "Plank position. Drive your knees toward your chest one at a time, fast but controlled.",
    "Rowing Machine": "Push with the legs first, then lean back and pull the handle to your chest.",
    "Treadmill Intervals": "Alternate fast running and walking. Start slowly and warm up first.",
    "Jumping Jacks": "Jump feet apart while lifting your arms over your head, then back together.",
    "Burpees": "Squat, jump back to a plank, do a push-up, jump forward and jump up.",
    "High Knees": "Run on the spot and lift your knees to hip height. Stay on the balls of your feet.",
    "Stationary Bike": "Seat at hip height. Keep a steady pace where you can still talk a little.",
    "Step Jacks": "Like jumping jacks without the jump. Step one foot out to the side at a time."
};

// Estimated workout time in minutes: 10 min warm-up + about 40 sec
// of work per set + the rest between sets, rounded to the nearest 5 min
function parseRestSeconds(rest) {
    const numbers = (rest.match(/\d+/g) || []).map(Number);
    if (numbers.length === 0) return 60;
    const average = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return rest.includes("min") ? average * 60 : average;
}

function estimateWorkoutMinutes(day, week) {
    const seconds = day.exercises.reduce((total, ex) =>
        total + getWeekSets(ex.sets, week) * (40 + parseRestSeconds(ex.rest)), 0);
    return Math.round((10 + seconds / 60) / 5) * 5;
}


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

// Small exercises never get more than 3 sets
function getSets(ex, sets) {
    return SMALL_EXERCISES.includes(ex.name) ? Math.min(sets, 3) : sets;
}

// Beginners learn with 8-12 reps instead of heavy 4-6 (based on ACSM training guidelines)
function getGoalSettings(goalKey, levelKey) {
    const goal = GOAL_SETTINGS[goalKey];
    if (goal && goalKey === "strength" && levelKey === "beginner") {
        return { ...goal, reps: "8-12", smallReps: "12-15", rest: "1-2 min" };
    }
    return goal;
}

// Shorter rest for small exercises
function getRest(ex, goal) {
    return SMALL_EXERCISES.includes(ex.name) ? goal.smallRest : goal.rest;
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
    const goal =  getGoalSettings(preferences.goal, preferences.level);
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
            sets: getSets(ex, sets),
            reps: getReps(ex, goal),
            rest: getRest(ex, goal)
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
    const goal = getGoalSettings(plan.goal, plan.level);
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
                       const baseSets = Math.max(2, goal.sets + level.extraSets);
            day.exercises[exerciseIndex] = {
                ...current,
                name: next.name,
                sets: current.muscle === "cardio" ? current.sets : getSets(next, baseSets),
                reps: current.muscle === "cardio" ? current.reps : getReps(next, goal),
                rest: current.muscle === "cardio" ? current.rest : getRest(next, goal)
            };
            return plan;
        }
    }
    return plan;
}
 
// Sets for a given week (1-4), never fewer than 2
function getWeekSets(sets, week) {
    return Math.max(2, sets + PROGRESSION[week - 1].extraSets);
}
 

// ==========================================
// REP+ WORKOUT PLAN DISPLAY
// Dynamic weekdays based on program start
// ==========================================

// Get the actual date and weekday of a workout
function getWorkoutDisplayDate(plan, week, dayIndex) {
    const dateString = getScheduledWorkoutDate(
        plan,
        week,
        dayIndex
    );

    if (!dateString) {
        return {
            weekday: plan.week[dayIndex].day,
            date: ""
        };
    }

    const date = parseLocalDate(dateString);

    if (!date) {
        return {
            weekday: plan.week[dayIndex].day,
            date: ""
        };
    }

    return {
        weekday: date.toLocaleDateString("en-GB", {
            weekday: "long"
        }),

        date: date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        })
    };
}

// Render the complete workout plan
function renderPlan(plan) {
    const week = plan.currentWeek || 1;

    // Week navigation buttons
    const weekButtons = PROGRESSION.map((_, i) => `
        <button
            type="button"
            class="week-btn${i + 1 === week ? " active" : ""}"
            data-week="${i + 1}">
            Week ${i + 1}
        </button>
    `).join("");

    // Generate workout and rest-day cards
    const cards = plan.week.map((day, dayIndex) => {

        // Calculate the actual scheduled date
        const displayDate = getWorkoutDisplayDate(
            plan,
            week,
            dayIndex
        );

        const dayHeading = `
            <h3>${displayDate.weekday}</h3>
            ${displayDate.date
                ? `<p class="workout-date">
                    ${displayDate.date}
                   </p>`
                : ""}
        `;

        // Rest days
        if (day.rest) {
            return `
                <div class="day-card rest">
                    ${dayHeading}
                    <p>Rest Day 😴</p>
                </div>
            `;
        }

        // Exercises
        const rows = day.exercises.map(
            (ex, exIndex) => `
                <li>
                        <details class="exercise-info">
                        <summary><strong>${ex.name}</strong></summary>
                        <p>${EXERCISE_TIPS[ex.name] || ""}</p>
                    </details>

                    <span>
                        ${getWeekSets(ex.sets, week)}
                        × ${ex.reps}
                        · rest ${ex.rest}
                    </span>

                    <button
                        type="button"
                        class="swap-btn"
                        data-day="${dayIndex}"
                        data-exercise="${exIndex}"
                        title="Swap exercise">
                        ↻
                    </button>
                </li>
            `
        ).join("");

       const scheduledDate = getScheduledWorkoutDate(
    plan,
    week,
    dayIndex
);

        const today = getLocalDate();

        const isFutureWorkout = scheduledDate > today;

        const checked = isDone(week, dayIndex)
            ? "checked"
            : "";

        const disabled = isFutureWorkout
            ? "disabled"
            : "";

        const doneBox = `
        <label class="done-label">
            <input
            type="checkbox"
            class="done-check"
            data-day="${dayIndex}"
            ${checked}
            ${disabled}>
            ${isFutureWorkout ? "Upcoming 🔒" : "Done"}
        </label>
        `;

        return `
            <div class="day-card${checked
                ? " completed"
                : ""}">

                ${dayHeading}

                <p class="day-title">
                    ${day.title}
                </p>

                <p class="workout-time">
                    ⏱ About ${estimateWorkoutMinutes(day, week)} min
                </p>

                <ul>
                    ${rows}
                </ul>

                ${doneBox}
            </div>
        `;
    }).join("");

    // Full plan HTML
    return `
        <h3 class="plan-heading">
            Your ${plan.days}-day plan:
            ${plan.goalLabel} (${plan.level})
        </h3>

        <p class="plan-tip">
            💡 ${plan.tip || ""}
        </p>

        ${renderProgress(plan, week)}

        <div class="week-tabs">
            ${weekButtons}
        </div>

        <p class="week-note">
            ${PROGRESSION[week - 1].note}
        </p>

        <div class="plan-grid">
            ${cards}
        </div>
    `;
}
