<?php
// api/create_slot.php
require_once '../db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $sql = "INSERT INTO available_slots (day_of_week, specific_date, time_slot, is_active, available_services) VALUES (?, ?, ?, ?, ?)";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['day_of_week'] ?? null,
            $data['specific_date'] ?? null,
            $data['time_slot'],
            $data['is_active'] ? 1 : 0,
            $data['available_services'] ? implode(',', $data['available_services']) : null
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
