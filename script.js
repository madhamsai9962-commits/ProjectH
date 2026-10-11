
"use strict";

const prices = {
  "Standard Room": 2000,
  "Deluxe Room": 3500,
  "Luxury Suite": 5000
};

const form = document.querySelector("#booking-form");
const roomSelect = document.querySelector("#room");
const checkin = document.querySelector("#checkin");
const checkout = document.querySelector("#checkout");
const estimate = document.querySelector("#estimate");
const message = document.querySelector("#message");
const bookingList = document.querySelector("#booking-list");

const today = new Date();
const todayString = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

checkin.min = todayString;
checkout.min = todayString;

function getNights() {
  if (!checkin.value || !checkout.value) return 0;

  const start = new Date(`${checkin.value}T00:00:00Z`);
  const end = new Date(`${checkout.value}T00:00:00Z`);

  return Math.round((end - start) / 86400000);
}

function getTotal() {
  const nights = getNights();
  const price = prices[roomSelect.value] || 0;
  return nights > 0 ? nights * price : 0;
}

function updateEstimate() {
  const nights = getNights();
  const total = getTotal();

  if (!roomSelect.value || !checkin.value || !checkout.value) {
    estimate.textContent =
      "Select a room and dates to calculate your estimated total.";
  } else if (nights <= 0) {
    estimate.textContent = "Check-out must be after check-in.";
  } else {
    estimate.textContent =
      `${nights} night(s) × ₹${prices[roomSelect.value].toLocaleString("en-IN")} = ₹${total.toLocaleString("en-IN")}`;
  }

  checkout.min = checkin.value || todayString;
}

function readBookings() {
  try {
    const data = JSON.parse(localStorage.getItem("hotelBookings") || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem("hotelBookings", JSON.stringify(bookings));
}

function renderBookings() {
  const bookings = readBookings();
  bookingList.replaceChildren();

  if (bookings.length === 0) {
    bookingList.textContent = "No demo bookings yet.";
    return;
  }

  bookings.forEach((booking) => {
    const article = document.createElement("article");
    article.className = "booking-item";

    const title = document.createElement("h3");
    title.textContent = booking.room;

    const details = document.createElement("p");
    details.textContent =
      `${booking.guest} | ${booking.checkin} to ${booking.checkout} | ` +
      `${booking.guests} guest(s) | ₹${booking.total.toLocaleString("en-IN")}`;

    const reference = document.createElement("p");
    reference.textContent = `Demo reference: ${booking.id}`;

    article.append(title, details, reference);
    bookingList.append(article);
  });
}

[roomSelect, checkin, checkout].forEach((field) => {
  field.addEventListener("change", updateEstimate);
});

checkin.addEventListener("change", () => {
  checkout.min = checkin.value || todayString;

  if (checkout.value && checkout.value <= checkin.value) {
    checkout.value = "";
  }

  updateEstimate();
});

document.querySelectorAll(".book-room").forEach((button) => {
  button.addEventListener("click", () => {
    roomSelect.value = button.dataset.room;
    updateEstimate();
    document.querySelector("#booking").scrollIntoView({
      behavior: "smooth"
    });
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const nights = getNights();

  if (nights <= 0) {
    message.textContent =
      "Please choose a check-out date after your check-in date.";
    return;
  }

  const booking = {
    id: `GP${Date.now().toString().slice(-8)}`,
    guest: form.elements.guest.value.trim(),
    email: form.elements.email.value.trim(),
    room: roomSelect.value,
    checkin: checkin.value,
    checkout: checkout.value,
    guests: Number(form.elements.guests.value),
    total: getTotal()
  };

  if (!booking.guest || !booking.email ||
      !prices[booking.room] || booking.guests < 1 ||
      booking.guests > 6) {
    message.textContent = "Please enter valid booking details.";
    return;
  }

  try {
    const bookings = readBookings();
    bookings.push(booking);
    saveBookings(bookings);
  } catch {
    message.textContent =
      "Could not save this demo booking in your browser.";
    return;
  }

  message.textContent =
    `Demo booking confirmed! Reference: ${booking.id}. ` +
    `Estimated total: ₹${booking.total.toLocaleString("en-IN")}.`;

  form.reset();
  checkin.min = todayString;
  checkout.min = todayString;
  updateEstimate();
  renderBookings();

  document.querySelector("#bookings").scrollIntoView({
    behavior: "smooth"
  });
});

document.querySelector("#clear-bookings").addEventListener("click", () => {
  try {
    localStorage.removeItem("hotelBookings");
    message.textContent = "Demo bookings cleared from this browser.";
    renderBookings();
  } catch {
    message.textContent = "Could not clear demo bookings.";
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();

updateEstimate();
renderBookings();

