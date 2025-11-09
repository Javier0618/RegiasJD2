import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Sparkles, Clock, Save, X, DollarSign, Image as ImageIcon, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Uñas",
  "Cabello",
  "Facial",
  "Maquillaje",
  "Depilación",
  "Pestañas y Cejas",
  "Tratamientos",
  "Otros"
];

export default function ConfigurarServiciosPage() {
  const [editingService, setEditingService] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    duration_minutes: "",
    price: "",
    category: "",
    image_url: "",
    description: "",
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => base44.entities.Service.list("order"),
    initialData: [],
  });

  const createServiceMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      handleCloseDialog();
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      handleCloseDialog();
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const toggleActiveServiceMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.Service.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        duration_minutes: service.duration_minutes.toString(),
        price: service.price?.toString() || "",
        category: service.category || "",
        image_url: service.image_url || "",
        description: service.description || "",
        is_active: service.is_active
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        duration_minutes: "",
        price: "",
        category: "",
        image_url: "",
        description: "",
        is_active: true
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingService(null);
    setFormData({
      name: "",
      duration_minutes: "",
      price: "",
      category: "",
      image_url: "",
      description: "",
      is_active: true
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
    } catch (error) {
      alert("Error al subir la imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSave = {
      name: formData.name,
      duration_minutes: parseInt(formData.duration_minutes),
      price: parseFloat(formData.price),
      category: formData.category,
      image_url: formData.image_url,
      description: formData.description,
      is_active: formData.is_active,
      order: editingService?.order || services.length
    };

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: dataToSave });
    } else {
      createServiceMutation.mutate(dataToSave);
    }
  };

  const handleDelete = (service) => {
    if (confirm(`¿Estás segura de eliminar el servicio "${service.name}"?`)) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  const activeServices = services.filter(s => s.is_active);
  const inactiveServices = services.filter(s => !s.is_active);

  // Agrupar servicios por categoría
  const servicesByCategory = activeServices.reduce((acc, service) => {
    const category = service.category || "Sin Categoría";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-pink-500" />
                Configurar Servicios
              </h1>
              <p className="text-gray-600">
                Gestiona los servicios disponibles, precios y categorías
              </p>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Servicio
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-pink-700">{services.length}</div>
              <p className="text-sm text-pink-900 mt-1">Total Servicios</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-green-700">{activeServices.length}</div>
              <p className="text-sm text-green-900 mt-1">Activos</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-purple-700">{Object.keys(servicesByCategory).length}</div>
              <p className="text-sm text-purple-900 mt-1">Categorías</p>
            </CardContent>
          </Card>
        </div>

        {/* Services by Category */}
        <div className="space-y-6 mb-8">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <Card key={category} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-500" />
                  {category} ({categoryServices.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      className="border border-purple-200 rounded-lg overflow-hidden bg-gradient-to-br from-white to-purple-50 hover:shadow-md transition-shadow"
                    >
                      {service.image_url && (
                        <div className="w-full h-40 bg-gray-200 relative">
                          <img 
                            src={service.image_url} 
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                          <Switch
                            checked={service.is_active}
                            onCheckedChange={(checked) => 
                              toggleActiveServiceMutation.mutate({ 
                                id: service.id, 
                                is_active: checked 
                              })
                            }
                          />
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-pink-500" />
                            <span className="font-medium text-gray-700">
                              {service.duration_minutes} minutos
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-bold text-green-700 text-lg">
                              ${service.price?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>

                        {service.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {service.description}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(service)}
                            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(service)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inactive Services */}
        {inactiveServices.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                Servicios Inactivos ({inactiveServices.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {inactiveServices.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm text-gray-700">{service.name}</h3>
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={(checked) => 
                          toggleActiveServiceMutation.mutate({ 
                            id: service.id, 
                            is_active: checked 
                          })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(service)}
                        className="flex-1 text-xs"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(service)}
                        className="text-xs border-red-200 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {editingService ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              {editingService ? "Editar Servicio" : "Nuevo Servicio"}
            </DialogTitle>
            <DialogDescription>
              {editingService ? "Modifica los detalles del servicio" : "Agrega un nuevo servicio al catálogo"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Servicio *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Manicura"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    placeholder="Ej: 30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Precio ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ej: 25000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagen del Servicio</Label>
                <div className="flex gap-3 items-start">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="flex-1"
                  />
                  {uploadingImage && <span className="text-sm text-gray-500">Subiendo...</span>}
                </div>
                {formData.image_url && (
                  <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción breve del servicio..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="is_active" className="font-semibold">Servicio Activo</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Los servicios activos estarán disponibles para reservar
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createServiceMutation.isPending || updateServiceMutation.isPending || uploadingImage}
                className="bg-gradient-to-r from-pink-500 to-purple-500"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingService ? "Guardar Cambios" : "Crear Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
