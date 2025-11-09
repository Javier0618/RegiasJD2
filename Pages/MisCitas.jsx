
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Scissors, Sparkles, XCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import CancelAppointmentModal from "../components/booking/CancelAppointmentModal";
import { Alert, AlertDescription } from "@/components/ui/alert";

const STATUS_CONFIG = {
  pendiente: { 
    label: "Pendiente", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: "⏳"
  },
  confirmada: { 
    label: "Confirmada", 
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "✓"
  },
  completada: { 
    label: "Completada", 
    color: "bg-green-100 text-green-800 border-green-300",
    icon: "✓"
  },
  cancelada: { 
    label: "Cancelada", 
    color: "bg-red-100 text-red-800 border-red-300",
    icon: "✗"
  }
};

// Convertir hora de 24h a 12h para mostrar
const convertTo12Hour = (time24h) => {
  let [hours, minutes] = time24h.split(':');
  hours = parseInt(hours);
  
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
};

export default function MisCitasPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cancelingAppointment, setCancelingAppointment] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["myAppointments", currentUser?.email],
    queryFn: () => base44.entities.Appointment.filter(
      { created_by: currentUser.email },
      "-appointment_date"
    ),
    initialData: [],
    enabled: !!currentUser,
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async ({ appointment, reason }) => {
      // Actualizar el estado de la cita a cancelada
      await base44.entities.Appointment.update(appointment.id, { 
        status: "cancelada",
        notes: appointment.notes ? `${appointment.notes}\n\nMotivo de cancelación: ${reason}` : `Motivo de cancelación: ${reason}`
      });
      
      // Enviar notificación a Telegram
      try {
        const appointmentDateObj = new Date(appointment.appointment_date + "T12:00:00");
        const message = `❌ *Cita Cancelada*\n\n👤 *Cliente:* ${appointment.client_name}\n📱 *Celular:* ${appointment.phone}\n💅 *Servicio:* ${Array.isArray(appointment.services) ? appointment.services.join(', ') : appointment.service}\n📅 *Fecha:* ${format(appointmentDateObj, "dd/MM/yyyy", { locale: es })}\n⏰ *Hora:* ${appointment.appointment_time}\n\n📝 *Motivo:* ${reason}`;
        
        const telegramUrl = `https://api.telegram.org/bot8399842732:AAHV73JByOgm35CTJhkLHgpTZjG1NnbwgqQ/sendMessage`;
        
        await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "695002182",
            text: message,
            parse_mode: "Markdown"
          })
        });
      } catch (error) {
        console.log("No se pudo enviar notificación a Telegram:", error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      setCancelingAppointment(null);
    },
  });

  const getCancelReason = (notes) => {
    if (!notes) return null;
    
    // Buscar "Cancelada por administrador. Motivo:"
    const adminCancelMatch = notes.match(/Cancelada por administrador\.\s*Motivo:\s*(.+?)(?:\n|$)/);
    if (adminCancelMatch) {
      return adminCancelMatch[1].trim();
    }
    
    // Buscar "Motivo de cancelación:" (cancelación por cliente)
    const clientCancelMatch = notes.match(/Motivo de cancelación:\s*(.+?)(?:\n|$)/);
    if (clientCancelMatch) {
      return null; // No mostrar motivo de cancelación del cliente
    }
    
    return null;
  };

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date + "T12:00:00");
    return aptDate >= new Date() && apt.status !== "cancelada";
  });

  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date + "T12:00:00");
    return aptDate < new Date() || apt.status === "cancelada";
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-3"
          >
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Mis Citas</h1>
          </motion.div>
          <p className="text-xl text-pink-100">
            Hola, {currentUser.full_name || currentUser.email}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{appointments.length}</div>
              <p className="text-sm text-gray-600 mt-1">Total Citas</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-800">
                {appointments.filter(a => a.status === "pendiente").length}
              </div>
              <p className="text-sm text-yellow-900 mt-1">Pendientes</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-800">
                {appointments.filter(a => a.status === "confirmada").length}
              </div>
              <p className="text-sm text-blue-900 mt-1">Confirmadas</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-800">
                {appointments.filter(a => a.status === "completada").length}
              </div>
              <p className="text-sm text-green-900 mt-1">Completadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-5 h-5 text-pink-500" />
              Próximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No tienes citas próximas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => {
                  const appointmentDate = new Date(appointment.appointment_date + "T12:00:00");
                  const cancelReason = getCancelReason(appointment.notes);
                  const services = appointment.services || (appointment.service ? [appointment.service] : []);
                  
                  return (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-pink-200 rounded-xl p-5 bg-gradient-to-br from-white to-pink-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-pink-500" />
                            <span className="font-semibold text-lg">
                              {format(appointmentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{convertTo12Hour(appointment.appointment_time)}</span>
                            </div>
                            {appointment.total_duration_minutes && (
                              <Badge variant="outline" className="bg-blue-50">
                                {appointment.total_duration_minutes} min
                              </Badge>
                            )}
                            {appointment.total_price && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                ${appointment.total_price.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Scissors className="w-4 h-4 text-purple-500" />
                              <span className="font-medium">Servicios:</span>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-6">
                              {services.map((service, idx) => (
                                <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {appointment.notes && !appointment.notes.includes("Motivo de cancelación") && !appointment.notes.includes("Cancelada por administrador") && (
                            <p className="text-sm text-gray-500 mt-2">
                              {appointment.notes}
                            </p>
                          )}
                          {cancelReason && (
                            <Alert variant="destructive" className="mt-3">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <span className="font-semibold">Motivo de cancelación:</span> {cancelReason}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant="outline" className={`${STATUS_CONFIG[appointment.status]?.color} text-sm px-4 py-2 border`}>
                            {STATUS_CONFIG[appointment.status]?.icon} {STATUS_CONFIG[appointment.status]?.label}
                          </Badge>
                          {appointment.status !== "cancelada" && appointment.status !== "completada" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCancelingAppointment(appointment)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancelar Cita
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="w-5 h-5 text-gray-500" />
                Historial de Citas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {pastAppointments.map((appointment) => {
                  const appointmentDate = new Date(appointment.appointment_date + "T12:00:00");
                  const cancelReason = getCancelReason(appointment.notes);
                  const services = appointment.services || (appointment.service ? [appointment.service] : []);
                  
                  return (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 text-sm flex-wrap">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="font-medium">
                              {format(appointmentDate, "dd/MM/yyyy", { locale: es })}
                            </span>
                            <Clock className="w-3 h-3 text-gray-400 ml-2" />
                            <span>{convertTo12Hour(appointment.appointment_time)}</span>
                            {appointment.total_price && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                ${appointment.total_price.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 text-sm text-gray-600 items-center">
                            <Scissors className="w-3 h-3 text-purple-400" />
                            {services.map((service, idx) => (
                              <span key={idx}>
                                {service}{idx < services.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                          {cancelReason && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                <span className="font-semibold">Motivo de cancelación:</span> {cancelReason}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        <Badge variant="outline" className={`${STATUS_CONFIG[appointment.status]?.color} text-xs px-3 py-1 border`}>
                          {STATUS_CONFIG[appointment.status]?.icon} {STATUS_CONFIG[appointment.status]?.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Appointment Modal */}
      <AnimatePresence>
        {cancelingAppointment && (
          <CancelAppointmentModal
            appointment={cancelingAppointment}
            onClose={() => setCancelingAppointment(null)}
            onConfirm={(reason) => cancelAppointmentMutation.mutate({ 
              appointment: cancelingAppointment, 
              reason 
            })}
            isSubmitting={cancelAppointmentMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
