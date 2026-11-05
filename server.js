require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  specialty: { type: String, required: true, trim: true },
  location: { type: String, default: "WeCare Clinic", trim: true },
  available: { type: Boolean, default: true }
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  appointmentDate: { type: Date, required: true },
  reason: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["pending", "approved", "cancelled"], default: "pending" }
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true }
}, { timestamps: true });

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 }
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);
const Subscription = mongoose.model("Subscription", subscriptionSchema);
const Enquiry = mongoose.model("Enquiry", enquirySchema);


const starterDoctors = [
  { name: "Dr. Paradox Alex", specialty: "Skin Specialist", location: "Colombo", available: true },
  { name: "Dr. Jane Doe", specialty: "Cardiologist", location: "Kandy", available: true },
  { name: "Dr. Jeni Smith", specialty: "Orthopedic Specialist", location: "Galle", available: true },
  { name: "Dr. Emily Clark", specialty: "Pediatrician", location: "Jaffna", available: true },
  { name: "Dr. Michael Lasi", specialty: "Neurologist", location: "Negombo", available: true },
  { name: "Dr. Amara Perera", specialty: "General Medicine", location: "Kurunegala", available: true },
  { name: "Dr. Nimal Fernando", specialty: "Cardiologist", location: "Matara", available: true },
  { name: "Dr. Ishara Silva", specialty: "Dermatologist", location: "Anuradhapura", available: true },
  { name: "Dr. Kavindi Peris", specialty: "Pediatrician", location: "Pita Kotte", available: true }
];



function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}


app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "WeCare API is running" });
});



app.get("/api/doctors", async (req, res, next) => {
  try {
    const filter = { available: true };

    if (req.query.search) {
      const search = String(req.query.search).slice(0, 80);

      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } }
      ];
    }

    if (req.query.location) {
      const locations = String(req.query.location)
        .split(",")
        .map(location => location.trim())
        .filter(Boolean)
        .map(location => ({
          location: {
            $regex: location,
            $options: "i"
          }
        }));

      if (locations.length > 0) {
        filter.$and = [
          ...(filter.$and || []),
          { $or: locations }
        ];
      }
    }

    const doctors = await Doctor.find(filter)
      .select("name specialty location")
      .sort({ name: 1 });

    res.json(doctors);
  } catch (error) {
    next(error);
  }
});



app.post("/api/appointments", async (req, res, next) => {
  try {
    const { patientName, email, phone, doctorId, appointmentDate, reason } = req.body;
    if (!patientName || !email || !validEmail(email) || !phone || !doctorId || !appointmentDate) {
      return res.status(400).json({ message: "Please complete all required fields with a valid email." });
    }
    const date = new Date(appointmentDate);
    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      return res.status(400).json({ message: "Please choose a future appointment date and time." });
    }
    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "Please select a valid doctor." });
    }
    const doctor = await Doctor.findOne({ _id: doctorId, available: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found or unavailable." });

    const appointment = await Appointment.create({
      patientName: String(patientName).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      doctorId,
      appointmentDate: date,
      reason: String(reason || "").trim()
    });
    res.status(201).json({
      message: "Appointment request submitted. It is pending clinic confirmation.",
      appointmentId: appointment._id
    });
  } catch (error) { next(error); }
});

app.post("/api/newsletter", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!validEmail(email)) return res.status(400).json({ message: "Enter a valid email address." });
    try {
      await Subscription.create({ email });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ message: "This email is already subscribed." });
      throw error;
    }
    res.status(201).json({ message: "Thanks for subscribing to WeCare updates." });
  } catch (error) { next(error); }
});

app.post("/api/enquiries", async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !validEmail(email) || !message) {
      return res.status(400).json({ message: "Please provide your name, a valid email, and a message." });
    }
    const enquiry = await Enquiry.create({
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message).trim()
    });
    res.status(201).json({ message: "Your message has been received.", enquiryId: enquiry._id });
  } catch (error) { next(error); }
});

// Development-only helper: add sample doctors if the collection is empty.

async function seedDoctors() {
  for (const doctor of starterDoctors) {
    await Doctor.updateOne(
      { name: doctor.name, location: doctor.location },
      { $setOnInsert: doctor },
      { upsert: true }
    );
  }

  console.log("Sample doctor records checked.");
}


app.use((req, res) => res.status(404).json({ message: "Endpoint not found." }));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Server error. Please try again later." });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Create a .env file using .env.example.");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    await seedDoctors();
    app.listen(PORT, () => console.log(`WeCare is running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  }
}

start();
