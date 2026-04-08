import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileText, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, onClear, isLoading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false,
    disabled: isLoading
  });

  if (selectedFile) {
    return (
      <div className="relative p-6 border-2 border-primary/20 bg-primary/5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <FileText size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        {!isLoading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer p-12 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center",
        isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300">
        <FileUp size={32} />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">Arraste sua multa aqui</p>
        <p className="text-sm text-muted-foreground mt-1">PDF ou Imagem (Máx. 10MB)</p>
      </div>
      <div className="mt-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
        Selecionar arquivo
      </div>
    </div>
  );
};
