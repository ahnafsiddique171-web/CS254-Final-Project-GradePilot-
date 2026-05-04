let requiredFinalScore = null;
let hasAttemptedCalculation = false; //: Tracks if the calculate button has been clicked

const gradeForm = document.getElementById("grade-form");
const gpaForm = document.getElementById("gpa-form");

const gradeTableBody = document.getElementById("grade-table-body");
const gpaTableBody = document.getElementById("gpa-table-body");

const calculateFinalBtn = document.getElementById("calculate-final-btn");
const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");

const tabButtons = document.querySelectorAll(".tab-btn");
const toolSections = document.querySelectorAll(".tool-section");

let gradeCategories = JSON.parse(localStorage.getItem("gradeCategories")) || [];
let gpaCourses = JSON.parse(localStorage.getItem("gpaCourses")) || [];

let requiredFinalScore = null;

function saveData() {
  localStorage.setItem("gradeCategories", JSON.stringify(gradeCategories));
  localStorage.setItem("gpaCourses", JSON.stringify(gpaCourses));
}

function getLetterGrade(percentage) {
  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 67) return "D+";
  if (percentage >= 60) return "D";
  return "F";
}

function calculateCourseGrade() {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  gradeCategories.forEach(category => {
    totalWeightedScore += category.score * (category.weight / 100);
    totalWeight += category.weight;
  });

  if (totalWeight === 0) {
    return null;
  }

  return (totalWeightedScore / totalWeight) * 100;
}

function calculateGPA() {
  let totalQualityPoints = 0;
  let totalCredits = 0;

  gpaCourses.forEach(course => {
    totalQualityPoints += course.gradePoints * course.credits;
    totalCredits += course.credits;
  });

  if (totalCredits === 0) {
    return {
      gpa: null,
      credits: 0
    };
  }

  return {
    gpa: totalQualityPoints / totalCredits,
    credits: totalCredits
  };
}

function renderGradeTable() {
  gradeTableBody.innerHTML = "";

  if (gradeCategories.length === 0) {
    gradeTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-message">No categories added yet.</td>
      </tr>
    `;
    return;
  }

  gradeCategories.forEach((category, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${category.name}</td>
      <td>${category.weight}%</td>
      <td>${category.score}%</td>
      <td>
        <button class="delete-small-btn" onclick="deleteGradeCategory(${index})">
          Delete
        </button>
      </td>
    `;

    gradeTableBody.appendChild(row);
  });
}

function renderGpaTable() {
  gpaTableBody.innerHTML = "";

  if (gpaCourses.length === 0) {
    gpaTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-message">No courses added yet.</td>
      </tr>
    `;
    return;
  }

  gpaCourses.forEach((course, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${course.name}</td>
      <td>${course.credits}</td>
      <td>${course.gradePoints.toFixed(1)}</td>
      <td>
        <button class="delete-small-btn" onclick="deleteGpaCourse(${index})">
          Delete
        </button>
      </td>
    `;

    gpaTableBody.appendChild(row);
  });
}

function updateDashboard() {
  const currentTotalWeight = gradeCategories.reduce((sum, category) => sum + category.weight, 0);
  const finalWeightVal = Math.max(0, Number(document.getElementById("final-weight").value) || 0);
  
  // Calculate non-negative max values
  const maxFinalWeight = Math.max(0, 100 - currentTotalWeight);
  const maxCategoryWeight = Math.max(0, maxFinalWeight - finalWeightVal);

  // Update all three text displays
  document.getElementById("max-weight-display").textContent = `Maximum possible final weight: ${maxFinalWeight}%`;
  document.getElementById("current-weight-display").textContent = `${finalWeightVal}%`;
  document.getElementById("max-category-weight-display").textContent = `Maximum possible category weight: ${maxCategoryWeight}%`;
  
  const courseGrade = calculateCourseGrade();
  const gpaData = calculateGPA();

  const heroCourseGrade = document.getElementById("hero-course-grade");
  const heroGpa = document.getElementById("hero-gpa");

  const dashboardCourseGrade = document.getElementById("dashboard-course-grade");
  const dashboardLetterGrade = document.getElementById("dashboard-letter-grade");
  const dashboardFinalNeeded = document.getElementById("dashboard-final-needed");
  const dashboardGpa = document.getElementById("dashboard-gpa");
  const dashboardTotalCredits = document.getElementById("dashboard-total-credits");
  const gpaResult = document.getElementById("gpa-result");
  const academicStatus = document.getElementById("academic-status");

  if (courseGrade === null) {
    heroCourseGrade.textContent = "--%";
    dashboardCourseGrade.textContent = "--%";
    dashboardLetterGrade.textContent = "Letter Grade: --";
  } else {
    heroCourseGrade.textContent = `${courseGrade.toFixed(1)}%`;
    dashboardCourseGrade.textContent = `${courseGrade.toFixed(1)}%`;
    dashboardLetterGrade.textContent = `Letter Grade: ${getLetterGrade(courseGrade)}`;
  }

  if (requiredFinalScore === null || Number.isNaN(requiredFinalScore)) {
    dashboardFinalNeeded.textContent = "--%";
  } else if (requiredFinalScore > 100) {
    dashboardFinalNeeded.textContent = `${requiredFinalScore.toFixed(1)}%`;
  } else if (requiredFinalScore < 0) {
    dashboardFinalNeeded.textContent = "0%";
  } else {
    dashboardFinalNeeded.textContent = `${requiredFinalScore.toFixed(1)}%`;
  }

  if (gpaData.gpa === null) {
    heroGpa.textContent = "--";
    dashboardGpa.textContent = "--";
    gpaResult.textContent = "--";
    dashboardTotalCredits.textContent = "Credits: 0";
  } else {
    heroGpa.textContent = gpaData.gpa.toFixed(2);
    dashboardGpa.textContent = gpaData.gpa.toFixed(2);
    gpaResult.textContent = gpaData.gpa.toFixed(2);
    dashboardTotalCredits.textContent = `Credits: ${gpaData.credits}`;
  }

  academicStatus.textContent = generateAcademicStatus(courseGrade, gpaData.gpa);
}

function generateAcademicStatus(courseGrade, gpa) {
  if (courseGrade === null && gpa === null) {
    return "Add your course grade categories and GPA courses to generate a personalized academic summary.";
  }

  if (courseGrade !== null && gpa !== null) {
    return `Your estimated course grade is ${courseGrade.toFixed(1)}% (${getLetterGrade(courseGrade)}), and your predicted semester GPA is ${gpa.toFixed(2)}. Use this information to decide where to focus your study time.`;
  }

  if (courseGrade !== null) {
    return `Your estimated course grade is ${courseGrade.toFixed(1)}% (${getLetterGrade(courseGrade)}). Add GPA courses to see your full semester outlook.`;
  }

  return `Your predicted semester GPA is ${gpa.toFixed(2)}. Add course grade categories to estimate your current class performance.`;
}

function deleteGradeCategory(index) {
  gradeCategories.splice(index, 1);
  requiredFinalScore = null;
  saveData();
  renderGradeTable();
  updateDashboard();
  document.getElementById("final-result-box").style.display = "none";
  document.getElementById("category-error-box").style.display = "none";
}

function deleteGpaCourse(index) {
  gpaCourses.splice(index, 1);
  saveData();
  renderGpaTable();
  updateDashboard();
  
  document.getElementById("gpa-error-box").style.display = "none";
}

gradeForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("category-name").value.trim();
  const weight = Number(document.getElementById("category-weight").value);
  const score = Number(document.getElementById("category-score").value);
  const categoryErrorBox = document.getElementById("category-error-box");
  
  // Hide the error box upon a new submission attempt
  categoryErrorBox.style.display = "none";

  if (!name || weight <= 0 || score < 0) {
    categoryErrorBox.textContent = "Please enter a valid category name, weight, and score.";
    categoryErrorBox.style.display = "block";
    return;
  }

  const currentTotalWeight = gradeCategories.reduce((sum, category) => sum + category.weight, 0);
  const finalWeightVal = Number(document.getElementById("final-weight").value) || 0;
  const totalWithFinal = currentTotalWeight + finalWeightVal;

  // Rule 2: If the sum is already 100, block further additions
  if (currentTotalWeight === 100 || totalWithFinal === 100) {
    categoryErrorBox.textContent = "Cannot add more categories. The total weight capacity is already at 100%.";
    categoryErrorBox.style.display = "block";
    return;
  }

  // Rule 3: If the new category pushes the sum over 100, block it
  if (totalWithFinal + weight > 100) {
    const maxAllowed = 100 - totalWithFinal;
    categoryErrorBox.textContent = `Error: This category exceeds the remaining limit of ${maxAllowed}%.`;
    categoryErrorBox.style.display = "block";
    return;
  }

  gradeCategories.push({
    name,
    weight,
    score
  });

  gradeForm.reset();
  requiredFinalScore = null;

  saveData();
  renderGradeTable();
  updateDashboard();
  document.getElementById("final-result-box").style.display = "none";
});

gpaForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("course-name").value.trim();
  const credits = Number(document.getElementById("credit-hours").value);
  const gradePoints = Number(document.getElementById("letter-grade").value);
  const gpaErrorBox = document.getElementById("gpa-error-box");

  gpaErrorBox.style.display = "none";

  // Strict validation: Must have a name, 1-6 credits, and a valid dropdown selection
  if (!name || credits < 1 || credits > 6 || Number.isNaN(gradePoints)) {
    gpaErrorBox.textContent = "Please enter a valid course name, credit amount (1-6), and letter grade.";
    gpaErrorBox.style.display = "block";
    return;
  }

  gpaCourses.push({
    name,
    credits,
    gradePoints
  });

  gpaForm.reset();

  saveData();
  renderGpaTable();
  updateDashboard();
});

function validateFinalExamInputs() {
  const finalWeightStr = document.getElementById("final-weight").value;
  const targetGradeStr = document.getElementById("target-grade").value;
  const resultBox = document.getElementById("final-result-box");
  const calcBtn = document.getElementById("calculate-final-btn");

  const currentTotalWeight = gradeCategories.reduce((sum, category) => sum + category.weight, 0);
  const maxFinalWeight = Math.max(0, 100 - currentTotalWeight);

  const fw = Number(finalWeightStr);
  const tg = Number(targetGradeStr);

  let errors = [];
  let disableButton = false;

  // Rule 2: Hard Validation (Active in real-time)
  if (finalWeightStr !== "" && (fw <= 0 || fw > maxFinalWeight)) {
    errors.push(`Error: The maximum possible final weight is ${maxFinalWeight}%. Your input exceeds this.`);
    disableButton = true;
  }

  if (targetGradeStr !== "" && (tg < 0 || tg > 100)) {
    errors.push("Please enter a valid target grade (0 - 100).");
    disableButton = true;
  }

  // Rule 1: Empty Field Validation (Active only after button click)
  if (!disableButton && hasAttemptedCalculation) {
    if (finalWeightStr === "" && targetGradeStr === "") {
      errors.push("Please enter both a final exam weight and target grade.");
    } else if (finalWeightStr === "") {
      errors.push("Please enter a final exam weight.");
    } else if (targetGradeStr === "") {
      errors.push("Please enter a target grade.");
    }
  }

  // Render UI Updates
  if (errors.length > 0) {
    resultBox.style.display = "block";
    resultBox.innerHTML = errors.join("<br><br>"); // Stacks messages if both are invalid
    resultBox.style.backgroundColor = "#fee2e2";
    resultBox.style.color = "var(--danger)";
    resultBox.style.border = "1px solid #f87171";
  } else if (!hasAttemptedCalculation || disableButton) {
    resultBox.style.display = "none";
  }

  // Manage Button State
  if (disableButton) {
    calcBtn.disabled = true;
    calcBtn.style.opacity = "0.5";
    calcBtn.style.cursor = "not-allowed";
  } else {
    calcBtn.disabled = false;
    calcBtn.style.opacity = "1";
    calcBtn.style.cursor = "pointer";
  }

  return errors.length === 0 && finalWeightStr !== "" && targetGradeStr !== "";
}

function handleInputChanges() {
  const resultBox = document.getElementById("final-result-box");
  
  // Clear successful calculations instantly when input changes
  if (resultBox.style.backgroundColor === "rgb(239, 246, 255)" || resultBox.style.backgroundColor === "#eff6ff") {
    resultBox.style.display = "none";
  }

  const fwInput = document.getElementById("final-weight");
  const currentTotalWeight = gradeCategories.reduce((sum, category) => sum + category.weight, 0);
  const enteredWeight = Math.max(0, Number(fwInput.value) || 0);
  const maxFinalWeight = Math.max(0, 100 - currentTotalWeight);
  const maxCategoryWeight = Math.max(0, maxFinalWeight - enteredWeight);

  document.getElementById("max-category-weight-display").textContent = `Maximum possible category weight: ${maxCategoryWeight}%`;
  document.getElementById("current-weight-display").textContent = `${enteredWeight}%`;
  document.getElementById("max-weight-display").textContent = `Maximum possible final weight: ${maxFinalWeight}%`;

  validateFinalExamInputs();
}

// Bind real-time tracking to both fields
document.getElementById("final-weight").addEventListener("input", handleInputChanges);
document.getElementById("target-grade").addEventListener("input", handleInputChanges);

calculateFinalBtn.addEventListener("click", function() {
  hasAttemptedCalculation = true;
  const isValid = validateFinalExamInputs();

  if (!isValid) return;

  const finalWeight = Number(document.getElementById("final-weight").value);
  const targetGrade = Number(document.getElementById("target-grade").value);
  const courseGrade = calculateCourseGrade();
  const resultBox = document.getElementById("final-result-box");

  function showMessage(message, isError = false) {
    resultBox.style.display = "block";
    resultBox.innerHTML = message;
    if (isError) {
      resultBox.style.backgroundColor = "#fee2e2";
      resultBox.style.color = "var(--danger)";
      resultBox.style.border = "1px solid #f87171";
    } else {
      resultBox.style.backgroundColor = "#eff6ff";
      resultBox.style.color = "var(--primary-dark)";
      resultBox.style.border = "1px solid #93c5fd";
    }
  }

  if (courseGrade === null) {
    showMessage("Please add at least one grade category first.", true);
    return;
  }

  const remainingWeight = finalWeight / 100;
  const currentWeight = 1 - remainingWeight;

  requiredFinalScore = (targetGrade - (courseGrade * currentWeight)) / remainingWeight;

  updateDashboard();

  if (requiredFinalScore > 100) {
    showMessage(`You would need ${requiredFinalScore.toFixed(1)}% on the final, which is above 100%. Your target may not be realistically reachable.`, true);
  } else if (requiredFinalScore < 0) {
    showMessage("You have already secured enough points to meet this target, assuming the entered weights are correct.", false);
  } else {
    showMessage(`You need approximately ${requiredFinalScore.toFixed(1)}% on the final to reach your target grade.`, false);
  }
});

saveBtn.addEventListener("click", function() {
  saveData();
  alert("Your progress has been saved in this browser.");
});

resetBtn.addEventListener("click", function() {
  const confirmed = confirm("Are you sure you want to reset all data?");

  if (!confirmed) {
    return;
  }

  gradeCategories = [];
  gpaCourses = [];
  requiredFinalScore = null;

  localStorage.removeItem("gradeCategories");
  localStorage.removeItem("gpaCourses");

  //Reset validation tracking and button styles
  hasAttemptedCalculation = false;
  const calcBtn = document.getElementById("calculate-final-btn");
  calcBtn.disabled = false;
  calcBtn.style.opacity = "1";
  calcBtn.style.cursor = "pointer";

  // Clear all HTML form inputs
  gradeForm.reset();
  gpaForm.reset();
  
  // Clear the standalone final exam calculator inputs
  document.getElementById("final-weight").value = "";
  document.getElementById("target-grade").value = "";

  renderGradeTable();
  renderGpaTable();
  updateDashboard();

  document.getElementById("final-result-box").style.display = "none";
  document.getElementById("category-error-box").style.display = "none";
  document.getElementById("gpa-error-box").style.display = "none";
});

tabButtons.forEach(button => {
  button.addEventListener("click", function() {
    const targetTab = button.dataset.tab;

    tabButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    toolSections.forEach(section => {
      section.classList.remove("active-tool");
    });

    document.getElementById(targetTab).classList.add("active-tool");
    if (targetTab === "gpa-section") {
      saveBtn.classList.add("gpa-btn");
    } else {
      saveBtn.classList.remove("gpa-btn");
    }
    document.getElementById(targetTab).scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

renderGradeTable();
renderGpaTable();
updateDashboard();

// Intercept anchor links to handle tab switching and smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(event) {
    const targetId = this.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      event.preventDefault(); // Stop the default instant jump

      // If the link points to a hidden tab section, activate that tab first
      if (targetElement.classList.contains("tool-section")) {
        const correspondingTabBtn = document.querySelector(`.tab-btn[data-tab="${targetId}"]`);
        if (correspondingTabBtn) {
          // This triggers existing tab logic, which also handles the scroll
          correspondingTabBtn.click(); 
          return;
        }
      }

      // For standard links (like the Dashboard link), just smooth scroll
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});
