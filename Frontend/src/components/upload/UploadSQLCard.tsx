import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Database, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/clerk-react";
import { uploadSqlFile } from "@/lib/api";

interface UploadSQLCardProps {
  onSessionCreated: (sessionId: string) => void;
}

type IngestStep =
  | "idle"
  | "parsing"
  | "creating"
  | "extracting"
  | "sampling"
  | "indexing"
  | "done";

const UploadSQLCard = ({ onSessionCreated }: UploadSQLCardProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [ingestStep, setIngestStep] = useState<IngestStep>("idle");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { getToken } = useAuth();

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const sqlFile = acceptedFiles[0];
    if (sqlFile) {
      setFile(sqlFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/sql": [".sql"] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file || isUploading) return;

    try {
      setIsUploading(true);
      setIngestStep("parsing");
      setProgress(15);

      const uploadPromise = uploadSqlFile(getToken, file, { name: file.name });

      await sleep(300);
      setIngestStep("creating");
      setProgress(35);

      await sleep(300);
      setIngestStep("extracting");
      setProgress(60);

      const response = await uploadPromise;

      setIngestStep("sampling");
      setProgress(75);
      await sleep(200);

      setIngestStep("indexing");
      setProgress(85);
      await sleep(200);

      setIngestStep("done");
      setProgress(100);

      toast({
        title: "Upload successful",
        description:
          response.message ??
          "Your database schema has been indexed successfully.",
      });

      setFile(null);
      onSessionCreated(response.sessionId);
    } catch (error) {
      console.error("Upload failed", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while indexing your schema.",
        variant: "destructive",
      });
      setIngestStep("idle");
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUseSample = () => {
    toast({
      title: "Sample dataset",
      description: "A preloaded sample workspace will be available soon.",
    });
  };

  const stepLabels: Record<IngestStep, string> = {
    idle: "Ready to upload",
    parsing: "Parsing SQL...",
    creating: "Creating DB...",
    extracting: "Extracting schema...",
    sampling: "Sampling rows...",
    indexing: "Indexing schema...",
    done: "Done — viewing schema",
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          Upload your .sql schema file
        </CardTitle>
        <CardDescription>
          Upload a SQL file with DDL and INSERT statements, or start with a
          sample database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {ingestStep === "idle" ? (
          <>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                transition-colors duration-200
                ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragActive
                      ? "Drop your SQL file here"
                      : "Drag & drop your SQL file here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 animate-fade-in-up animation-delay-200">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleUpload}
                disabled={!file || isUploading}
              >
                Upload & Index
              </Button>
              <span className="text-sm text-muted-foreground">or</span>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleUseSample}
                disabled={isUploading}
              >
                Use sample DB
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6 py-8">
            <div className="flex items-center justify-center gap-3">
              {ingestStep === "done" ? (
                <CheckCircle2 className="h-8 w-8 text-primary animate-in zoom-in duration-300" />
              ) : (
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              )}
              <span className="text-lg font-medium">
                {stepLabels[ingestStep]}
              </span>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div
                className={
                  ingestStep === "parsing" || ingestStep === "done"
                    ? "text-primary font-medium"
                    : ""
                }
              >
                1. Parsing SQL
              </div>
              <div
                className={
                  ingestStep === "creating" || ingestStep === "done"
                    ? "text-primary font-medium"
                    : ""
                }
              >
                2. Creating DB
              </div>
              <div
                className={
                  ingestStep === "extracting" || ingestStep === "done"
                    ? "text-primary font-medium"
                    : ""
                }
              >
                3. Extracting schema
              </div>
              <div
                className={
                  ingestStep === "sampling" || ingestStep === "done"
                    ? "text-primary font-medium"
                    : ""
                }
              >
                4. Sampling rows
              </div>
              <div
                className={
                  ingestStep === "indexing" || ingestStep === "done"
                    ? "text-primary font-medium"
                    : ""
                }
              >
                5. Generating embeddings
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadSQLCard;
