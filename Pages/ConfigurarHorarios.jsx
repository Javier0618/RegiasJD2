import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" }
];

const SUGGESTED_TIMES = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM"
];

const SERVICES = [
  "Manicura",
  "Pedicura",
  "Manicura y Pedicura",
  "Uñas Acrílicas",
  "Uñas en Gel",
  "Peinado",
  "Aplanchado",
  "Brushing",
  "Tinte de Cabello",
  "Mechas",
  "Balayage",
  "Tratamiento Capilar",
  "Corte de Cabello",
  "Maquillaje",
  "Depilación",
  "Pestañas",
  "Cejas",
  "Facial",
  "Otro"
];

// Convertir hora de 12h a 24h para guardar en BD
const convertTo24Hour = (time12h) => {
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

// Convertir hora de 24h a 12h para mostrar
const convertTo12Hour = (time24h) => {
  let [hours, minutes] = time24h.split(':');
  hours = parseInt(hours);
  
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
};

export default function ConfigurarHorariosPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTime, setNewTime] = useState("");
  const [applyToAllWeeks, setApplyToAllWeeks] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [allServices, setAllServices] = useState(true);
  const queryClient = useQueryClient();

  const { data: slots, isLoading } = useQuery({
    queryKey: ["availableSlots"],
    queryFn: () => base44.entities.AvailableSlot.list(),
    initialData: [],
  });

  const createSlotMutation = useMutation({
    mutationFn: (data) => base44.entities.AvailableSlot.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      setNewTime("");
      setSelectedServices([]);
      setAllServices(true);
      setApplyToAllWeeks(false);
    },
  });

  const toggleSlotMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.AvailableSlot.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (id) => base44.entities.AvailableSlot.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
    },
  });

  const handleAddSlot = () => {
    if (!newTime || !selectedDate) {
      alert("Por favor selecciona una fecha y hora");
      return;
    }
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();

    if (applyToAllWeeks) {
      const exists = slots.some(
        s => s.day_of_week === dayOfWeek && s.time_slot === newTime && !s.specific_date
      );
      
      if (exists) {
        alert("Este horario recurrente ya existe");
        return;
      }

      createSlotMutation.mutate({
        day_of_week: dayOfWeek,
        time_slot: newTime,
        is_active: true,
        available_services: allServices ? [] : selectedServices
      });
    } else {
      const exists = slots.some(
        s => s.specific_date === dateStr && s.time_slot === newTime
      );
      
      if (exists) {
        alert("Este horario ya existe para esta fecha");
        return;
      }

      createSlotMutation.mutate({
        specific_date: dateStr,
        time_slot: newTime,
        is_active: true,
        available_services: allServices ? [] : selectedServices
      });
    }
  };

  return <></>;
}
