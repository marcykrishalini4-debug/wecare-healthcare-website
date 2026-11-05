
const API = "/api";

function showMessage(message, isError = false) {
    let box = document.getElementById("wecare-message");

    if (!box) {
        box = document.createElement("div");
        box.id = "wecare-message";
        box.setAttribute("role", "status");
        box.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:9999;max-width:360px;padding:14px 18px;border-radius:8px;background:#fff;box-shadow:0 4px 24px #0002;font:14px Arial,sans-serif;";
        document.body.appendChild(box);
    }

    box.style.borderLeft = `5px solid ${isError ? "#c0392b" : "#16805d"}`;
    box.textContent = message;
    box.hidden = false;

    clearTimeout(window.wecareMessageTimer);
    window.wecareMessageTimer = setTimeout(() => {
        box.hidden = true;
    }, 5000);
}

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");

if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
        menu.classList.toggle("active");
    });

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("active");
        });
    });
}

const inputStyle = "display:block;width:100%;padding:11px;margin-top:5px;border:1px solid #ccd4e0;border-radius:5px;box-sizing:border-box;font:14px Arial,sans-serif;";

function openAppointmentForm() {
    if (document.getElementById("appointment-modal")) return;

    const modal = document.createElement("div");
    modal.id = "appointment-modal";
    modal.style.cssText = "position:fixed;inset:0;background:#071a35b8;z-index:9998;display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;";

    modal.innerHTML = `
        <section style="background:white;width:min(560px,100%);max-height:95vh;overflow:auto;border-radius:12px;padding:24px;font-family:Arial,sans-serif;color:#122853;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                <h2>Book an Appointment</h2>
                <button id="close-appointment" type="button" aria-label="Close" style="font-size:24px;border:0;background:transparent;cursor:pointer;">&times;</button>
            </div>

            <p style="margin:10px 0 18px;color:#535353;">Submit a request. The clinic must confirm the appointment.</p>

            <form id="appointment-form" style="display:grid;gap:12px;">
                <label>Full name *
                    <input name="patientName" required maxlength="100" style="${inputStyle}">
                </label>

                <label>Email *
                    <input name="email" type="email" required style="${inputStyle}">
                </label>

                <label>Phone number *
                    <input name="phone" type="tel" required maxlength="30" style="${inputStyle}">
                </label>

                <label>Choose a doctor *
                    <select name="doctorId" id="appointment-doctor" required style="${inputStyle}">
                        <option value="">Loading doctors...</option>
                    </select>
                </label>

                <label>Date and time *
                    <input name="appointmentDate" type="datetime-local" required style="${inputStyle}">
                </label>

                <label>Reason for visit (optional)
                    <textarea name="reason" rows="3" maxlength="1000" style="${inputStyle}"></textarea>
                </label>

                <button type="submit" style="background:#014dd5;color:white;border:0;border-radius:5px;padding:13px;cursor:pointer;">
                    Submit Appointment Request
                </button>

                <small style="color:#666;">Please do not enter sensitive medical details in this demo form.</small>
            </form>
        </section>
    `;

    document.body.appendChild(modal);

    document.getElementById("close-appointment").addEventListener("click", () => {
        modal.remove();
    });

    modal.addEventListener("click", event => {
        if (event.target === modal) modal.remove();
    });

    loadDoctorsIntoSelect();

    document.getElementById("appointment-form").addEventListener("submit", async event => {
        event.preventDefault();

        const form = event.currentTarget;
        const payload = Object.fromEntries(new FormData(form).entries());

        try {
            const result = await request(`${API}/appointments`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            modal.remove();
            showMessage(result.message);
        } catch (error) {
            showMessage(error.message, true);
        }
    });
}

async function loadDoctorsIntoSelect() {
    const select = document.getElementById("appointment-doctor");

    if (!select) return;

    try {
        const doctors = await request(`${API}/doctors`);

        select.innerHTML = '<option value="">Select a doctor</option>';

        doctors.forEach(doctor => {
            const option = document.createElement("option");
            option.value = doctor._id;
            option.textContent = `${doctor.name} — ${doctor.specialty}`;
            select.appendChild(option);
        });
    } catch (error) {
        select.innerHTML = '<option value="">Could not load doctors</option>';
        showMessage(error.message, true);
    }
}

document.querySelectorAll('a[href="#why-choose-us"], .why-btn, .hero-text-btns a').forEach(link => {
    const text = link.textContent.toLowerCase();

    if (text.includes("appointment") || text.includes("book")) {
        link.addEventListener("click", event => {
            event.preventDefault();
            openAppointmentForm();
        });
    } else if (text.includes("find doctor")) {
        link.addEventListener("click", event => {
            event.preventDefault();

            document.getElementById("doctorSearch")?.focus();

            document.querySelector(".appointment-search-container")
                ?.scrollIntoView({ behavior: "smooth" });
        });
    }
});

const searchButton = document.getElementById("doctorSearchButton");

if (searchButton) {
    searchButton.addEventListener("click", searchDoctors);
}

["doctorSearch", "locationSearch"].forEach(id => {
    const input = document.getElementById(id);

    if (input) {
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                searchDoctors();
            }
        });
    }
});

async function searchDoctors() {
    const search = document.getElementById("doctorSearch")?.value.trim() || "";
    const location = document.getElementById("locationSearch")?.value.trim() || "";

    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (location) params.set("location", location);

    try {
        const doctors = await request(`${API}/doctors?${params.toString()}`);

        let results = document.getElementById("doctor-search-results");

        if (!results) {
            results = document.createElement("section");
            results.id = "doctor-search-results";
            results.style.cssText = "max-width:1000px;width:90%;margin:24px auto;padding:20px;border-radius:10px;background:#f5f7fb;";

            document.querySelector(".appointment-search-container")?.after(results);
        }

        results.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent = `Doctor search results (${doctors.length})`;
        results.appendChild(heading);

        if (!doctors.length) {
            const paragraph = document.createElement("p");
            paragraph.textContent = "No doctors matched. Try another name, specialty, or location.";
            results.appendChild(paragraph);
            return;
        }

        doctors.forEach(doctor => {
            const card = document.createElement("div");

            card.style.cssText = "background:white;padding:14px;margin-top:10px;border-radius:7px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;";

            const info = document.createElement("div");
            const name = document.createElement("strong");
            name.textContent = doctor.name;

            const details = document.createElement("p");
            details.textContent = `${doctor.specialty} · ${doctor.location}`;
            details.style.marginTop = "5px";

            info.append(name, details);

            const book = document.createElement("button");
            book.type = "button";
            book.textContent = "Book appointment";
            book.style.cssText = "background:#014dd5;color:white;border:0;padding:10px 14px;border-radius:5px;cursor:pointer;";

            book.addEventListener("click", async () => {
                openAppointmentForm();

                try {
                    const doctors = await request(`${API}/doctors`);
                    const select = document.getElementById("appointment-doctor");

                    if (select) {
                        select.value = doctor._id;
                    }
                } catch (error) {
                    showMessage(error.message, true);
                }
            });

            card.append(info, book);
            results.appendChild(card);
        });

        results.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
        showMessage(error.message, true);
    }
}

const newsletterForm = document.querySelector(".footer-box form");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", async event => {
        event.preventDefault();

        const emailInput = newsletterForm.querySelector('input[type="email"]');

        try {
            const result = await request(`${API}/newsletter`, {
                method: "POST",
                body: JSON.stringify({ email: emailInput.value })
            });

            showMessage(result.message);
            newsletterForm.reset();
        } catch (error) {
            showMessage(error.message, true);
        }
    });
}

async function submitEnquiry(name, email, message) {
    return request(`${API}/enquiries`, {
        method: "POST",
        body: JSON.stringify({ name, email, message })
    });
}

document.addEventListener("DOMContentLoaded", () => {
  // DOCTOR SEARCH
  const doctorInput = document.getElementById("doctorSearch");
  const locationInput = document.getElementById("locationSearch");
  const searchButton = document.getElementById("doctorSearchButton");
  const doctorResults = document.getElementById("doctorResults");

  async function searchDoctors() {
    if (!doctorResults) return;

    const search = doctorInput?.value.trim() || "";
    const location = locationInput?.value.trim() || "";

    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (location) params.set("location", location);

    doctorResults.textContent = "Searching for doctors...";

    try {
      const response = await fetch(`/api/doctors?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Could not load doctors.");
      }

      const doctors = await response.json();
      doctorResults.replaceChildren();

      if (!doctors.length) {
        doctorResults.textContent = "No doctors found. Try another search or location.";
        return;
      }

      doctors.forEach((doctor) => {
        const card = document.createElement("div");
        card.className = "doctor-result";

        const name = document.createElement("h3");
        name.textContent = doctor.name || "Doctor";

        const specialty = document.createElement("p");
        specialty.textContent = `Specialty: ${doctor.specialty || "Not specified"}`;

        const city = document.createElement("p");
        city.textContent = `Location: ${doctor.location || "Not specified"}`;

        card.append(name, specialty, city);
        doctorResults.appendChild(card);
      });
    } catch (error) {
      doctorResults.textContent =
        "Unable to load doctors. Check your server and database connection.";
      console.error("Doctor search error:", error);
    }
  }

  if (searchButton) {
    searchButton.addEventListener("click", searchDoctors);
  }

  [doctorInput, locationInput].forEach((input) => {
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchDoctors();
      }
    });
  });

  // NEWSLETTER
  const newsletterForm = document.getElementById("newsletterForm");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const emailInput = document.getElementById("newsletterEmail");
      const message = document.getElementById("newsletterMessage");

      if (!emailInput || !message) return;

      message.textContent = "Sending...";

      try {
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: emailInput.value.trim()
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Subscription failed.");
        }

        message.textContent = result.message;
        newsletterForm.reset();
      } catch (error) {
        message.textContent =
          error.message || "Unable to submit your subscription.";
      }
    });
  }
});
