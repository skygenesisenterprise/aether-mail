import React, { useState, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  X,
  Crop,
  RotateCw,
  Palette,
  Maximize2,
  Download,
  Trash2,
  Image as ImageIcon,
  FileImage,
  Star,
  Check,
  AlertCircle,
  Zap,
  Sparkles,
  Sliders,
  Eye,
  EyeOff,
} from "lucide-react";

interface ProfilePhoto {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  isPrimary?: boolean;
}

interface PhotoFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
}

interface ProfilePhotoManagerProps {
  currentPhoto?: string;
  onPhotoUpdate: (photoUrl: string) => void;
  onPhotoDelete: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ProfilePhotoManager({
  currentPhoto,
  onPhotoUpdate,
  onPhotoDelete,
  isOpen = false,
  onClose,
}: ProfilePhotoManagerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "gallery" | "edit">(
    "upload",
  );
  const [photoHistory, setPhotoHistory] = useState<ProfilePhoto[]>([]);
  const [filters, setFilters] = useState<PhotoFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: false,
    sepia: false,
  });
  const [cropMode, setCropMode] = useState(false);
  const [editedImage, setEditedImage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Simuler l'historique des photos de profil
  React.useEffect(() => {
    const mockHistory: ProfilePhoto[] = [
      {
        id: "1",
        url: currentPhoto || "",
        name: "Photo actuelle",
        size: 245760,
        type: "image/jpeg",
        uploadedAt: new Date().toISOString(),
        isPrimary: true,
      },
      {
        id: "2",
        url: "https://picsum.photos/200/200?random=1",
        name: "Photo professionnelle",
        size: 180456,
        type: "image/jpeg",
        uploadedAt: "2024-03-15T10:30:00Z",
      },
      {
        id: "3",
        url: "https://picsum.photos/200/200?random=2",
        name: "Photo de voyage",
        size: 324567,
        type: "image/png",
        uploadedAt: "2024-01-20T14:22:00Z",
      },
    ];
    setPhotoHistory(mockHistory);
  }, [currentPhoto]);

  // Gérer le drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Gérer la sélection de fichier
  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setEditedImage(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Gérer le clic sur l'input
  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Gérer le changement de fichier
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  // Appliquer les filtres
  const applyFilters = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Appliquer les filtres CSS
    let filterString = "";
    if (filters.grayscale) filterString += "grayscale(100%) ";
    if (filters.sepia) filterString += "sepia(100%) ";
    if (filters.brightness !== 100)
      filterString += `brightness(${filters.brightness}%) `;
    if (filters.contrast !== 100)
      filterString += `contrast(${filters.contrast}%) `;
    if (filters.saturation !== 100)
      filterString += `saturate(${filters.saturation}%) `;
    if (filters.blur > 0) filterString += `blur(${filters.blur}px) `;

    ctx.filter = filterString.trim();
    ctx.drawImage(img, 0, 0);

    const filteredImageUrl = canvas.toDataURL("image/jpeg", 0.9);
    setEditedImage(filteredImageUrl);
  }, [filters]);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: false,
      sepia: false,
    });
  }, []);

  // Télécharger l'image éditée
  const downloadImage = useCallback(() => {
    if (editedImage) {
      const link = document.createElement("a");
      link.download = "profile-photo-edited.jpg";
      link.href = editedImage;
      link.click();
    }
  }, [editedImage]);

  // Supprimer la photo actuelle
  const deletePhoto = useCallback(() => {
    onPhotoDelete?.();
    onClose?.();
  }, [onPhotoDelete, onClose]);

  // Sauvegarder la nouvelle photo
  const savePhoto = useCallback(async () => {
    if (!editedImage) return;

    setIsProcessing(true);

    try {
      // Simuler l'upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onPhotoUpdate?.(editedImage);
      onClose?.();
    } catch (error) {
      console.error("Error saving photo:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [editedImage, onPhotoUpdate, onClose]);

  // Sélectionner une photo de la galerie
  const selectFromGallery = useCallback((photo: ProfilePhoto) => {
    setEditedImage(photo.url);
    setActiveTab("edit");
  }, []);

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card w-full max-w-4xl h-[90vh] max-h-[800px] rounded-xl shadow-2xl flex overflow-hidden">
        {/* Sidebar de navigation */}
        <div className="w-80 bg-muted/30 border-r border-border flex flex-col">
          {/* En-tête */}
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">
              Gestion de la photo
            </h2>
            <p className="text-sm text-muted-foreground">
              Personnalisez votre profil avec une photo professionnelle
            </p>
          </div>

          {/* Navigation des tabs */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {[
                {
                  id: "upload",
                  name: "Télécharger",
                  icon: <Upload size={18} />,
                },
                {
                  id: "gallery",
                  name: "Galerie",
                  icon: <FileImage size={18} />,
                },
                { id: "edit", name: "Éditer", icon: <Sliders size={18} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Actions rapides */}
          <div className="p-4 border-t border-border space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted hover:text-card-foreground rounded-lg transition-colors">
              <Camera size={18} />
              <span className="font-medium">Prendre une photo</span>
            </button>
            <button
              onClick={deletePhoto}
              className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/20 hover:text-destructive-foreground rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              <span className="font-medium">Supprimer la photo</span>
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* En-tête du contenu */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
            <h1 className="text-xl font-semibold text-card-foreground">
              {activeTab === "upload" && "Télécharger une photo"}
              {activeTab === "gallery" && "Galerie de photos"}
              {activeTab === "edit" && "Éditer la photo"}
            </h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Tab Télécharger */}
            {activeTab === "upload" && (
              <div className="space-y-6">
                {/* Zone de drag & drop */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 rounded-lg object-cover mx-auto shadow-lg"
                      />
                      <div className="text-sm text-muted-foreground">
                        {selectedFile?.name}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload
                        size={48}
                        className="text-muted-foreground mx-auto mb-4"
                      />
                      <div>
                        <p className="text-lg font-medium text-card-foreground mb-2">
                          Glissez-déposez une image
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">ou</p>
                        <button
                          onClick={handleFileInputClick}
                          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                        >
                          <ImageIcon size={20} className="mr-2" />
                          Parcourir vos fichiers
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations sur le fichier */}
                {selectedFile && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-card-foreground mb-3">
                      Informations sur le fichier
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nom:</span>
                        <span className="text-card-foreground font-medium ml-2">
                          {selectedFile.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Taille:</span>
                        <span className="text-card-foreground font-medium ml-2">
                          {formatFileSize(selectedFile.size)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="text-card-foreground font-medium ml-2">
                          {selectedFile.type}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab Galerie */}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoHistory.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => selectFromGallery(photo)}
                      className="group relative cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-200"
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-32 object-cover"
                      />

                      {/* Overlay avec informations */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <div className="text-sm font-medium truncate">
                            {photo.name}
                          </div>
                          <div className="text-xs opacity-80">
                            {formatFileSize(photo.size)} •{" "}
                            {formatDate(photo.uploadedAt)}
                          </div>
                        </div>

                        {photo.isPrimary && (
                          <div className="absolute top-3 right-3">
                            <Star
                              size={16}
                              className="text-yellow-400 fill-yellow-400"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Éditer */}
            {activeTab === "edit" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Zone d'édition */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-card-foreground mb-4">
                      Édition de l'image
                    </h3>

                    {/* Contrôles de base */}
                    <div className="flex justify-center mb-4 space-x-2">
                      <button
                        onClick={() => setCropMode(!cropMode)}
                        className={`p-3 rounded-lg transition-colors ${
                          cropMode
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-card-foreground"
                        }`}
                      >
                        <Crop size={20} />
                      </button>
                      <button className="p-3 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors">
                        <RotateCw size={20} />
                      </button>
                      <button className="p-3 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors">
                        <Maximize2 size={20} />
                      </button>
                    </div>

                    {/* Canvas pour l'édition */}
                    <div className="relative bg-muted/30 rounded-lg p-4">
                      <img
                        ref={imageRef}
                        src={editedImage || currentPhoto || ""}
                        alt="Edit"
                        className="w-full max-h-96 object-contain hidden"
                        onLoad={applyFilters}
                      />
                      <canvas
                        ref={canvasRef}
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                  </div>

                  {/* Filtres et ajustements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-card-foreground mb-4">
                      Filtres et ajustements
                    </h3>

                    {/* Filtres rapides */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      <button
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            grayscale: !prev.grayscale,
                          }))
                        }
                        className={`p-3 rounded-lg transition-colors ${
                          filters.grayscale
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-card-foreground"
                        }`}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 rounded"></div>
                      </button>
                      <button
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            sepia: !prev.sepia,
                          }))
                        }
                        className={`p-3 rounded-lg transition-colors ${
                          filters.sepia
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-card-foreground"
                        }`}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-yellow-600 to-orange-400 rounded"></div>
                      </button>
                    </div>

                    {/* Ajustements fins */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Luminosité: {filters.brightness}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={filters.brightness}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              brightness: parseInt(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Contraste: {filters.contrast}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={filters.contrast}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              contrast: parseInt(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Saturation: {filters.saturation}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={filters.saturation}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              saturation: parseInt(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Flou: {filters.blur}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={filters.blur}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              blur: parseInt(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Actions des filtres */}
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={resetFilters}
                        className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors"
                      >
                        Réinitialiser
                      </button>
                      <button
                        onClick={downloadImage}
                        className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                      >
                        <Download size={16} className="mr-2" />
                        Télécharger
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barre d'actions inférieure */}
          <div className="p-4 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {activeTab === "upload" &&
                  "Formats supportés: JPG, PNG, GIF, WebP (max 10MB)"}
                {activeTab === "gallery" &&
                  `${photoHistory.length} photos dans votre galerie`}
                {activeTab === "edit" &&
                  "Éditez votre photo avec des filtres professionnels"}
              </div>

              <div className="flex gap-2">
                {activeTab === "edit" && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors"
                  >
                    <EyeOff size={16} className="mr-2" />
                    Masquer l'original
                  </button>
                )}

                <button
                  onClick={savePhoto}
                  disabled={isProcessing || !editedImage}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Appliquer la photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
