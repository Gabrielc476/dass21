import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Upload, FileImage } from "lucide-react";
import { toast } from "sonner";

export function AssessmentUpload({ patientId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      setPreview("");
      return;
    }

    // Check if the file is an image
    if (!selectedFile.type.startsWith("image/")) {
      setError("Por favor, selecione uma imagem válida (JPEG, PNG, GIF)");
      setFile(null);
      setPreview("");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Por favor, selecione uma imagem para enviar");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("patient_id", patientId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dass21/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao processar o questionário");
      }

      toast.success("Questionário processado", {
        description: "O questionário DASS-21 foi processado com sucesso.",
      });

      // Redirect to patient assessments
      router.push(`/dashboard/patients/${patientId}/assessments`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(`/dashboard/patients/${patientId}/assessments`)
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl ml-2">
            Upload de Questionário
          </CardTitle>
        </div>
        <CardDescription>
          Envie uma imagem do questionário DASS-21 preenchido para processamento
          OCR.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div
            className="grid place-items-center border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById("file-input").click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-80 object-contain rounded-lg"
                />
                <p className="text-sm text-center text-muted-foreground">
                  Clique para alterar a imagem
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileImage className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium">Clique para selecionar uma imagem</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Formatos aceitos: JPEG, PNG, GIF
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/patients/${patientId}/assessments`)
              }
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? (
                <>Processando...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
