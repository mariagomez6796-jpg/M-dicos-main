"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Edit, Calendar, FileText, AlertCircle, Plus, Loader2 } from "lucide-react"
import {
  getPatients,
  getPatientMedicalHistory,
  createMedicalHistory,
  getPatientAllergies,
  createAllergy,
  deleteAllergy,
  getPatientConditions,
  createCondition,
  deleteCondition,
  getUserId,
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
  chiefComplaint: string
  presentIllness: string
  physicalExamination: string
  diagnosis: string
  treatmentPlan: string
  clinicalNotes: string
  followUpDate: string
  createdAt: string
}

interface Allergy {
  id: number
  patientId: number
  allergen: string
  reaction: string
  severity: string
  diagnosedDate: string
  notes: string
}

interface Condition {
  id: number
  patientId: number
  conditionName: string
  diagnosedDate: string
  status: string
  notes: string
}

export function MedicalHistoryEditor() {
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false)
  const [isAllergyOpen, setIsAllergyOpen] = useState(false)
  const [isConditionOpen, setIsConditionOpen] = useState(false)
  const [newAllergen, setNewAllergen] = useState("")
  const [newCondition, setNewCondition] = useState("")
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    chiefComplaint: "",
    presentIllness: "",
    physicalExamination: "",
    diagnosis: "",
    treatmentPlan: "",
    clinicalNotes: "",
    consultationDate: new Date().toISOString().slice(0, 16),
  })

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

  const loadPatientData = async (patient: Patient) => {
    setSelectedPatient(patient)
    try {
      const [history, patientAllergies, patientConditions] = await Promise.all([
        getPatientMedicalHistory(patient.id),
        getPatientAllergies(patient.id),
        getPatientConditions(patient.id),
      ])
      setHistoryEntries(Array.isArray(history) ? history : [])
      setAllergies(Array.isArray(patientAllergies) ? patientAllergies : [])
      setConditions(Array.isArray(patientConditions) ? patientConditions : [])
    } catch (err) {
      console.error("Error loading patient data:", err)
    }
  }

  const handleCreateEntry = async () => {
    if (!selectedPatient) return
    const doctorId = getUserId()
    if (!doctorId) return

    setSaving(true)
    try {
      const payload = {
        doctorId,
        consultationDate: formData.consultationDate
          ? new Date(formData.consultationDate).toISOString()
          : new Date().toISOString(),
        chiefComplaint: formData.chiefComplaint,
        presentIllness: formData.presentIllness,
        physicalExamination: formData.physicalExamination,
        diagnosis: formData.diagnosis,
        treatmentPlan: formData.treatmentPlan,
        clinicalNotes: formData.clinicalNotes,
      }
      const newEntry = await createMedicalHistory(selectedPatient.id, payload)
      setIsNewEntryOpen(false)
      setFormData({
        chiefComplaint: "",
        presentIllness: "",
        physicalExamination: "",
        diagnosis: "",
        treatmentPlan: "",
        clinicalNotes: "",
        consultationDate: new Date().toISOString().slice(0, 16),
      })
      setHistoryEntries(prev => [newEntry, ...prev])
    } catch (err) {
      console.error("Error creating entry:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleAddAllergy = async () => {
    if (!selectedPatient || !newAllergen.trim()) return
    setSaving(true)
    try {
      const newAllergy = await createAllergy(selectedPatient.id, { allergen: newAllergen.trim() })
      setIsAllergyOpen(false)
      setNewAllergen("")
      // Use requestAnimationFrame to update state after dialog unmounts
      requestAnimationFrame(() => {
        setAllergies(prev => [...prev, newAllergy])
      })
    } catch (err) {
      console.error("Error adding allergy:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAllergy = async (allergyId: number) => {
    try {
      await deleteAllergy(allergyId)
      setAllergies(prev => prev.filter(a => a.id !== allergyId))
    } catch (err) {
      console.error("Error deleting allergy:", err)
    }
  }

  const handleAddCondition = async () => {
    if (!selectedPatient || !newCondition.trim()) return
    setSaving(true)
    try {
      const newCond = await createCondition(selectedPatient.id, { conditionName: newCondition.trim() })
      setIsConditionOpen(false)
      setNewCondition("")
      // Use requestAnimationFrame to update state after dialog unmounts
      requestAnimationFrame(() => {
        setConditions(prev => [...prev, newCond])
      })
    } catch (err) {
      console.error("Error adding condition:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCondition = async (conditionId: number) => {
    try {
      await deleteCondition(conditionId)
      setConditions(prev => prev.filter(c => c.id !== conditionId))
    } catch (err) {
      console.error("Error deleting condition:", err)
    }
  }

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "SEVERE": return "destructive"
      case "MODERATE": return "default"
      default: return "secondary"
    }
  }

  const getConditionStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "default"
      case "MANAGED": return "secondary"
      case "RESOLVED": return "outline"
      default: return "secondary"
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Historial Médico</h2>
          <p className="text-muted-foreground">Consulta y modifica el historial médico de tus pacientes</p>
        </div>
        {selectedPatient && (
          <Button variant="outline" onClick={() => setSelectedPatient(null)}>
            Volver a pacientes
          </Button>
        )}
      </div>

      {!selectedPatient ? (
        <>
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
                  onClick={() => loadPatientData(patient)}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{patient.name || `Paciente #${patient.id}`}</CardTitle>
                        {patient.email && <CardDescription>{patient.email}</CardDescription>}
                      </div>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedPatient.name || `Paciente #${selectedPatient.id}`}</CardTitle>
                  {selectedPatient.email && <CardDescription>{selectedPatient.email}</CardDescription>}
                </div>
                <Button onClick={() => setIsNewEntryOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Entrada
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Condiciones</CardTitle>
                  <CardDescription>Diagnósticos activos del paciente</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsConditionOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {conditions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin condiciones registradas</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((c) => (
                      <Badge
                        key={c.id}
                        variant={getConditionStatusColor(c.status) as any}
                        className="cursor-pointer"
                        onClick={() => handleDeleteCondition(c.id)}
                      >
                        {c.conditionName} {c.status && `(${c.status})`}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Alergias
                  </CardTitle>
                  <CardDescription>Alergias registradas del paciente</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsAllergyOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {allergies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin alergias registradas</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((a) => (
                      <Badge
                        key={a.id}
                        variant={getSeverityColor(a.severity) as any}
                        className="cursor-pointer"
                        onClick={() => handleDeleteAllergy(a.id)}
                      >
                        {a.allergen} {a.severity && `(${a.severity})`}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Entradas del Historial</h3>
            {historyEntries.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No hay entradas de historial médico. Crea una nueva entrada usando el botón superior.
                </CardContent>
              </Card>
            ) : (
              historyEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{entry.diagnosis}</CardTitle>
                        <CardDescription>
                          {new Date(entry.consultationDate).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          {" — "}
                          Dr. {entry.doctorName}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {entry.chiefComplaint && (
                      <div>
                        <p className="text-sm font-medium">Motivo de consulta</p>
                        <p className="text-sm text-muted-foreground">{entry.chiefComplaint}</p>
                      </div>
                    )}
                    {entry.treatmentPlan && (
                      <div>
                        <p className="text-sm font-medium">Plan de tratamiento</p>
                        <p className="text-sm text-muted-foreground">{entry.treatmentPlan}</p>
                      </div>
                    )}
                    {entry.clinicalNotes && (
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Notas clínicas
                        </p>
                        <p className="text-sm text-muted-foreground">{entry.clinicalNotes}</p>
                      </div>
                    )}
                    {entry.followUpDate && (
                      <div className="flex items-center gap-2 text-sm">
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
      )}

      <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Entrada de Historial</DialogTitle>
            <DialogDescription>
              Agregar una nueva entrada al historial de {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="consultationDate">Fecha de consulta</Label>
              <Input
                id="consultationDate"
                type="datetime-local"
                value={formData.consultationDate}
                onChange={(e) => setFormData({ ...formData, consultationDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Motivo de consulta</Label>
              <Textarea
                id="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                placeholder="¿Cuál es el motivo de la consulta?"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="presentIllness">Enfermedad actual</Label>
              <Textarea
                id="presentIllness"
                value={formData.presentIllness}
                onChange={(e) => setFormData({ ...formData, presentIllness: e.target.value })}
                placeholder="Descripción de la enfermedad actual"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physicalExamination">Examen físico</Label>
              <Textarea
                id="physicalExamination"
                value={formData.physicalExamination}
                onChange={(e) => setFormData({ ...formData, physicalExamination: e.target.value })}
                placeholder="Hallazgos del examen físico"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Diagnóstico principal"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatmentPlan">Plan de tratamiento</Label>
              <Textarea
                id="treatmentPlan"
                value={formData.treatmentPlan}
                onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                placeholder="Plan de tratamiento recomendado"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicalNotes">Notas clínicas</Label>
              <Textarea
                id="clinicalNotes"
                value={formData.clinicalNotes}
                onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                placeholder="Notas y observaciones adicionales"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateEntry} disabled={saving || !formData.diagnosis.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAllergyOpen} onOpenChange={setIsAllergyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Alergia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="allergen">Alérgeno</Label>
              <Input
                id="allergen"
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                placeholder="Ej: Penicilina, Polen, etc."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAllergyOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddAllergy} disabled={saving || !newAllergen.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Agregar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isConditionOpen} onOpenChange={setIsConditionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Condición</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="conditionName">Nombre de la condición</Label>
              <Input
                id="conditionName"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Ej: Hipertensión, Diabetes tipo 2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsConditionOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddCondition} disabled={saving || !newCondition.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Agregar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
