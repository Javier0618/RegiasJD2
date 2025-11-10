<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurar Servicios - RegiasJD</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-gray-50">
<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Configurar Servicios</h1>
        <button id="new-service-btn" class="bg-blue-500 text-white px-4 py-2 rounded">Nuevo Servicio</button>
    </div>

    <div id="services-container" class="space-y-4">
        <!-- Services will be loaded here -->
    </div>
</div>

<!-- Service Modal -->
<div id="service-modal" class="fixed z-10 inset-0 overflow-y-auto hidden">
    <div class="flex items-center justify-center min-h-screen">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
        <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <form id="service-form">
                <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title"></h3>
                    <div class="mt-2 space-y-4">
                        <input type="hidden" id="service-id" name="id">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="name" id="name" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required>
                        </div>
                        <div>
                            <label for="duration_minutes" class="block text-sm font-medium text-gray-700">Duración (minutos)</label>
                            <input type="number" name="duration_minutes" id="duration_minutes" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required>
                        </div>
                        <div>
                            <label for="price" class="block text-sm font-medium text-gray-700">Precio</label>
                            <input type="number" name="price" id="price" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required>
                        </div>
                        <div>
                            <label for="category" class="block text-sm font-medium text-gray-700">Categoría</label>
                            <input type="text" name="category" id="category" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required>
                        </div>
                        <div>
                            <label for="image_url" class="block text-sm font-medium text-gray-700">URL de la Imagen</label>
                            <input type="text" name="image_url" id="image_url" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                        </div>
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea name="description" id="description" rows="3" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                        </div>
                        <div class="flex items-center">
                            <input id="is_active" name="is_active" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                            <label for="is_active" class="ml-2 block text-sm text-gray-900">Activo</label>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">Guardar</button>
                    <button type="button" id="close-modal-btn" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    const servicesContainer = document.getElementById('services-container');
    const newServiceBtn = document.getElementById('new-service-btn');
    const serviceModal = document.getElementById('service-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const serviceForm = document.getElementById('service-form');
    const modalTitle = document.getElementById('modal-title');
    let services = [];

    async function fetchServices() {
        try {
            const response = await fetch('api/get_services.php');
            services = await response.json();
            renderServices();
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    }

    function renderServices() {
        servicesContainer.innerHTML = '';
        const servicesByCategory = services.reduce((acc, service) => {
            const category = service.category || 'Sin Categoría';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(service);
            return acc;
        }, {});

        for (const category in servicesByCategory) {
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'p-4 bg-white rounded-lg shadow';
            categoryContainer.innerHTML = `<h2 class="text-xl font-bold mb-4">${category}</h2>`;

            const servicesGrid = document.createElement('div');
            servicesGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

            servicesByCategory[category].forEach(service => {
                const serviceEl = document.createElement('div');
                serviceEl.className = 'border p-4 rounded';
                serviceEl.innerHTML = `
                    <h3 class="font-bold">${service.name} ${service.is_active ? '' : '(Inactivo)'}</h3>
                    <p>${service.duration_minutes} min - $${service.price}</p>
                    <div class="mt-2">
                        <button class="edit-btn text-blue-500 mr-2" data-id="${service.id}">Editar</button>
                        <button class="delete-btn text-red-500" data-id="${service.id}">Eliminar</button>
                    </div>
                `;
                servicesGrid.appendChild(serviceEl);
            });
            categoryContainer.appendChild(servicesGrid);
            servicesContainer.appendChild(categoryContainer);
        }
    }

    function openModal(service = null) {
        serviceForm.reset();
        if (service) {
            modalTitle.textContent = 'Editar Servicio';
            document.getElementById('service-id').value = service.id;
            document.getElementById('name').value = service.name;
            document.getElementById('duration_minutes').value = service.duration_minutes;
            document.getElementById('price').value = service.price;
            document.getElementById('category').value = service.category;
            document.getElementById('image_url').value = service.image_url || '';
            document.getElementById('description').value = service.description || '';
            document.getElementById('is_active').checked = service.is_active;
        } else {
            modalTitle.textContent = 'Nuevo Servicio';
        }
        serviceModal.classList.remove('hidden');
    }

    newServiceBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', () => serviceModal.classList.add('hidden'));

    servicesContainer.addEventListener('click', e => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            const service = services.find(s => s.id == id);
            openModal(service);
        }
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
                fetch('api/delete_service.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                }).then(() => fetchServices());
            }
        }
    });

    serviceForm.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(serviceForm);
        const data = Object.fromEntries(formData.entries());
        data.is_active = document.getElementById('is_active').checked;

        const url = data.id ? 'api/update_service.php' : 'api/create_service.php';

        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        serviceModal.classList.add('hidden');
        fetchServices();
    });

    fetchServices();
});
</script>
</body>
</html>
