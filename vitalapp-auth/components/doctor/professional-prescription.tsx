"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Medicine {
  name: string
  medicine_name?: string
  frequency: string
  duration: string
}

interface PrescriptionData {
  id: number
  diagnosis: string
  medicines: Medicine[]
  created_at: string
  doctor_name: string
  specialty: string
  doctor_license?: string
  patient_name?: string
  patient_age?: number
  patient_gender?: string
  signature_data?: string
  hospital_logo?: string
  hospital_name?: string
  hospital_phone?: string
  hospital_email?: string
}

interface ProfessionalPrescriptionProps {
  prescription: PrescriptionData
}

// 🚀 CSS EXTRAÍDO A UNA CONSTANTE PARA EVITAR EL BUG DE COMPILACIÓN DE NEXT.JS
const prescriptionStyles = `
  @media print {
    body * { visibility: hidden; }
    .prescription-container, .prescription-container * { visibility: visible; }
    .prescription-container { position: absolute; left: 0; top: 0; width: 100%; padding: 10mm; margin: 0; box-shadow: none; }
    .no-print { display: none !important; }
    .prescription-header-logo img, .prescription-signature img { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
  @media screen {
    .prescription-container { max-width: 210mm; margin: 20px auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 10mm; }
  }
  .prescription-container { font-family: Arial, sans-serif; background: white; position: relative; }
  .prescription-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.03; width: 500px; height: 500px; pointer-events: none; z-index: 0; }
  .prescription-content { position: relative; z-index: 1; }
  .prescription-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .prescription-header-logo { width: 80px; flex-shrink: 0; }
  .prescription-header-logo img { width: 80px; height: auto; display: block; }
  .prescription-header-doctor { flex: 1; text-align: center; padding: 0 20px; }
  .prescription-doctor-name { color: #1e40af; font-size: 18px; font-weight: bold; margin: 3px 0; }
  .prescription-doctor-specialty { color: #1e40af; font-size: 16px; font-weight: bold; margin: 2px 0; }
  .prescription-doctor-license { color: #1e40af; font-size: 14px; margin: 2px 0; }
  .prescription-divider { border: none; border-top: 3px solid #1e40af; margin: 10px 0; }
  .prescription-patient-info { margin: 12px 0; }
  .prescription-info-row { margin: 6px 0; font-size: 14px; }
  .prescription-info-label { color: #1e40af; font-weight: bold; display: inline; }
  .prescription-info-value { color: #000; display: inline; }
  .prescription-content-section { margin-top: 15px; }
  .prescription-diagnosis { margin-bottom: 15px; }
  .prescription-section-title { font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 8px; }
  .prescription-section-content { margin-left: 20px; font-size: 14px; }
  .prescription-medicine-item { margin-bottom: 12px; }
  .prescription-medicine-name { font-weight: bold; font-size: 14px; }
  .prescription-medicine-details { margin-left: 15px; margin-top: 4px; font-size: 13px; }
  .prescription-signature-section { margin-top: 40px; display: flex; justify-content: flex-end; }
  .prescription-signature-box { text-align: center; min-width: 250px; }
  .prescription-signature { margin-bottom: 10px; }
  .prescription-signature img { max-height: 80px; max-width: 200px; display: block; margin: 0 auto; }
  .prescription-signature-line { border-top: 2px solid #000; margin: 10px auto 5px; width: 250px; }
  .prescription-signature-name { font-size: 12px; font-weight: bold; margin-top: 5px; }
  .prescription-signature-title { font-size: 11px; color: #666; }
  .prescription-footer { margin-top: 25px; text-align: center; border-top: 2px solid #1e40af; padding-top: 8px; }
  .prescription-hospital-name { font-weight: bold; font-size: 16px; color: #1e40af; margin-bottom: 5px; }
  .prescription-contact-info { display: flex; justify-content: center; gap: 30px; font-size: 14px; color: #000; flex-wrap: wrap; }
  .prescription-contact-item { display: flex; align-items: center; gap: 5px; }
  .prescription-contact-icon { width: 16px; height: 16px; flex-shrink: 0; }
`;

export function ProfessionalPrescription({ prescription }: ProfessionalPrescriptionProps) {
  const hospitalName = prescription.hospital_name || "HOSPITAL GAFEM"
  const hospitalPhone = prescription.hospital_phone || ""
  const hospitalEmail = prescription.hospital_email || ""

  return (
    <>
      {/* SE INYECTA EL CSS DESDE LA CONSTANTE */}
      <style dangerouslySetInnerHTML={{ __html: prescriptionStyles }} />

      <div className="prescription-container">
        {/* Watermark */}
        <svg className="prescription-watermark" viewBox="0 0 100 150" fill="currentColor">
          <path d="M50,10 L50,30 M40,20 L60,20 M30,40 Q30,30 40,30 L60,30 Q70,30 70,40 L70,60 Q70,70 60,70 L40,70 Q30,70 30,60 Z M50,70 L50,90 M35,80 L65,80 M50,90 L50,140 M30,130 L70,130" stroke="currentColor" strokeWidth="3" fill="none"/>
          <circle cx="50" cy="50" r="8" fill="currentColor"/>
        </svg>

        <div className="prescription-content">
          {/* Header */}
          <div className="prescription-header">
            <div className="prescription-header-logo">
              {prescription.hospital_logo ? (
                <img src={prescription.hospital_logo} alt="Hospital Logo" />
              ) : (
                <svg viewBox="0 0 100 150" fill="#1e40af">
                  <path d="M50,10 L50,30 M40,20 L60,20 M30,40 Q30,30 40,30 L60,30 Q70,30 70,40 L70,60 Q70,70 60,70 L40,70 Q30,70 30,60 Z M50,70 L50,90 M35,80 L65,80 M50,90 L50,140 M30,130 L70,130" stroke="currentColor" strokeWidth="3" fill="none"/>
                  <circle cx="50" cy="50" r="8" fill="currentColor"/>
                </svg>
              )}
            </div>
            
            <div className="prescription-header-doctor">
              <div className="prescription-doctor-name">{prescription.doctor_name}</div>
              <div className="prescription-doctor-specialty">{prescription.specialty}</div>
              {prescription.doctor_license && (
                <div className="prescription-doctor-license">[Ced. Profesional: {prescription.doctor_license}]</div>
              )}
            </div>
            
            <div style={{ width: '80px' }}></div>
          </div>

          <hr className="prescription-divider" />

          {/* Patient Info */}
          <div className="prescription-patient-info">
            <div className="prescription-info-row">
              <span className="prescription-info-label">Fecha: </span>
              <span className="prescription-info-value">{format(new Date(prescription.created_at), 'PPP', {locale: es})}</span>
            </div>
            <div className="prescription-info-row">
              <span className="prescription-info-label">Paciente: </span>
              <span className="prescription-info-value">{prescription.patient_name || ''}</span>
            </div>
          </div>

          <hr className="prescription-divider" />

          {/* Content */}
          <div className="prescription-content-section">
            <div className="prescription-diagnosis">
              <div className="prescription-section-title">Diagnóstico:</div>
              <div className="prescription-section-content">{prescription.diagnosis}</div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div className="prescription-section-title">Tratamiento:</div>
              <div className="prescription-section-content">
                {prescription.medicines.map((med, index) => (
                  <div key={index} className="prescription-medicine-item">
                    <div className="prescription-medicine-name">
                      {index + 1}. {med.name || med.medicine_name}
                    </div>
                    <div className="prescription-medicine-details">
                      <div>Frecuencia: {med.frequency}</div>
                      <div>Duración: {med.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="prescription-signature-section">
            <div className="prescription-signature-box">
              {prescription.signature_data && (
                <div className="prescription-signature">
                  <img src={prescription.signature_data} alt="Firma" />
                </div>
              )}
              <div className="prescription-signature-line"></div>
              <div className="prescription-signature-name">{prescription.doctor_name}</div>
              <div className="prescription-signature-title">{prescription.specialty}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="prescription-footer">
            <div className="prescription-hospital-name">{hospitalName}</div>
            <div className="prescription-contact-info">
              {hospitalPhone && (
                <div className="prescription-contact-item">
                  <svg className="prescription-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span>{hospitalPhone}</span>
                </div>
              )}
              {hospitalEmail && (
                <div className="prescription-contact-item">
                  <svg className="prescription-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>{hospitalEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}