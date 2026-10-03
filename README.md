# Skilitsa ID

biometric pet registry and companion platform designed to solve a fundamental limitation of traditional pet identification: RFID microchips require specialized physical wand scanners usually only found in veterinary clinics or municipal shelters. If a dog gets lost in a park or on a walk, a good Samaritan who finds them has no immediate way to identify the dog or contact the owner on the spot.
This platform turns any smartphone camera into an instant, non-invasive biometric scanner while serving as an everyday care hub for dog parents.
1. The Core Biometric AI Vision System
At the heart of the platform is an online vision pipeline:
Face Detection & Framing: An automated detector isolates the dog's face, ears, and snout from any photo or live camera stream.
Dual-Model Ensemble:
AvitoTech DINO-v2 Small Animal Model (384 dimensions): Captures macro anatomical traits, coat texture, fur color distributions, and skull structure.
DogFaceRecognition ONNX Model (512 dimensions): Analyzes micro facial landmark geometries—such as interpupillary distance, snout-to-forehead triangulation, and ear-tip ratios.
Unified 896-Dimension Vector Fingerprint: The embeddings from both models are concatenated and normalized into a mathematical biometric fingerprint unique to each dog.
Cosine Distance Matching: When a lost dog is scanned, the system calculates cosine similarity against registered profiles in milliseconds, calculating a confidence percentage (e.g., 98.4% Match).
2. The Two Core Interaction Flows
A. The Registration Flow (Pet Owner)
An owner snaps or uploads a photo of their dog.
The system extracts the 896-dimensional facial vector and associates it with the owner's emergency contact details, medical needs, and microchip number.
The dog is issued a digital Biometric Pet Passport that is stored in the registry.
B. The Public Scanner & Reunion Flow (Finder)
Anyone finding a lost dog opens the public "Scan Lost Dog" camera tool—no account required.
The animated HUD sweeps the dog's face, detects landmarks, and executes the vector search.
When a match is confirmed, the Emotional Reunion Card appears:
Displays the dog’s name, photo, and urgent health alerts (e.g., "Requires daily insulin").
Provides instant "Call Owner Now" and "Send SMS" buttons directly connecting finder and parent.
3. Everyday Pet-Parent Companion Hub
Beyond lost-and-found emergencies, the platform integrates daily tools that dog parents rely on:
Expense & Food Budget Tracker:
Tracks recurring food bags, treats, vet appointments, and grooming.
Features dynamic monthly budget limits with real-time visual alerts (safe green below 70%, warning amber at 70–90%, critical alert red above 90%).
Calculates daily spending velocity so pet parents know their true cost of care.
Health, Vaccine & Vet Appointment Scheduler:
Immunization timeline for core vaccines (Rabies, DHPP, Bordetella, Leptospirosis).
Checkup countdowns with clinic information and medication reminders (monthly flea/tick chewables).
Pet Business Loyalty Card Wallet & Streamlined Refills:
Digital wallet storing scannable barcodes (CODE128) and QR codes for local pet shops, clinics, and groomers.
Automated Refill Reminders: Calculates food consumption based on bag weight and feeding interval (e.g., a 17kg bag lasting 28 days triggers an alert at Day 24 before kibble runs out).
Community & Social Playdate Launchpad:
Direct integration points connecting pet parents to the official Skilitsa.com community, neighborhood weekend park playdate groups, and rescue networks.
4. Aesthetic & Tone
Inspired by the warmth of Skilitsa.com ("σκυλίτσα" — little dog / puppy) combined with a playful 3D Pixar cartoon style:
Expressive 3D dog avatars (Golden Retriever, Beagle, Frenchie, Collie).
Bouncy, tactile 3D claymorphic buttons that depress when clicked.
Subtle floating cartoon clouds, bones, and heart bubbles in the background.
Custom animated paw print cursor and full optical Dark Mode compensation.

Architecture note: Operates online-only (no offline requirement).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ee7c525-4375-4bee-9118-bb621483e52d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
