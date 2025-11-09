// JavaScript Example: Reading Entities
// Filterable fields: client_name, phone, services, total_duration_minutes, total_price, appointment_date, appointment_time, status, notes
async function fetchAppointmentEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/690e77e63a5af9a5d30fc462/entities/Appointment`, {
        headers: {
            'api_key': '221212a668d742eeb1fd55f2c7a0bb55', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: client_name, phone, services, total_duration_minutes, total_price, appointment_date, appointment_time, status, notes
async function updateAppointmentEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/690e77e63a5af9a5d30fc462/entities/Appointment/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': '221212a668d742eeb1fd55f2c7a0bb55', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    const data = await response.json();
    console.log(data);
}