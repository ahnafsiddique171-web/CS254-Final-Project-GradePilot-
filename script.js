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
  document.getElementById("max-weight-display").textContent = `Maximum possible final weight: ${100 - currentTotalWeight}%`;
  
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

  if (!name || credits <= 0 || Number.isNaN(gradePoints)) {
    alert("Please enter a valid course name, credit amount, and letter grade.");
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

// Real-time validation for the Final Exam Weight input
document.getElementById("final-weight").addEventListener("input", function() {
  const resultBox = document.getElementById("final-result-box");
  const currentTotalWeight = gradeCategories.reduce((sum, category) => sum + category.weight, 0);
  const maxFinalWeight = 100 - currentTotalWeight;
  const enteredWeight = Number(this.value);

  if (enteredWeight > maxFinalWeight) {
    resultBox.style.display = "block";
    resultBox.textContent = `Error: The maximum possible final weight is ${maxFinalWeight}%. Your input exceeds this.`;
    resultBox.style.backgroundColor = "#fee2e2";
    resultBox.style.color = "var(--danger)";
    resultBox.style.border = "1px solid #f87171";
  } else {
    // Hide the error box if the user corrects their input
    if (resultBox.style.backgroundColor === "rgb(254, 226, 226)" || resultBox.style.backgroundColor === "#fee2e2") {
      resultBox.style.display = "none";
    }
  }
});

calculateFinalBtn.addEventListener("click", function() {
  const finalWeightInput = document.getElementById("final-weight").value;
  const targetGradeInput = document.getElementById("target-grade").value;
  const resultBox = document.getElementById("final-result-box");

  // Helper function to style and show the on-page message
  function showMessage(message, isError = false) {
    resultBox.style.display = "block";
    resultBox.textContent = message;
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

  if (finalWeightInput === "" || targetGradeInput === "") {
    showMessage("Please enter both a final exam weight and a target grade.", true);
    return;
  }

  const finalWeight = Number(finalWeightInput);
  const targetGrade = Number(targetGradeInput);
  const courseGrade = calculateCourseGrade();

  if (courseGrade === null) {
    showMessage("Please add at least one grade category first.", true);
    return;
  }

  if (finalWeight <= 0 || finalWeight > 100 || targetGrade < 0 || targetGrade > 100) {
    showMessage("Please enter a valid final exam weight (1-100) and target grade (0-100).", true);
    return;
  }

  const currentTotalWeight = gradeCategories.reduce((sum, category) => sum + category.weight, 0);
  if (currentTotalWeight + finalWeight > 100) {
    showMessage(`Error: Your current categories total ${currentTotalWeight}%. A final exam weight of ${finalWeight}% exceeds 100%.`, true);
    return;
  }

  const remainingWeight = finalWeight / 100;
  const currentWeight = 1 - remainingWeight;

  requiredFinalScore = (targetGrade - (courseGrade * currentWeight)) / remainingWeight;

  updateDashboard();

  // Displaying successful calculations in the on-page box
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

  renderGradeTable();
  renderGpaTable();
  updateDashboard();

  document.getElementById("final-result-box").style.display = "none";
  document.getElementById("category-error-box").style.display = "none";
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
