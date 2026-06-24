"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, Calendar, User, Download, AlertCircle, Loader2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ProfessionalPrescription } from "../doctor/professional-prescription"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"


const API_TREATMENTS_URL = "http://localhost:8003";

interface Medicine {
  name: string;
  medicine_name?: string; // Respaldo por si la API varía
  frequency: string;
  duration: string;
}

interface Treatment {
  id: number;
  appointment_id: number;
  diagnosis: string;
  medicines: Medicine[];
  created_at: string;
  doctor_name: string;
  specialty: string;
  patient_name?: string;
  patient_age?: number;
  hospital_phone?: string;
  hospital_email?: string;
  signature_data?: string;
  hospital_logo?: string;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token 
    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
    : { 'Content-Type': 'application/json' };
};

const getPatientTreatments = async (patientId: number) => {
  const res = await fetch(`${API_TREATMENTS_URL}/patient/treatments/${patientId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
};

const getUserIdFromAuth = (): number | null => {
  try {
    const directId = localStorage.getItem('user_id') || localStorage.getItem('patient_id') || localStorage.getItem('userId');
    if (directId && !isNaN(Number(directId))) return Number(directId);
    
    const userInfoString = localStorage.getItem('user') || localStorage.getItem('userInfo'); 
    if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        const id = userInfo.id || userInfo.user_id;
        if (id) return Number(id);
    }
    return null;
  } catch { return null; }
};

// --- 2. COMPONENTE PRINCIPAL ---

export function PrescriptionsView() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPrescription, setSelectedPrescription] = useState<Treatment | null>(null)
  const [showProfessionalView, setShowProfessionalView] = useState(false)
  const [prescriptionToPrint, setPrescriptionToPrint] = useState<Treatment | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      const patientId = getUserIdFromAuth();
      
      if (!patientId) {
        setError("No se pudo identificar al paciente. Inicia sesión nuevamente.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getPatientTreatments(patientId);
        setTreatments(data || []);
      } catch (err: any) {
        console.error(err);
        setError("Error al cargar las recetas.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Función para imprimir/descargar la receta usando el diseño profesional
  const handleDownload = (treatment: Treatment) => {
    // Set the prescription to print (this will render it in the print-only container)
    setPrescriptionToPrint(treatment);
    
    // Wait for React to render the print-only div, then trigger print
    setTimeout(() => {
      window.print();
      // Clear the print prescription after printing
      setTimeout(() => setPrescriptionToPrint(null), 100);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Cargando tus recetas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/50 text-destructive p-4 rounded-md flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Print-only container - hidden on screen, visible when printing */}
      <div className="hidden print:block">
        {prescriptionToPrint && (
          <ProfessionalPrescription prescription={prescriptionToPrint} />
        )}
      </div>

      {/* Main app container - visible on screen, hidden when printing */}
      <div className="space-y-6 print:hidden">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Mis Recetas Médicas</h2>
        <p className="text-muted-foreground">Consulta y descarga los tratamientos prescritos por tus doctores</p>
      </div>

      {treatments.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No tienes recetas médicas registradas.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {treatments.map((treatment) => (
            <Card key={treatment.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      {/* Título ahora es el Diagnóstico */}
                      <CardTitle className="text-lg">{treatment.diagnosis}</CardTitle>
                      <Badge variant="outline">
                        Receta #{treatment.id}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Prescrito por Dr. {treatment.doctor_name} ({treatment.specialty})
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPrescription(treatment)
                        setShowProfessionalView(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Receta
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(treatment)}>
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4 border-b">
                  <Calendar className="w-4 h-4" />
                  <span>Emitida el: {format(new Date(treatment.created_at), "PPP", { locale: es })}</span>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Medicamentos Prescritos
                  </p>
                  <div className="space-y-3">
                    {treatment.medicines.map((medication, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          {/* Usamos name o medicine_name */}
                          <h4 className="font-semibold text-foreground">{medication.name || medication.medicine_name}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium text-foreground">Frecuencia:</span> {medication.frequency}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Duración:</span> {medication.duration}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Professional Prescription Dialog modificado para impresión */}
      <Dialog open={showProfessionalView} onOpenChange={setShowProfessionalView}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto print:max-h-none print:h-auto print:w-full print:max-w-full print:p-0 print:m-0 print:border-none print:shadow-none bg-white">
          <DialogHeader className="print:hidden">
            <DialogTitle>Receta Médica Profesional</DialogTitle>
          </DialogHeader>
          <div className="print-area">
            {selectedPrescription && (
              <ProfessionalPrescription prescription={selectedPrescription} />
            )}
          </div
        </DialogContent>
      </Dialog>
      </div>
    </>
  )
}