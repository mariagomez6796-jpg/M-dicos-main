# M-dicos
# VitalApp - Medical Management System with Mini-Blockchain

VitalApp is a medical management system enhanced with a mini-blockchain mechanism for secure event auditing and data integrity verification.

The system manages:

- Patients
- Doctors
- Administrators
- Appointments
- Treatments
- Video consultations

Additionally, a simplified blockchain is implemented to record critical CRUD events and verify data integrity using SHA-256 hashing.

---

# Authors

- Maria Fernanda Gomez Enriquez
- Eduardo Caleb Martinez Arias
- Jose Manuel Lozano Perez

Centro Universitario de Tonalá  
Universidad de Guadalajara

---

# Technologies Used

## Backend
- Java 17
- Spring Boot
- Spring Security
- JWT
- Maven

## Frontend
- Next.js
- React
- TypeScript

## Database
- MySQL 8

## APIs / Microservices
- Python
- FastAPI

## Containerization
- Docker
- Docker Compose

## Blockchain
- SHA-256 hashing
- JSON export

---

# Project Structure

```bash
VitalApp/
│
├── backend(CRUDG)/
├── frontend(vitalapp-auth)/
├── appointments-api/
├── treatments-api/
├── video-api/
├── output/
├── docker-compose.yml
└── README.md
```

---

# Quick Start

Run the full project with Docker:

```bash
docker-compose up --build
```

---

# Access URLs

Frontend:

```bash
http://localhost:3000
```

Backend:

```bash
http://localhost:8080
```

---

# Installation Instructions

## 1. Clone repository

```bash
git clone  https://github.com/mariagomez6796-jpg/M-dicos-main.git
cd vitalapp
```

Replace with your repository URL.

---

## 2. Start containers

Build and run:

```bash
docker-compose up --build
```

This will initialize:

- MySQL database
- Spring Boot backend
- Next.js frontend
- Appointments API
- Treatments API
- Video consultation API

---

## 3. Stop containers

```bash
docker-compose down
```

---

# Database Configuration

Default configuration:

```bash
username: root
password: root
database: vitalapp
```

Modify credentials in:

```bash
backend/src/main/resources/application.properties
docker-compose.yml
```

---

# Mini-Blockchain Functionality

VitalApp integrates a simplified blockchain for auditing critical system events.

Each block contains:

- index
- timestamp
- eventData
- previousHash
- currentHash

Hash algorithm:

```text
SHA-256
```

---

# How to Test Blockchain

## 1. Generate blocks

Open application and perform CRUD operations:

- Create Patient
- Create Doctor
- Update Patient
- Delete Administrator

Example generated events:

```text
CREATE_PATIENT ID=1
UPDATE_DOCTOR ID=2
DELETE_ADMIN ID=3
```

Each operation automatically creates a blockchain block.

---

## 2. View blockchain

Check blockchain endpoint:

```bash
GET /api/v1/blockchain
```

URL:

```bash
http://localhost:8080/api/v1/blockchain
```

Or query database:

```sql
SELECT * FROM blockchain_blocks;
```

---

## 3. Validate blockchain integrity

Endpoint:

```bash
GET /api/v1/blockchain/validate
```

URL:

```bash
http://localhost:8080/api/v1/blockchain/validate
```

Expected result:

```json
true
```

---


Last updated: 2021-09-21T14:00:00Z

