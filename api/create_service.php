<?php
// api/create_service.php
require_once '../db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $sql = "INSERT INTO services (name, duration_minutes, price, category, image_url, description, is_active, `order`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['name'],
            $data['duration_minutes'],
            $data['price'],
            $data['category'],
            $data['image_url'] ?? null,
            $data['description'] ?? null,
            $data['is_active'] ? 1 : 0,
            $data['order'] ?? 0
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
