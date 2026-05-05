# GradePilot

GradePilot is a student-focused academic planning web app that helps users estimate their current course grade, calculate the score needed on a final exam, and predict their semester GPA.

## Live Site

Live site link: https://cs254-final-project-gradepilot.pages.dev/

## Features

- Estimate current course grade from weighted categories
- Calculate the final exam score needed for a target grade
- Estimate semester GPA using courses, credits, and expected grades
- Display results in a live academic dashboard
- Save, delete, and reset user entries with browser local storage
- Use a responsive layout for desktop and mobile screens

## Tech Stack

- HTML
- CSS
- JavaScript
- Browser Local Storage
- Cloudflare Pages

## How It Works

GradePilot uses HTML to structure the webpage, CSS to create the layout and visual design, and JavaScript to handle calculations and user interactions.

The Course Grade Estimator stores grading categories in a JavaScript array and calculates the weighted average based on each category’s score and weight.

The Final Exam Goal Calculator estimates the score needed on the final exam based on the user’s current estimated grade, final exam weight, and target course grade.

The GPA Calculator stores course entries in a separate JavaScript array and calculates semester GPA using grade points and credit hours.

Browser local storage is used to save the user’s progress in the same browser.

## Technical Challenge
One of the most significant technical challenges was implementing the unified, real-time validation state for the Course Grade Estimator. I had to ensure that the "Maximum possible final weight" dynamically subtracted the weights of existing grade categories so users couldn't exceed 100% capacity. This required binding a single real-time validation function to multiple input fields simultaneously, tracking both pre-click typing and post-click calculation attempts, and conditionally rendering compound error messages (e.g., warning a user about both an out-of-bounds weight *and* an invalid target grade at the exact same time).

## Future Improvements
If I were to continue developing this application, I would implement a full backend database (using Python/Flask and SQLite or Firebase) with user authentication. Currently, the app relies on LocalStorage, meaning a user's data is tied to a specific browser and device. Adding a backend would allow students to log in and access their GradePilot dashboard from anywhere.
