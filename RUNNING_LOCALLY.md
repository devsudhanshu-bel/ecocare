# How to Run EcoCare Locally 🌿

Follow these simple steps to get the project running on your machine.

## 1. Prerequisites
Make sure you have **Node.js** installed on your computer. You can check by running this command in your terminal:
```sh
node -v
```
If not installed, download it from [nodejs.org](https://nodejs.org/).

## 2. Setup the Backend (Server)
The backend handles the database and authentication.

1.  Open your terminal (Command Prompt or PowerShell).
2.  Navigate to the **backend** folder:
    ```sh
    cd "c:\Users\josh1\OneDrive - ThorJS24\Desktop\christ\6th sem\ecocare-main\backend"
    ```
3.  Install the necessary libraries (dependencies):
    ```sh
    npm install
    ```
4.  Start the backend server:
    ```sh
    npm run start
    ```
    > You should see a message: **"Backend running on port 5000"** and **"MongoDB connected"**.
    > **Keep this terminal open!** The server needs to stay running.

## 3. Setup the Frontend (User Interface)
The frontend is what you see in the browser.

1.  Open a **new** terminal window.
2.  Navigate to the **frontend** folder:
    ```sh
    cd "c:\Users\josh1\OneDrive - ThorJS24\Desktop\christ\6th sem\ecocare-main\frontend"
    ```
3.  Install the necessary libraries:
    ```sh
    npm install
    ```
4.  Start the frontend:
    ```sh
    npm run dev
    ```
    > You will see a URL like: `http://localhost:5173`.

## 4. How to Test
1.  Open your web browser (Chrome, Edge, etc.).
2.  Go to the URL shown in the frontend terminal (usually **http://localhost:5173**).
3.  **Sign Up**:
    - Click on **Sign Up**.
    - Enter a test email (e.g., `test@example.com`) and password.
    - Click "Sign up". You should be redirected to the Dashboard.
4.  **Login**:
    - Use the same email and password to log in again.

## Troubleshooting
- **Error: "MongoNetworkError"**: Check your internet connection. The database is in the cloud.
- **Error: "Address already in use"**: You might have another server running. Close other terminal windows and try again.
