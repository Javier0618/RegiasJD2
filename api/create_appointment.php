<?php
// api/create_appointment.php

require_once '../db.php';
require_once '../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    $required_fields = ['client_name', 'phone', 'services', 'total_duration_minutes', 'total_price', 'appointment_date', 'appointment_time', 'status'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit;
        }
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO appointments (client_name, phone, services, total_duration_minutes, total_price, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['client_name'],
            $data['phone'],
            is_array($data['services']) ? implode(', ', $data['services']) : $data['services'],
            $data['total_duration_minutes'],
            $data['total_price'],
            $data['appointment_date'],
            $data['appointment_time'],
            $data['status']
        ]);

        $appointment_id = $pdo->lastInsertId();

        // Send Telegram notification
        $servicesText = is_array($data['services']) ? implode(", ", $data['services']) : $data['services'];
        $appointmentDateObj = date_create($data['appointment_date']);
        $formattedDate = date_format($appointmentDateObj, 'd/m/Y');

        $message = "🌸 *Nueva Cita Agendada*\n\n" .
                   "👤 *Cliente:* " . $data['client_name'] . "\n" .
                   "📱 *Celular:* " . $data['phone'] . "\n" .
                   "💅 *Servicios:* " . $servicesText . "\n" .
                   "⏱️ *Duración Total:* " . $data['total_duration_minutes'] . " minutos\n" .
                   "💰 *Total:* $" . number_format($data['total_price'], 0, ',', '.') . "\n" .
                   "📅 *Fecha:* " . $formattedDate . "\n" .
                   "⏰ *Hora:* " . $data['appointment_time'];

        $telegramUrl = 'https://api.telegram.org/bot' . TELEGRAM_BOT_TOKEN . '/sendMessage';
        $telegramData = [
            'chat_id' => TELEGRAM_CHAT_ID,
            'text' => $message,
            'parse_mode' => 'Markdown'
        ];

        $options = [
            'http' => [
                'header'  => "Content-type: application/json\r\n",
                'method'  => 'POST',
                'content' => json_encode($telegramData),
            ],
        ];

        $context  = stream_context_create($options);
        file_get_contents($telegramUrl, false, $context);

        echo json_encode(['success' => true, 'appointment_id' => $appointment_id]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
