import React, { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, AlertTriangle, Calendar, Clock, Scissors } from "lucide-react";

// Convertir hora de 24h a 12h para mostrar
const convertTo12Hour = (time24h) => {
  let [hours, minutes] = time24h.split(':');
  hours = parseInt(hours);
  
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
};

export default function CancelAppointmentModal({ appointment, onClose, onConfirm, isSubmitting }) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  const appointmentDate = new Date(appointment.appointment_date + "T12:00:00");

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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Cancelar Cita</h2>
          </div>
          
          <p className="text-red-100 text-sm">
            ¿Estás segura de que deseas cancelar esta cita?
          </p>
        </div>

        {/* Appointment Details */}
        <div className="p-6 bg-gray-50 border-b space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="font-medium">
              {format(appointmentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{convertTo12Hour(appointment.appointment_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Scissors className="w-4 h-4 text-gray-500" />
            <span>{appointment.service}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-gray-700 font-medium">
              Motivo de Cancelación *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Por favor indícanos el motivo de tu cancelación..."
              required
              className="border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              Tu motivo nos ayuda a mejorar nuestro servicio
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              No, Mantener Cita
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              {isSubmitting ? "Cancelando..." : "Sí, Cancelar"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}