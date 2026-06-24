"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, Calendar, FileText, AlertCircle, Loader2, ChevronLeft } from "lucide-react"
import {
  getPatients,
  getCompletePatientHistory,
  getPatientMedicalHistory,
} from "@/services/medical-history.service"

interface Patient {
  id: number
  name: string
  email: string
}

interface HistoryEntry {
  id: number
  patientId: number
  patientName: string
  doctorId: number
  doctorName: string
  doctorSpecialty: string
  consultationDate: string
  diagnosis: string
  treatmentPlan: string
  clinicalNotes: string
  chiefComplaint: string
}

interface Allergy {
  id: number
  allergen: string
  severity: string
}

interface Condition {
  id: number
  conditionName: string
  status: string
}

interface CompleteHistory {
  medicalHistory: HistoryEntry[]
  allergies: Allergy[]
  conditions: Condition[]
}

export function PatientHistoryView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [completeHistory, setCompleteHistory] = useState<CompleteHistory | null>(null)
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const data = await getPatients()
      setPatients(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error loading patients:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadCompleteHistory = async (patient: Patient) => {
    setSelectedPatient(patient)
    setLoadingDetail(true)
    try {
      const [complete, history] = await Promise.all([
        getCompletePatientHistory(patient.id),
        getPatientMedicalHistory(patient.id),
      ])
      setCompleteHistory(complete)
      setHistoryEntries(Array.isArray(history) ? history : [])
    } catch (err) {
      console.error("Error loading complete history:", err)
    } finally {
      setLoadingDetail(false)
    }
  }

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (selectedPatient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
            <p className="text-muted-foreground">{selectedPatient.email}</p>
          </div>
        </div>

        {loadingDetail ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Consultas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{historyEntries.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Condiciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{completeHistory?.conditions?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Alergias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{completeHistory?.allergies?.length || 0}</p>
                </CardContent>
              </Card>
            </div>

            {completeHistory?.conditions && completeHistory.conditions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Condiciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {completeHistory.conditions.map((c) => (
                      <Badge key={c.id} variant="secondary">
                        {c.conditionName} {c.status && `(${c.status})`}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {completeHistory?.allergies && completeHistory.allergies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Alergias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {completeHistory.allergies.map((a) => (
                      <Badge key={a.id} variant="destructive">
                        {a.allergen} {a.severity && `(${a.severity})`}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Historial de Consultas</h3>
              {historyEntries.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No hay consultas registradas para este paciente.
                  </CardContent>
                </Card>
              ) : (
                historyEntries.map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{entry.diagnosis}</CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.consultationDate).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                      <CardDescription>
                        Dr. {entry.doctorName} {entry.doctorSpecialty && `- ${entry.doctorSpecialty}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {entry.chiefComplaint && (
                        <p className="text-sm">
                          <span className="font-medium">Motivo:</span>{" "}
                          <span className="text-muted-foreground">{entry.chiefComplaint}</span>
                        </p>
                      )}
                      {entry.treatmentPlan && (
                        <p className="text-sm">
                          <span className="font-medium">Tratamiento:</span>{" "}
                          <span className="text-muted-foreground">{entry.treatmentPlan}</span>
                        </p>
                      )}
                      {entry.clinicalNotes && (
                        <p className="text-sm">
                          <span className="font-medium">Notas:</span>{" "}
                          <span className="text-muted-foreground">{entry.clinicalNotes}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Historial de Pacientes</h2>
        <p className="text-muted-foreground">Accede al historial médico completo de los pacientes</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No se encontraron pacientes</p>
        ) : (
          filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => loadCompleteHistory(patient)}
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    {patient.email && <CardDescription>{patient.email}</CardDescription>}
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Historial
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
