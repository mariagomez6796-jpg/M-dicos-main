"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, AlertCircle, Loader2 } from "lucide-react"
import {
  getPatientMedicalHistory,
  getPatientAllergies,
  getPatientConditions,
  getUserId,
} from "@/services/medical-history.service"

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
  followUpDate: string
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

export function PatientMedicalHistory() {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMyHistory()
  }, [])

  const loadMyHistory = async () => {
    const patientId = getUserId()
    if (!patientId) {
      setLoading(false)
      return
    }
    try {
      const [history, patientAllergies, patientConditions] = await Promise.all([
        getPatientMedicalHistory(patientId),
        getPatientAllergies(patientId),
        getPatientConditions(patientId),
      ])
      setHistoryEntries(Array.isArray(history) ? history : [])
      setAllergies(Array.isArray(patientAllergies) ? patientAllergies : [])
      setConditions(Array.isArray(patientConditions) ? patientConditions : [])
    } catch (err) {
      console.error("Error loading medical history:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Mi Historial Médico</h2>
        <p className="text-muted-foreground">Consulta tu historial médico, diagnósticos y tratamientos</p>
      </div>

      {allergies.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Mis Alergias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allergies.map((a) => (
                <Badge key={a.id} variant="destructive">
                  {a.allergen} {a.severity && `(${a.severity})`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {conditions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mis Condiciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c) => (
                <Badge key={c.id} variant="secondary">
                  {c.conditionName} {c.status && `(${c.status})`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Consultas</h3>
        {historyEntries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No tienes consultas registradas en tu historial.
            </CardContent>
          </Card>
        ) : (
          historyEntries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{entry.diagnosis}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date(entry.consultationDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <CardDescription>
                  Dr. {entry.doctorName} {entry.doctorSpecialty && `- ${entry.doctorSpecialty}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {entry.chiefComplaint && (
                  <p className="text-sm">
                    <span className="font-medium">Motivo de consulta:</span>{" "}
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
                {entry.followUpDate && (
                  <div className="flex items-center gap-2 text-sm pt-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Seguimiento:</span>
                    <span className="font-medium">
                      {new Date(entry.followUpDate).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
