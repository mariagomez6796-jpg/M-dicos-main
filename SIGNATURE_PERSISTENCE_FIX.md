# Signature and Hospital Logo Persistence Fix

## Problem Identified
The signature and hospital logo were not persisting when changing pages or saving because the frontend was calling the **Java Spring Boot backend** (port 8080), but the treatment and prescription logic is actually handled by the **Python FastAPI microservice** (port 8003) in the `./treatments-api` directory.

## Architecture Correction
- **Backend**: Python FastAPI (`treatments-api/main.py`) - Port 8003
- **Database**: Shared MySQL database (CRUDG)
- **Frontend**: React/Next.js - Must call port 8003 for doctor profile settings

## Changes Made

### 1. Backend Fix (treatments-api/main.py)

#### Added Pydantic Model for Profile Settings
```python
class DoctorProfileSettings(BaseModel):
    signatureData: Optional[str] = None
    hospitalLogo: Optional[str] = None
```

#### Added GET Endpoint to Fetch Doctor Profile
```python
@app.get("/api/v1/doctor/{doctor_id}")
def get_doctor_profile(doctor_id: int):
    """Get doctor profile including signature and logo"""
    db = conectar_db()
    if not db: 
        raise HTTPException(status_code=500, detail="Error DB")
    cursor = db.cursor(dictionary=True)
    
    try:
        query = """
            SELECT id, name, email_address as email, phoneNumber, specialty, 
                   signature_data as signatureData, hospital_logo as hospitalLogo
            FROM tbl_doctor 
            WHERE id = %s
        """
        cursor.execute(query, (doctor_id,))
        doctor = cursor.fetchone()
        
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor no encontrado")
            
        return doctor
    finally:
        db.close()
```

#### Added PUT Endpoint to Update Profile Settings
```python
@app.put("/api/v1/doctor/profile/settings/{doctor_id}")
def update_doctor_profile_settings(doctor_id: int, settings: DoctorProfileSettings):
    """Update doctor signature and hospital logo with database persistence"""
    db = conectar_db()
    if not db: 
        raise HTTPException(status_code=500, detail="Error DB")
    cursor = db.cursor(dictionary=True)
    
    try:
        # First verify the doctor exists
        cursor.execute("SELECT id FROM tbl_doctor WHERE id = %s", (doctor_id,))
        doctor = cursor.fetchone()
        
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor no encontrado")
        
        # Update signature and logo in database
        update_query = """
            UPDATE tbl_doctor 
            SET signature_data = %s, hospital_logo = %s
            WHERE id = %s
        """
        cursor.execute(update_query, (
            settings.signatureData,
            settings.hospitalLogo,
            doctor_id
        ))
        
        # Commit the transaction to persist changes
        db.commit()
        
        # Fetch and return the updated doctor data
        cursor.execute("""
            SELECT id, name, email_address as email, phoneNumber, specialty,
                   signature_data as signatureData, hospital_logo as hospitalLogo
            FROM tbl_doctor 
            WHERE id = %s
        """, (doctor_id,))
        updated_doctor = cursor.fetchone()
        
        return updated_doctor
        
    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error SQL: {err.msg}")
    finally:
        db.close()
```

### 2. Frontend Fix (vitalapp-auth/components/doctor/profile-settings.tsx)

#### Changed API Base URL
```typescript
// BEFORE (INCORRECT - was calling Java backend)
const API_BASE_URL = "http://localhost:8080"

// AFTER (CORRECT - now calls FastAPI treatments service)
const API_BASE_URL = "http://localhost:8003"
```

The rest of the frontend code remains the same. The component already:
- Loads doctor settings on mount via GET `/api/v1/doctor/{doctor_id}`
- Saves settings via PUT `/api/v1/doctor/profile/settings/{doctor_id}`
- Updates local state after successful save to prevent blank images

### 3. Database Schema Verification

The database already has the required fields (from `CRUDG/sql/add_doctor_signature_fields.sql`):
```sql
ALTER TABLE tbl_doctor 
ADD COLUMN signature_data LONGTEXT NULL COMMENT 'Base64 encoded doctor signature image';

ALTER TABLE tbl_doctor 
ADD COLUMN hospital_logo LONGTEXT NULL COMMENT 'Base64 encoded hospital logo image';
```

## How It Works Now

1. **Loading Settings**: When the profile settings page loads, it calls `GET http://localhost:8003/api/v1/doctor/{doctor_id}` to fetch the doctor's current signature and logo from the database.

2. **Saving Settings**: When the user clicks "Guardar Configuración", it sends a `PUT` request to `http://localhost:8003/api/v1/doctor/profile/settings/{doctor_id}` with the Base64-encoded signature and logo.

3. **Database Persistence**: The FastAPI endpoint executes an `UPDATE` SQL query on the `tbl_doctor` table and commits the transaction, ensuring the data is permanently stored.

4. **State Update**: After a successful save, the frontend updates its local state with the returned data from the backend, preventing the images from going blank when switching tabs.

## Port Configuration

From `docker-compose.yaml`:
- **treatments-api**: Internal port 8000, exposed as **8003** (`"8003:8000"`)
- **Java backend (CRUDG)**: Port **8080**
- **appointments-api**: Port **8001**
- **videocalls-api**: Port **8000**

## Testing the Fix

To test the complete flow:

1. Start the services:
   ```bash
   docker-compose up -d
   ```

2. Ensure the database migration has been run:
   ```bash
   docker exec -i crudg_db mysql -uroot -proot CRUDG < CRUDG/sql/add_doctor_signature_fields.sql
   ```

3. Log in as a doctor and navigate to Profile Settings

4. Draw or upload a signature and hospital logo

5. Click "Guardar Configuración"

6. Verify the data persists by:
   - Switching to another tab and back
   - Refreshing the page
   - Logging out and back in

## Key Points

✅ **Correct Architecture**: FastAPI handles all treatment/prescription logic, not Java  
✅ **Database Persistence**: Uses proper SQL UPDATE with commit()  
✅ **Frontend Connection**: Now calls the correct port (8003)  
✅ **State Management**: Updates local state after save to prevent blank images  
✅ **Error Handling**: Includes proper error handling and rollback on failure

## Files Modified

1. `treatments-api/main.py` - Added doctor profile endpoints
2. `vitalapp-auth/components/doctor/profile-settings.tsx` - Changed API_BASE_URL to port 8003

---
*Fix implemented on 2026-06-24*
*Made with Bob*