import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, startOfWeek, getDay, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

import DaySelector from "../components/booking/DaySelector";
import TimeSlotSelector from "../components/booking/TimeSlotSelector";
import BookingModal from "../components/booking/BookingModal";

export default function AgendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const queryClient = useQueryClient();

  const { data: appointments, isLoading: loadingAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => base44.entities.Appointment.list("-appointment_date"),
    initialData: [],
  });

  const { data: availableSlots, isLoading: loadingSlots } = useQuery({
    queryKey: ["availableSlots"],
    queryFn: () => base44.entities.AvailableSlot.filter({ is_active: true }),
    initialData: [],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData) => {
      const appointment = await base44.entities.Appointment.create(appointmentData);
      
      try {
        const appointmentDateObj = new Date(appointmentData.appointment_date + "T12:00:00");
        const servicesText = appointmentData.services.join(", ");
        const message = `🌸 *Nueva Cita Agendada*\n\n👤 *Cliente:* ${appointmentData.client_name}\n📱 *Celular:* ${appointmentData.phone}\n💅 *Servicios:* ${servicesText}\n⏱️ *Duración Total:* ${appointmentData.total_duration_minutes} minutos\n💰 *Total:* $${appointmentData.total_price?.toLocaleString() || 0}\n📅 *Fecha:* ${format(appointmentDateObj, "dd/MM/yyyy", { locale: es })}\n⏰ *Hora:* ${appointmentData.appointment_time}`;
        
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
      
      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowBookingModal(false);
      setSelectedTime(null);
      setAvailableServices([]);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000);
    },
  });

  const handleTimeSlotClick = (time, services = []) => {
    setSelectedTime(time);
    setAvailableServices(services);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (bookingData) => {
    createAppointmentMutation.mutate({
      ...bookingData,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      appointment_time: selectedTime,
      status: "pendiente"
    });
  };

  const getDayOfWeekNumber = (date) => {
    const day = getDay(date);
    return day === 0 ? 7 : day;
  };

  const hasAvailability = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayNumber = getDayOfWeekNumber(date);
    
    const specificSlots = availableSlots.filter(
      slot => slot.specific_date === dateStr && slot.is_active
    );
    
    if (specificSlots.length > 0) {
      return specificSlots.some(slot => {
        const isBooked = appointments.some(apt => {
          const aptDateStr = apt.appointment_date.split('T')[0];
          return aptDateStr === dateStr &&
                 apt.appointment_time === slot.time_slot &&
                 apt.status !== "cancelada";
        });
        return !isBooked;
      });
    }
    
    const recurringSlots = availableSlots.filter(
      slot => slot.day_of_week === dayNumber && slot.is_active && !slot.specific_date
    );
    
    if (recurringSlots.length > 0) {
      return recurringSlots.some(slot => {
        const isBooked = appointments.some(apt => {
          const aptDateStr = apt.appointment_date.split('T')[0];
          return aptDateStr === dateStr &&
                 apt.appointment_time === slot.time_slot &&
                 apt.status !== "cancelada";
        });
        return !isBooked;
      });
    }
    
    return false;
  };

  const getCurrentWeekDays = () => {
    const today = new Date();
    const start = addDays(startOfWeek(today, { weekStartsOn: 1 }), weekOffset * 7);
    const allDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    return allDays.filter(day => hasAvailability(day));
  };

  const weekDays = getCurrentWeekDays();

  React.useEffect(() => {
    if (weekDays.length > 0 && !weekDays.some(day => isSameDay(day, selectedDate))) {
      setSelectedDate(weekDays[0]);
    }
  }, [weekDays, selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 md:gap-3 mb-3"
          >
            <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">RegiasJD</h1>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
          </motion.div>
          <p className="text-base md:text-xl text-pink-100 max-w-2xl mx-auto">
            Agenda tu cita de belleza de manera fácil y rápida
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="rounded-full hover:bg-pink-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            {weekDays.length > 0 ? (
              <p className="text-xs md:text-sm text-gray-500">
                {format(weekDays[0], "dd MMM", { locale: es })} - {format(weekDays[weekDays.length - 1], "dd MMM yyyy", { locale: es })}
              </p>
            ) : (
              <p className="text-xs md:text-sm text-gray-500">
                No hay disponibilidad esta semana
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="rounded-full hover:bg-pink-100"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {weekDays.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No hay fechas disponibles esta semana</p>
            <p className="text-sm text-gray-400 mt-2">Intenta navegar a la siguiente semana</p>
          </div>
        ) : (
          <>
            <DaySelector
              days={weekDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            <TimeSlotSelector
              selectedDate={selectedDate}
              appointments={appointments}
              availableSlots={availableSlots}
              onTimeSlotClick={handleTimeSlotClick}
              isLoading={loadingAppointments || loadingSlots}
            />
          </>
        )}
      </div>

      <AnimatePresence>
        {showBookingModal && (
          <BookingModal
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableServices={availableServices}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedTime(null);
              setAvailableServices([]);
            }}
            onSubmit={handleBookingSubmit}
            isSubmitting={createAppointmentMutation.isPending}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-4"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 md:px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-base md:text-lg">¡Cita Agendada!</p>
                <p className="text-xs md:text-sm text-green-100">Te esperamos en RegiasJD</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
