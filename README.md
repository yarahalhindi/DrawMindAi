# DrawMind AI

DrawMind AI is an AI-powered system designed for the preliminary emotional analysis of children's hand-drawn artwork[cite: 1]. Developed by a team of university students, the platform translates raw visual features from drawings into interpretable outputs accessible to non-specialist users, such as parents and educators[cite: 1]. 

**Disclaimer:** This system is strictly a preliminary analytical tool and does not provide clinical diagnoses, psychiatric assessments, or medical recommendations[cite: 1]. It is intended to support, not replace, professional psychological evaluation[cite: 1].

---

## Key Features

*   **Four-Class Emotion Classification:** Classifies children's drawings into four primary emotional categories: happiness, sadness, anger, and fear[cite: 1].
*   **Explainable AI (XAI):** Generates Grad-CAM visual attribution heatmaps to identify the specific regions of the drawing most influential to the model's prediction[cite: 1].
*   **Visual Feature Extraction:** Automatically computes 14 distinct visual properties, including canvas spatial usage, edge density, stroke sharpness, and dominant color tone[cite: 1].
*   **Natural-Language Reports:** Integrates with a Large Language Model (Groq API / Llama-3.3-70b-versatile) to translate raw computer vision metrics and parent notes into structured, easily understandable psychological reports[cite: 1].
*   **Multi-Profile Management:** Allows parents and caregivers to maintain separate profiles for multiple children, tracking emotional trends over time[cite: 1].
*   **Specialist Directory:** Provides an integrated directory of certified child psychologists and mental health professionals for seamless consultation requests[cite: 1].

---

## System Architecture

DrawMind AI utilizes a multi-modal, decoupled architecture to handle complex image processing alongside natural language generation.

### AI & Machine Learning Pipeline
*   **Hierarchical Decision-Logic Module:** To overcome natural dataset imbalances, the system employs a cascading architecture rather than a single multi-class model[cite: 1]. 
*   **Base Models:** The pipeline uses two specialized binary classifiers (Happy/Sad and Angry/Fear) built on a **MobileNetV2** backbone[cite: 1].
*   **Attention Mechanism:** The models integrate a custom **SimAM** (Simple, Parameter-Free Attention Module) layer to dynamically focus on locally distinctive stroke patterns without adding heavy parameters[cite: 1].

### Backend & Infrastructure
*   **Framework:** Built with **Python** and **FastAPI** to manage asynchronous file uploads, database queries, and AI inference calls efficiently[cite: 1].
*   **Database:** Utilizes a serverless **PostgreSQL** instance hosted on Neon, managed via SQLAlchemy ORM for strict referential integrity[cite: 1].
*   **Image Processing:** Relies on **OpenCV** for an extensive three-stage "Master Filter" preprocessing pipeline (bilateral filtering, Laplacian sharpening, and tensor normalization)[cite: 1].

---

## API Endpoints

The FastAPI backend exposes the following RESTful endpoints to handle the application's core functionality[cite: 1]:

*   `POST /register` & `POST /login`: Handles user account creation and authentication (passwords hashed via bcrypt)[cite: 1].
*   `POST /children` & `GET /children`: Manages child profile creation and retrieval linked to parent accounts[cite: 1].
*   `POST /drawings`: Receives drawing uploads, saves them, runs the full CV/AI pipeline (including LLM generation), and commits results to the database[cite: 1].
*   `GET /drawings`: Fetches a child's complete drawing and analysis history using SQLAlchemy joined loads for speed[cite: 1].
*   `DELETE /drawings/{drawing_id}`: Removes a drawing record and cascades the deletion to all associated emotion results and suggestions[cite: 1].
*   `POST /api/chat`: Handles the conversational AI feature to answer user questions based on session history and drawing results[cite: 1].

---

## Testing Strategy

The system's reliability is ensured through a rigorous, three-phase testing methodology[cite: 1]:

1.  **Unit Testing:** Verifies isolated database operations, endpoint routing integrity, and mathematical feature extraction outputs[cite: 1].
2.  **Integration Testing:** Ensures smooth data flow between client-to-server file uploads, the Vision-Language Model API pipeline, and Cloud Infrastructure synchronization[cite: 1].
3.  **Usability Testing:** Validates that the front-end interfaces (such as adding child profiles and navigating the specialist directory) are intuitive for non-technical caregivers[cite: 1].

---

## Future Roadmap

We are continuously working to improve DrawMind AI. Planned future updates include[cite: 1]:
*   **Longitudinal Tracking:** Developing data visualization dashboards to map a child's emotional trends over extended periods[cite: 1].
*   **On-Device Inference:** Transitioning to TensorFlow Lite for local, offline model inference to enhance speed and user privacy[cite: 1].
*   **Voice Input Modality:** Integrating audio analysis to evaluate the tone and pitch of a child's verbal descriptions alongside their visual artwork[cite: 1].

---

## Repository Structure

The codebase is organized into several primary directories to manage both the backend AI services and the frontend application environments:

*   **`.agents/`**, **`artifacts/`**, **`attached_assets/`**, **`lib/`**, **`scripts/`**: Core directories housing the application logic, AI scripts, and dependencies.
*   **`package.json`** & **`package-lock.json`**: Node package configurations handling frontend dependencies and scripts.
*   **`.env`**, **`.gitignore`**, **`.replit`**, **`.replitignore`**: Environment and deployment configurations for local and cloud hosting setups.

---

## Credits & Acknowledgements

DrawMind AI was researched, designed, and developed by undergraduate students at the **University of Jordan, King Abdullah II School of Information Technology**[cite: 1]. 

*   **Student Development Team:** Rahmeh Ibrahim Alfuqahaa, Raghad Wael Alkhudair, Yarah Alhindi, and Mariya Khaled Hammash[cite: 1].
*   **Academic Supervisors:** Dr. Ruba Obeidat and Dr. Dima Suleiman[cite: 1].
