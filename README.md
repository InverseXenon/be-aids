# 🎓 BE AIDS Digital Yearbook

> A premium, highly interactive digital yearbook crafted to immortalize the memories, batchmates, and legacy of the BE AIDS (Batch '26). 

This project aims to re-create the nostalgic feeling of flipping through a physical college yearbook while upgrading it with modern, interactive digital features. Built for performance, beauty, and emotional resonance.

---

## ✨ Core Features

* **📖 Interactive Flipping Yearbook:** A highly optimized digital flipbook module allowing you to smoothly flip through batchmate portraits and bios just like a real book.
* **🎵 Native Ambient Lofi Player:** A custom-built music player featuring an animated spinning vinyl, allowing users to listen to retro/lofi beats while browsing their memories.
* **📸 The Vault (Media Gallery):** An optimized infinite-scrolling gallery using Cloudinary. Clicking on any highlighted memory opens a cinematic Lightbox experience with social interactions (likes & comments).
* **🏆 Hall of Fame (Superlatives):** A dedicated, interactive voting and showcase module honoring class superlatives.
* **💬 Real-Time Interactions & Comments:** Seamless interactions that let batchmates react and drop comments instantly on specific timeline events or photos.
* **✨ Premium Glassmorphic UI:** Smooth Framer Motion micro-animations, gorgeous gradients, and a heavily customized Tailwind CSS v4 design system.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
* **Library:** [React 19](https://react.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Database:** [MongoDB](https://www.mongodb.com/) via Mongoose
* **Image Delivery:** [Cloudinary](https://cloudinary.com/) (AVIF/WebP Auto-Format & Resizing)
* **Icons:** [Lucide-React](https://lucide.dev/)

---

## 🚀 Getting Started

To run this project locally, make sure you have **Node.js** installed, then follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/InverseXenon/be-aids.git
cd be-aids
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
You will need to create a `.env.local` file at the root of the project to connect to the necessary services. 
```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXTAUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to experience the yearbook.

---

## 🏎️ Production Performance optimizations
This web application takes full advantage of Next.js static asset caching and edge networks.
* **Zero Layout Shift:** Native `next/image` handles loader configurations straight from Cloudinary for predictive dimensions.
* **Opt-in Standalone Build:** The application is packed via Turbopack to output an isolated `standalone` footprint for Vercel/Docker serverless executions.
* **GPU Accelerated Effects:** Complex animations (`will-change-transform`, spinning disks) are outsourced heavily to CSS layers so the JavaScript main thread stays untouched.

---
*Crafted with ❤️ for the finest moments of our lives.*
