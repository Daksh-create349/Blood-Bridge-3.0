# 🩸 Blood Bridge

**Bridging the critical gap between urgent need and willing donors.**

Blood Bridge is a smart, AI-powered web platform designed to revolutionize blood bank management and emergency response. It connects hospitals, blood banks, and donors in a real-time network to prevent critical shortages and streamline logistics.

![Blood Bridge Banner](https://img.shields.io/badge/Status-Active-success?style=for-the-badge) ![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge) ![Gemini AI](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)

## 🚀 Key Features

*   **Real-Time Dashboard**: Visualize blood inventory levels with "Critical", "Low", and "Healthy" status indicators.
*   **Urgent Broadcast System**: Hospitals can broadcast specific blood requirements to nearby facilities and registered donors within a specific radius (5km/10km).
*   **AI-Powered Analytics**: Uses **Google Gemini AI** to analyze inventory data, generate strategic insights, and forecast supply risks based on historical patterns.
*   **Smart Logistics**: Track shipments (Drone/Ambulance) in real-time. Includes an **Autonomous Agent** mode where AI matches urgent requests with available stock and dispatches vehicles automatically.
*   **Donation Camps**: Map-based discovery of nearby donation drives with digital registration and ticket generation.
*   **Donor Registry**: A searchable database of verified donors with a gamified leaderboard system.
*   **Pulse AI Chatbot**: An intelligent assistant to help users navigate the app and answer queries about blood donation.
*   **Role-Based Access**: Secure login for Donors, Hospitals, and Admins.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), TypeScript
*   **Styling**: Tailwind CSS (with Glassmorphism UI design), Lucide React Icons
*   **Maps**: Leaflet, React-Leaflet (OpenStreetMap/Esri Satellite)
*   **AI Integration**: Google GenAI SDK (Gemini 2.5 Flash)
*   **Charts**: Recharts
*   **Communication**: EmailJS (Contact Form)
*   **Routing**: React Router DOM

## ⚙️ Environment Variables

To run this project, you need to configure the following environment variables in a `.env` file at the root of your project:

```env
# Google Gemini API Key (Required for AI features)
API_KEY=your_google_gemini_api_key

# EmailJS Configuration (Required for Contact Form)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/blood-bridge.git
    cd blood-bridge
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env` file based on the section above.

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Build for production**
    ```bash
    npm run build
    ```

## 📱 Application Modules

### 1. Dashboard
An overview of current stock. Admins can update inventory units, view breakdown by blood type, and check compatibility charts.

### 2. Request Network
*   **Send Request**: Hospitals create alerts specifying blood type, quantity, and urgency.
*   **Active Alerts**: A live feed of needs. Other hospitals can "Accept & Donate" to trigger a transfer.

### 3. Logistics
A visual map interface tracking active shipments.
*   **Manual Mode**: View active deliveries.
*   **Autopilot Mode**: The Gemini AI agent scans active requests and inventory, automatically dispatching drones or ambulances when a match is found.

### 4. Camps
Interactive map showing upcoming donation drives. Users can use their webcam to register and generate a digital pass.

### 5. Analytics
Data visualization for volume by blood type and stock status. Includes a "Run Prediction Model" feature powered by AI to forecast future shortages.

## 👥 Credits

**Created & Developed by:**
*   **Daksh Ranjan Srivastava**
*   **Nimish Bordiya**

---

*Note: This application is a prototype designed for demonstration purposes. While it uses real geolocation APIs and AI models, the hospital data and donor records are simulated.*

