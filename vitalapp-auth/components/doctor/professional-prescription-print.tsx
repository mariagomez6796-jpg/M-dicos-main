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

interface ProfessionalPrescriptionPrintProps {
  prescription: PrescriptionData
}

export function ProfessionalPrescriptionPrint({ prescription }: ProfessionalPrescriptionPrintProps) {
  const hospitalName = prescription.hospital_name || "HOSPITAL GAFEM"
  const hospitalPhone = prescription.hospital_phone || "<<Numero.Telefono>>"
  const hospitalEmail = prescription.hospital_email || "<<Email>>"

  return (
    <>
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .prescription-print-container,
          .prescription-print-container * {
            visibility: visible;
          }
          .prescription-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
        
        .prescription-print-container {
          background: white;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
          font-family: Arial, sans-serif;
        }
        
        .medical-symbol {
          width: 80px;
          height: auto;
          color: #1e40af;
        }
        
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          padding-bottom: 10px;
        }
        
        .doctor-info {
          flex: 1;
          text-align: center;
        }
        
        .doctor-name {
          color: #1e40af;
          font-size: 18px;
          font-weight: bold;
          margin: 5px 0;
        }
        
        .doctor-specialty {
          color: #1e40af;
          font-size: 16px;
          font-weight: bold;
          margin: 3px 0;
        }
        
        .doctor-license {
          color: #1e40af;
          font-size: 14px;
          margin: 3px 0;
        }
        
        .divider {
          border: none;
          border-top: 3px solid #1e40af;
          margin: 15px 0;
        }
        
        .patient-section {
          margin: 20px 0;
        }
        
        .info-row {
          display: flex;
          gap: 20px;
          margin: 8px 0;
        }
        
        .info-label {
          color: #1e40af;
          font-weight: bold;
          font-size: 14px;
        }
        
        .info-value {
          color: #000;
          font-size: 14px;
        }
        
        .watermark-symbol {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.05;
          width: 400px;
          height: 400px;
          pointer-events: none;
        }
        
        .signature-section {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-line {
          border-top: 2px solid #000;
          width: 250px;
          margin: 10px auto 5px;
        }
        
        .signature-image {
          max-height: 80px;
          max-width: 200px;
          margin-bottom: -10px;
        }
        
        .footer-section {
          margin-top: 40px;
          text-align: center;
          border-top: 2px solid #1e40af;
          padding-top: 10px;
        }
        
        .hospital-name {
          font-weight: bold;
          font-size: 16px;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          gap: 30px;
          font-size: 14px;
          color: #000;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      `}</style>

      <div className="prescription-print-container relative">
        {/* Watermark Medical Symbol */}
        <svg className="watermark-symbol" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>

        {/* Header with Logo and Doctor Info */}
        <div className="header-section">
          <div style={{ width: '80px' }}>
            {prescription.hospital_logo ? (
              <img 
                src={prescription.hospital_logo} 
                alt="Hospital Logo" 
                style={{ width: '80px', height: 'auto' }}
              />
            ) : (
              <svg className="medical-symbol" viewBox="0 0 100 150" fill="currentColor">
                <path d="M50,10 L50,30 M40,20 L60,20 M30,40 Q30,30 40,30 L60,30 Q70,30 70,40 L70,60 Q70,70 60,70 L40,70 Q30,70 30,60 Z M50,70 L50,90 M35,80 L65,80 M50,90 L50,140 M30,130 L70,130" stroke="currentColor" strokeWidth="3" fill="none"/>
                <circle cx="50" cy="50" r="8" fill="currentColor"/>
              </svg>
            )}
          </div>
          
          <div className="doctor-info">
            <div className="doctor-name"><<{prescription.doctor_name}>></div>
            <div className="doctor-specialty"><<{prescription.specialty}>></div>
            {prescription.doctor_license && (
              <div className="doctor-license"><<Ced. Profesional: {prescription.doctor_license}>></div>
            )}
          </div>
          
          <div style={{ width: '80px' }}></div>
        </div>

        <hr className="divider" />

        {/* Patient Information */}
        <div className="patient-section">
          <div className="info-row">
            <div>
              <span className="info-label">Fecha: </span>
              <span className="info-value"><<{format(new Date(prescription.created_at), "dd/MM/yyyy", { locale: es })}>></span>
            </div>
          </div>
          <div className="info-row">
            <div>
              <span className="info-label">Paciente: </span>
              <span className="info-value"><<{prescription.patient_name || "Nom.Paciente"}>></span>
            </div>
          </div>
          <div className="info-row">
            <div>
              <span className="info-label">Edad: </span>
              <span className="info-value"><<{prescription.patient_age || "Edad"}>></span>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Prescription Content */}
        <div style={{ minHeight: '300px', marginTop: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div className="info-label" style={{ fontSize: '16px', marginBottom: '10px' }}>Diagnóstico:</div>
            <div style={{ marginLeft: '20px', fontSize: '14px' }}>{prescription.diagnosis}</div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <div className="info-label" style={{ fontSize: '16px', marginBottom: '10px' }}>Tratamiento:</div>
            {prescription.medicines.map((med, index) => (
              <div key={index} style={{ marginLeft: '20px', marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {index + 1}. {med.name || med.medicine_name}
                </div>
                <div style={{ fontSize: '13px', marginLeft: '15px', marginTop: '5px' }}>
                  <div>Frecuencia: {med.frequency}</div>
                  <div>Duración: {med.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Section */}
        <div className="signature-section">
          <div style={{ flex: 1 }}></div>
          <div className="signature-box">
            {prescription.signature_data && (
              <img 
                src={prescription.signature_data} 
                alt="Firma" 
                className="signature-image"
              />
            )}
            <div className="signature-line"></div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}><<Firm.{prescription.doctor_name.split(' ')[0]}>></div>
            <div style={{ fontSize: '11px' }}><<{prescription.doctor_name}>></div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer-section">
          <div className="hospital-name">{hospitalName}</div>
          <div className="contact-info">
            <div className="contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>{hospitalPhone}</span>
            </div>
            <div className="contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span>{hospitalEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Made with Bob
