<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administrar Citas - RegiasJD</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/format/index.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns/locale/es/index.js"></script>
</head>
<body class="bg-gray-50">
<div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Administración de Citas</h1>

    <!-- Stats -->
    <div id="stats-container" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <!-- Stats will be loaded here -->
    </div>

    <!-- Filters -->
    <div class="mb-4">
        <label for="status-filter" class="block text-sm font-medium text-gray-700">Filtrar por estado:</label>
        <select id="status-filter" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="all">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
        </select>
    </div>

    <!-- Appointments Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody id="appointments-tbody" class="bg-white divide-y divide-gray-200">
                <!-- Rows will be injected here -->
            </tbody>
        </table>
    </div>
</div>

<!-- Cancel Modal -->
<div id="cancel-modal" class="fixed z-10 inset-0 overflow-y-auto hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <i data-lucide="alert-triangle" class="h-6 w-6 text-red-600"></i>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Cancelar Cita</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">Por favor, ingresa el motivo de la cancelación.</p>
              <textarea id="cancel-reason" rows="3" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"></textarea>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button type="button" id="confirm-cancel-btn" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
          Confirmar Cancelación
        </button>
        <button type="button" id="close-modal-btn" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    const { format } = dateFns;
    const es = dateFns.locale.es;

    let appointments = [];
    let cancelingAppointment = null;
    const tbody = document.getElementById('appointments-tbody');
    const statusFilter = document.getElementById('status-filter');
    const statsContainer = document.getElementById('stats-container');
    const cancelModal = document.getElementById('cancel-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const cancelReasonInput = document.getElementById('cancel-reason');

    const STATUS_CONFIG = {
        pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
        confirmada: { label: "Confirmada", color: "bg-blue-100 text-blue-800" },
        completada: { label: "Completada", color: "bg-green-100 text-green-800" },
        cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" }
    };

    async function fetchAppointments() {
        try {
            const response = await fetch('api/get_appointments.php');
            appointments = await response.json();
            renderTable();
            renderStats();
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }

    function renderTable() {
        const filterValue = statusFilter.value;
        const filteredAppointments = filterValue === 'all'
            ? appointments
            : appointments.filter(apt => apt.status === filterValue);

        tbody.innerHTML = '';
        if (filteredAppointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No hay citas que coincidan con el filtro.</td></tr>';
            return;
        }

        filteredAppointments.forEach(apt => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${apt.client_name}</div>
                    <div class="text-sm text-gray-500">${apt.phone}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>${format(new Date(apt.appointment_date + 'T00:00:00'), 'PPP', { locale: es })} - ${apt.appointment_time.substring(0,5)}</div>
                    <div>${apt.services}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select class="status-select border-gray-300 rounded-md" data-id="${apt.id}">
                        <option value="pendiente" ${apt.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="confirmada" ${apt.status === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                        <option value="completada" ${apt.status === 'completada' ? 'selected' : ''}>Completada</option>
                        <option value="cancelada" ${apt.status === 'cancelada' ? 'selected' : ''} disabled>Cancelada</option>
                    </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="cancel-btn text-red-600 hover:text-red-900" data-id="${apt.id}">Cancelar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderStats() {
        const stats = {
            total: appointments.length,
            pendiente: appointments.filter(a => a.status === 'pendiente').length,
            confirmada: appointments.filter(a => a.status === 'confirmada').length,
            completada: appointments.filter(a => a.status === 'completada').length,
        };
        statsContainer.innerHTML = `
            <div class="bg-white p-4 shadow rounded-lg"><div class="text-sm font-medium text-gray-500">Total</div><div class="mt-1 text-3xl font-semibold text-gray-900">${stats.total}</div></div>
            <div class="bg-white p-4 shadow rounded-lg"><div class="text-sm font-medium text-gray-500">Pendientes</div><div class="mt-1 text-3xl font-semibold text-gray-900">${stats.pendiente}</div></div>
            <div class="bg-white p-4 shadow rounded-lg"><div class="text-sm font-medium text-gray-500">Confirmadas</div><div class="mt-1 text-3xl font-semibold text-gray-900">${stats.confirmada}</div></div>
            <div class="bg-white p-4 shadow rounded-lg"><div class="text-sm font-medium text-gray-500">Completadas</div><div class="mt-1 text-3xl font-semibold text-gray-900">${stats.completada}</div></div>
        `;
    }

    statusFilter.addEventListener('change', renderTable);

    tbody.addEventListener('change', async (e) => {
        if (e.target.classList.contains('status-select')) {
            const id = e.target.dataset.id;
            const status = e.target.value;
            try {
                await fetch('api/update_appointment_status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status })
                });
                fetchAppointments();
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    });

    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('cancel-btn')) {
            const id = e.target.dataset.id;
            cancelingAppointment = appointments.find(a => a.id == id);
            cancelModal.classList.remove('hidden');
        }
    });

    closeModalBtn.addEventListener('click', () => {
        cancelModal.classList.add('hidden');
        cancelingAppointment = null;
        cancelReasonInput.value = '';
    });

    confirmCancelBtn.addEventListener('click', async () => {
        const reason = cancelReasonInput.value.trim();
        if (reason && cancelingAppointment) {
            try {
                await fetch('api/cancel_appointment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: cancelingAppointment.id, reason: reason, appointment: cancelingAppointment })
                });
                cancelModal.classList.add('hidden');
                fetchAppointments();
            } catch (error) {
                console.error('Error canceling appointment:', error);
            }
        }
    });

    fetchAppointments();
});
</script>
</body>
</html>
