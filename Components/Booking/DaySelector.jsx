import React from "react";
import { format, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function DaySelector({ days, selectedDate, onSelectDate }) {
  if (days.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-4">
        <Calendar className="w-5 h-5 text-pink-500" />
        Selecciona un día
      </h2>

      <div className={`grid gap-2 md:gap-3 ${
        days.length === 7 ? 'grid-cols-7' : 
        days.length === 6 ? 'grid-cols-6' : 
        days.length === 5 ? 'grid-cols-5' : 
        days.length === 4 ? 'grid-cols-4' : 
        days.length === 3 ? 'grid-cols-3' : 
        days.length === 2 ? 'grid-cols-2' : 
        'grid-cols-1'
      }`}>
        {days.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);

          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(day)}
              className={`
                relative p-4 rounded-2xl text-center transition-all duration-200
                ${isSelected 
                  ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg" 
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }
              `}
            >
              <div className={`text-xs font-medium uppercase mb-1 ${isSelected ? "text-white" : "text-gray-500"}`}>
                {format(day, "EEE", { locale: es }).substring(0, 3).toUpperCase()}
              </div>
              <div className={`text-2xl font-bold ${isSelected ? "text-white" : "text-gray-800"}`}>
                {format(day, "d")}
              </div>
              {isDayToday && !isSelected && (
                <div className="absolute -top-1 -right-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white text-[10px] font-bold">
                    Hoy
                  </span>
                </div>
              )}
              {isDayToday && isSelected && (
                <div className="text-[10px] font-medium mt-1">
                  Hoy
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
