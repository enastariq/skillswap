import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Chart from "chart.js/auto";

// Activate Day.js relativeTime plugin ("Reviewed 2 hours ago")
dayjs.extend(relativeTime);

// --- 1. INITIAL DATA WITH ISO TIMESTAMPS ---
const defaultSkills = [
  {
    id: 1,
    title: "Beginner Python & Automation",
    category: "Coding & Tech",
    rating: "⭐ 4.9 (24)",
    desc: "Learn how to write your first Python scripts and automate boring spreadsheet tasks in 60 minutes.",
    mentor: "Alex Lin",
    role: "Backend Engineer",
    initials: "AL",
    createdAt: dayjs().subtract(2, "day").toISOString()
  },
  {
    id: 2,
    title: "Artisan Sourdough Bread Baking",
    category: "Culinary & Baking",
    rating: "⭐ 5.0 (41)",
    desc: "Master starter maintenance, dough folding, and baking a crispy golden loaf in your home oven.",
    mentor: "Maya Rossi",
    role: "Pastry Chef",
    initials: "MR",
    createdAt: dayjs().subtract(5, "hour").toISOString()
  },
  {
    id: 3,
    title: "Conversational Spanish Practice",
    category: "Languages",
    rating: "⭐ 4.8 (19)",
    desc: "Relaxed, real-world Spanish conversation practice tailored for travel, ordering food, and making friends.",
    mentor: "Carlos Mendez",
    role: "Native Speaker & Tutor",
    initials: "CM",
    createdAt: dayjs().subtract(1, "day").toISOString()
  },
  {
    id: 4,
    title: "Acoustic Guitar Fingerpicking",
    category: "Music & Arts",
    rating: "⭐ 4.9 (15)",
    desc: "Transition from basic strumming to smooth fingerstyle patterns with step-by-step chord exercises.",
    mentor: "Samira Khan",
    role: "Session Musician",
    initials: "SK",
    createdAt: dayjs().subtract(3, "day").toISOString()
  }
];

const defaultBookings = [
  {
    id: 101,
    title: "Artisan Sourdough Bread Baking with Maya Rossi",
    isoDate: dayjs().add(1, "day").hour(16).minute(0).toISOString(),
    duration: "60 mins"
  }
];

let skills = JSON.parse(localStorage.getItem("skillswap_vite_skills")) || defaultSkills;
let bookings = JSON.parse(localStorage.getItem("skillswap_vite_bookings")) || defaultBookings;

localStorage.setItem("skillswap_vite_skills", JSON.stringify(skills));
localStorage.setItem("skillswap_vite_bookings", JSON.stringify(bookings));

let activeCategory = "All Skills";
let searchQuery = "";
let selectedSkillForBooking = null;
let categoryChartInstance = null;

// --- 2. SELECT DOM ELEMENTS ---
const skillGrid = document.querySelector(".skill-grid");
const resultsCount = document.querySelector(".results-count");
const searchInput = document.querySelector("#search-input");
const categoryPills = document.querySelectorAll(".pill");
const bookingList = document.querySelector(".booking-list");

const offerModal = document.querySelector("#offer-modal");
const openOfferBtn = document.querySelector("#open-offer-modal-btn");
const closeOfferBtn = document.querySelector("#close-offer-modal");
const offerForm = document.querySelector("#offer-form");

const bookModal = document.querySelector("#book-modal");
const closeBookBtn = document.querySelector("#close-book-modal");
const bookForm = document.querySelector("#book-form");
const bookModalTitle = document.querySelector("#book-modal-title");
const durationSelect = document.querySelector("#session-duration");
const calculatedCost = document.querySelector("#calculated-cost");

// --- 3. RENDER FUNCTIONS (WITH DAY.JS & CHART.JS) ---
const renderSkills = () => {
  skillGrid.innerHTML = "";

  const filtered = skills.filter((item) => {
    const matchesCategory = activeCategory === "All Skills" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mentor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  resultsCount.textContent = `Showing ${filtered.length} skill${filtered.length === 1 ? "" : "s"}`;

  filtered.forEach((skill) => {
    // Format relative timestamp using Day.js!
    const relativePosted = dayjs(skill.createdAt).fromNow();

    const card = document.createElement("article");
    card.className = "skill-card";
    card.innerHTML = `
      <div class="card-top">
        <span class="category-badge">${skill.category}</span>
        <span class="rating">${skill.rating}</span>
      </div>
      <h3>${skill.title}</h3>
      <p class="skill-desc">${skill.desc}</p>
      <p class="posted-time">🕒 Listed ${relativePosted}</p>
      <div class="mentor-info">
        <div class="avatar" aria-hidden="true">${skill.initials}</div>
        <div>
          <p class="mentor-name">${skill.mentor}</p>
          <p class="mentor-role">${skill.role}</p>
        </div>
      </div>
      <div class="card-footer">
        <div class="price"><strong>1 Credit</strong> <span>/ 60 min</span></div>
        <button type="button" class="btn-book">Book Session</button>
      </div>
    `;

    card.querySelector(".btn-book").addEventListener("click", () => {
      selectedSkillForBooking = skill;
      bookModalTitle.textContent = `Book: ${skill.title}`;
      bookModal.showModal();
    });

    skillGrid.append(card);
  });
};

const renderBookings = () => {
  bookingList.innerHTML = "";

  bookings.forEach((booking) => {
    // Use Day.js to format the exact local date & relative countdown!
    const formattedDate = dayjs(booking.isoDate).format("ddd, MMM D [at] h:mm A");
    const relativeStart = dayjs(booking.isoDate).fromNow();

    const item = document.createElement("article");
    item.className = "booking-item";
    item.innerHTML = `
      <div>
        <h4>${booking.title}</h4>
        <p class="booking-time">📅 ${formattedDate} (${relativeStart}) • ${booking.duration}</p>
      </div>
      <span class="status-confirmed">Confirmed</span>
    `;
    bookingList.append(item);
  });
};

const renderChart = () => {
  const ctx = document.querySelector("#skills-chart");
  const categories = ["Coding & Tech", "Languages", "Culinary & Baking", "Music & Arts"];
  const counts = categories.map(
    (cat) => skills.filter((s) => s.category === cat).length
  );

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  categoryChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: categories,
      datasets: [
        {
          label: "Active Mentor Listings by Category",
          data: counts,
          backgroundColor: ["#4f46e5", "#06b6d4", "#f59e0b", "#ec4899"],
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  });
};

// --- 4. EVENT LISTENERS ---
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderSkills();
});

categoryPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    categoryPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    activeCategory = pill.textContent.trim();
    renderSkills();
  });
});

openOfferBtn.addEventListener("click", () => offerModal.showModal());
closeOfferBtn.addEventListener("click", () => offerModal.close());

offerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const mentorName = document.querySelector("#mentor-name").value.trim();
  const initials = mentorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const newSkill = {
    id: Date.now(),
    title: document.querySelector("#skill-title").value.trim(),
    category: document.querySelector("#skill-category").value,
    rating: "⭐ New",
    desc: document.querySelector("#skill-desc").value.trim(),
    mentor: mentorName,
    role: document.querySelector("#mentor-role").value.trim(),
    initials: initials || "ME",
    createdAt: dayjs().toISOString()
  };

  skills.unshift(newSkill);
  localStorage.setItem("skillswap_vite_skills", JSON.stringify(skills));

  renderSkills();
  renderChart(); // Automatically updates the Chart.js bar graph!
  offerForm.reset();
  offerModal.close();
});

durationSelect.addEventListener("change", () => {
  const mins = Number(durationSelect.value);
  const credits = mins / 60;
  calculatedCost.textContent = `${credits} Credit${credits === 1 ? "" : "s"}`;
});

closeBookBtn.addEventListener("click", () => bookModal.close());

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const rawDate = document.querySelector("#session-date").value;

  const newBooking = {
    id: Date.now(),
    title: `${selectedSkillForBooking.title} with ${selectedSkillForBooking.mentor}`,
    isoDate: dayjs(rawDate).toISOString(),
    duration: `${durationSelect.value} mins`
  };

  bookings.unshift(newBooking);
  localStorage.setItem("skillswap_vite_bookings", JSON.stringify(bookings));

  renderBookings();
  bookForm.reset();
  calculatedCost.textContent = "1 Credit";
  bookModal.close();
});

// --- 5. INITIALIZE ---
renderSkills();
renderBookings();
renderChart();