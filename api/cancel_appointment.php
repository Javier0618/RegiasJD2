<?php
// api/cancel_appointment.php

require_once '../db.php';
require_once '../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id']) || !isset($data['reason']) || !isset($data['appointment'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    $appointment = $data['appointment'];
    $reason = $data['reason'];
    $notes = isset($appointment['notes']) && $appointment['notes'] ? $appointment['notes'] . "\n\nCancelada por administrador. Motivo: " . $reason : "Cancelada por administrador. Motivo: " . $reason;

    try {
        $stmt = $pdo->prepare("UPDATE appointments SET status = 'cancelada', notes = ? WHERE id = ?");
        $stmt->execute([$notes, $data['id']]);

        // Send Telegram notification
        $appointmentDateObj = date_create($appointment['appointment_date']);
        $formattedDate = date_format($appointmentDateObj, 'd/m/Y');

        $message = "❌ *Cita Cancelada por Administrador*\n\n" .
                   "👤 *Cliente:* " . $appointment['client_name'] . "\n" .
                   "📱 *Celular:* " . $appointment['phone'] . "\n" .
                   "💅 *Servicios:* " . $appointment['services'] . "\n" .
                   "📅 *Fecha:* " . $formattedDate . "\n" .
                   "⏰ *Hora:* " . $appointment['appointment_time'] . "\n\n" .
                   "📝 *Motivo:* " . $reason;

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

        echo json_encode(['success' => true]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
