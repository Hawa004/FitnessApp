# REP+ – Your Personal Workout Planner

REP+ is a web app that creates a personal 4-week training plan from four simple choices, and lets you track the workouts you complete.

**Live demo:** https://hawa004.github.io/FitnessApp/ 

## The problem

Many people want to start training but don't know which exercises to do, how many sets and reps to use, or how to get stronger over time. REP+ answers these questions in a few seconds, without accounts, payment or personal data.

## Features

1. **Workout plan generator** – choose your goal (build muscle, get stronger, improve fitness), experience level, training days per week (2–7) and where you train (gym, home or both). The app builds a weekly plan with exercises, sets, reps and rest times.

2. **Personalised to your level** – beginners get basic exercises with light weight and a technique tip, while advanced users get more exercises, more sets and harder exercises like pull-ups. Small exercises get higher reps and max 3 sets, while heavy lifts get more sets.

3. **4-week progression** – Week 1–4 buttons change the load: find your weight, add weight, hardest week, then a lighter recovery week.

4. **Swap exercise (↻)** – replace an exercise with another one for the same muscle that fits your level and location.

5. **Workout tracking and progress dashboard** – choose a start date, mark workouts as done, and see completed/remaining workouts and a progress bar. Future workouts are locked (🔒), so you can only mark today's and earlier workouts as done.

6. **Workout calendar** – every workout gets a real date, and completed workouts are marked with ✓ in a monthly calendar.

7. **Exercise tips and workout time** – tap an exercise to see a short technique tip, with easier options where it helps (push-ups on your knees, band-assisted pull-ups), and every training day shows about how long the workout takes.

Sets, reps and rest times follow the ACSM (American College of Sports Medicine) guidelines for resistance training: heavy 4–6 reps with 2–3 min rest for strength, 8–12 reps with 1–2 min rest for muscle growth, 12–15+ reps with short rest for fitness, and 8–12 reps with light weight for beginners.

All data is saved in the browser (`localStorage`), so the plan and progress are still there after a refresh.

## How to run

No installation needed. Open `index.html` in a browser (or use the VS Code extension *Live Server*). Open `test.html` to run the automatic tests.

## Project structure

| File | Purpose |
|---|---|
| `index.html` | Page layout and questionnaire |
| `style.css` | Design (dark theme, pink accents, mobile layout) |
| `js/workouts.js` | Exercise database and plan logic: levels, goals, swap, 4-week progression |
| `js/progress.js` | Workout tracking, start date, progress dashboard and calendar |
| `js/script.js` | Connects the form and buttons to the logic |
| `test.html` | 29 automatic tests for the plan logic and progress tracking |

## How we used AI

We built REP+ with vibe coding: we described what we wanted in plain language, and AI coding assistants helped us turn our ideas into working code and find and fix bugs. We came up with the ideas, made the decisions, and wrote and adjusted a good part of the code ourselves.

- **From idea to code:** we decided what the app should do (a plan generator, levels, a 4-week progression, tracking, a calendar, exercise tips) and how to split the work between us. AI helped us turn these ideas into working HTML, CSS and JavaScript, which we then edited, tested and built on ourselves.
- **Debugging:** AI helped us understand error messages in the browser console. For example, the form did nothing because a variable called `location` crashed the whole script, and a 404 error turned out to be a wrong file name (`workout.js` instead of `workouts.js`).
- **Improving the AI's suggestions:** we did not just accept the first version. Beginners were only given "easy" exercises, but basic lifts like squats and bench press are exactly what beginners should learn, so we changed it so everyone gets the basic lifts while the level controls weight, sets and the hardest exercises.
- **Checking against real guidelines:** we asked how trainers actually recommend sets, reps and rest, and adjusted the rules to the ACSM guidelines (for example, beginners on the strength goal now use 8–12 reps instead of heavy 4–6). We also rewrote exercise tips ourselves, adding easier options and safety tips like "don't lock your knees" on the leg press.

## Testing

- `test.html` checks all 162 combinations of goal, level, days and location: every plan has 7 days, the right number of training days, enough exercises, no duplicates, only exercises that fit the location, and nothing too hard for the level.
- It also tests the goal rules, swap exercise, 4-week progression, progress tracking, exercise tips, workout time and the ACSM training guidelines. Result: **29 / 29 tests passed**.
- We tested the interface manually on desktop and mobile, and checked that the plan and progress are saved after a page refresh.

## Team

Two students: Person 1 (workout generator, exercise database, plan logic and tests) and Person 2 (design, layout, navigation, workout tracking and progress dashboard).