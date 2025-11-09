import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Phone, Scissors, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_CONFIG = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  confirmada: { label: "Confirmada", color: "bg-blue-100 text-blue-800 border-blue-300" },
  completada: { label: "Completada", color: "bg-green-100 text-green-800 border-green-300" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800 border-red-300" }
};

const convertTo12Hour = (time24h) => {
  let [hours, minutes] = time24h.split(':');
  hours = parseInt(hours);
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
};

export default function AdminCitasPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [cancelingAppointment, setCancelingAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => base44.entities.Appointment.list("-appointment_date"),
    initialData: [],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Appointment.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async ({ id, appointment, reason }) => {
      await base44.entities.Appointment.update(id, { 
        status: "cancelada",
        notes: appointment.notes ? `${appointment.notes}\n\nCancelada por administrador. Motivo: ${reason}` : `Cancelada por administrador. Motivo: ${reason}`
      });
      try {
        const appointmentDateObj = new Date(appointment.appointment_date + "T12:00:00");
        const message = `❌ *Cita Cancelada por Administrador*\n\n👤 *Cliente:* ${appointment.client_name}\n📱 *Celular:* ${appointment.phone}\n💅 *Servicio:* ${appointment.service}\n📅 *Fecha:* ${format(appointmentDateObj, "dd/MM/yyyy", { locale: es })}\n⏰ *Hora:* ${appointment.appointment_time}\n\n📝 *Motivo:* ${reason}`;
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
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setCancelingAppointment(null);
      setCancelReason("");
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const handleCancelClick = (appointment) => {
    setCancelingAppointment(appointment);
    setCancelReason("");
  };

  const handleCancelConfirm = () => {
    if (cancelReason.trim()) {
      cancelAppointmentMutation.mutate({
        id: cancelingAppointment.id,
        appointment: cancelingAppointment,
        reason: cancelReason
      });
    }
  };

  const filteredAppointments = filterStatus === "all"
    ? appointments
    : appointments.filter(apt => apt.status === filterStatus);

  const stats = {
    total: appointments.length,
    pendiente: appointments.filter(a => a.status === "pendiente").length,
    confirmada: appointments.filter(a => a.status === "confirmada").length,
    completada: appointments.filter(a => a.status === "completada").length,
  };

  return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">AdminCitas Component</div>;
}
