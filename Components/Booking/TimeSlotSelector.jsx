import React from "react";
import { format, isSameDay, getDay, parse } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Convertir hora de 24h a 12h para mostrar
const convertTo12Hour = (time24h) => {
  let [hours, minutes] = time24h.split(':');
  hours = parseInt(hours);
  
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
};

export default function TimeSlotSelector({ 
  selectedDate, 
  appointments, 
  availableSlots, 
  onTimeSlotClick, 
  isLoading 
}) {
  console.log("TimeSlotSelector - Appointments:", appointments);
  console.log("TimeSlotSelector - Selected Date:", selectedDate);
  console.log("TimeSlotSelector - Available Slots:", availableSlots);

  // Convertir día de la semana de date-fns (0=Domingo) a nuestro formato (1=Lunes)
  const getDayOfWeekNumber = (date) => {
    const day = getDay(date);
    return day === 0 ? 7 : day;
  };

  // Obtener slots disponibles para la fecha seleccionada
  const getAvailableTimeSlotsForDate = (date) => {
    const dayNumber = getDayOfWeekNumber(date);
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Primero buscar slots específicos para esta fecha
    const specificSlots = availableSlots.filter(
      slot => slot.specific_date === dateStr && slot.is_active
    );
    
    // Si hay slots específicos, usar solo esos
    if (specificSlots.length > 0) {
      return specificSlots.map(slot => ({
        time: slot.time_slot,
        services: slot.available_services || []
      })).sort((a, b) => a.time.localeCompare(b.time));
    }
    
    // Si no, usar slots recurrentes del día de la semana
    return availableSlots
      .filter(slot => slot.day_of_week === dayNumber && slot.is_active && !slot.specific_date)
      .map(slot => ({
        time: slot.time_slot,
        services: slot.available_services || []
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const isSlotBooked = (date, time) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    const booked = appointments.some((apt) => {
      const aptDateStr = apt.appointment_date.split('T')[0]; // Manejar formatos con hora
      const isMatch = aptDateStr === dateStr && 
                     apt.appointment_time === time && 
                     apt.status !== "cancelada";
      
      if (isMatch) {
        console.log("Slot RESERVADO encontrado:", {
          fecha: dateStr,
          hora: time,
          cita: apt
        });
      }
      
      return isMatch;
    });
    
    return booked;
  };

  const isPast = (date, time) => {
    const now = new Date();
    const slotDate = new Date(date);
    const [hours, minutes] = time.split(":");
    slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return slotDate < now;
  };

  const timeSlots = getAvailableTimeSlotsForDate(selectedDate);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-6">
        <Clock className="w-5 h-5 text-pink-500" />
        Horarios para {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
      </h2>

      {timeSlots.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No hay horarios disponibles para este día</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {timeSlots.map((slot) => {
            const booked = isSlotBooked(selectedDate, slot.time);
            const past = isPast(selectedDate, slot.time);
            const disabled = booked || past;
            const hasLimitedServices = slot.services.length > 0;

            console.log(`Slot ${slot.time}:`, { booked, past, disabled });

            return (
              <motion.button
                key={slot.time}
                whileHover={!disabled ? { scale: 1.05 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                onClick={() => !disabled && onTimeSlotClick(slot.time, slot.services)}
                disabled={disabled}
                className={`
                  relative p-4 rounded-xl text-lg font-semibold transition-all duration-200
                  ${disabled
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-75"
                    : "bg-gradient-to-br from-pink-50 to-purple-50 text-gray-800 hover:from-pink-100 hover:to-purple-100 border border-pink-200"
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <span className={disabled ? "line-through" : ""}>{convertTo12Hour(slot.time)}</span>
                  {booked && (
                    <span className="text-xs text-red-600 font-bold mt-1">RESERVADO</span>
                  )}
                  {past && !booked && (
                    <span className="text-xs text-gray-500 mt-1">Pasado</span>
                  )}
                  {!disabled && !booked && hasLimitedServices && (
                    <span className="text-xs text-purple-600 mt-1">
                      {slot.services.length} servicios
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
