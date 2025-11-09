import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Calendar, Clock, Sparkles, DollarSign } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

// Convertir hora de 24h a 12h para mostrar
const convertTo12Hour = (time24h) => {
  let [hours, minutes] = time24h.split(':');
  hours = parseInt(hours);
  
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
};

export default function BookingModal({ 
  selectedDate, 
  selectedTime, 
  availableServices = [], 
  onClose, 
  onSubmit, 
  isSubmitting 
}) {
  const [formData, setFormData] = useState({
    client_name: "",
    phone: "",
    selectedServices: [],
    notes: ""
  });

  const { data: allServices, isLoading: loadingServices } = useQuery({
    queryKey: ["services"],
    queryFn: () => base44.entities.Service.filter({ is_active: true }, "order"),
    initialData: [],
  });

  // Filtrar servicios según disponibilidad del slot
  const servicesToShow = availableServices.length > 0 
    ? allServices.filter(s => availableServices.includes(s.name))
    : allServices;

  // Agrupar por categoría
  const servicesByCategory = servicesToShow.reduce((acc, service) => {
    const category = service.category || "Sin Categoría";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  const getTotalDuration = () => {
    return formData.selectedServices.reduce((total, serviceName) => {
      const service = allServices.find(s => s.name === serviceName);
      return total + (service?.duration_minutes || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return formData.selectedServices.reduce((total, serviceName) => {
      const service = allServices.find(s => s.name === serviceName);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.client_name && formData.phone && formData.selectedServices.length > 0) {
      onSubmit({
        client_name: formData.client_name,
        phone: formData.phone,
        services: formData.selectedServices,
        total_duration_minutes: getTotalDuration(),
        total_price: getTotalPrice(),
        notes: formData.notes
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceName) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceName)
        ? prev.selectedServices.filter(s => s !== serviceName)
        : [...prev.selectedServices, serviceName]
    }));
  };

  const totalDuration = getTotalDuration();
  const totalPrice = getTotalPrice();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Agendar Cita</h2>
          </div>
          
          <div className="flex items-center gap-4 text-pink-100 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: es })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {convertTo12Hour(selectedTime)}
            </div>
            {totalDuration > 0 && (
              <Badge className="bg-white/20 text-white border-white/30">
                {totalDuration} min
              </Badge>
            )}
            {totalPrice > 0 && (
              <Badge className="bg-green-500/80 text-white border-white/30">
                ${totalPrice.toLocaleString()}
              </Badge>
            )}
          </div>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name" className="text-gray-700 font-medium">
                  Nombre Completo *
                </Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleChange("client_name", e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                  className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Número de Celular *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Ej: 3001234567"
                  required
                  className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 font-medium">
                  Servicios * (Selecciona uno o más)
                </Label>
                {formData.selectedServices.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {formData.selectedServices.length} seleccionado(s)
                  </Badge>
                )}
              </div>
              
              {availableServices.length > 0 && (
                <p className="text-xs text-purple-600">
                  Este horario solo está disponible para ciertos servicios
                </p>
              )}

              {loadingServices ? (
                <p className="text-sm text-gray-500">Cargando servicios...</p>
              ) : servicesToShow.length === 0 ? (
                <p className="text-sm text-gray-500">No hay servicios disponibles</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                  {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-sm text-purple-700 mb-2 flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-500 rounded"></div>
                        {category}
                      </h3>
                      <div className="space-y-2 ml-3">
                        {categoryServices.map((service) => (
                          <div
                            key={service.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                              formData.selectedServices.includes(service.name)
                                ? "bg-pink-50 border-pink-300 shadow-sm"
                                : "bg-white border-gray-200 hover:border-pink-200"
                            }`}
                            onClick={() => handleServiceToggle(service.name)}
                          >
                            <Checkbox
                              id={service.id}
                              checked={formData.selectedServices.includes(service.name)}
                              onCheckedChange={() => handleServiceToggle(service.name)}
                              className="mt-1"
                            />
                            <div className="flex-1 grid md:grid-cols-[1fr,auto] gap-3">
                              <div>
                                <Label 
                                  htmlFor={service.id} 
                                  className="cursor-pointer font-medium text-gray-900"
                                >
                                  {service.name}
                                </Label>
                                {service.description && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-pink-500" />
                                  <span className="text-sm text-gray-600 font-medium">
                                    {service.duration_minutes} min
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="text-lg font-bold text-green-700">
                                    ${service.price?.toLocaleString() || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.selectedServices.length === 0 && !loadingServices && (
                <p className="text-xs text-red-600">
                  Por favor selecciona al menos un servicio
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700 font-medium">
                Notas Adicionales (Opcional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Alguna preferencia o detalle adicional..."
                className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-purple-50 border-t flex-shrink-0">
            {formData.selectedServices.length > 0 && (
              <div className="mb-4 p-4 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Duración Total</p>
                    <p className="text-lg font-bold text-gray-900">{totalDuration} minutos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total a Pagar</p>
                    <p className="text-2xl font-bold text-green-600">${totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || formData.selectedServices.length === 0}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                {isSubmitting ? "Agendando..." : "Confirmar Cita"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}