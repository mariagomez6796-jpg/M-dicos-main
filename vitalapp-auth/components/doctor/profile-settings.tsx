"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignatureCanvas } from "./signature-canvas"
import { useToast } from "@/hooks/use-toast"
import { Upload, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react"

const API_BASE_URL = "http://localhost:8003"

interface DoctorSettings {
  signatureData?: string
  hospitalLogo?: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

const getUserIdFromAuth = (): number | null => {
  try {
    const directId = localStorage.getItem('user_id') || localStorage.getItem('userId')
    if (directId && !isNaN(Number(directId))) return Number(directId)
    
    const userInfoString = localStorage.getItem('user') || localStorage.getItem('userInfo')
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString)
      const id = userInfo.id || userInfo.user_id
      if (id) return Number(id)
    }
    return null
  } catch {
    return null
  }
}

export function ProfileSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [settings, setSettings] = useState<DoctorSettings>({})
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    const id = getUserIdFromAuth()
    if (id) {
      setDoctorId(id)
      loadDoctorSettings(id)
    }
  }, [])

  const loadDoctorSettings = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/doctor/${id}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setSettings({
          signatureData: data.signatureData,
          hospitalLogo: data.hospitalLogo
        })
        setSignaturePreview(data.signatureData || null)
        setLogoPreview(data.hospitalLogo || null)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const handleSignatureSave = (signatureData: string) => {
    setSignaturePreview(signatureData)
    setSettings(prev => ({ ...prev, signatureData }))
    toast({
      title: "Firma capturada",
      description: "Haz clic en 'Guardar Configuración' para aplicar los cambios."
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido.",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setLogoPreview(base64String)
      setSettings(prev => ({ ...prev, hospitalLogo: base64String }))
      toast({
        title: "Logo cargado",
        description: "Haz clic en 'Guardar Configuración' para aplicar los cambios."
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido.",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setSignaturePreview(base64String)
      setSettings(prev => ({ ...prev, signatureData: base64String }))
      toast({
        title: "Firma cargada",
        description: "Haz clic en 'Guardar Configuración' para aplicar los cambios."
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSaveSettings = async () => {
    if (!doctorId) {
      toast({
        title: "Error",
        description: "No se pudo identificar al doctor.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/doctor/profile/settings/${doctorId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        const updatedDoctor = await response.json()
        // Update local state with the saved data from backend
        setSettings({
          signatureData: updatedDoctor.signatureData,
          hospitalLogo: updatedDoctor.hospitalLogo
        })
        setSignaturePreview(updatedDoctor.signatureData || null)
        setLogoPreview(updatedDoctor.hospitalLogo || null)
        
        toast({
          title: "Éxito",
          description: "Configuración guardada correctamente."
        })
      } else {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error("Error al guardar")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Configuración de Recetas y Certificación
        </h2>
        <p className="text-muted-foreground">
          Configura tu firma electrónica y logo del hospital para las recetas médicas
        </p>
      </div>

      <Tabs defaultValue="signature" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signature">Firma Electrónica</TabsTrigger>
          <TabsTrigger value="logo">Logo del Hospital</TabsTrigger>
        </TabsList>

        <TabsContent value="signature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Firma Electrónica</CardTitle>
              <CardDescription>
                Dibuja tu firma o sube una imagen de tu firma física
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SignatureCanvas
                onSave={handleSignatureSave}
                initialSignature={signaturePreview || undefined}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O sube una imagen
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature-upload">Subir imagen de firma</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="signature-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleSignatureUpload}
                    className="flex-1"
                  />
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos aceptados: PNG, JPG (máx. 5MB)
                </p>
              </div>

              {signaturePreview && (
                <div className="space-y-2">
                  <Label>Vista previa de la firma</Label>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <img
                      src={signaturePreview}
                      alt="Firma preview"
                      className="max-h-32 mx-auto"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo del Hospital</CardTitle>
              <CardDescription>
                Sube el logo oficial de tu hospital o clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Subir logo del hospital</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos aceptados: PNG, JPG (máx. 5MB)
                </p>
              </div>

              {logoPreview && (
                <div className="space-y-2">
                  <Label>Vista previa del logo</Label>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-32 mx-auto"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={loading || (!settings.signatureData && !settings.hospitalLogo)}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Made with Bob
