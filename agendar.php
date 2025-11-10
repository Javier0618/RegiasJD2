<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendar Cita - RegiasJD</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/format/index.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/addDays/index.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/startOfWeek/index.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/getDay/index.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/isSameDay/index.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns/locale/es/index.js"></script>

    <style>
        .animate-enter {
            opacity: 0;
            transform: translateY(50px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .animate-enter-active {
            opacity: 1;
            transform: translateY(0);
        }
        .animate-exit {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .animate-exit-active {
            opacity: 0;
            transform: translateY(50px);
        }
    </style>
</head>
<body class="bg-gradient-to-br from-pink-50 via-purple-50 to-white">
    <div id="app" class="min-h-screen">
        <div class="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white py-8 md:py-12 px-4 md:px-6">
            <div class="max-w-6xl mx-auto text-center">
                <div class="flex items-center justify-center gap-2 md:gap-3 mb-3">
                    <i data-lucide="sparkles" class="w-6 h-6 md:w-8 md:h-8"></i>
                    <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold">RegiasJD</h1>
                    <i data-lucide="sparkles" class="w-6 h-6 md:w-8 md:h-8"></i>
                </div>
                <p class="text-base md:text-xl text-pink-100 max-w-2xl mx-auto">
                    Agenda tu cita de belleza de manera fácil y rápida
                </p>
            </div>
        </div>

        <div class="max-w-6xl mx-auto px-4 py-6 md:py-8">
            <div class="flex items-center justify-between mb-6">
                <button id="prev-week" class="rounded-full hover:bg-pink-100 p-2">
                    <i data-lucide="chevron-left" class="w-5 h-5"></i>
                </button>

                <div class="text-center" id="week-display">
                    <!-- Date range will be inserted here -->
                </div>

                <button id="next-week" class="rounded-full hover:bg-pink-100 p-2">
                    <i data-lucide="chevron-right" class="w-5 h-5"></i>
                </button>
            </div>

            <div id="calendar-container">
                <div id="day-selector-container" class="flex justify-center space-x-2 mb-8">
                    <!-- Day selectors will be inserted here -->
                </div>
                <div id="time-slot-selector-container">
                    <!-- Time slots will be inserted here -->
                </div>
            </div>
            <div id="no-availability" class="text-center py-12 hidden">
                 <p class="text-lg text-gray-500">No hay fechas disponibles esta semana</p>
                 <p class="text-sm text-gray-400 mt-2">Intenta navegar a la siguiente semana</p>
            </div>
        </div>

        <!-- Booking Modal -->
        <div id="booking-modal" class="fixed inset-0 bg-black bg-opacity-50 z-40 items-center justify-center hidden">
             <div class="bg-white rounded-2xl shadow-xl w-full max-w-md m-4 p-6 relative">
                 <button id="close-modal-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <i data-lucide="x" class="w-6 h-6"></i>
                 </button>
                 <h2 class="text-2xl font-bold text-gray-800 mb-2">Confirmar Cita</h2>
                 <p class="text-gray-500 mb-6">
                    Fecha: <span id="modal-date" class="font-semibold"></span>, Hora: <span id="modal-time" class="font-semibold"></span>
                 </p>
                 <form id="booking-form">
                    <div class="space-y-4">
                        <div>
                            <label for="client_name" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input type="text" id="client_name" name="client_name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500">
                        </div>
                        <div>
                            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                            <input type="tel" id="phone" name="phone" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500">
                        </div>
                        <div id="services-container">
                           <!-- Services checkboxes will be inserted here -->
                        </div>
                        <div>
                            <p class="text-right font-bold text-lg">Total: $<span id="total-price">0</span></p>
                        </div>
                    </div>
                    <div class="mt-8">
                        <button type="submit" id="submit-booking-btn" class="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition duration-300">
                            Agendar Cita
                        </button>
                    </div>
                 </form>
            </div>
        </div>

        <!-- Success Message -->
        <div id="success-message" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 hidden animate-enter">
            <div class="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 md:px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 md:w-8 md:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <div>
                    <p class="font-bold text-base md:text-lg">¡Cita Agendada!</p>
                    <p class="text-xs md:text-sm text-green-100">Te esperamos en RegiasJD</p>
                </div>
            </div>
        </div>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', () => {

        lucide.createIcons();

        const { format, addDays, startOfWeek, getDay, isSameDay } = dateFns;
        const es = dateFns.locale.es;

        let state = {
            selectedDate: new Date(),
            selectedTime: null,
            weekOffset: 0,
            appointments: [],
            availableSlots: [],
            allServices: [],
            availableServicesForSlot: [],
            loading: true,
        };

        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');
        const weekDisplay = document.getElementById('week-display');
        const daySelectorContainer = document.getElementById('day-selector-container');
        const timeSlotSelectorContainer = document.getElementById('time-slot-selector-container');
        const noAvailabilityDiv = document.getElementById('no-availability');
        const calendarContainer = document.getElementById('calendar-container');

        // Modal elements
        const bookingModal = document.getElementById('booking-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const bookingForm = document.getElementById('booking-form');
        const modalDate = document.getElementById('modal-date');
        const modalTime = document.getElementById('modal-time');
        const servicesContainer = document.getElementById('services-container');
        const totalPriceEl = document.getElementById('total-price');
        const submitBookingBtn = document.getElementById('submit-booking-btn');

        // Success Message
        const successMessage = document.getElementById('success-message');

        const fetchData = async () => {
            try {
                setState({ loading: true });
                const [appointmentsRes, slotsRes, servicesRes] = await Promise.all([
                    fetch('/api/get_appointments.php'),
                    fetch('/api/get_slots.php'),
                    fetch('/api/get_services.php')
                ]);
                const appointments = await appointmentsRes.json();
                const availableSlots = await slotsRes.json();
                const allServices = await servicesRes.json();

                setState({ appointments, availableSlots, allServices, loading: false });
                render();
            } catch (error) {
                console.error("Error fetching data:", error);
                setState({ loading: false });
            }
        };

        function setState(newState) {
            state = { ...state, ...newState };
        }

        const getDayOfWeekNumber = (date) => {
            const day = getDay(date);
            return day === 0 ? 7 : day;
        };

        const hasAvailability = (date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const dayNumber = getDayOfWeekNumber(date);

            const isSlotAvailable = (slot) => {
                return !state.appointments.some(apt =>
                    apt.appointment_date === dateStr &&
                    apt.appointment_time === slot.time_slot &&
                    apt.status !== "cancelada"
                );
            };

            const specificSlots = state.availableSlots.filter(s => s.specific_date === dateStr && s.is_active);
            if (specificSlots.length > 0) {
                return specificSlots.some(isSlotAvailable);
            }

            const recurringSlots = state.availableSlots.filter(s => parseInt(s.day_of_week) === dayNumber && s.is_active && !s.specific_date);
            if (recurringSlots.length > 0) {
                 return recurringSlots.some(isSlotAvailable);
            }

            return false;
        };

        const getCurrentWeekDaysWithAvailability = () => {
            const today = new Date();
            const start = addDays(startOfWeek(today, { weekStartsOn: 1 }), state.weekOffset * 7);
            return Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter(day => hasAvailability(day));
        };

        function renderWeekDays(weekDays) {
            daySelectorContainer.innerHTML = '';
            if (weekDays.length > 0) {
                const selectedDateStr = format(state.selectedDate, 'yyyy-MM-dd');
                weekDays.forEach(day => {
                    const dayButton = document.createElement('button');
                    const isSelected = isSameDay(day, state.selectedDate);
                    dayButton.className = `p-2 rounded-xl text-center w-16 transition-all duration-300 ${isSelected ? 'bg-pink-500 text-white shadow-lg' : 'bg-white hover:bg-pink-100'}`;
                    dayButton.innerHTML = `
                        <p class="text-xs capitalize">${format(day, 'EEE', { locale: es })}</p>
                        <p class="font-bold text-xl">${format(day, 'd')}</p>
                    `;
                    dayButton.onclick = () => {
                        setState({ selectedDate: day });
                        render();
                    };
                    daySelectorContainer.appendChild(dayButton);
                });

                weekDisplay.innerHTML = `
                    <p class="text-xs md:text-sm text-gray-500">
                        ${format(weekDays[0], "dd MMM", { locale: es })} - ${format(weekDays[weekDays.length - 1], "dd MMM yyyy", { locale: es })}
                    </p>
                `;
            } else {
                 weekDisplay.innerHTML = `<p class="text-xs md:text-sm text-gray-500">No hay disponibilidad esta semana</p>`;
            }
        }

        function renderTimeSlots() {
            const dateStr = format(state.selectedDate, "yyyy-MM-dd");
            const dayNumber = getDayOfWeekNumber(state.selectedDate);

            const slotsForDay = state.availableSlots.filter(slot => {
                return slot.is_active && (slot.specific_date === dateStr || (parseInt(slot.day_of_week) === dayNumber && !slot.specific_date));
            });

            const bookedSlots = state.appointments
                .filter(apt => apt.appointment_date === dateStr && apt.status !== 'cancelada')
                .map(apt => apt.appointment_time);

            timeSlotSelectorContainer.innerHTML = ' <h3 class="text-lg font-semibold text-gray-700 mb-4 text-center">Elige un Horario</h3>';

            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3';

            if (slotsForDay.length > 0) {
                slotsForDay.sort((a,b) => a.time_slot.localeCompare(b.time_slot));

                slotsForDay.forEach(slot => {
                    const isBooked = bookedSlots.includes(slot.time_slot);
                    const timeButton = document.createElement('button');
                    timeButton.textContent = format(new Date(`1970-01-01T${slot.time_slot}`), 'h:mm a');
                    timeButton.disabled = isBooked;
                    timeButton.className = `p-3 rounded-lg text-center font-semibold text-sm transition-all duration-200 ${isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-pink-500 hover:text-white hover:shadow-md'}`;

                    if (!isBooked) {
                         timeButton.onclick = () => handleTimeSlotClick(slot.time_slot, slot.available_services);
                    }

                    grid.appendChild(timeButton);
                });
            } else {
                 grid.innerHTML = '<p class="text-center col-span-full text-gray-500">No hay horarios disponibles para este día.</p>';
            }
             timeSlotSelectorContainer.appendChild(grid);
        }

        function handleTimeSlotClick(time, availableServicesCSV) {
            let availableServicesForSlot = state.allServices;
            if (availableServicesCSV) {
                 const serviceNames = availableServicesCSV.split(',').map(s => s.trim());
                 availableServicesForSlot = state.allServices.filter(service => serviceNames.includes(service.name));
            }

            setState({ selectedTime: time, availableServicesForSlot });

            modalDate.textContent = format(state.selectedDate, 'eeee, dd MMMM', { locale: es });
            modalTime.textContent = format(new Date(`1970-01-01T${time}`), 'h:mm a');

            renderServicesForModal();
            updateTotalPrice();

            bookingModal.style.display = 'flex';
        }

        function renderServicesForModal() {
            servicesContainer.innerHTML = '<p class="block text-sm font-medium text-gray-700 mb-2">Servicios disponibles</p>';
            const serviceGrid = document.createElement('div');
            serviceGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-2';

            state.availableServicesForSlot.forEach(service => {
                const label = document.createElement('label');
                label.className = 'flex items-center p-2 border rounded-lg cursor-pointer';
                label.innerHTML = `
                    <input type="checkbox" name="services[]" value="${service.id}" class="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500">
                    <span class="ml-2 text-sm text-gray-700">${service.name}</span>
                    <span class="ml-auto text-sm font-semibold text-gray-900">$${parseInt(service.price).toLocaleString()}</span>
                `;
                label.querySelector('input').addEventListener('change', updateTotalPrice);
                serviceGrid.appendChild(label);
            });
            servicesContainer.appendChild(serviceGrid);
        }

        function updateTotalPrice() {
            let total = 0;
            const selectedServiceIds = Array.from(document.querySelectorAll('input[name="services[]"]:checked')).map(cb => cb.value);

            selectedServiceIds.forEach(id => {
                const service = state.allServices.find(s => s.id == id);
                if (service) total += parseFloat(service.price);
            });

            totalPriceEl.textContent = total.toLocaleString();
        }

        function render() {
             if (state.loading) return;

             const weekDays = getCurrentWeekDaysWithAvailability();

             if (weekDays.length > 0) {
                 const isSelectedDateInCurrentWeek = weekDays.some(day => isSameDay(day, state.selectedDate));
                 if (!isSelectedDateInCurrentWeek) {
                     setState({ selectedDate: weekDays[0] });
                 }
                 calendarContainer.classList.remove('hidden');
                 noAvailabilityDiv.classList.add('hidden');
                 renderWeekDays(weekDays);
                 renderTimeSlots();
             } else {
                 calendarContainer.classList.add('hidden');
                 noAvailabilityDiv.classList.remove('hidden');
                 renderWeekDays([]);
             }
        }

        prevWeekBtn.addEventListener('click', () => {
            setState({ weekOffset: state.weekOffset - 1 });
            render();
        });

        nextWeekBtn.addEventListener('click', () => {
            setState({ weekOffset: state.weekOffset + 1 });
            render();
        });

        closeModalBtn.addEventListener('click', () => {
            bookingModal.style.display = 'none';
        });

        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBookingBtn.disabled = true;
            submitBookingBtn.textContent = 'Agendando...';

            const formData = new FormData(bookingForm);
            const clientName = formData.get('client_name');
            const phone = formData.get('phone');
            const selectedServiceIds = Array.from(document.querySelectorAll('input[name="services[]"]:checked')).map(cb => cb.value);

            if(selectedServiceIds.length === 0) {
                alert('Por favor selecciona al menos un servicio.');
                submitBookingBtn.disabled = false;
                submitBookingBtn.textContent = 'Agendar Cita';
                return;
            }

            let totalPrice = 0;
            let totalDuration = 0;
            const serviceNames = [];

            selectedServiceIds.forEach(id => {
                const service = state.allServices.find(s => s.id == id);
                if (service) {
                    totalPrice += parseFloat(service.price);
                    totalDuration += parseInt(service.duration_minutes);
                    serviceNames.push(service.name);
                }
            });

            const appointmentData = {
                client_name: clientName,
                phone: phone,
                services: serviceNames,
                total_duration_minutes: totalDuration,
                total_price: totalPrice,
                appointment_date: format(state.selectedDate, "yyyy-MM-dd"),
                appointment_time: state.selectedTime,
                status: "pendiente"
            };

            try {
                const response = await fetch('/api/create_appointment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(appointmentData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    bookingModal.style.display = 'none';
                    bookingForm.reset();
                    showSuccess();
                    fetchData(); // Refresh data
                } else {
                    alert('Error al agendar la cita: ' + (result.error || 'Unknown error'));
                }
            } catch (error) {
                alert('Hubo un error de conexión al agendar la cita.');
                console.error('Submit error:', error);
            } finally {
                submitBookingBtn.disabled = false;
                submitBookingBtn.textContent = 'Agendar Cita';
            }
        });

        function showSuccess() {
            successMessage.classList.remove('hidden');
            successMessage.classList.add('animate-enter-active');

            setTimeout(() => {
                successMessage.classList.remove('animate-enter-active');
                successMessage.classList.add('animate-exit-active');
                setTimeout(() => {
                     successMessage.classList.add('hidden');
                     successMessage.classList.remove('animate-exit-active');
                }, 300);
            }, 4000);
        }

        fetchData();
    });
    </script>
</body>
</html>
