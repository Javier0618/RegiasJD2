<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurar Horarios - RegiasJD</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
<div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Configurar Horarios Recurrentes</h1>

    <div class="bg-white p-4 rounded-lg shadow mb-6">
        <h2 class="text-xl font-bold mb-4">Añadir Nuevo Horario</h2>
        <form id="new-slot-form" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label for="day_of_week" class="block text-sm font-medium text-gray-700">Día de la semana</label>
                <select id="day_of_week" name="day_of_week" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                    <option value="6">Sábado</option>
                    <option value="7">Domingo</option>
                </select>
            </div>
            <div>
                <label for="time_slot" class="block text-sm font-medium text-gray-700">Hora</label>
                <input type="time" id="time_slot" name="time_slot" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required>
            </div>
            <div class="flex items-end">
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Añadir Horario</button>
            </div>
        </form>
    </div>

    <div id="slots-container" class="grid grid-cols-1 md:grid-cols-7 gap-4">
        <!-- Slots will be loaded here -->
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const slotsContainer = document.getElementById('slots-container');
    const newSlotForm = document.getElementById('new-slot-form');
    let slots = [];
    const daysOfWeek = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    async function fetchSlots() {
        try {
            const response = await fetch('api/get_slots.php');
            slots = await response.json();
            renderSlots();
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    }

    function renderSlots() {
        slotsContainer.innerHTML = '';
        const slotsByDay = Array.from({ length: 7 }, () => []);
        slots.forEach(slot => {
            if (slot.day_of_week) {
                slotsByDay[slot.day_of_week - 1].push(slot);
            }
        });

        slotsByDay.forEach((daySlots, index) => {
            const dayContainer = document.createElement('div');
            dayContainer.className = 'p-4 bg-white rounded-lg shadow';
            dayContainer.innerHTML = `<h2 class="text-lg font-bold mb-4">${daysOfWeek[index + 1]}</h2>`;

            const timesList = document.createElement('ul');
            timesList.className = 'space-y-2';

            daySlots.sort((a,b) => a.time_slot.localeCompare(b.time_slot));

            daySlots.forEach(slot => {
                const timeItem = document.createElement('li');
                timeItem.className = 'flex justify-between items-center';
                timeItem.innerHTML = `
                    <span>${slot.time_slot.substring(0,5)}</span>
                    <button class="delete-slot-btn text-red-500" data-id="${slot.id}">Eliminar</button>
                `;
                timesList.appendChild(timeItem);
            });
            dayContainer.appendChild(timesList);
            slotsContainer.appendChild(dayContainer);
        });
    }

    newSlotForm.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(newSlotForm);
        const data = {
            day_of_week: formData.get('day_of_week'),
            time_slot: formData.get('time_slot'),
            is_active: 1
        };

        await fetch('api/create_slot.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        newSlotForm.reset();
        fetchSlots();
    });

    slotsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('delete-slot-btn')) {
            const id = e.target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este horario?')) {
                fetch('api/delete_slot.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                }).then(() => fetchSlots());
            }
        }
    });

    fetchSlots();
});
</script>
</body>
</html>
